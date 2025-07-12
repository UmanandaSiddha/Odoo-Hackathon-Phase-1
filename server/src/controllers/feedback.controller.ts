import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import catchAsyncErrors from '../middlewares/catchAsyncErrors';
import ErrorHandler from '../utils/errorHandler';
import { StatusCodes } from 'http-status-codes';

// POST /api/feedback/:userId - Give feedback to a user
export const giveFeedback = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const reviewerId = req.user?.id;
    const { userId: revieweeId } = req.params;
    const { rating, comment } = req.body;

    if (!reviewerId || !revieweeId) {
        return next(new ErrorHandler("Missing user ID", StatusCodes.BAD_REQUEST));
    }

    if (!rating || rating < 1 || rating > 5) {
        return next(new ErrorHandler("Rating must be between 1 and 5", StatusCodes.BAD_REQUEST));
    }

    if (reviewerId === revieweeId) {
        return next(new ErrorHandler("You cannot give feedback to yourself", StatusCodes.BAD_REQUEST));
    }

    // Check if feedback already exists from reviewer to this user
    const existing = await prisma.feedback.findFirst({
        where: {
            reviewerId,
            revieweeId
        }
    });

    if (existing) {
        return next(new ErrorHandler("You already gave feedback to this user", StatusCodes.CONFLICT));
    }

    const feedback = await prisma.feedback.create({
        data: {
            reviewerId,
            revieweeId,
            rating,
            comment
        }
    });

    return res.status(StatusCodes.CREATED).json({ message: "Feedback submitted", feedback });
});

// DELETE /api/feedback/:feedbackId - Delete feedback
export const deleteFeedback = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const reviewerId = req.user?.id;
    const { feedbackId } = req.params;

    const feedback = await prisma.feedback.findUnique({
        where: { id: feedbackId }
    });

    if (!feedback) {
        return next(new ErrorHandler("Feedback not found", StatusCodes.NOT_FOUND));
    }

    if (feedback.reviewerId !== reviewerId) {
        return next(new ErrorHandler("Not authorized to delete this feedback", StatusCodes.FORBIDDEN));
    }

    await prisma.feedback.delete({ where: { id: feedbackId } });

    return res.status(StatusCodes.OK).json({ message: "Feedback deleted" });
});
