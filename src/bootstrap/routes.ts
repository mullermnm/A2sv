import { Router, Request, Response } from 'express';

/**
 * Combines and exports all route modules
 * This is a placeholder - actual routes will be added in later phases
 */
const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'A2SV E-commerce API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Ping endpoint for Swagger demo
 * GET /api/ping
 */
router.get('/ping', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Pong! API is responsive',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

// Future route imports will be added here:
// import authRoutes from '@routes/auth.routes';
// import productRoutes from '@routes/product.routes';
// import orderRoutes from '@routes/order.routes';
//
// router.use('/auth', authRoutes);
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);

export default router;
