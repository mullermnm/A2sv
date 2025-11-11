import { ProductRepository } from '@repositories/product.repository';
import { IProduct } from '@models/product.model';
import { ErrorMessages, ErrorResponse, SuccessResponse } from '@helpers/index';
import { BaseService } from './BaseService';
import Order from '@models/order.model';

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
   * Update an existing product (User Story 4)
   * Admin only
   * Uses transaction to update product and related orders
   */
  async updateProduct(productId: string, updateData: Partial<IProduct>) {
    // Start transaction using BaseRepository method
    const session = await this.productRepository.startTransaction();

    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(productId);

      if (!existingProduct.success || !existingProduct.data) {
        await session.abortTransaction();
        await session.endSession();
        return ErrorResponse.createNotFound('Product not found');
      }

      const oldProduct = existingProduct.data;
      const nameChanged = updateData.name && updateData.name !== oldProduct.name;
      const priceChanged = updateData.price !== undefined && updateData.price !== oldProduct.price;

      // Update the product using BaseRepository method
      const result = await this.productRepository.updateByIdWithTransaction(
        productId,
        updateData,
        session
      );

      if (!result.success || !result.data) {
        await session.abortTransaction();
        await session.endSession();
        return ErrorResponse.createInternalError('Failed to update product');
      }

      // If name or price changed, update all orders containing this product
      if (nameChanged || priceChanged) {
        const orders = await Order.find({ 'products.productId': productId }, null, { session });

        for (const order of orders) {
          let orderModified = false;

          for (const product of order.products) {
            if (product.productId.toString() === productId) {
              if (nameChanged && updateData.name) {
                product.name = updateData.name;
                orderModified = true;
              }
              if (priceChanged && updateData.price !== undefined) {
                product.price = updateData.price;
                orderModified = true;
              }
            }
          }

          if (orderModified) {
            // Recalculate total price
            order.totalPrice = order.products.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            order.totalPrice = Math.round(order.totalPrice * 100) / 100;

            await order.save({ session });
          }
        }
      }

      await session.commitTransaction();
      await session.endSession();

      return SuccessResponse.createOk(
        result.data,
        nameChanged || priceChanged
          ? 'Product and related orders updated successfully'
          : 'Product updated successfully'
      );
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      console.error('Error in updateProduct:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }

  /**
   * Delete a product (User Story 8)
   * Admin only
   * Checks for orders and performs soft delete if orders exist, hard delete otherwise
   */
  async deleteProduct(productId: string) {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(productId);

      if (!existingProduct.success || !existingProduct.data) {
        return ErrorResponse.createNotFound('Product not found');
      }

      // Check if there are any orders containing this product
      const ordersWithProduct = await Order.countDocuments({
        'products.productId': productId,
      });

      if (ordersWithProduct > 0) {
        // Soft delete: Update status to 'deleted'
        const result = await this.productRepository.updateById(productId, {
          status: 'deleted',
        } as Partial<IProduct>);

        if (!result.success) {
          return result;
        }

        return SuccessResponse.createOk(
          undefined,
          `Product soft deleted successfully (${ordersWithProduct} order(s) reference this product)`
        );
      } else {
        // Hard delete: No orders reference this product
        const result = await this.productRepository.deleteById(productId);

        if (!result.success) {
          return result;
        }

        return SuccessResponse.createOk(undefined, 'Product permanently deleted');
      }
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return ErrorResponse.createInternalError(ErrorMessages.INTERNAL_ERROR);
    }
  }
}

export default ProductService;
