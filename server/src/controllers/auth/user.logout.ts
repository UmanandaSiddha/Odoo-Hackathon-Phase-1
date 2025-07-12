import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
    try {
        
    } catch (error) {
        console.error("Error while logging out: ", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    };
};