import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    // Support tokens that use either { userId } or { sub } properties
    req.userId = (payload && (payload.userId || payload.sub)) ? Number(payload.userId ?? payload.sub) : undefined;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
