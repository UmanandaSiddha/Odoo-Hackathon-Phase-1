import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse";
import { prisma } from "..";

dotenv.config();

// this is the middleware function through which all routes will pass, protected ones of course
// the requests from clients needs the access token in the field
// "Authorization": `Bearer <access_token>`
export const authenticateUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;
		const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
		const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

		if (!accessTokenSecretKey || !refreshTokenSecretKey) return sendResponse(res, 500, false, "Server configuration error");

		const authHeader = req.headers.authorization;
		if (!authHeader) return sendResponse(res, 401, false, "Authorization header is required");

		// console.log("auth header: ", authHeader);
		// Check if the token format is correct
		if (!authHeader.startsWith("Bearer ")) return sendResponse(res, 401, false, "Invalid token format");

		const token = authHeader.split(" ")[1];
		if (!token) return sendResponse(res, 401, false, "Token is required");

		// Fetch user session
		const userSession = await prisma.session.findFirst({
			where: {
				userId: userId
			}
		});
		if (!userSession) return sendResponse(res, 401, false, "Session not found");
		const currentDate = new Date().toISOString();
		const refreshTokenExpiry = userSession.expiresAt?.toISOString();
		if (!refreshTokenExpiry) return;

		// Check if refresh token is expired
		if (currentDate > refreshTokenExpiry) {
			// console.log("session expired");
			return sendResponse(res, 403, false, "Session expired. Please log in again");
		}

		// Verify access token
		jwt.verify(token, accessTokenSecretKey, async (err, decoded) => {
			if (err) {
				if (err.name === "TokenExpiredError") {
					// console.error("access token expired error");
					// Attempt to refresh the access token
					try {
						const refreshToken = userSession.refreshToken;
						// console.log("refresh token: ", refreshToken);
						if (!refreshToken) {
							return sendResponse(res, 403, false, "Refresh token not found");
						}

						// Verify refresh token
						jwt.verify(
							refreshToken,
							refreshTokenSecretKey,
							async (refreshErr, refreshDecoded) => {
								if (refreshErr) {
									// console.log("Refresh token invalid or expired");
									return sendResponse(res, 403, false, "Refresh token invalid or expired");
								}

								// Generate new access token
								const newAccessToken = jwt.sign(
									{ userId: (refreshDecoded as any).userId },
									accessTokenSecretKey,
									{ expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRY) || "30m" }
								);

								// Update session with new access token
								await prisma.session.update({
									where: {
										id: userSession.id
									},
									data: {
										accessToken: newAccessToken
									}
								});

								// Set new access token in response header
								res.setHeader("X-New-Access-Token", newAccessToken);
								(req as any).user = refreshDecoded;
								next();
							}
						);
					} catch (error) {
						return sendResponse(res, 500, false, "Error refreshing token");
					}
				} else {
					return sendResponse(res, 401, false, "Invalid token");
				}
			} else {
				// Token is valid
				const jwtUserId = (decoded as any).userId;
				const paramUserId = Number(req.params.userId);

				if (jwtUserId !== paramUserId) {
					return sendResponse(res, 403, false, "User ID mismatch");
				}

				(req as any).user = decoded;
				next();
			}
		});
	} catch (error) {
		return sendResponse(res, 500, false, "Internal server error");
	}
};
