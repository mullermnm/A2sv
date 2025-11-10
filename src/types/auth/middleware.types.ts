import { Request } from 'express';
import { AuthenticatedUser, UserRole } from '../users/user';

/**
 * Extend Express Request to include authenticated user
 */
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
