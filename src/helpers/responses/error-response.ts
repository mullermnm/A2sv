import { Response } from 'express';
import { ApiResponse, HttpStatus } from '@types/common.types';
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
 * Error Response Helper Class
 */
export class ErrorResponse {
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
}
