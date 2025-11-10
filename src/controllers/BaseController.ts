import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import { BaseService } from '@services/BaseService';
import { ErrorResponse, SuccessResponse } from '@helpers/index';
import { BaseQueryOptions } from '@src/types';

/**
 * Generic Base Controller class
 * Provides common CRUD operations for all controllers
 * @template T - The document type
 */
export abstract class BaseController<T extends Document> {
  protected service: BaseService<T>;

  constructor(service: BaseService<T>) {
    this.service = service;

    // Bind methods to preserve 'this' context
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Get all documents with pagination
   * GET /resource
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { page, limit, sort, search, ...filters } = req.query;

      const options: BaseQueryOptions = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        sort: (sort as string) || '-createdAt',
        select: ['-__v'],
      };

      // Build filter from query params
      const filter = this.buildFilter(filters, search as string);

      const result = await (this.service as any).repository.findAll(filter, options);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.paginated(
        res,
        result.data,
        {
          pageNumber: result.page,
          pageSize: result.limit,
          totalSize: result.totalItems,
          totalPages: result.totalPages,
        },
        result.message
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single document by ID
   * GET /resource/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const options: BaseQueryOptions = {
        select: ['-__v'],
      };

      const result = await (this.service as any).repository.findById(id, options);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new document
   * POST /resource
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const data = this.prepareCreateData(req);

      const result = await (this.service as any).repository.create(data);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.created(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a document by ID
   * PUT /resource/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const data = this.prepareUpdateData(req);

      const result = await (this.service as any).repository.updateById(id, data);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a document by ID
   * DELETE /resource/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const result = await (this.service as any).repository.deleteById(id);

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, undefined, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Build filter object from query parameters
   * Override this method in child controllers for custom filtering
   */
  protected buildFilter(
    filters: Record<string, unknown>,
    _search?: string
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    // Add custom filter logic here
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        filter[key] = filters[key];
      }
    });

    return filter;
  }

  /**
   * Prepare data for create operation
   * Override this method in child controllers for custom data preparation
   */
  protected prepareCreateData(req: Request): Partial<T> {
    return req.body;
  }

  /**
   * Prepare data for update operation
   * Override this method in child controllers for custom data preparation
   */
  protected prepareUpdateData(req: Request): Partial<T> {
    return req.body;
  }
}
