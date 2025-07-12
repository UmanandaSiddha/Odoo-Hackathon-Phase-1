import catchAsyncErrors from "../middlewares/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { PrismaApiFeatures, QueryString } from "../utils/apiFeatures";
import { prisma } from "../index";

export const getAllUsers = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiFeatures = new PrismaApiFeatures(prisma.user, req.query as QueryString)
        .search(['firstName', 'lastName', 'email', 'username'])
        .filter()
        .sort()
        .pagination();

    const { results: users, totalCount } = await apiFeatures.execute();
    
    const totalPages = Math.ceil(totalCount / (Number(req.query.limit) || 10));

    res.status(200).json({
        success: true,
        count: users.length,
        totalCount,
        totalPages,
        users,
    });
})