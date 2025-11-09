import { BaseRepository } from './BaseRepository';
import Product, { IProduct } from '@models/product.model';
import { FindAllResult, FindResult } from '../types/repository.types';
import { HttpStatus } from '../types/common.types';
import { ErrorMessages, SuccessMessages } from '@helpers/index';
import { FilterQuery } from 'mongoose';

/**
 * Product Repository
 * Handles all product-related database operations
 */
export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  /**
   * Find products with pagination and optional search
   * User Stories 5 & 6
   */
  async findAllPaginated(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<FindAllResult<IProduct>> {
    try {
      const { page, limit, search } = options;
      const skip = (page - 1) * limit;

      // Build query filter
      const filter: FilterQuery<IProduct> = {};

      // Add search condition if provided (case-insensitive, partial match)
      if (search && search.trim() !== '') {
        filter.name = { $regex: search.trim(), $options: 'i' };
      }

      // Execute queries in parallel
      const [products, total] = await Promise.all([
        this.model
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v')
          .exec(),
        this.model.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: products,
        page,
        limit,
        totalPages,
        totalItems: total,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      } as any;
    } catch (error) {
      console.error('Error in findAllPaginated:', error);
      return {
        success: false,
        data: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalItems: 0,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find product by ID with detailed information
   * User Story 7
   */
  async findByIdDetailed(id: string): Promise<FindResult<IProduct>> {
    try {
      const result = await this.findById(id, {
        populate: [{ path: 'userId', select: 'username email' }],
      });
      return result;
    } catch (error) {
      console.error('Error in findByIdDetailed:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find products by category
   */
  async findByCategory(category: string): Promise<FindAllResult<IProduct>> {
    try {
      const products = await this.model
        .find({ category: category.toLowerCase() })
        .sort({ createdAt: -1 })
        .select('-__v')
        .exec();

      return {
        success: true,
        data: products,
        page: 1,
        limit: products.length,
        totalPages: 1,
        totalItems: products.length,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findByCategory:', error);
      return {
        success: false,
        data: [],
        page: 1,
        limit: 0,
        totalPages: 0,
        totalItems: 0,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find products in stock
   */
  async findInStock(): Promise<FindAllResult<IProduct>> {
    try {
      const products = await this.model
        .find({ stock: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .select('-__v')
        .exec();

      return {
        success: true,
        data: products,
        page: 1,
        limit: products.length,
        totalPages: 1,
        totalItems: products.length,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findInStock:', error);
      return {
        success: false,
        data: [],
        page: 1,
        limit: 0,
        totalPages: 0,
        totalItems: 0,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Update product stock
   * Used for order processing
   */
  async updateStock(
    productId: string,
    quantity: number,
    operation: 'increase' | 'decrease'
  ): Promise<FindResult<IProduct>> {
    try {
      const product = await this.model.findById(productId);

      if (!product) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Product not found',
        };
      }

      if (operation === 'decrease') {
        if (product.stock < quantity) {
          return {
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Insufficient stock',
          };
        }
        product.stock -= quantity;
      } else {
        product.stock += quantity;
      }

      await product.save();

      return {
        success: true,
        data: product,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_UPDATED,
      };
    } catch (error) {
      console.error('Error in updateStock:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }
}

// Export singleton instance
export default new ProductRepository();
