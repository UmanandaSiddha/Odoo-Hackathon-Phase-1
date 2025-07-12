import { Request, Response } from "express";
import z from "zod";
import bcrypt from 'bcryptjs';
import { prisma } from "../..";
import { accessTokenGenerator, refreshTokenGenerator } from "../../utils/auth/generate.token";
import { saveSessionInDB } from "../../utils/auth/save.session";

// Validation schema for registration
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        message: "All the fields are required",
      });

    const validatedData = loginSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    });

    if (!existingUser) return res.status(401).json({ message: "Invalid Credentials" });
    const isPasswordValid = await bcrypt.compare(validatedData.password, existingUser.password);
    if (!isPasswordValid) return res.status(401).json({
        message: "Invalid Credentials"
    });

    // Generate new tokens
    const accessToken = accessTokenGenerator(Number(existingUser.id));
    const refreshToken = refreshTokenGenerator(Number(existingUser.id));

    const saveSession = await saveSessionInDB(existingUser.id, accessToken, refreshToken);
    if (!saveSession) return res.status(500).json({
        message: "Failed to create session"
    });

    // Set secure cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(accessToken) || 30 * 60 * 1000,
      sameSite: "strict",
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(refreshToken) || 1000 * 60 * 60 * 24 * 14,
      sameSite: "strict",
      path: "/",
    });

    await prisma.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            lastLogin: new Date(),
            updatedAt: new Date()
        }
    });

    return res.status(200).json({
        message: "Login successful",
        user: existingUser,
        accessToken: accessToken
    });
  } catch (error) {
    console.error("Login error");
    return res.status(500).json({
        message: "Internal Server Error"
    });
  };
};
