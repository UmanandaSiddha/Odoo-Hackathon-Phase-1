import { Request, Response } from 'express';
import { prisma } from "../index";
import bcrypt from 'bcryptjs';

// import { verifyAuth } from '@/middleware/auth';

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

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
                    select: { name: true },
                },

                skillsWanted: {
                    select: { name: true },
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
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.error('Error fetching current user:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const {
            firstName,
            lastName,
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
                location: true
            }
        });

        return res.status(200).json({ user: updatedUser });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { skill, userId, firstName, city, state, country } = req.query;

        const filters: any = {
            isBanned: false,
            isPublic: true
        };

        // Filter by user ID
        if (userId) {
            filters.id = String(userId);
        }

        // Filter by first name (partial match, case-insensitive)
        if (firstName) {
            filters.firstName = {
                contains: String(firstName),
                mode: 'insensitive'
            };
        }

        // Filter by location.city/state/country
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

        // If skill is provided, use `skillsOffered`
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
                skillsOffered: { select: { name: true } },
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
            take: 50 // prevent overfetching
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error('User search failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;

        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Account deletion failed:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};