import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { StatusCodes } from "http-status-codes";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";

export const getDashboardUsers = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
        where: {
            isPublic: true,
            isBanned: false
        },
        select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            isOnline: true,
            rating: true,
            skillsOffered: {
                select: {
                    name: true
                }
            },
            location: {
                select: {
                    city: true,
                    state: true,
                    country: true
                }
            },
            feedbackRecieved: {
                select: {
                    rating: true,
                    comment: true,
                    reviewer: {
                        select: {
                            username: true,
                            profilePicture: true
                        }
                    }
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        },
        take: 100 // optional limit for performance
    });

    return res.status(StatusCodes.OK).json({ users });
});

// POST /api/requests - Send swap request
export const sendSwapRequest = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const senderId = req.user?.id;

    if (!senderId) {
        return next(new ErrorHandler('Unauthorized: User ID missing', StatusCodes.UNAUTHORIZED));
    }

    const { receiverId, skillOffered, skillWanted } = req.body;

    if (!receiverId || !skillOffered || !skillWanted) {
        return next(new ErrorHandler('All fields are required.', StatusCodes.BAD_REQUEST));
    }

    // Check for existing PENDING request
    const existing = await prisma.swapRequest.findFirst({
        where: {
            senderId,
            receiverId: String(receiverId),
            skillOffered: String(skillOffered),
            skillWanted: String(skillWanted),
            status: 'PENDING'
        }
    });

    if (existing) {
        return next(new ErrorHandler('A pending request for the same skills already exists.', StatusCodes.CONFLICT));
    }

    // Create the new request
    const request = await prisma.swapRequest.create({
        data: {
            senderId,
            receiverId: String(receiverId),
            skillOffered: String(skillOffered),
            skillWanted: String(skillWanted)
        }
    });

    return res.status(StatusCodes.CREATED).json({ message: 'Request sent', request });
});

// PATCH /api/requests/:id/accept - Accept request
export const acceptSwapRequest = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const request = await prisma.swapRequest.findUnique({ where: { id } });

    if (!request) {
        return next(new ErrorHandler('Request not found.', StatusCodes.NOT_FOUND));
    }

    if (request.receiverId !== userId) {
        return next(new ErrorHandler('You are not authorized to accept this request.', StatusCodes.FORBIDDEN));
    }

    if (request.status !== 'PENDING') {
        return next(new ErrorHandler('Request is already processed.', StatusCodes.BAD_REQUEST));
    }

    const updated = await prisma.swapRequest.update({
        where: { id },
        data: { status: 'ACCEPTED' }
    });

    return res.status(StatusCodes.OK).json({ message: 'Request accepted', request: updated });
});

// DELETE /api/requests/:id - Cancel or reject request
export const deleteSwapRequest = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { id } = req.params;

    const request = await prisma.swapRequest.findUnique({ where: { id } });

    if (!request) {
        return next(new ErrorHandler('Request not found.', StatusCodes.NOT_FOUND));
    }

    const isOwner = request.senderId === userId || request.receiverId === userId;
    if (!isOwner) {
        return next(new ErrorHandler('Not authorized to delete this request.', StatusCodes.FORBIDDEN));
    }

    await prisma.swapRequest.delete({ where: { id } });

    return res.status(StatusCodes.OK).json({ message: 'Request deleted successfully' });
});


export const getMyRequests = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        return next(new ErrorHandler('Unauthorized', StatusCodes.UNAUTHORIZED));
    }

    const [sent, received] = await Promise.all([
        prisma.swapRequest.findMany({
            where: { senderId: userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                skillOffered: true,
                skillWanted: true,
                status: true,
                createdAt: true,
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    }
                }
            }
        }),
        prisma.swapRequest.findMany({
            where: { receiverId: userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                skillOffered: true,
                skillWanted: true,
                status: true,
                createdAt: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                    }
                }
            }
        })
    ]);

    res.status(StatusCodes.OK).json({ sent, received });
});