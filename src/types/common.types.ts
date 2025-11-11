import { Document, PopulateOptions } from 'mongoose';

/**
 * Generic API Response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[] | null;
}

/**
 * Paginated API Response structure
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
  currentPage: number;
  pageSize: number;
  totalSize: number;
  totalPages: number;
  errors?: string[] | null;
}

/**
 * Repository operation result
 */
export interface RepositoryResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Query options for repository operations
 */
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: PopulateOptions | PopulateOptions[];
  select?: string | string[];
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Search query parameters
 */
export interface SearchQuery extends QueryOptions {
  search?: string;
  [key: string]: unknown;
}

/**
 * Generic Mongoose Document type
 */
export type MongooseDoc<T> = Document<unknown, object, T> & T;

/**
 * HTTP Status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}
