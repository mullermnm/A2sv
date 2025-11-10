import { BaseRepository } from './BaseRepository';
import Product, { IProduct } from '@models/product.model';
import { FindAllResult, FindResult, HttpStatus } from '@src/types';
import { ErrorMessages } from '@helpers/index';
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
   * Find product by ID with detailed information
   * User Story 7
   */

  /**
   * Find products by category - uses base findAll
   */
  async findByCategory(category: string): Promise<FindAllResult<IProduct>> {
    const filter: FilterQuery<IProduct> = {
      category: category.toLowerCase(),
      status: 'active',
    };
    return this.findAll(filter, { select: ['-__v'], sort: '-createdAt' });
  }

  /**
   * Find products in stock - uses base findAll
   */
  async findInStock(): Promise<FindAllResult<IProduct>> {
    const filter: FilterQuery<IProduct> = {
      stock: { $gt: 0 },
      status: 'active',
    };
    return this.findAll(filter, { select: ['-__v'], sort: '-createdAt' });
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
      // Use base findById method
      const productResult = await this.findById(productId);

      if (!productResult.success || !productResult.data) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Product not found',
        };
      }

      const currentStock = productResult.data.stock;

      if (operation === 'decrease') {
        if (currentStock < quantity) {
          return {
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Insufficient stock',
          };
        }
      }

      // Calculate new stock
      const newStock = operation === 'decrease' ? currentStock - quantity : currentStock + quantity;

      // Use base updateById method
      return this.updateById(productId, { stock: newStock } as Partial<IProduct>);
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
