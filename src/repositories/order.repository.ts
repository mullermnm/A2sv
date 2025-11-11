import { ClientSession, Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import Order, { IOrder, IOrderProduct } from '../models/order.model';
import { ErrorMessages } from '@helpers/index';
import { CreateResult, HttpStatus, OrderStatus } from '@src/types';

/**
 * Order Repository
 * Handles all database operations for orders with transaction support
 */
export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }

  /**
   * Create order with transaction support
   * Used during order placement to ensure atomic operations
   */
  async createOrder(
    userId: Types.ObjectId,
    products: IOrderProduct[],
    description: string,
    session: ClientSession
  ): Promise<CreateResult<IOrder>> {
    try {
      const orderData = {
        userId,
        products,
        description,
        status: OrderStatus.PENDING,
        totalPrice: 0, // Will be calculated by pre-save hook
      };

      const result = await this.createWithTransaction(orderData as Partial<IOrder>, session);
      return result;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, session?: ClientSession) {
    try {
      if (!Types.ObjectId.isValid(orderId)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      const updateData = { status };

      if (session) {
        return await this.updateByIdWithTransaction(orderId, updateData, session);
      }

      return await this.updateById(orderId, updateData);
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
      };
    }
  }
}

// Export singleton instance
export default new OrderRepository();
