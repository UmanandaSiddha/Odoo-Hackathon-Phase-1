import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import ErrorHandler from "../utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import { SocketServer } from "../services/socket.service";

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

    } catch (error) {
        next(error);
    }
};

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

    } catch (error) {
        next(error);
    }
};

export const getMessagesForConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return next(new ErrorHandler('Authentication required.', StatusCodes.UNAUTHORIZED));
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { id: userId } },
            },
        });

        if (!conversation) {
            return next(new ErrorHandler('You are not authorized to view this conversation.', StatusCodes.FORBIDDEN));
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await prisma.chat.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
            take: limit,
            skip: skip,
            include: {
                sender: {
                    select: { id: true, firstName: true, lastName: true, profilePicture: true }
                }
            }
        });

        const totalMessages = await prisma.chat.count({ where: { conversationId } });

        res.status(StatusCodes.OK).json({
            success: true,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: page,
            messages,
        });

    } catch (error) {
        next(error);
    }
};