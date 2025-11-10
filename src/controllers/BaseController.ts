import { Request, Response, NextFunction } from 'express';
import { Document, FilterQuery } from 'mongoose';
import { BaseService } from '@services/BaseService';
import { ErrorResponse, SuccessResponse } from '@helpers/index';
import { BaseQueryOptions } from '@src/types';
import { BaseRepository } from '@repositories/BaseRepository';

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

      const repository = this.service['repository'] as unknown as BaseRepository<T>;
      const result = await repository.findAll(filter, options);

      if (!result.success) {
        return ErrorResponse.send(res, result.message || 'Operation failed', result.statusCode);
      }

      return SuccessResponse.paginated(
        res,
        result.data ?? [],
        {
          pageNumber: result.page ?? 1,
          pageSize: result.limit ?? 10,
          totalSize: result.totalItems ?? 0,
          totalPages: result.totalPages ?? 0,
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
      const id = req.params.id as string;

      const options: BaseQueryOptions = {
        select: ['-__v'],
      };

      const repository = this.service['repository'] as unknown as BaseRepository<T>;
      const result = await repository.findById(id, options);

      if (!result.success) {
        return ErrorResponse.send(res, result.message || 'Operation failed', result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message || undefined, result.statusCode);
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
      // Prepare data for creation (override this method if needed)
      const data = this.prepareCreateData(req);

      const repository = this.service['repository'] as unknown as BaseRepository<T>;
      const result = await repository.create(data);

      if (!result.success) {
        return ErrorResponse.send(res, result.message || 'Operation failed', result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message || undefined, result.statusCode);
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
      const id = req.params.id as string;
      // Prepare data for update (override this method if needed)
      const data = this.prepareUpdateData(req);

      const repository = this.service['repository'] as unknown as BaseRepository<T>;
      const result = await repository.updateById(id, data);

      if (!result.success) {
        return ErrorResponse.send(res, result.message || 'Operation failed', result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message || undefined, result.statusCode);
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
      const id = req.params.id as string;

      const repository = this.service['repository'] as unknown as BaseRepository<T>;
      const result = await repository.deleteById(id);

      if (!result.success) {
        return ErrorResponse.send(res, result.message || 'Operation failed', result.statusCode);
      }

      return SuccessResponse.send(res, undefined, result.message || undefined, result.statusCode);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Build filter from query parameters
   * Override this method in child classes for custom filtering
   */
  protected buildFilter(filters: Record<string, unknown>, _search?: string): FilterQuery<T> {
    const filter: Record<string, unknown> = {};

    // Copy all non-empty filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        filter[key] = filters[key];
      }
    });

    return filter as FilterQuery<T>;
  }

  /**
   * Prepare data for creation
   * Override this method in child classes for custom data preparation
   */
  protected prepareCreateData(req: Request): Partial<T> {
    return req.body as Partial<T>;
  }

  /**
   * Prepare data for update
   * Override this method in child classes for custom data preparation
   */
  protected prepareUpdateData(req: Request): Partial<T> {
    return req.body as Partial<T>;
  }
}
