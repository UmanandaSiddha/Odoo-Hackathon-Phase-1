import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import ErrorHandler from "../utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { SocketServer } from "../services/socket.service";
import { PrismaApiFeatures, QueryString } from "../utils/apiFeatures";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";

interface ConversationWithRelations {
    id: string;
    lastMessage: string | null;
    lastActivity: Date;
    unreadCount: number;
    participants: Array<{
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        isOnline: boolean;
    }>;
    chats: Array<{
        message: string;
        createdAt: Date;
        status: string;
    }>;
    _count: {
        chats: number;
    };
}

interface ContactUser {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string | null;
    isOnline: boolean;
}

export const sendMessage = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { recipientId } = req.params;
    const { message } = req.body;
    const senderId = (req as any).user?.userId;

    if (!senderId) {
        return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
    }

    if (!message) {
        return next(new ErrorHandler('Message content cannot be empty.', StatusCodes.BAD_REQUEST));
    }

    if (senderId === recipientId) {
        return next(new ErrorHandler('You cannot send a message to yourself.', StatusCodes.BAD_REQUEST));
    }

    let conversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { participants: { some: { id: senderId } } },
                { participants: { some: { id: recipientId } } },
            ],
        },
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [{ id: senderId }, { id: recipientId }],
                },
            },
        });
    }

    const newChatMessage = await prisma.chat.create({
        data: {
            message,
            senderId,
            receiverId: recipientId,
            conversationId: conversation.id,
            status: 'SENT'
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true }
            }
        }
    });

    // Update conversation metadata
    await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
            lastMessage: message,
            lastActivity: new Date(),
            unreadCount: {
                increment: 1
            }
        }
    });

    const socketServer = req.app.get('socketServer') as SocketServer;
    if (socketServer) {
        socketServer.emitToUser(recipientId, 'receive_message', newChatMessage);
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Message sent successfully.',
        chat: newChatMessage,
    });
});

export const getConversations = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
        return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
    }

    const conversations = await prisma.conversation.findMany({
        where: { participants: { some: { id: userId } } },
        orderBy: { lastActivity: 'desc' },
        include: {
            participants: {
                where: { id: { not: userId } },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    isOnline: true
                },
            },
            chats: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    message: true,
                    createdAt: true,
                    status: true
                }
            },
            _count: {
                select: { chats: true }
            }
        },
    });

    const formattedConversations = conversations.map((conv: ConversationWithRelations) => ({
        id: conv.id,
        contact: {
            id: conv.participants[0].id,
            name: `${conv.participants[0].firstName} ${conv.participants[0].lastName}`,
            avatar: conv.participants[0].profilePicture || `https://ui-avatars.com/api/?name=${conv.participants[0].firstName}+${conv.participants[0].lastName}`,
            online: conv.participants[0].isOnline
        },
        lastMessage: conv.lastMessage || '',
        timestamp: conv.lastActivity.toLocaleString(),
        unreadCount: conv.unreadCount,
        totalMessages: conv._count.chats
    }));

    res.status(StatusCodes.OK).json({
        success: true,
        conversations: formattedConversations,
    });
});

export const getMessagesForConversation = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
        return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
    }

    const isParticipant = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: { some: { id: userId } },
        },
    });

    if (!isParticipant) {
        return next(new ErrorHandler('You are not authorized to view this conversation.', StatusCodes.FORBIDDEN));
    }

    // Reset unread count when fetching messages
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 }
    });

    const query = {
        ...req.query,
        conversationId: conversationId,
        sort: req.query.sort || 'createdAt_asc',
    };
    
    const features = new PrismaApiFeatures(prisma.chat, query as QueryString)
        .filter()
        .sort()
        .pagination();

    const { results: messages, totalCount } = await features.execute();
    
    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.message,
        sender: msg.senderId === userId ? 'me' : 'other',
        timestamp: new Date(msg.createdAt).toLocaleString(),
        status: msg.status.toLowerCase()
    }));

    const limit = Number(req.query.limit) || 10;
    const currentPage = Number(req.query.page) || 1;

    res.status(StatusCodes.OK).json({
        success: true,
        totalMessages: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: currentPage,
        messages: formattedMessages,
    });
});

export const updateMessageStatus = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
        return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
    }

    const message = await prisma.chat.findUnique({
        where: { id: messageId },
        include: { sender: true }
    });

    if (!message) {
        return next(new ErrorHandler('Message not found.', StatusCodes.NOT_FOUND));
    }

    if (message.receiverId !== userId) {
        return next(new ErrorHandler('Not authorized to update this message status.', StatusCodes.FORBIDDEN));
    }

    const updatedMessage = await prisma.chat.update({
        where: { id: messageId },
        data: { status },
    });

    const socketServer = req.app.get('socketServer') as SocketServer;
    if (socketServer) {
        socketServer.emitToUser(message.senderId, 'message_status_update', {
            messageId,
            status
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: updatedMessage,
    });
});

export const searchContacts = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.query;
    const userId = (req as any).user?.userId;

    if (!userId) {
        return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
    }

    const contacts = await prisma.user.findMany({
        where: {
            AND: [
                { id: { not: userId } },
                {
                    OR: [
                        { firstName: { contains: String(query), mode: 'insensitive' } },
                        { lastName: { contains: String(query), mode: 'insensitive' } },
                    ]
                }
            ]
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true
        },
        take: 10
    });

    const formattedContacts = contacts.map((contact: ContactUser) => ({
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        avatar: contact.profilePicture || `https://ui-avatars.com/api/?name=${contact.firstName}+${contact.lastName}`,
        online: contact.isOnline
    }));

    res.status(StatusCodes.OK).json({
        success: true,
        contacts: formattedContacts
    });
});