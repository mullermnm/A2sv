import { Request, Response, NextFunction } from 'express';
import { BaseController } from './BaseController';
import { ProductService } from '@services/product.service';
import { IProduct } from '@models/product.model';
import { ErrorResponse, SuccessResponse } from '@helpers/index';
import productRepository from '@repositories/product.repository';
import { AuthRequest } from '@src/types';

/**
 * Product Controller
 * Handles HTTP requests for product operations
 */
export class ProductController extends BaseController<IProduct> {
  private productService: ProductService;

  constructor(productService: ProductService) {
    super(productService);
    this.productService = productService;
  }

  /**
   * Override buildFilter to add product search and advanced filtering
   * Supports:
   * - search: Name search (case-insensitive, partial match)
   * - minPrice, maxPrice: Price range filtering
   * - category: Category filtering
   * - status: Status filtering (active/deleted)
   * - minStock, maxStock: Stock range filtering
   * - inStock: Boolean to filter products with stock > 0
   */
  protected buildFilter(
    filters: Record<string, unknown>,
    search?: string
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    // Add case-insensitive name search
    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Price range filtering
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter.price = {};
      if (filters.minPrice !== undefined) {
        const minPrice = Number(filters.minPrice);
        if (!isNaN(minPrice) && minPrice >= 0) {
          (filter.price as Record<string, unknown>).$gte = minPrice;
        }
      }
      if (filters.maxPrice !== undefined) {
        const maxPrice = Number(filters.maxPrice);
        if (!isNaN(maxPrice) && maxPrice >= 0) {
          (filter.price as Record<string, unknown>).$lte = maxPrice;
        }
      }
    }

    // Category filtering (case-insensitive)
    if (
      filters.category &&
      typeof filters.category === 'string' &&
      filters.category.trim() !== ''
    ) {
      filter.category = filters.category.toLowerCase().trim();
    }

    // Status filtering (default to active only)
    if (filters.status && typeof filters.status === 'string') {
      const status = filters.status.toLowerCase();
      if (status === 'active' || status === 'deleted') {
        filter.status = status;
      }
    } else {
      // Default: only show active products
      filter.status = 'active';
    }

    // Stock filtering - handle minStock, maxStock, and inStock together
    const stockFilter: Record<string, unknown> = {};
    // Add min/max stock range
    if (filters.minStock !== undefined) {
      const minStock = Number(filters.minStock);
      if (!isNaN(minStock) && minStock >= 0) {
        stockFilter.$gte = minStock;
      }
    }
    if (filters.maxStock !== undefined) {
      const maxStock = Number(filters.maxStock);
      if (!isNaN(maxStock) && maxStock >= 0) {
        stockFilter.$lte = maxStock;
      }
    }

    // Add in-stock filtering (overrides minStock if both present)
    if (filters.inStock !== undefined) {
      const inStock = filters.inStock === 'true' || filters.inStock === true;
      if (inStock) {
        // If we already have minStock, use the greater value
        if (stockFilter.$gte !== undefined) {
          stockFilter.$gt = Math.max(0, Number(stockFilter.$gte) - 1);
          delete stockFilter.$gte;
        } else {
          stockFilter.$gt = 0;
        }
      }
    }

    // Apply stock filter if any conditions were set
    if (Object.keys(stockFilter).length > 0) {
      filter.stock = stockFilter;
    }

    return filter;
  }

  /**
   * Create a new product (User Story 3)
   * POST /api/products
   * Admin only
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // Get userId from authenticated user
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;

      if (!userId) {
        return ErrorResponse.send(res, 'User not authenticated', 401);
      }

      const result = await this.productService.createProduct(req.body as Partial<IProduct>, userId);

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

      const result = await this.productService.updateProduct(id, req.body as Partial<IProduct>);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message, result.statusCode);
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
