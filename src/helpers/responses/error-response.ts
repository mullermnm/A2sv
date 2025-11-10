import { Response } from 'express';
import { ApiResponse, HttpStatus } from '@src/types';
import { ErrorMessages, getErrorStatusMessage } from '../messages/error-messages';

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message?: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  errors?: string[]
): Response => {
  const response: ApiResponse = {
    success: false,
    message: message || getErrorStatusMessage(statusCode),
    errors: errors || null,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 */
export const sendValidationError = (
  res: Response,
  errors: string[],
  message?: string
): Response => {
  return sendError(res, message || ErrorMessages.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, errors);
};

/**
 * Send not found error
 */
export const sendNotFound = (res: Response, message?: string): Response => {
  return sendError(res, message || ErrorMessages.NOT_FOUND, HttpStatus.NOT_FOUND);
};

/**
 * Send unauthorized error
 */
export const sendUnauthorized = (res: Response, message?: string): Response => {
  return sendError(res, message || ErrorMessages.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
};

/**
 * Send forbidden error
 */
export const sendForbidden = (res: Response, message?: string): Response => {
  return sendError(res, message || ErrorMessages.FORBIDDEN, HttpStatus.FORBIDDEN);
};

/**
 * Send bad request error
 */
export const sendBadRequest = (res: Response, message?: string, errors?: string[]): Response => {
  return sendError(res, message || ErrorMessages.BAD_REQUEST, HttpStatus.BAD_REQUEST, errors);
};

/**
 * Error result object (for services/repositories)
 */
export interface ErrorResult {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[] | null;
}

/**
 * Error Response Helper Class
 */
export class ErrorResponse {
  // Methods that send HTTP responses (for controllers)
  static send(
    res: Response,
    message?: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: string[]
  ): Response {
    return sendError(res, message, statusCode, errors);
  }

  static notFound(res: Response, message?: string): Response {
    return sendNotFound(res, message);
  }

  static unauthorized(res: Response, message?: string): Response {
    return sendUnauthorized(res, message);
  }

  static forbidden(res: Response, message?: string): Response {
    return sendForbidden(res, message);
  }

  static validationError(res: Response, errors: string[], message?: string): Response {
    return sendValidationError(res, errors, message);
  }

  static badRequest(res: Response, message?: string, errors?: string[]): Response {
    return sendBadRequest(res, message, errors);
  }

  // Factory methods that create error objects (for services/repositories)
  static create(
    message?: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errors?: string[]
  ): ErrorResult {
    return {
      success: false,
      statusCode,
      message: message || getErrorStatusMessage(statusCode),
      errors: errors || null,
    };
  }

  static createNotFound(message?: string): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: message || ErrorMessages.NOT_FOUND,
      errors: null,
    };
  }

  static createUnauthorized(message?: string): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.UNAUTHORIZED,
      message: message || ErrorMessages.UNAUTHORIZED,
      errors: null,
    };
  }

  static createForbidden(message?: string): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.FORBIDDEN,
      message: message || ErrorMessages.FORBIDDEN,
      errors: null,
    };
  }

  static createBadRequest(message?: string, errors?: string[]): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: message || ErrorMessages.BAD_REQUEST,
      errors: errors || null,
    };
  }

  static createValidationError(errors: string[], message?: string): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: message || ErrorMessages.VALIDATION_FAILED,
      errors,
    };
  }

  static createConflict(message?: string): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.CONFLICT,
      message: message || getErrorStatusMessage(HttpStatus.CONFLICT),
      errors: null,
    };
  }

  static createInternalError(message?: string): ErrorResult {
    return {
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: message || ErrorMessages.INTERNAL_ERROR,
      errors: null,
    };
  }
}
