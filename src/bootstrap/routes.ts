import { Router, Request, Response } from 'express';
import authRoutes from '@routes/auth.routes';
import productRoutes from '@routes/product.routes';
import orderRoutes from '@routes/order.routes';

/**
 * Combines and exports all route modules with API versioning
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
 * API v1 Routes
 */
const v1Router = Router();
v1Router.use('/auth', authRoutes); // POST /api/v1/auth/register, POST /api/v1/auth/login
v1Router.use('/products', productRoutes);
v1Router.use('/orders', orderRoutes);

// Mount v1 routes
router.use('/v1', v1Router);

export default router;
