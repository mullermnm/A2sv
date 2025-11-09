import { Router } from 'express';
import { authenticate } from '@middlewares/auth.middleware';
// import { OrderController } from '@controllers/order.controller';

const router = Router();
// const orderController = new OrderController();

/**
 * @route   POST /api/orders
 * @desc    Place a new order (User role)
 * @access  Private/User
 * @body    products: [{ productId, quantity }], description (optional)
 * @note    Uses MongoDB transactions for stock updates
 */
router.post('/', authenticate, (_req, res) => {
  // orderController.create(req, res)
  res.status(501).json({ message: 'Place order endpoint - not implemented yet' });
});

/**
 * @route   GET /api/orders
 * @desc    Get order history for authenticated user
 * @access  Private
 */
router.get('/', authenticate, (_req, res) => {
  // orderController.getAll(req, res)
  res.status(501).json({ message: 'Get order history endpoint - not implemented yet' });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details for authenticated user
 * @access  Private
 */
router.get('/:id', authenticate, (_req, res) => {
  // orderController.getById(req, res)
  res.status(501).json({ message: 'Get order by ID endpoint - not implemented yet' });
});

export default router;
