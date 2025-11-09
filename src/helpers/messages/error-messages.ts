/**
 * HTTP Error Status Messages
 */
export const StatusErrorMessages = {
  400: 'Bad request',
  401: 'Unauthorized - Authentication required',
  403: 'Forbidden - Insufficient permissions',
  404: 'Resource not found',
  409: 'Conflict - Resource already exists',
  422: 'Validation failed',
  500: 'Internal server error',
  503: 'Service unavailable',
} as const;

/**
 * Custom Error Messages for E-commerce Operations
 */
export const ErrorMessages = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USERNAME_ALREADY_EXISTS: 'Username already taken',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Authentication token required',
  TOKEN_MISSING: 'Authorization token is missing',

  // Authorization
  UNAUTHORIZED: 'You are not authorized to perform this action',
  ADMIN_ONLY: 'This action requires admin privileges',
  FORBIDDEN: 'Access forbidden',
  ACCESS_DENIED: 'Access denied',

  // Products
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  INVALID_PRODUCT_DATA: 'Invalid product data provided',
  PRODUCT_OUT_OF_STOCK: 'Product is out of stock',

  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_ORDER_DATA: 'Invalid order data provided',
  ORDER_ALREADY_PROCESSED: 'Order has already been processed',
  EMPTY_CART: 'Cannot place order with empty cart',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input provided',
  REQUIRED_FIELD_MISSING: 'Required field is missing',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_ID: 'Invalid ID format',

  // Generic
  INTERNAL_ERROR: 'Internal server error occurred',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  OPERATION_FAILED: 'Operation failed',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network error occurred',
} as const;

/**
 * Get error status message by code
 */
export const getErrorStatusMessage = (statusCode: number): string => {
  return (
    StatusErrorMessages[statusCode as keyof typeof StatusErrorMessages] || StatusErrorMessages[500]
  );
};

/**
 * Type definitions for error message constants
 */
export type StatusErrorMessageKey = keyof typeof StatusErrorMessages;
export type ErrorMessageKey = keyof typeof ErrorMessages;
