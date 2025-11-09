import { Router } from 'express';
import { authenticate, adminOnly } from '@middlewares/auth.middleware';
import uploadFile from '@helpers/multer.helper';
// import { ProductController } from '@controllers/product.controller';

const router = Router();
// const productController = new ProductController();
const productUpload = uploadFile('products');

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and search
 * @access  Public
 * @query   page, limit, search
 */
router.get('/', (req, res) => {
  // productController.getAll(req, res)
  res.status(501).json({ message: 'Get products endpoint - not implemented yet' });
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  // productController.getById(req, res)
  res.status(501).json({ message: 'Get product by ID endpoint - not implemented yet' });
});

/**
 * @route   POST /api/products
 * @desc    Create a new product (Admin only)
 * @access  Private/Admin
 * @body    name, description, price, stock, category, productImage (file)
 */
router.post(
  '/',
  authenticate,
  adminOnly,
  productUpload.single('productImage'), // Multer will save file path to req.body.productImage
  (req, res) => {
    // productController.create(req, res)
    res.status(501).json({ message: 'Create product endpoint - not implemented yet' });
  }
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (Admin only)
 * @access  Private/Admin
 * @body    name, description, price, stock, category, productImage (file) - all optional
 */
router.put(
  '/:id',
  authenticate,
  adminOnly,
  productUpload.single('productImage'), // Optional image update
  (req, res) => {
    // productController.update(req, res)
    res.status(501).json({ message: 'Update product endpoint - not implemented yet' });
  }
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, adminOnly, (req, res) => {
  // productController.delete(req, res)
  res.status(501).json({ message: 'Delete product endpoint - not implemented yet' });
});

export default router;
