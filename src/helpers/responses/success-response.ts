import { Response } from 'express';
import { HttpStatus, ApiResponse, PaginatedResponse } from '@src/types';
import { SuccessMessages, getSuccessStatusMessage } from '@src/helpers/index';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HttpStatus.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message: message || getSuccessStatusMessage(statusCode),
    data,
    errors: null,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated success response
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T[],
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalSize: number;
    totalPages: number;
  },
  message?: string,
  statusCode: number = HttpStatus.OK
): Response => {
  const response: PaginatedResponse<T> = {
    success: true,
    message: message || SuccessMessages.DATA_RETRIEVED,
    data,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    totalSize: pagination.totalSize,
    totalPages: pagination.totalPages,
    errors: null,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send created response
 */
export const sendCreated = <T>(res: Response, data?: T, message?: string): Response => {
  return sendSuccess(res, data, message || SuccessMessages.DATA_CREATED, HttpStatus.CREATED);
};

/**
 * Success result object (for services/repositories)
 */
export interface SuccessResult<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
}

/**
 * Success Response Helper Class
 */
export class SuccessResponse {
  // Methods that send HTTP responses (for controllers)
  static send<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = HttpStatus.OK
  ): Response {
    return sendSuccess(res, data, message, statusCode);
  }

  static created<T>(res: Response, data?: T, message?: string): Response {
    return sendCreated(res, data, message);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      pageNumber: number;
      pageSize: number;
      totalSize: number;
      totalPages: number;
    },
    message?: string
  ): Response {
    return sendPaginatedSuccess(res, data, pagination, message);
  }

  // Factory methods that create success objects (for services/repositories)
  static create<T>(
    data?: T,
    message?: string,
    statusCode: number = HttpStatus.OK
  ): SuccessResult<T> {
    return {
      success: true,
      statusCode,
      message: message || getSuccessStatusMessage(statusCode),
      data,
    };
  }

  static createOk<T>(data?: T, message?: string): SuccessResult<T> {
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: message || SuccessMessages.OPERATION_SUCCESS,
      data,
    };
  }

  static createCreated<T>(data?: T, message?: string): SuccessResult<T> {
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: message || SuccessMessages.DATA_CREATED,
      data,
    };
  }
}
