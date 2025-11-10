import { Router } from 'express';
import { authenticate } from '@middlewares/auth.middleware';
import { OrderController } from '@controllers/order.controller';

const router = Router();
const orderController = new OrderController();

/**
 * @route   POST /api/orders
 * @desc    Place a new order (User role)
 * @access  Private/User
 * @body    products: [{ productId, quantity }], description (optional)
 * @note    Uses MongoDB transactions for stock updates
 */
router.post('/', authenticate, orderController.placeOrder);

/**
 * @route   GET /api/orders
 * @desc    Get order history for authenticated user
 * @access  Private
 */
router.get('/', authenticate, orderController.getOrderHistory);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details for authenticated user
 * @access  Private
 */
router.get('/:id', authenticate, orderController.getOrderById);

export default router;
