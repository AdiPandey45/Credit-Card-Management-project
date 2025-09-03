import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { createError } from '../middleware/errorHandler';
import { getConfig } from '../config/env';

const config = getConfig();

export interface LoginResult {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private generateAccessToken(user: { id: number; email: string; role?: string }) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role || 'USER' 
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );
  }

  private generateRefreshToken(userId: number) {
    return jwt.sign(
      { userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
  }

  async register(name: string, email: string, password: string): Promise<RegisterResult> {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw createError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      passwordHash
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    let isValidPassword = false;

    // Check passwordHash first (preferred)
    if (user.passwordHash) {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    }
    // Fallback to legacy password field
    else if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        isValidPassword = user.password === password;
      }
      
      // Upgrade to passwordHash if legacy password matched
      if (isValidPassword) {
        const newHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
        await userRepository.updatePasswordHash(user.id, newHash);
      }
    }

    if (!isValidPassword) {
      throw createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER'
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: number };
      
      // Verify user still exists
      const user = await userRepository.findById(payload.userId);
      if (!user) {
        throw createError('User not found', 401, 'USER_NOT_FOUND');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const userWithPassword = await userRepository.findByEmail(user.email);
    if (!userWithPassword) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    let isValidPassword = false;
    if (userWithPassword.passwordHash) {
      isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.passwordHash);
    } else if (userWithPassword.password) {
      isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.password);
    }

    if (!isValidPassword) {
      throw createError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);
    
    // Update password
    await userRepository.updatePasswordHash(userId, newPasswordHash);
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    const passwordHash = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);
    await userRepository.updatePasswordHash(user.id, passwordHash);
  }
}

export const authService = new AuthService();