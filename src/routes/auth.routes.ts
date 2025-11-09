import { Router } from 'express';
import userController from '@controllers/user.controller';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (User Story 1)
 * @access  Public
 */
router.post('/register', userController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token (User Story 2)
 * @access  Public
 */
router.post('/login', userController.login);

export default router;
