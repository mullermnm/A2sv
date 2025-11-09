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
router.post('/', authenticate, (req, res) => orderController.placeOrder(req, res));

/**
 * @route   GET /api/orders
 * @desc    Get order history for authenticated user
 * @access  Private
 */
router.get('/', authenticate, (req, res) => orderController.getOrderHistory(req, res));

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details for authenticated user
 * @access  Private
 */
router.get('/:id', authenticate, (req, res) => orderController.getOrderById(req, res));

export default router;
