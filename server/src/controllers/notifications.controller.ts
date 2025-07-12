import { Request, Response } from "express";
import { prisma } from "..";
import { StatusCodes } from "http-status-codes";
import ErrorHandler from "../utils/errorHandler";

type NotificationType = 'SWAP' | 'MESSAGE' | 'SYSTEM' | 'REVIEW';
type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

interface DBNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationWithTimestamp extends DBNotification {
  timestamp: string;
}

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { filter = 'all', page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const where = {
      userId,
      ...(filter === 'unread' ? { isRead: false } : {}),
      ...(filter === 'read' ? { isRead: true } : {})
    };

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          isRead: true,
          priority: true,
          actionUrl: true,
          metadata: true,
          createdAt: true
        }
      }),
      prisma.notification.count({ where })
    ]);

    // Get notification stats
    const stats = await prisma.$transaction([
      prisma.notification.count({
        where: { userId, isRead: false }
      }),
      prisma.notification.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

    const [unreadCount, weeklyCount, totalNotifications] = stats;

    return res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map((n: DBNotification): NotificationWithTimestamp => ({
          ...n,
          timestamp: n.createdAt.toISOString(),
          metadata: n.metadata as any
        })),
        stats: {
          unread: unreadCount,
          weekly: weeklyCount,
          total: totalNotifications
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error("Error while getting notifications: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this notification"
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error("Error while marking notification as read: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Error while marking all notifications as read: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification"
      });
    }

    await prisma.notification.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error while deleting notification: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    await prisma.notification.deleteMany({
      where: { userId }
    });

    return res.status(200).json({
      success: true,
      message: "All notifications deleted successfully"
    });
  } catch (error) {
    console.error("Error while deleting all notifications: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      title,
      description,
      priority = "MEDIUM",
      actionUrl,
      metadata
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type as NotificationType,
        title,
        description,
        priority: priority as NotificationPriority,
        actionUrl,
        metadata: metadata || {}
      }
    });

    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error while creating notification: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
