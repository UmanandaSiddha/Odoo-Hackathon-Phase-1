import { Request, Response } from "express";
import dotenv from 'dotenv';
import { prisma } from "../..";
import { fetchUser } from "../../utils/auth/fetchUser";
import { sendResponse } from "../../utils/sendResponse";

dotenv.config();

export const logout = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({
            message: "User ID is required"
        });

        const existingUser = await fetchUser(userId);
        if (!existingUser) return sendResponse(res, 404, false, "No user found with the user id");

        // Clear access token cookie
        res.cookie("accessToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "strict",
            path: "/",
        });

        // Clear refresh token cookie
        res.cookie("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: new Date(0),
            sameSite: "strict",
            path: "/",
        });

        const existingSession = await prisma.session.findUnique({
            where: {
                id: userId
            }
        });

        if (!existingSession) return sendResponse(res, 404, false, "session could not be found");
        await prisma.invalidatedToken.create({
            data: {
                refreshToken: existingSession.refreshToken,
                userId: existingUser.id,
                invalidatedAt: new Date()
            }
        });

        const deletedSession = await prisma.session.delete({
            where: {
                id: userId
            }
        });
        if (!deletedSession) return res.status(500).json({ message: "something unexpected occured while deleting the session" });

        return sendResponse(res, 200, false, "User logged out successfully");
    } catch (error) {
        console.error("Error while logging out: ", error);
        return sendResponse(res, 500, false, "Internal Server Error");
    };
};