import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index';
import { AuthenticatedUser, UserRole, HttpStatus } from '@src/types';
import { ErrorResponse, ErrorMessages } from '../helpers/index';

/**
 * Extend Express Request to include authenticated user
 */
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * JWT Payload structure
 */
interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Allows unprotected routes and static files to pass through
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const authReq = req as AuthRequest;

    // Check if route is unprotected
    const unprotectedRoutes = config.unprotected_routes || [];
    if (unprotectedRoutes.includes(req.path)) {
      return next();
    }

    // Check if route is static file
    const staticRoutes = config.static_file_routes || [];
    const isStaticFile = staticRoutes.some((route: string) => req.path.includes(route));
    if (isStaticFile) {
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return ErrorResponse.unauthorized(res, ErrorMessages.TOKEN_REQUIRED);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return ErrorResponse.unauthorized(res, ErrorMessages.TOKEN_MISSING);
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return ErrorResponse.send(
        res,
        ErrorMessages.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Attach user to request
    authReq.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return ErrorResponse.unauthorized(res, ErrorMessages.UNAUTHORIZED);
  }
};

/**
 * Authorization Middleware Factory
 * Checks if authenticated user has required role(s)
 * @param roles - Single role or array of roles allowed
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return ErrorResponse.unauthorized(res, ErrorMessages.TOKEN_REQUIRED);
    }

    // Check if user's role is in allowed roles
    if (!roles.includes(authReq.user.role)) {
      return ErrorResponse.forbidden(res, ErrorMessages.ADMIN_ONLY);
    }

    next();
  };
};

/**
 * Admin-only middleware
 * Shorthand for authorize(UserRole.ADMIN)
 */
export const adminOnly = authorize(UserRole.ADMIN);

/**
 * Optional authentication middleware
 * Attaches user if token is present but doesn't require it
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      authReq.user = {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (err) {
      // Silently fail for optional auth
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
