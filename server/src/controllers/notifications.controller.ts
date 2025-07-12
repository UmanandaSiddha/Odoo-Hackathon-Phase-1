import { Request, Response } from "express";
import { prisma } from "..";
import { sendResponse } from "../utils/sendResponse";

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return sendResponse(
      res,
      200,
      true,
      "fetched all notifications successfully",
      {
        notifications: notifications,
      }
    );
  } catch (error) {
    console.error("Error while getting all user notifications: ", error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return sendResponse(res, 200, true, "Marked notification as read", {
      updatedNotification: updated,
    });
  } catch (error) {
    console.error("Error while marking notification as read: ", error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};
