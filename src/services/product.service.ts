import { ProductRepository } from '@repositories/product.repository';
import { IProduct } from '@models/product.model';
import { ErrorMessages, ErrorResponse, SuccessResponse } from '@helpers/index';
import { Types } from 'mongoose';
import { BaseService } from './BaseService';

/**
 * Product Service
 * Handles business logic for product operations
 */
export class ProductService extends BaseService<IProduct> {
  private productRepository: ProductRepository;

  constructor(productRepository: ProductRepository) {
    super(productRepository);
    this.productRepository = productRepository;
  }

  /**
   * Create a new product (User Story 3)
   * Admin only
   */
  async createProduct(productData: Partial<IProduct>, userId: string) {
    try {
      // Add userId to product data
      const productWithUser = {
        ...productData,
        userId: new Types.ObjectId(userId),
      };

      const result = await this.productRepository.create(productWithUser as Partial<IProduct>);

      if (!result.success) {
        return result;
      }

      return SuccessResponse.createCreated(result.data, 'Product created successfully');
    } catch (error) {
      console.error('Error in createProduct:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Update an existing product (User Story 4)
   * Admin only
   */
  async updateProduct(productId: string, updateData: Partial<IProduct>) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(productId);

      if (!existingProduct.success || !existingProduct.data) {
        return ErrorResponse.createNotFound('Product not found');
      }

      // Update the product
      const result = await this.productRepository.updateById(productId, updateData);

      if (!result.success) {
        return result;
      }

      return SuccessResponse.createOk(result.data, 'Product updated successfully');
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Get paginated list of products with optional search (User Stories 5 & 6)
   * Public
   */
  async getProducts(query: { page: number; limit: number; search?: string }) {
    try {
      const { page, limit, search } = query;

      const result = await this.productRepository.findAll({
        page,
        limit: limit || 10,
        search,
      });

      if (!result.success) {
        return result;
      }

      return SuccessResponse.createOk(
        {
          data: result.data,
          currentPage: result.page,
          pageSize: result.limit,
          totalPages: result.totalPages,
          totalProducts: result.totalItems,
        },
        search
          ? `Found ${result.totalItems} products matching "${search}"`
          : 'Products retrieved successfully'
      );
    } catch (error) {
      console.error('Error in getProducts:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Get product details by ID (User Story 7)
   * Public
   */
  async getProductById(productId: string) {
    try {
      const result = await this.productRepository.findById(productId, {
        populate: [{ path: 'userId', select: 'username email' }],
      });

      return result;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Delete a product (User Story 8)
   * Admin only
   */
  async deleteProduct(productId: string) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(productId);

      if (!existingProduct.success || !existingProduct.data) {
        return ErrorResponse.createNotFound('Product not found');
      }

      const result = await this.productRepository.deleteById(productId);

      if (!result.success) {
        return result;
      }

      return SuccessResponse.createOk(undefined, 'Product deleted successfully');
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string) {
    try {
      const result = await this.productRepository.findByCategory(category);

      return result;
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }
}

export default ProductService;
