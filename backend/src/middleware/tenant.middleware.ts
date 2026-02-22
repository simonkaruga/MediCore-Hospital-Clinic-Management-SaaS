import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const tenantIsolation = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
