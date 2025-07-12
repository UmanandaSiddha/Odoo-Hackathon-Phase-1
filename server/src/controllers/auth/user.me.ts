import { Request, Response } from 'express';
import { Prisma } from "@prisma/client";
import { prisma } from '../..';

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // The user ID will be available from the auth middleware in req.user
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User not authenticated'
      });
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive fields like password
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return user data
    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
