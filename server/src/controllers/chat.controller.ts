import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import ErrorHandler from "../utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { SocketServer } from "../services/socket.service";
import { PrismaApiFeatures, QueryString } from "../utils/apiFeatures";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";

export const sendMessage = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { recipientId } = req.params;
    const { message } = req.body;
    const senderId = req.user?.id;

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
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, profilePicture: true }
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
    const userId = req.user?.id;
    if (!userId) {
        return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
    }

    const conversations = await prisma.conversation.findMany({
        where: { participants: { some: { id: userId } } },
        orderBy: { updatedAt: 'desc' },
        include: {
            participants: {
                where: { id: { not: userId } },
                select: { id: true, firstName: true, lastName: true, profilePicture: true, isOnline: true },
            },
            chats: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
    });

    res.status(StatusCodes.OK).json({
        success: true,
        conversations,
    });
});

export const getMessagesForConversation = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;
    const userId = req.user?.id;

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
    
    const limit = Number(req.query.limit) || 10;
    const currentPage = Number(req.query.page) || 1;

    res.status(StatusCodes.OK).json({
        success: true,
        totalMessages: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: currentPage,
        messages,
    });
});