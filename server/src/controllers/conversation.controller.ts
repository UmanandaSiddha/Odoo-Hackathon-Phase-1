import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { StatusCodes } from "http-status-codes";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";

export const getConversations = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.query;
    if (!userId) {
        return next(new ErrorHandler("No Userid", 404));
    }
    const conversation = await prisma.conversation.findFirst({
        where: {
            participants: {
                some: {
                    id: typeof userId === "string" ? userId : Array.isArray(userId) ? userId[0] : undefined
                }
            }
        }
    });
    res.status(StatusCodes.OK).json({
        success: true,
        data: conversation
    })
});