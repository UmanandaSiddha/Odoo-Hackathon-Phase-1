import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from '@prisma/client';
import ErrorHandler from "../utils/errorHandler";

interface PrismaKnownError extends Prisma.PrismaClientKnownRequestError {
    meta?: {
        target?: string[];
        cause?: string;
    };
}

const ErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message: err.message || "Internal Server Error",
    };

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const prismaError = err as PrismaKnownError;
        
        switch (prismaError.code) {
            case 'P2002': {
                const field = prismaError.meta?.target?.[0] || 'field';
                const message = `The value for the ${field} field is already taken.`;
                error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
                break;
            }
            case 'P2025': {
                const message = prismaError.meta?.cause || `Resource not found. The requested record does not exist.`;
                error = new ErrorHandler(message, StatusCodes.NOT_FOUND);
                break;
            }
            case 'P2023': {
                const message = `Invalid input data format. ${prismaError.meta?.cause || ''}`;
                error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
                break;
            }
            default: {
                error = new ErrorHandler(`Database Error: ${prismaError.message}`, StatusCodes.INTERNAL_SERVER_ERROR);
                break;
            }
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        console.error("Prisma Validation Error:", err.message);
        const message = "A validation error occurred. Please check your input data.";
        error = new ErrorHandler(message, StatusCodes.BAD_REQUEST);
    }

    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid. Please try again.`;
        error = new ErrorHandler(message, StatusCodes.UNAUTHORIZED);
    }

    if (err.name === "TokenExpiredError") {
        const message = `Json Web Token has expired. Please log in again.`;
        error = new ErrorHandler(message, StatusCodes.UNAUTHORIZED);
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        details: err.details || {},
    });
};

export default ErrorMiddleware;