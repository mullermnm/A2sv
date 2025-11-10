import { Router } from 'express';
import { authenticate } from '@middlewares/auth.middleware';
import { OrderController } from '@controllers/order.controller';
import { orderLimiter, apiLimiter } from '@middlewares/rateLimiter.middleware';

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
router.post('/', orderLimiter, authenticate, orderController.placeOrder.bind(orderController));

/**
 * @route   GET /api/orders
 * @desc    Get order history for authenticated user
 * @access  Private
 * @rateLimit 100 requests per 15 minutes per IP
 */
router.get('/', apiLimiter, authenticate, orderController.getOrderHistory.bind(orderController));

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details for authenticated user
 * @access  Private
 * @rateLimit 100 requests per 15 minutes per IP
 */
router.get('/:id', apiLimiter, authenticate, orderController.getOrderById.bind(orderController));

export default router;
