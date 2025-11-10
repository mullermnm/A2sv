import { Router } from 'express';
import { authenticate } from '@middlewares/auth.middleware';
import { OrderController } from '@controllers/order.controller';
import { orderLimiter, apiLimiter } from '@middlewares/rateLimiter.middleware';
import { asyncHandler } from '@helpers/asyncHandler';

const router = Router();
const orderController = new OrderController();

/**
 * @route   POST /api/orders
 * @desc    Place a new order (User role)
 * @access  Private/User
 * @body    products: [{ productId, quantity }], description (optional)
 * @note    Uses MongoDB transactions for stock updates
 * @rateLimit 10 requests per 10 minutes per IP
 */
router.post(
  '/',
  orderLimiter,
  authenticate,
  asyncHandler(orderController.placeOrder.bind(orderController))
);

/**
 * @route   GET /api/orders
 * @desc    Get order history for authenticated user
 * @access  Private
 * @rateLimit 100 requests per 15 minutes per IP
 */
router.get(
  '/',
  apiLimiter,
  authenticate,
  asyncHandler(orderController.getOrderHistory.bind(orderController))
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details for authenticated user
 * @access  Private
 * @rateLimit 100 requests per 15 minutes per IP
 */
router.get(
  '/:id',
  apiLimiter,
  authenticate,
  asyncHandler(orderController.getOrderById.bind(orderController))
);

export default router;
