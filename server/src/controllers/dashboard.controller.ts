import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { StatusCodes } from "http-status-codes";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";

export const getDashboardStats = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
        return next(new ErrorHandler('Unauthorized', StatusCodes.UNAUTHORIZED));
    }

    // Get all the required data in parallel
    const [
        user,
        totalSwaps,
        monthlySwaps,
        activeConnections,
        ratings,
        skillProgress,
        achievements,
        upcomingSwaps
    ] = await Promise.all([
        // Get user details
        prisma.user.findUnique({
            where: { id: userId },
            select: { 
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true
            }
        }),

        // Total swaps
        prisma.swapRequest.count({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'ACCEPTED'
            }
        }),

        // Monthly swaps
        prisma.swapRequest.count({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'ACCEPTED',
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
                }
            }
        }),

        // Active connections
        prisma.swapRequest.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'ACCEPTED'
            },
            select: {
                sender: {
                    select: { id: true }
                },
                receiver: {
                    select: { id: true }
                }
            }
        }),

        // Get ratings
        prisma.feedback.findMany({
            where: {
                revieweeId: userId
            },
            select: {
                rating: true
            }
        }),

        // Skill progress
        prisma.skillProgress.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                progress: 'desc'
            },
            take: 3
        }),

        // Achievements
        prisma.achievement.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                unlockedAt: 'desc'
            },
            take: 4
        }),

        // Upcoming swaps (pending requests)
        prisma.swapRequest.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'ACCEPTED'
            },
            select: {
                id: true,
                skillOffered: true,
                skillWanted: true,
                sender: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                receiver: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 3
        })
    ]);

    // Calculate average rating
    const averageRating = ratings.length > 0
        ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
        : '0.0';

    // Get unique connections
    const uniqueConnections = new Set();
    activeConnections.forEach(conn => {
        uniqueConnections.add(conn.sender.id);
        uniqueConnections.add(conn.receiver.id);
    });
    uniqueConnections.delete(userId); // Remove self from connections

    // Format upcoming swaps
    const formattedUpcomingSwaps = upcomingSwaps.map(swap => ({
        title: swap.skillWanted,
        with: swap.senderId === userId 
            ? `${swap.receiver.firstName} ${swap.receiver.lastName}`
            : `${swap.sender.firstName} ${swap.sender.lastName}`,
        date: new Date(swap.createdAt).toLocaleString(),
        skillToLearn: swap.skillWanted,
        skillToTeach: swap.skillOffered
    }));

    const stats = {
        totalSwaps: {
            title: 'Total Swaps',
            value: totalSwaps,
            description: `${monthlySwaps} completed this month`,
            trend: {
                value: monthlySwaps > 0 ? ((monthlySwaps / totalSwaps) * 100).toFixed(0) : 0,
                isPositive: true
            }
        },
        activeConnections: {
            title: 'Active Connections',
            value: uniqueConnections.size,
            description: 'Active learning partners',
            trend: {
                value: 10,
                isPositive: true
            }
        },
        averageRating: {
            title: 'Average Rating',
            value: averageRating,
            description: `From ${ratings.length} reviews`,
            trend: {
                value: 5,
                isPositive: true
            }
        },
        skillsProgress: {
            title: 'Skills Progress',
            value: skillProgress.length > 0 
                ? `${Math.max(...skillProgress.map(s => s.progress))}%`
                : '0%',
            description: `${skillProgress.length} skills improved`,
            trend: {
                value: 15,
                isPositive: true
            }
        }
    };

    return res.status(StatusCodes.OK).json({
        user,
        stats,
        skillProgress,
        achievements,
        upcomingSwaps: formattedUpcomingSwaps
    });
});

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
            skillsWanted: {
                select: { name: true },
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