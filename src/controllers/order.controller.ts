import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { IOrder } from '../models/order.model';
import { ErrorResponse, SuccessResponse } from '@helpers/index';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Order Controller
 * Handles HTTP requests for order management
 */
export class OrderController extends BaseController<IOrder> {
  private orderService: OrderService;

  constructor() {
    const orderRepository = new OrderRepository();
    const productRepository = new ProductRepository();
    const orderService = new OrderService(orderRepository, productRepository);
    
    super(orderService);
    this.orderService = orderService;
  }

  /**
   * Place a new order
   * POST /api/orders
   * @access Private (Authenticated users)
   * User Story 9: Place Order
   */
  async placeOrder(req: Request, res: Response): Promise<Response | void> {
    try {
      const authReq = req as AuthRequest;
      
      // Check authentication
      if (!authReq.user || !authReq.user.userId) {
        return ErrorResponse.send(res, 'Unauthorized', 401);
      }

      const userId = authReq.user.userId;
      const orderData = req.body;

      // Validate request body
      if (!orderData.products || !Array.isArray(orderData.products)) {
        return ErrorResponse.send(res, 'Products array is required', 400);
      }

      if (orderData.products.length === 0) {
        return ErrorResponse.send(res, 'Order must contain at least one product', 400);
      }

      // Validate each product item
      for (const item of orderData.products) {
        if (!item.productId || !item.quantity) {
          return ErrorResponse.send(
            res,
            'Each product must have productId and quantity',
            400
          );
        }

        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          return ErrorResponse.send(res, 'Quantity must be a number greater than 0', 400);
        }
      }

      // Place the order using service
      const result = await this.orderService.placeOrder(userId, orderData);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.created(res, result.data, result.message);
    } catch (error) {
      console.error('Error in placeOrder controller:', error);
      return ErrorResponse.send(res, 'Internal server error', 500);
    }
  }

  /**
   * Get order history for authenticated user
   * GET /api/orders
   * @access Private (Authenticated users)
   * User Story 10: View Order History
   */
  async getOrderHistory(req: Request, res: Response): Promise<Response | void> {
    try {
      const authReq = req as AuthRequest;
      
      // Check authentication
      if (!authReq.user || !authReq.user.userId) {
        return ErrorResponse.send(res, 'Unauthorized', 401);
      }

      const userId = authReq.user.userId;
      
      // Get pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Get user's orders
      const result = await this.orderService.getUserOrders(userId, page, limit);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.paginated(
        res,
        result.data,
        {
          pageNumber: result.page,
          pageSize: result.limit,
          totalPages: result.totalPages,
          totalSize: result.totalItems,
        },
        result.message
      );
    } catch (error) {
      console.error('Error in getOrderHistory controller:', error);
      return ErrorResponse.send(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single order by ID
   * GET /api/orders/:id
   * @access Private (Authenticated users - own orders only)
   */
  async getOrderById(req: Request, res: Response): Promise<Response | void> {
    try {
      const authReq = req as AuthRequest;
      
      // Check authentication
      if (!authReq.user || !authReq.user.userId) {
        return ErrorResponse.send(res, 'Unauthorized', 401);
      }

      const userId = authReq.user.userId;
      const orderId = req.params.id;

      if (!orderId) {
        return ErrorResponse.send(res, 'Order ID is required', 400);
      }

      // Get order (ensures user can only access their own orders)
      const result = await this.orderService.getOrderById(orderId, userId);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, (result as any).data || null, result.message);
    } catch (error) {
      console.error('Error in getOrderById controller:', error);
      return ErrorResponse.send(res, 'Internal server error', 500);
    }
  }
}
