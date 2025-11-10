import { Types, startSession } from 'mongoose';
import { BaseService } from './BaseService';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { IOrder, IOrderProduct } from '../models/order.model';
import { HttpStatus } from '@src/types';
import { ErrorMessages, SuccessMessages } from '@helpers/index';

/**
 * Order placement request interface
 */
export interface PlaceOrderRequest {
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  description?: string;
}

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
   * Place a new order with transaction support
   * User Story 9: Place Order
   * - Validates products and stock availability
   * - Uses database transaction for atomic operations
   * - Calculates total price on backend
   * - Updates product stock
   */
  async placeOrder(userId: string, orderData: PlaceOrderRequest) {
    // Start a MongoDB session for transaction
    const session = await startSession();

    try {
      // Validate userId
      if (!Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      // Validate order data
      if (!orderData.products || orderData.products.length === 0) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Order must contain at least one product',
        };
      }

      let orderResult: any;

      // Execute within transaction
      await session.withTransaction(async () => {
        const orderProducts: IOrderProduct[] = [];

        // Process each product in the order
        for (const item of orderData.products) {
          // Validate productId
          if (!Types.ObjectId.isValid(item.productId)) {
            throw new Error(`Invalid product ID: ${item.productId}`);
          }

          // Validate quantity
          if (!item.quantity || item.quantity < 1) {
            throw new Error('Product quantity must be at least 1');
          }

          // Fetch product details with transaction
          const productResult = await this.productRepository.findByIdWithTransaction(
            item.productId,
            session
          );

          if (!productResult.success || !productResult.data) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          const product = productResult.data;

          // Check stock availability
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }

          // Update product stock (deduct ordered quantity)
          const newStock = product.stock - item.quantity;
          const updateResult = await this.productRepository.updateByIdWithTransaction(
            item.productId,
            { stock: newStock },
            session
          );

          if (!updateResult.success) {
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
        const createResult = await orderRepo.createOrder(
          new Types.ObjectId(userId),
          orderProducts,
          orderData.description || '',
          session
        );

        if (!createResult.success) {
          throw new Error('Failed to create order');
        }

        orderResult = createResult;
      });

      // Transaction succeeded
      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: SuccessMessages.OPERATION_SUCCESS,
        data: orderResult && orderResult.data ? orderResult.data : undefined,
      };
    } catch (error) {
      // Transaction will auto-rollback on error
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

      return {
        success: false,
        statusCode,
        message: errorMessage,
      };
    } finally {
      // Always end the session
      await session.endSession();
    }
  }

  /**
   * Get order history for a user
   * User Story 10: View Order History
   * - Returns only orders belonging to authenticated user
   * - Supports pagination
   */
  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    try {
      // Validate userId
      if (!Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
          data: [],
          page,
          limit,
          totalPages: 0,
          totalItems: 0,
        };
      }

      const orderRepo = this.repository as OrderRepository;
      const result = await orderRepo.findOrdersByUser(userId, page, limit);

      return result;
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
        data: [],
        page,
        limit,
        totalPages: 0,
        totalItems: 0,
      };
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
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      const orderRepo = this.repository as OrderRepository;
      const result = await orderRepo.findOrderByIdAndUser(orderId, userId);

      return result;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
      };
    }
  }
}
