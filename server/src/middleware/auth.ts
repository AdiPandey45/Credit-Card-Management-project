import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface JWTPayload {
  userId: number;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'Authorization header required' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Bearer token required' 
      });
    }

    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    req.userId = payload.userId;
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role || 'USER'
    };
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
}

export async function validateUserExists(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        success: false,
        error: 'User ID not found in token' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('User validation failed', { error: error.message, userId: req.userId });
    return res.status(500).json({ 
      success: false,
      error: 'User validation failed' 
    });
  }
}