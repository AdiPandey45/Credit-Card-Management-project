import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function createError(message: string, statusCode: number = 500, code?: string, details?: any): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: 'Unique constraint violation',
          details: `${error.meta?.target} already exists`
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Record not found'
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          error: 'Foreign key constraint violation'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Database operation failed',
          code: error.code
        });
    }
  }

  // Custom app errors
  if (error instanceof Error && 'statusCode' in error) {
    const appError = error as AppError;
    return res.status(appError.statusCode || 500).json({
      success: false,
      error: appError.message,
      code: appError.code,
      details: appError.details
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
}