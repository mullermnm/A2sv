import { Response } from 'express';
import { BaseController } from './BaseController';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { IOrder } from '../models/order.model';
import { ErrorResponse, SuccessResponse } from '@helpers/index';
import { AuthRequest, PlaceOrderBody } from '@src/types';

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

    // Bind custom methods to preserve 'this' context
    this.placeOrder = this.placeOrder.bind(this);
    this.getOrderHistory = this.getOrderHistory.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
  }

  /**
   * Override buildFilter to add order filtering
   * Supports:
   * - status: Order status filtering (pending, processing, shipped, delivered, cancelled)
   * - minPrice, maxPrice: Total price range filtering
   * - startDate, endDate: Date range filtering
   * Note: userId filtering is handled in custom methods for security
   */
  protected buildFilter(filters: Record<string, unknown>): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

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
   * Place a new order
   * POST /api/orders
   * @access Private (Authenticated users)
   * User Story 9: Place Order
   */
  async placeOrder(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Check authentication
      if (!req.user || !req.user.userId) {
        return ErrorResponse.send(res, 'Unauthorized', 401);
      }

      const userId = req.user.userId;
      const orderData = req.body as PlaceOrderBody;

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
          return ErrorResponse.send(res, 'Each product must have productId and quantity', 400);
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
   * Get order history for authenticated user with filtering
   * GET /api/orders
   * @access Private (Authenticated users)
   * User Story 10: View Order History
   * Supports filtering by status, price range, and date range
   */
  async getOrderHistory(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Check authentication
      if (!req.user || !req.user.userId) {
        return ErrorResponse.send(res, 'Unauthorized', 401);
      }

      const userId = req.user.userId;

      // Get pagination parameters
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '10', 10);

      // Build filters from query parameters
      const filters = this.buildFilter(req.query);

      // Add userId filter for security (user can only see their own orders)
      filters.userId = userId;

      // Get user's orders with filters
      const result = await this.orderService.getUserOrdersWithFilters(filters, page, limit);

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
  async getOrderById(req: AuthRequest, res: Response): Promise<Response | void> {
    try {
      // Check authentication
      if (!req.user || !req.user.userId) {
        return ErrorResponse.send(res, 'Unauthorized', 401);
      }

      const userId = req.user.userId;
      const orderId = req.params.id;

      if (!orderId) {
        return ErrorResponse.send(res, 'Order ID is required', 400);
      }

      // Get order (ensures user can only access their own orders)
      const result = await this.orderService.getOrderById(orderId, userId);

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
