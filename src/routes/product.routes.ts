import { Router } from 'express';
import { authenticate, adminOnly } from '@middlewares/auth.middleware';
import { validate } from '@validators/middleware';
import { createProductSchema, updateProductSchema } from '@validators/schemas/product.validator';
import productController from '@controllers/product.controller';
import { apiLimiter, adminLimiter } from '@middlewares/rateLimiter.middleware';
import { cacheMiddleware } from '@middlewares/cache.middleware';
import uploadFile from '@helpers/multer.helper';
import { asyncHandler } from '@helpers/asyncHandler';

const router = Router();

// Initialize upload for products - files will be saved to uploads/products/
const productUpload = uploadFile('products');

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and search (User Stories 5 & 6)
 * @access  Public
 * @query   page, limit/pageSize, search (optional)
 * @rateLimit 100 requests per 15 minutes per IP
 */
router.get(
  '/',
  apiLimiter,
  asyncHandler(cacheMiddleware(300)),
  asyncHandler(productController.getAll.bind(productController))
);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID (User Story 7)
 * @access  Public
 * @rateLimit 100 requests per 15 minutes per IP
 */
router.get(
  '/:id',
  apiLimiter,
  asyncHandler(cacheMiddleware(600)),
  asyncHandler(productController.getById.bind(productController))
);

/**
 * @route   POST /api/products
 * @desc    Create a new product (User Story 3)
 * @access  Private/Admin
 * @body    name, description, price, stock, category
 * @file    productImage (optional) - Product image upload
 * @rateLimit 20 requests per 5 minutes per IP
 */
router.post(
  '/',
  adminLimiter,
  authenticate,
  adminOnly,
  productUpload.single('productImage'),
  validate(createProductSchema),
  asyncHandler(productController.create.bind(productController))
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (User Story 4)
 * @access  Private/Admin
 * @body    name, description, price, stock, category - all optional
 * @file    productImage (optional) - Product image upload
 * @rateLimit 20 requests per 5 minutes per IP
 */
router.put(
  '/:id',
  adminLimiter,
  authenticate,
  adminOnly,
  productUpload.single('productImage'),
  validate(updateProductSchema),
  asyncHandler(productController.update.bind(productController))
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (User Story 8)
 * @access  Private/Admin
 * @rateLimit 20 requests per 5 minutes per IP
 */
router.delete(
  '/:id',
  adminLimiter,
  authenticate,
  adminOnly,
  asyncHandler(productController.delete.bind(productController))
);

export default router;
