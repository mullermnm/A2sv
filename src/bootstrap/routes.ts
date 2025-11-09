import { Router, Request, Response } from 'express';
import authRoutes from '@src/routes/auth.routes'; // User routes for auth endpoints
import productRoutes from '@routes/product.routes';
import orderRoutes from '@routes/order.routes';

/**
 * Combines and exports all route modules
 * This is a placeholder - actual routes will be added in later phases
 */
const router = Router();

/**
 * Health Check Route
 * @route GET /api/health
 * @access Public
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * Ping Route
 * @route GET /api/ping
 * @access Public
 */
router.get('/ping', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    data: null,
  });
});

/**
 * API Routes
 */
router.use('/auth', authRoutes); // POST /api/auth/register, POST /api/auth/login
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export default router;
