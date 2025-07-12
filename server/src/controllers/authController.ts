import { Request, Response } from 'express';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  location: z.string().optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        location: validatedData.location,
        isPublic: true,
        availability: []
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        isPublic: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 