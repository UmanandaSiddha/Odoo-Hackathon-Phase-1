import { Request, Response, NextFunction } from "express";
import { prisma } from "../index";
import { StatusCodes } from "http-status-codes";
import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/errorHandler";

interface SwapStats {
    pending: number;
    active: number;
    completed: number;
    hoursExchanged: number;
}

interface Connection {
    sender: { id: string };
    receiver: { id: string };
}

interface Rating {
    rating: number;
}

interface SkillProgress {
    progress: number;
}

interface SwapRequest {
    id: string;
    senderId: string;
    receiverId: string;
    skillOffered: string;
    skillWanted: string;
    status: string;
    duration: number | null;
    createdAt: Date;
    lastActivity: Date | null;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        rating: number;
        skillsOffered: Array<{
            skillProgress: Array<{
                level: string;
            }>;
        }>;
    };
    receiver: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture: string | null;
        rating: number;
        skillsOffered: Array<{
            skillProgress: Array<{
                level: string;
            }>;
        }>;
    };
    messages: Array<{ id: string }>;
}

interface SkillWithProgress {
    skillProgress: Array<{
        level: string;
    }>;
}

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
        }).then((ratings: Rating[]) => ratings),

        // Skill progress
        prisma.skillProgress.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                progress: 'desc'
            },
            take: 3
        }).then((progress: SkillProgress[]) => progress),

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
        ? (ratings.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / ratings.length).toFixed(1)
        : '0.0';

    // Get unique connections
    const uniqueConnections = new Set<string>();
    activeConnections.forEach((conn: Connection) => {
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

export const getSwapStats = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
        return next(new ErrorHandler('Unauthorized', StatusCodes.UNAUTHORIZED));
    }

    const [pending, active, completed, totalHours] = await Promise.all([
        // Pending swaps
        prisma.swapRequest.count({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'PENDING'
            }
        }),

        // Active (accepted) swaps
        prisma.swapRequest.count({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'ACCEPTED'
            }
        }),

        // Completed swaps
        prisma.swapRequest.count({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'COMPLETED'
            }
        }),

        // Total hours exchanged
        prisma.swapRequest.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                status: 'COMPLETED'
            },
            select: {
                duration: true
            }
        }).then((swaps: Array<{ duration: number | null }>) => 
            swaps.reduce((acc: number, curr: { duration: number | null }) => acc + (curr.duration || 0), 0)
        )
    ]);

    const stats: SwapStats = {
        pending,
        active,
        completed,
        hoursExchanged: totalHours
    };

    return res.status(StatusCodes.OK).json({ stats });
});

export const getSwaps = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
        return next(new ErrorHandler('Unauthorized', StatusCodes.UNAUTHORIZED));
    }

    const { status, search, page = 1, limit = 10 } = req.query;

    // Build where clause
    const where: any = {
        OR: [
            { senderId: userId },
            { receiverId: userId }
        ]
    };

    // Add status filter if provided
    if (status && status !== 'all') {
        where.status = String(status).toUpperCase();
    }

    // Add search filter if provided
    if (search) {
        where.OR = [
            { skillOffered: { contains: String(search), mode: 'insensitive' } },
            { skillWanted: { contains: String(search), mode: 'insensitive' } },
            {
                sender: {
                    OR: [
                        { firstName: { contains: String(search), mode: 'insensitive' } },
                        { lastName: { contains: String(search), mode: 'insensitive' } }
                    ]
                }
            },
            {
                receiver: {
                    OR: [
                        { firstName: { contains: String(search), mode: 'insensitive' } },
                        { lastName: { contains: String(search), mode: 'insensitive' } }
                    ]
                }
            }
        ];
    }

    const [swaps, total] = await Promise.all([
        prisma.swapRequest.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            select: {
                id: true,
                skillOffered: true,
                skillWanted: true,
                status: true,
                createdAt: true,
                duration: true,
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        rating: true,
                        skillsOffered: {
                            where: {
                                name: true // We'll filter in memory
                            },
                            select: {
                                skillProgress: {
                                    select: { level: true }
                                }
                            }
                        }
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        rating: true,
                        skillsOffered: {
                            where: {
                                name: true // We'll filter in memory
                            },
                            select: {
                                skillProgress: {
                                    select: { level: true }
                                }
                            }
                        }
                    }
                },
                messages: {
                    select: {
                        id: true
                    }
                },
                lastActivity: true
            }
        }),
        prisma.swapRequest.count({ where })
    ]) as [SwapRequest[], number];

    // Format the response to match frontend requirements
    const formattedSwaps = swaps.map((swap: SwapRequest) => {
        const isUserSender = swap.sender.id === userId;
        const partner = isUserSender ? swap.receiver : swap.sender;
        const skillToTeach = isUserSender ? swap.skillOffered : swap.skillWanted;
        const skillToLearn = isUserSender ? swap.skillWanted : swap.skillOffered;

        // Filter skills in memory
        const teacherSkills = isUserSender ? 
            swap.sender.skillsOffered.filter((s: SkillWithProgress) => s.skillProgress[0]?.level) :
            swap.receiver.skillsOffered.filter((s: SkillWithProgress) => s.skillProgress[0]?.level);
        const learnerSkills = isUserSender ?
            swap.receiver.skillsOffered.filter((s: SkillWithProgress) => s.skillProgress[0]?.level) :
            swap.sender.skillsOffered.filter((s: SkillWithProgress) => s.skillProgress[0]?.level);

        return {
            id: swap.id,
            title: `${skillToLearn} Session`,
            with: {
                name: `${partner.firstName} ${partner.lastName}`,
                avatar: partner.profilePicture || '',
                rating: Number(partner.rating)
            },
            skillToTeach: {
                name: skillToTeach,
                level: teacherSkills[0]?.skillProgress[0]?.level || 'Beginner'
            },
            skillToLearn: {
                name: skillToLearn,
                level: learnerSkills[0]?.skillProgress[0]?.level || 'Beginner'
            },
            status: swap.status.toLowerCase(),
            date: new Date(swap.createdAt).toLocaleString(),
            duration: `${swap.duration || 1} hour${swap.duration !== 1 ? 's' : ''}`,
            messages: swap.messages.length,
            lastActive: swap.lastActivity 
                ? new Date(swap.lastActivity).toLocaleString()
                : 'Never'
        };
    });

    return res.status(StatusCodes.OK).json({
        swaps: formattedSwaps,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    });
});

// Update existing sendSwapRequest to include duration
export const sendSwapRequest = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
        return next(new ErrorHandler('Unauthorized', StatusCodes.UNAUTHORIZED));
    }

    const { receiverId, skillOffered, skillWanted, duration = 1 } = req.body;

    if (!receiverId || !skillOffered || !skillWanted) {
        return next(new ErrorHandler('All fields are required.', StatusCodes.BAD_REQUEST));
    }

    // Check for existing PENDING request
    const existing = await prisma.swapRequest.findFirst({
        where: {
            senderId: userId,
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
            senderId: userId,
            receiverId: String(receiverId),
            skillOffered: String(skillOffered),
            skillWanted: String(skillWanted),
            duration: Number(duration),
            lastActivity: new Date()
        }
    });

    return res.status(StatusCodes.CREATED).json({ message: 'Request sent', request });
});

// Update existing acceptSwapRequest to update lastActivity
export const acceptSwapRequest = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
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
        data: { 
            status: 'ACCEPTED',
            lastActivity: new Date()
        }
    });

    return res.status(StatusCodes.OK).json({ message: 'Request accepted', request: updated });
});

// Add new endpoint for completing a swap
export const completeSwap = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const request = await prisma.swapRequest.findUnique({ where: { id } });

    if (!request) {
        return next(new ErrorHandler('Swap not found.', StatusCodes.NOT_FOUND));
    }

    if (request.senderId !== userId && request.receiverId !== userId) {
        return next(new ErrorHandler('Not authorized to complete this swap.', StatusCodes.FORBIDDEN));
    }

    if (request.status !== 'ACCEPTED') {
        return next(new ErrorHandler('Can only complete accepted swaps.', StatusCodes.BAD_REQUEST));
    }

    const updated = await prisma.swapRequest.update({
        where: { id },
        data: { 
            status: 'COMPLETED',
            lastActivity: new Date()
        }
    });

    return res.status(StatusCodes.OK).json({ message: 'Swap completed', request: updated });
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