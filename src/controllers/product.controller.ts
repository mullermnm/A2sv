import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@services/product.service';
import { SuccessResponse, ErrorResponse } from '@helpers/index';
import productRepository from '@repositories/product.repository';

/**
 * Product Controller
 * Handles HTTP requests for product operations
 */
export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  /**
   * Create a new product (User Story 3)
   * POST /api/products
   * Admin only
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // Get userId from authenticated user
      const userId = (req as any).user?.userId;

      if (!userId) {
        return ErrorResponse.send(res, 'User not authenticated', 401);
      }

      const result = await this.productService.createProduct(req.body, userId);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message, result.statusCode);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a product (User Story 4)
   * PUT /api/products/:id
   * Admin only
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      if (!id) {
        return ErrorResponse.send(res, 'Product ID is required', 400);
      }

      const result = await this.productService.updateProduct(id, req.body);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message, result.statusCode);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get list of products with pagination and search (User Stories 5 & 6)
   * GET /api/products
   * Public
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit =
        parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string) || '';

      const result = await this.productService.getProducts({ page, limit, search });

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      // Return paginated response
      return res.status(result.statusCode).json({
        success: true,
        message: result.message,
        data: result.data,
        currentPage: (result as any).currentPage,
        pageSize: (result as any).pageSize,
        totalPages: (result as any).totalPages,
        totalProducts: (result as any).totalProducts,
        errors: null,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get product details by ID (User Story 7)
   * GET /api/products/:id
   * Public
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      if (!id) {
        return ErrorResponse.send(res, 'Product ID is required', 400);
      }

      const result = await this.productService.getProductById(id);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message, result.statusCode);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a product (User Story 8)
   * DELETE /api/products/:id
   * Admin only
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      if (!id) {
        return ErrorResponse.send(res, 'Product ID is required', 400);
      }

      const result = await this.productService.deleteProduct(id);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, undefined, result.message, result.statusCode);
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
export default new ProductController(new ProductService(productRepository));
