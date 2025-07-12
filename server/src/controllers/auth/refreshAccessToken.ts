import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../..";
import { sendResponse } from "../../utils/sendResponse";
import dotenv from "dotenv";

dotenv.config();

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    // const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) return sendResponse(res, 401, false, "Refresh token required");

    const storedSession = await prisma.session.findFirst({
      where: {
        userId: userId,
      },
    });
    if (!storedSession)
      return sendResponse(res, 401, false, "Incorrect userId");

    jwt.verify(
      storedSession.refreshToken as string,
      process.env.REFRESH_TOKEN_SECRET_KEY!,
      async (err: any, decoded: any) => {
        if (err) return sendResponse(res, 403, false, "Refresh token expired");

        const newAccessToken = jwt.sign(
          { userId: decoded.userId },
          process.env.ACCESS_TOKEN_SECRET_KEY!,
          { expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRY) || "30m" }
        );

        await prisma.session.update({
          where: {
            id: storedSession.id,
          },
          data: {
            accessToken: newAccessToken,
          },
        });

        // SETTING ACCESS TOKEN IN COOKIES
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "production",
          maxAge: Number(process.env.ACCESS_TOKEN_EXPIRY) || 30 * 60 * 1000,
          sameSite: "strict",
        });
      }
    );

    return sendResponse(res, 200, true, "Access token refreshed successfully", {
      userId: userId,
    });
  } catch (error) {
    console.error("Error while refreshing access token: ", error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};
