import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import jwt from 'jsonwebtoken';
import { prisma } from "../index";
import ErrorHandler from "../utils/errorHandler";

export interface SocketWithAuth extends Socket {
    data: {
        user?: {
            id: string;
        };
    }
}

interface RequestWithCookies extends Request {
    cookies: { [key: string]: string };
}

export const socketAuthMiddleware = async (socket: SocketWithAuth, next: (err?: ExtendedError) => void) => {
    const req = socket.request as unknown as RequestWithCookies;
    
    let token = socket.handshake.auth.token;
    let authMethod = 'auth header';

    if (!token && req.cookies) {
        token = req.cookies.authToken; 
        authMethod = 'cookie';
    }

    if (!token) {
        console.error("Socket Auth: No token provided in auth header or cookies.");
        return next(new ErrorHandler("Authentication error: Token not provided.", 401));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await prisma.user.findUnique({ where: { id: payload.id } });
		if (!user) {
			return next(new ErrorHandler("User not Found!!", 404));
		}

        socket.data.user = user;
        next();

    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            console.error("Socket Auth: Token has expired.");
            return next(new Error("Authentication error: Token has expired."));
        }
        if (err instanceof jwt.JsonWebTokenError) {
            console.error("Socket Auth: Token is invalid.");
            return next(new Error("Authentication error: Token is invalid."));
        }
        
        console.error("Socket Auth: An unknown authentication error occurred.", err);
        return next(new Error("Authentication error."));
    }
};