// @ts-ignore: If you see type errors, ensure you have @types/express, @types/jsonwebtoken, and @types/node installed
// <reference types="node" />
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
  user?: any;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const headers = req.headers as Record<string, string | undefined>;
  const authHeader = headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function isRole(req: AuthRequest, ...roles: string[]): boolean {
  if (!req.user || !req.user.roles) return false;
  return roles.some(role => req.user.roles.includes(role));
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!isRole(req, 'ROLE_ADMIN')) {
      return res.status(403).json({ error: 'Admin role required' });
    }
    next();
  });
} 