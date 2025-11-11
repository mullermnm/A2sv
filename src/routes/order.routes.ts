import { Router } from 'express';
import { authenticate } from '@middlewares/auth.middleware';
import { OrderController } from '@controllers/order.controller';
import { orderLimiter, apiLimiter } from '@middlewares/rateLimiter.middleware';
import { asyncHandler } from '@helpers/asyncHandler';
import { validate } from '@validators/middleware';
import { createOrderSchema } from '@validators/schemas/order.validator';
import { OrderService } from '@services/order.service';
import orderRepository from '@repositories/order.repository';
import productRepository from '@repositories/product.repository';

const router = Router();
const orderService = new OrderService(orderRepository, productRepository);
const orderController = new OrderController(orderService);

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
  validate(createOrderSchema),
  asyncHandler(orderController.placeOrder.bind(orderController))
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin) or user's own orders (User)
 * @access  Private
 * @query   page, limit, status (optional filters)
 * @rateLimit 100 requests per 15 minutes per IP
 * @note    Admin sees all orders, regular users see only their own
 */
router.get(
  '/',
  apiLimiter,
  authenticate,
  asyncHandler(orderController.getAll.bind(orderController))
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
  asyncHandler(orderController.getById.bind(orderController))
);

export default router;
