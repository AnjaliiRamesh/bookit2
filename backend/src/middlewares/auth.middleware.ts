import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'USER' | 'ORGANIZER';
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting format: "Bearer <TOKEN>"

  if (!token) {
    res.status(401).json({ message: 'Access Denied: No Token Provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    req.user = decoded; // Attach the user details directly to the request object
    next(); // Pass control smoothly to the next function block
  } catch (error) {
    res.status(403).json({ message: 'Invalid or Expired Security Token' });
  }
};

// Secondary Guard Rule: Validates specific Role profiles
export const requireRole = (role: 'USER' | 'ORGANIZER') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ message: 'Forbidden: Insufficient platform permissions' });
      return;
    }
    next();
  };
};