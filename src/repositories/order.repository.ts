import { ClientSession, Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import Order, { IOrder, IOrderProduct } from '../models/order.model';
import { ErrorMessages, SuccessMessages } from '@helpers/index';
import { CreateResult, FindAllResult, HttpStatus, OrderStatus } from '@src/types';

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
   * Find all orders for a specific user with pagination
   */
  async findOrdersByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<FindAllResult<IOrder>> {
    try {
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

      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalItems = await this.model.countDocuments({ userId: new Types.ObjectId(userId) });
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated results
      const orders = await this.model
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
        data: orders,
        page,
        limit,
        totalPages,
        totalItems,
      };
    } catch (error) {
      console.error('Error in findOrdersByUser:', error);
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
   * Find order by ID and user (ensures user can only access their own orders)
   */
  async findOrderByIdAndUser(orderId: string, userId: string) {
    try {
      if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      const order = await this.model.findOne({
        _id: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId),
      });

      if (!order) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
        data: order,
      };
    } catch (error) {
      console.error('Error in findOrderByIdAndUser:', error);
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
