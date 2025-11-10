import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Skip rate limiting in test environment
const skipRateLimitInTest = (_req: Request, _res: Response): boolean => {
  return process.env.NODE_ENV === 'test';
};

/**
 * Rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  skip: skipRateLimitInTest,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login/register attempts from this IP, please try again after 15 minutes',
    errors: ['RATE_LIMIT_EXCEEDED'],
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
      errors: ['RATE_LIMIT_EXCEEDED'],
    });
  },
});

/**
 * Rate limiter for general API endpoints
 * More lenient for normal operations
 */
export const apiLimiter = rateLimit({
  skip: skipRateLimitInTest,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: ['RATE_LIMIT_EXCEEDED'],
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      errors: ['RATE_LIMIT_EXCEEDED'],
    });
  },
});

/**
 * Strict rate limiter for order creation
 * Prevent spam orders
 */
export const orderLimiter = rateLimit({
  skip: skipRateLimitInTest,
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 order creations per 10 minutes
  message: {
    success: false,
    message: 'Too many order creation attempts, please try again after 10 minutes',
    errors: ['RATE_LIMIT_EXCEEDED'],
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many order creation attempts, please try again after 10 minutes',
      errors: ['RATE_LIMIT_EXCEEDED'],
    });
  },
});

/**
 * Strict rate limiter for product creation/update/delete (Admin operations)
 * Prevent spam modifications
 */
export const adminLimiter = rateLimit({
  skip: skipRateLimitInTest,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 admin operations per 5 minutes
  message: {
    success: false,
    message: 'Too many admin operations, please try again after 5 minutes',
    errors: ['RATE_LIMIT_EXCEEDED'],
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many admin operations, please try again after 5 minutes',
      errors: ['RATE_LIMIT_EXCEEDED'],
    });
  },
});
