import { Response, Request } from 'express';
import { BaseController } from './BaseController';
import { OrderService } from '../services/order.service';
import orderRepository from '@src/repositories/order.repository';
import productRepository from '@src/repositories/product.repository';
import { IOrder } from '../models/order.model';
import { ErrorResponse, SuccessResponse } from '@helpers/index';
import { AuthRequest, PlaceOrderBody, UserRole } from '@src/types';

/**
 * Order Controller
 * Handles HTTP requests for order management
 */
export class OrderController extends BaseController<IOrder> {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    super(orderService);
    this.orderService = orderService;
  }

  /**
   * Override buildFilter to add order filtering
   * Supports:
   * - userId: Filter by user (added automatically for non-admin)
   * - status: Order status filtering (pending, processing, shipped, delivered, cancelled)
   * - minPrice, maxPrice: Total price range filtering
   * - startDate, endDate: Date range filtering
   */
  protected buildFilter(
    filters: Record<string, unknown>,
    _search?: string
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    // User ID filtering (for security - non-admin users)
    if (filters.userId) {
      filter.userId = filters.userId;
    }

    // Status filtering (pending, processing, shipped, delivered, cancelled)
    if (filters.status && typeof filters.status === 'string') {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const status = filters.status.toLowerCase();
      if (validStatuses.includes(status)) {
        filter.status = status;
      }
    }

    // Total price range filtering
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter.totalPrice = {};
      if (filters.minPrice !== undefined) {
        const minPrice = Number(filters.minPrice);
        if (!isNaN(minPrice) && minPrice >= 0) {
          (filter.totalPrice as Record<string, unknown>).$gte = minPrice;
        }
      }
      if (filters.maxPrice !== undefined) {
        const maxPrice = Number(filters.maxPrice);
        if (!isNaN(maxPrice) && maxPrice >= 0) {
          (filter.totalPrice as Record<string, unknown>).$lte = maxPrice;
        }
      }
    }

    // Date range filtering
    if (filters.startDate !== undefined || filters.endDate !== undefined) {
      filter.createdAt = {};
      if (filters.startDate !== undefined) {
        const startDate = new Date(filters.startDate as string);
        if (!isNaN(startDate.getTime())) {
          (filter.createdAt as Record<string, unknown>).$gte = startDate;
        }
      }
      if (filters.endDate !== undefined) {
        const endDate = new Date(filters.endDate as string);
        if (!isNaN(endDate.getTime())) {
          (filter.createdAt as Record<string, unknown>).$lte = endDate;
        }
      }
    }

    return filter;
  }

  /**
   * Override getAll to add userId filter for non-admin users
   * GET /api/orders
   * @access Private (Admin sees all, users see only their own)
   */
  async getAll(req: Request, res: Response): Promise<Response | void> {
    const authReq = req as AuthRequest;

    // Add userId filter for non-admin users
    if (authReq.user && authReq.user.role !== UserRole.ADMIN) {
      req.query.userId = authReq.user.userId;
    }

    // Call parent getAll with modified query
    return super.getAll(req, res, () => {});
  }

  /**
   * Place a new order
   * POST /api/orders
   * @access Private (Authenticated users)
   * User Story 9: Place Order
   */
  async placeOrder(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const userId = req.user!.userId;
      const orderData = req.body as PlaceOrderBody;

      // Place the order using service (validation already done by Joi middleware)
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
   * Override getById to ensure users can only access their own orders
   * GET /api/orders/:id
   * @access Private (Admin can see any order, users only their own)
   */
  async getById(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      const orderId = req.params.id;

      if (!orderId) {
        return ErrorResponse.send(res, 'Order ID is required', 400);
      }

      // Get order using service
      const result = await this.orderService.getOrderById(orderId, req.user!.userId);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data || null, result.message);
    } catch (error) {
      console.error('Error in getOrderById controller:', error);
      return ErrorResponse.send(res, 'Internal server error', 500);
    }
  }
}

// Export singleton instance
export default new OrderController(new OrderService(orderRepository, productRepository));
