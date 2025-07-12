import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  accessTokenGenerator,
  refreshTokenGenerator,
} from "../../utils/auth/generate.token";
import { Prisma } from "@prisma/client";
import { saveSessionInDB } from "../../utils/auth/save.session";
import { prisma } from "../..";
import dotenv from 'dotenv';

dotenv.config();

interface INewUserProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isPublic: boolean;
  rating?: number;
  availability?: [];
}

// Validation schema for registration
const registerSchema = z.object({
  firstName: z.string().min(2, "Name must be at least 2 characters"),
  lastname: z.string().min(2, "last name must be at least 2 characters"),
  username: z.string().min(2, "username must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

export const register = async (req: Request, res: Response) => {
  try {
    // validating whether all the fields are present or not
    const { firstName, lastName, username, email, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // passing the request body through zod
    const validatedData = registerSchema.parse(req.body);

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user: INewUserProps = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastname,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        isPublic: true,
        rating: new Prisma.Decimal(0.0),
        availability: { create: [] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        isPublic: true,
      },
    });

    const accessToken = accessTokenGenerator(Number(user.id));
    const refreshToken = refreshTokenGenerator(Number(user.id));

    // saving the session in the database
    const savedSession = await saveSessionInDB(
      user.id,
      accessToken,
      refreshToken
    );
    if (!savedSession)
      return res.status(500).json({
        message: "Failed to create a session",
      });

    // saving the tokens in the cookies
    if (accessTokenExpiry || refreshTokenExpiry) {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: Number(accessToken) || 1000 * 60 * 30,
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
    } else {
      return res.status(500).json({
        message: "Token expiry configuration missing",
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
