import { FilterQuery, Model, UpdateQuery, PopulateOptions } from 'mongoose';

/**
 * Base repository query options
 */
export interface BaseQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: PopulateOptions | PopulateOptions[];
  select?: string | string[];
}

/**
 * Repository find result
 */
export interface FindResult<T> {
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
}

/**
 * Repository find all result with pagination
 */
export interface FindAllResult<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  statusCode: number;
  message?: string;
}

/**
 * Repository create result
 */
export interface CreateResult<T> {
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
}

/**
 * Repository update result
 */
export interface UpdateResult<T> {
  success: boolean;
  data?: T;
  statusCode: number;
  message?: string;
}

/**
 * Repository delete result
 */
export interface DeleteResult {
  success: boolean;
  statusCode: number;
  message?: string;
}

/**
 * Count result
 */
export interface CountResult {
  count: number;
}

/**
 * Base repository interface
 */
export interface IBaseRepository<T> {
  findById(id: string, options?: BaseQueryOptions): Promise<FindResult<T>>;
  findOne(filter: FilterQuery<T>, options?: BaseQueryOptions): Promise<FindResult<T>>;
  findAll(filter: FilterQuery<T>, options?: BaseQueryOptions): Promise<FindAllResult<T>>;
  create(data: Partial<T>): Promise<CreateResult<T>>;
  updateById(id: string, data: UpdateQuery<T>): Promise<UpdateResult<T>>;
  deleteById(id: string): Promise<DeleteResult>;
  count(filter: FilterQuery<T>): Promise<number>;
}
