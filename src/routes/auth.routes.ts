import { Router } from 'express';
import userController from '@controllers/user.controller';
import { validate } from '@validators/middleware';
import { registerSchema, loginSchema } from '@validators/schemas/auth.validator';
import { authLimiter } from '@middlewares/rateLimiter.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (User Story 1)
 * @access  Public
 * @validation Joi schema validates: username (alphanumeric), email (valid format), password (8+ chars, uppercase, lowercase, number, special char)
 * @rateLimit 5 requests per 15 minutes per IP
 */
router.post('/register', authLimiter, validate(registerSchema), userController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token (User Story 2)
 * @access  Public
 * @validation Joi schema validates: email (valid format), password (required)
 * @rateLimit 5 requests per 15 minutes per IP
 */
router.post('/login', authLimiter, validate(loginSchema), userController.login);

export default router;
