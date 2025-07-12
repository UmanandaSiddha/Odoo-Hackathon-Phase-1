import { Request, Response } from 'express';
import { prisma } from "../index";
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import ErrorHandler from '../utils/errorHandler';

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                isPublic: true,
                isOnline: true,
                isVerified: true,
                isBanned: true,
                role: true,
                rating: true,
                profilePicture: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                website: true,
                bio: true,
                phone: true,

                location: {
                    select: {
                        address: true,
                        city: true,
                        state: true,
                        country: true,
                        pinCode: true,
                    },
                },

                availability: true,

                skillsOffered: {
                    select: {
                        id: true,
                        name: true,
                        skillProgress: {
                            select: {
                                level: true,
                                progress: true,
                                hoursSpent: true
                            }
                        }
                    },
                },

                skillsWanted: {
                    select: {
                        id: true,
                        name: true,
                        skillProgress: {
                            select: {
                                level: true,
                                progress: true,
                                hoursSpent: true
                            }
                        }
                    },
                },

                feedbackRecieved: {
                    select: {
                        rating: true,
                        comment: true,
                        reviewer: {
                            select: {
                                id: true,
                                username: true,
                                profilePicture: true,
                            },
                        },
                    },
                },

                achievements: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        icon: true,
                        unlockedAt: true
                    },
                    orderBy: {
                        unlockedAt: 'desc'
                    }
                }
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Calculate stats
        const stats = {
            totalSwaps: await prisma.swapRequest.count({
                where: {
                    OR: [
                        { senderId: userId, status: 'ACCEPTED' },
                        { receiverId: userId, status: 'ACCEPTED' }
                    ]
                }
            }),
            hoursSpent: await prisma.skillProgress.aggregate({
                where: { userId },
                _sum: { hoursSpent: true }
            }).then((result: { _sum: { hoursSpent: number | null } }) => result._sum.hoursSpent || 0),
            rating: Number(user.rating),
            reviews: await prisma.feedback.count({
                where: { revieweeId: userId }
            }),
            completionRate: await prisma.swapRequest.groupBy({
                by: ['status'],
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                },
                _count: true
            }).then((results: Array<{ status: string; _count: number }>) => {
                const total = results.reduce((acc: number, curr: { _count: number }) => acc + curr._count, 0);
                const completed = results.find((r: { status: string; _count: number }) => r.status === 'ACCEPTED')?._count || 0;
                return total > 0 ? Math.round((completed / total) * 100) : 100;
            })
        };

        return res.status(200).json({ user: { ...user, stats } });
    } catch (err) {
        console.error('Error fetching current user:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        const {
            firstName,
            lastName,
            bio,
            website,
            phone,
            profilePicture,
            isPublic,
            address
        } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { addressId: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                bio,
                website,
                phone,
                profilePicture,
                isPublic,
                ...(address && {
                    location: user.addressId
                        ? {
                            update: {
                                where: { id: user.addressId },
                                data: address
                            }
                        }
                        : {
                            create: address
                        }
                })
            },
            include: {
                location: true,
                skillsOffered: true,
                skillsWanted: true,
                achievements: true
            }
        });

        return res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateSkills = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { skills, type } = req.body;

        if (!Array.isArray(skills)) {
            return res.status(400).json({ message: 'Skills must be an array' });
        }

        const relationName = type === 'offered' ? 'skillsOffered' : 'skillsWanted';

        // Get existing skills
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                [relationName]: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete removed skills
        const existingSkills = user[relationName] as { id: string, name: string }[];
        const skillsToDelete = existingSkills.filter(
            existing => !skills.some(newSkill => newSkill.name === existing.name)
        );

        // Create new skills
        const skillsToCreate = skills.filter(
            newSkill => !existingSkills.some(existing => existing.name === newSkill.name)
        );

        // Update user with new skills
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                [relationName]: {
                    deleteMany: {
                        id: {
                            in: skillsToDelete.map(skill => skill.id)
                        }
                    },
                    create: skillsToCreate.map(skill => ({
                        name: skill.name,
                        skillProgress: {
                            create: {
                                level: skill.level || 'Beginner',
                                progress: 0,
                                hoursSpent: 0
                            }
                        }
                    }))
                }
            },
            include: {
                skillsOffered: {
                    include: {
                        skillProgress: true
                    }
                },
                skillsWanted: {
                    include: {
                        skillProgress: true
                    }
                }
            }
        });

        return res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.error('Error updating skills:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateSkillProgress = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { skillId, progress, level, hoursSpent } = req.body;

        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            include: { skillProgress: true }
        });

        if (!skill || skill.userId !== userId) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        const updatedProgress = await prisma.skillProgress.upsert({
            where: {
                id: skill.skillProgress?.id || 'new',
            },
            create: {
                userId,
                skillName: skill.name,
                progress: progress || 0,
                level: level || 'Beginner',
                hoursSpent: hoursSpent || 0
            },
            update: {
                progress: progress !== undefined ? progress : undefined,
                level: level || undefined,
                hoursSpent: hoursSpent !== undefined ? hoursSpent : undefined
            }
        });

        return res.status(200).json({ progress: updatedProgress });
    } catch (err) {
        console.error('Error updating skill progress:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { skill, userId, firstName, city, state, country } = req.query;

        const filters: any = {
            isBanned: false,
            isPublic: true
        };

        if (userId) {
            filters.id = String(userId);
        }

        if (firstName) {
            filters.firstName = {
                contains: String(firstName),
                mode: 'insensitive'
            };
        }

        if (city || state || country) {
            filters.location = {
                ...(city && {
                    city: {
                        contains: String(city),
                        mode: 'insensitive'
                    }
                }),
                ...(state && {
                    state: {
                        contains: String(state),
                        mode: 'insensitive'
                    }
                }),
                ...(country && {
                    country: {
                        contains: String(country),
                        mode: 'insensitive'
                    }
                })
            };
        }

        if (skill) {
            filters.skillsOffered = {
                some: {
                    name: {
                        contains: String(skill),
                        mode: 'insensitive'
                    }
                }
            };
        }

        const users = await prisma.user.findMany({
            where: filters,
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
                rating: true,
                skillsOffered: {
                    select: {
                        name: true,
                        skillProgress: {
                            select: {
                                level: true
                            }
                        }
                    }
                },
                location: {
                    select: {
                        city: true,
                        state: true,
                        country: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            },
            take: 50
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error('User search failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { isOnline, lastLogin } = req.body;

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(typeof isOnline === 'boolean' && { isOnline }),
                ...(lastLogin && { lastLogin: new Date(lastLogin) })
            },
            select: {
                id: true,
                isOnline: true,
                lastLogin: true
            }
        });

        return res.status(200).json({ status: 'ok', user: updated });
    } catch (err) {
        console.error('Failed to update status:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing passwords' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true }
        });

        const isMatch = await bcrypt.compare(currentPassword, user!.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Password change failed:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Account deletion failed:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};