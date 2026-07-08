import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Generate JWT token for user
 */
const generateToken = (id: string, email: string, role: string): string => {
  return jwt.sign({ id, email, role }, env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

/**
 * @desc    Login admin user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user (explicitly selecting password since it might be omitted by default query selects)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify role is admin or user
    if (user.role !== 'admin' && user.role !== 'user') {
      throw new AppError('Access denied. Admin access only.', 403);
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    logger.info(`Admin logged in successfully: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register admin user (for seeding/development setup)
 * @route   POST /api/auth/register
 * @access  Public (in production this would be disabled or restricted)
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new AppError('User already exists', 400);
    }

    // Create user (password will be automatically hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: req.body.role || 'user',
      isActive: true,
    });

    logger.info(`Admin registered successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
