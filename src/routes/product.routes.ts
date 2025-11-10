import { Router } from 'express';
import { authenticate, adminOnly } from '@middlewares/auth.middleware';
import { validate } from '@validators/middleware';
import { createProductSchema, updateProductSchema } from '@validators/schemas/product.validator';
import productController from '@controllers/product.controller';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and search (User Stories 5 & 6)
 * @access  Public
 * @query   page, limit/pageSize, search (optional)
 */
router.get('/', productController.getAll);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID (User Story 7)
 * @access  Public
 */
router.get('/:id', productController.getById);

/**
 * @route   POST /api/products
 * @desc    Create a new product (User Story 3)
 * @access  Private/Admin
 * @body    name, description, price, stock, category
 */
router.post('/', authenticate, adminOnly, validate(createProductSchema), productController.create);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (User Story 4)
 * @access  Private/Admin
 * @body    name, description, price, stock, category - all optional
 */
router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate(updateProductSchema),
  productController.update
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (User Story 8)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, productController.delete);

export default router;
