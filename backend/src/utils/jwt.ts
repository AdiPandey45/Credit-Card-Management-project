import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export async function createRefreshToken(userId: number): Promise<string> {
  const token = generateRefreshToken();
  const expiresAt = new Date();
  
  // Parse the expiration time
  const expiresInMs = parseExpirationTime(REFRESH_TOKEN_EXPIRES_IN);
  expiresAt.setTime(expiresAt.getTime() + expiresInMs);

  try {
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  } catch (error) {
    logger.error('Error creating refresh token:', error);
    throw new Error('Failed to create refresh token');
  }
}

export async function validateRefreshToken(token: string): Promise<number | null> {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    if (refreshToken.expiresAt < new Date()) {
      // Token expired, clean it up
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      return null;
    }

    return refreshToken.userId;
  } catch (error) {
    logger.error('Error validating refresh token:', error);
    return null;
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    // Don't throw error if token doesn't exist
  }
}

export async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  } catch (error) {
    logger.error('Error revoking all user refresh tokens:', error);
    throw new Error('Failed to revoke refresh tokens');
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    if (result.count > 0) {
      logger.info(`Cleaned up ${result.count} expired refresh tokens`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
}

function parseExpirationTime(timeString: string): number {
  const match = timeString.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration time format: ${timeString}`);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

// Cleanup expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);