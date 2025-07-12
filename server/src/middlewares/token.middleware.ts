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
		const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET_KEY;
		const refreshTokenSecretKey = process.env.REFRESH_TOKEN_SECRET_KEY;

		if (!accessTokenSecretKey || !refreshTokenSecretKey) return sendResponse(res, 500, false, "Server configuration error");

		const authHeader = req.headers.authorization;
		if (!authHeader) return sendResponse(res, 401, false, "Authorization header is required");

		// Check if the token format is correct
		if (!authHeader.startsWith("Bearer ")) return sendResponse(res, 401, false, "Invalid token format");

		const token = authHeader.split(" ")[1];
		if (!token) return sendResponse(res, 401, false, "Token is required");

		console.log("Received token:", token);

		// Verify access token first
		jwt.verify(token, accessTokenSecretKey, async (err, decoded) => {
			if (err) {
				console.log("Token verification error:", err.name, err.message);
				
				if (err.name === "TokenExpiredError") {
					// Get userId from expired token
					const decodedExpired = jwt.decode(token) as any;
					console.log("Decoded expired token:", decodedExpired);
					
					if (!decodedExpired?.userId) {
						return sendResponse(res, 401, false, "Invalid token");
					}

					// Fetch user session using userId from expired token
					const userSession = await prisma.session.findFirst({
						where: {
							userId: decodedExpired.userId
						}
					});

					if (!userSession) return sendResponse(res, 401, false, "Session not found");
					
					const currentDate = new Date().toISOString();
					const refreshTokenExpiry = userSession.expiresAt?.toISOString();
					if (!refreshTokenExpiry) return sendResponse(res, 500, false, "Invalid session expiry");

					// Check if refresh token is expired
					if (currentDate > refreshTokenExpiry) {
						return sendResponse(res, 403, false, "Session expired. Please log in again");
					}

					try {
						const refreshToken = userSession.refreshToken;
						if (!refreshToken) {
							return sendResponse(res, 403, false, "Refresh token not found");
						}

						// Verify refresh token
						jwt.verify(
							refreshToken,
							refreshTokenSecretKey,
							async (refreshErr: jwt.VerifyErrors | null, refreshDecoded: any) => {
								if (refreshErr) {
									console.log("Refresh token error:", refreshErr);
									return sendResponse(res, 403, false, "Refresh token invalid or expired");
								}

								console.log("Refresh token decoded:", refreshDecoded);

								// Generate new access token
								const newAccessToken = jwt.sign(
									{ userId: refreshDecoded.userId },
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
								(req as any).user = { userId: refreshDecoded.userId };
								next();
							}
						);
					} catch (error) {
						console.log("Token refresh error:", error);
						return sendResponse(res, 500, false, "Error refreshing token");
					}
				} else {
					return sendResponse(res, 401, false, "Invalid token");
				}
			} else {
				// Token is valid
				console.log("Decoded token:", decoded);
				const jwtUserId = (decoded as any).userId;
				
				// Only check userId match if it's provided in params
				if (req.params.userId && jwtUserId !== req.params.userId) {
					return sendResponse(res, 403, false, "User ID mismatch");
				}

				(req as any).user = { userId: jwtUserId };
				next();
			}
		});
	} catch (error) {
		console.error("Authentication error:", error);
		return sendResponse(res, 500, false, "Internal server error");
	}
};
