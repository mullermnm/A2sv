import { Types } from 'mongoose';
import { BaseService } from './BaseService';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { IOrder, IOrderProduct } from '../models/order.model';
import { IProduct } from '../models/product.model';
import { PlaceOrderRequest, HttpStatus } from '@src/types';
import { ErrorMessages, SuccessMessages, ErrorResponse, SuccessResponse } from '@helpers/index';

/**
 * Order Service
 * Handles business logic for order placement and retrieval
 * Uses MongoDB transactions for order placement
 */
export class OrderService extends BaseService<IOrder> {
  private productRepository: ProductRepository;

  constructor(orderRepository: OrderRepository, productRepository: ProductRepository) {
    super(orderRepository);
    this.productRepository = productRepository;
  }

  /**
   * Place a new order with MongoDB transaction
   * User Story 9: Place Order
   * - Validates products and stock availability
   * - Uses atomic transactions for data consistency
   * - Calculates total price on backend
   * - Updates product stock atomically
   * 
   * NOTE: Requires MongoDB replica set. See MONGODB_REPLICA_SET_SETUP.md
   */
  async placeOrder(userId: string, orderData: PlaceOrderRequest) {
    // Start MongoDB transaction
    const session = await this.repository.startTransaction();

    try {
      // Validate userId
      if (!Types.ObjectId.isValid(userId)) {
        await session.abortTransaction();
        await session.endSession();
        return ErrorResponse.createBadRequest(ErrorMessages.INVALID_ID);
      }

      // Validate order data
      if (!orderData.products || orderData.products.length === 0) {
        await session.abortTransaction();
        await session.endSession();
        return ErrorResponse.createBadRequest('Order must contain at least one product');
      }

      const orderProducts: IOrderProduct[] = [];

      // Process each product in the order
      for (const item of orderData.products) {
        // Validate productId
        if (!Types.ObjectId.isValid(item.productId)) {
          await session.abortTransaction();
          await session.endSession();
          throw new Error(`Invalid product ID: ${item.productId}`);
        }

        // Validate quantity
        if (!item.quantity || item.quantity < 1) {
          await session.abortTransaction();
          await session.endSession();
          throw new Error('Product quantity must be at least 1');
        }

        // Fetch product details within transaction
        const productResult = await this.productRepository.findByIdWithTransaction(
          item.productId,
          session
        );

        if (!productResult.success || !productResult.data) {
          await session.abortTransaction();
          await session.endSession();
          throw new Error(`Product not found: ${item.productId}`);
        }

        const product = productResult.data;

        // Check stock availability
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          await session.endSession();
          throw new Error(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        // Update product stock (deduct ordered quantity) within transaction
        const newStock = product.stock - item.quantity;
        const updateResult = await this.productRepository.updateByIdWithTransaction(
          item.productId,
          { stock: newStock } as Partial<IProduct>,
          session
        );

        if (!updateResult.success) {
          await session.abortTransaction();
          await session.endSession();
          throw new Error(`Failed to update stock for product: ${product.name}`);
        }

        // Add product to order with backend-calculated price
        orderProducts.push({
          productId: new Types.ObjectId(item.productId),
          name: product.name,
          price: product.price, // Use price from database, not from client
          quantity: item.quantity,
        });
      }

      // Create the order within transaction
      const orderRepo = this.repository as OrderRepository;
      const createResult = await orderRepo.createWithTransaction(
        {
          userId: new Types.ObjectId(userId),
          products: orderProducts,
          description: orderData.description || '',
          status: 'pending',
          totalPrice: 0, // Will be calculated by pre-save hook
        } as Partial<IOrder>,
        session
      );

      if (!createResult.success) {
        await session.abortTransaction();
        await session.endSession();
        throw new Error('Failed to create order');
      }

      // Commit transaction - all operations succeeded
      await session.commitTransaction();
      await session.endSession();

      return SuccessResponse.createCreated(createResult.data, SuccessMessages.OPERATION_SUCCESS);
    } catch (error) {
      // Abort transaction on any error
      try {
        await session.abortTransaction();
        await session.endSession();
      } catch {
        // Session may already be ended
      }

      console.error('Error in placeOrder:', error);

      const errorMessage = error instanceof Error ? error.message : ErrorMessages.OPERATION_FAILED;

      // Determine appropriate status code based on error
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      if (errorMessage.includes('not found')) {
        statusCode = HttpStatus.NOT_FOUND;
      } else if (
        errorMessage.includes('Invalid') ||
        errorMessage.includes('Insufficient') ||
        errorMessage.includes('must')
      ) {
        statusCode = HttpStatus.BAD_REQUEST;
      }

      return ErrorResponse.create(errorMessage, statusCode);
    }
  }

  /**
   * Get a single order by ID for a user
   * Ensures user can only access their own orders
   */
  async getOrderById(orderId: string, userId: string) {
    try {
      // Validate IDs
      if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) {
        return ErrorResponse.createBadRequest(ErrorMessages.INVALID_ID);
      }

      const orderRepo = this.repository as OrderRepository;
      const result = await orderRepo.findOrderByIdAndUser(orderId, userId);

      return result;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return ErrorResponse.createInternalError(ErrorMessages.OPERATION_FAILED);
    }
  }
}
