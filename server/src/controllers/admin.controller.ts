import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { PrismaApiFeatures, QueryString } from "../utils/apiFeatures";
import { prisma } from "../index";
import ErrorHandler from "../utils/errorHandler";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { SocketServer } from "../services/socket.service";

export const getAllUsers = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiFeatures = new PrismaApiFeatures(prisma.user, req.query as QueryString)
        .search(['firstName', 'lastName', 'email', 'username'])
        .filter()
        .sort()
        .pagination();

    const { results: users, totalCount } = await apiFeatures.execute();

    const totalPages = Math.ceil(totalCount / (Number(req.query.limit) || 10));

    res.status(200).json({
        success: true,
        count: users.length,
        totalCount,
        totalPages,
        users,
    });
});

export const getUserById = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    if (!userId) {
        return next(new ErrorHandler("UserId not available in params", StatusCodes.BAD_REQUEST));
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

export const deleteUser = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    if (!userId) {
        return next(new ErrorHandler("UserId not available in params", StatusCodes.BAD_REQUEST));
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

const banActionBodySchema = z.object({
    ban: z.enum(['TRUE', 'FALSE'], {
        required_error: "The 'ban' status is required.",
        invalid_type_error: "Ban status must be a string: 'TRUE' or 'FALSE'.",
    })
});

export const userBanAction = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    if (!userId) {
        return next(new ErrorHandler("UserId not available in params", StatusCodes.BAD_REQUEST));
    }

    const bodyValidation = banActionBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        const errorMessage = bodyValidation.error.errors[0].message;
        return next(new ErrorHandler(errorMessage, StatusCodes.BAD_REQUEST));
    }
    const { ban } = bodyValidation.data;

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        return next(new ErrorHandler("User not found", StatusCodes.NOT_FOUND));
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: ban === "TRUE",
        }
    });

    res.status(200).json({
        success: true,
        message: `User has been successfully ${ban === "TRUE" ? 'banned' : 'unbanned'}.`,
        data: updatedUser,
    });
});

export const getAllSkills = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiFeatures = new PrismaApiFeatures(prisma.skill, req.query as QueryString)
        .search(['name'])
        .filter()
        .sort()
        .pagination();

    const { results: skills, totalCount } = await apiFeatures.execute();

    const totalPages = Math.ceil(totalCount / (Number(req.query.limit) || 10));

    res.status(200).json({
        success: true,
        count: skills.length,
        totalCount,
        totalPages,
        skills,
    });
});

export const deleteSkill = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { skillId } = req.params;
    if (!skillId) {
        return next(new ErrorHandler("SkillId not available in params", StatusCodes.BAD_REQUEST));
    }

    const skill = await prisma.skill.findUnique({
        where: { id: skillId }
    });
    if (!skill) {
        return next(new ErrorHandler("Skill not found", StatusCodes.NOT_FOUND));
    }

    await prisma.skill.delete({
        where: { id: skillId }
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Skill deleted successfully"
    })
});

export const getAllSwaps = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiFeatures = new PrismaApiFeatures(prisma.swapRequest, req.query as QueryString)
        .filter()
        .sort()
        .pagination();

    const { results: swaps, totalCount } = await apiFeatures.execute();

    const totalPages = Math.ceil(totalCount / (Number(req.query.limit) || 10));

    res.status(200).json({
        success: true,
        count: swaps.length,
        totalCount,
        totalPages,
        swaps,
    });
});

const adminMesaageBodySchema = z.object({
    title: z.string(),
    body: z.string()
});

export const createAdminMessage = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const bodyValidation = adminMesaageBodySchema.safeParse(req.body);
    if (!bodyValidation.success) {
        const errorMessage = bodyValidation.error.errors[0].message;
        return next(new ErrorHandler(errorMessage, StatusCodes.BAD_REQUEST));
    }
    const { title, body } = bodyValidation.data;

    const message = await prisma.adminMessage.create({
        data: {
            title,
            body
        }
    });

    const socketServer = req.app.get('socketServer') as SocketServer;
    if (socketServer) {
        socketServer.broadcastToAll("Admin Message", message);
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: message
    });
});

export const deleteAdminMessage = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { messageId } = req.params;
    if (!messageId) {
        return next(new ErrorHandler("MessageId not available in params", StatusCodes.BAD_REQUEST));
    }

    const message = await prisma.adminMessage.findFirst({
        where: { id: messageId }
    });
    if (!message) {
        return next(new ErrorHandler("No Message Found", StatusCodes.NOT_FOUND));
    }

    await prisma.adminMessage.delete({
        where: { id: messageId }
    });

    const socketServer = req.app.get('socketServer') as SocketServer;
    if (socketServer) {
        socketServer.broadcastToAll("Admin Message", null);
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Message Deleted SuccessFully"
    });
});