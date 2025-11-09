/**
 * HTTP Success Status Messages
 */
export const StatusSuccessMessages = {
  200: 'Request succeeded',
  201: 'Resource created successfully',
  202: 'Request accepted',
  204: 'No content',
} as const;

/**
 * Custom Success Messages for E-commerce Operations
 */
export const SuccessMessages = {
  // Authentication
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',

  // Products
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  PRODUCT_FETCHED: 'Product retrieved successfully',
  PRODUCTS_FETCHED: 'Products retrieved successfully',

  // Orders
  ORDER_PLACED: 'Order placed successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  ORDER_FETCHED: 'Order retrieved successfully',
  ORDERS_FETCHED: 'Orders retrieved successfully',

  // Generic
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
  DATA_CREATED: 'Data created successfully',
} as const;

/**
 * Get success status message by code
 */
export const getSuccessStatusMessage = (statusCode: number): string => {
  return (
    StatusSuccessMessages[statusCode as keyof typeof StatusSuccessMessages] ||
    StatusSuccessMessages[200]
  );
};

/**
 * Type definitions for success message constants
 */
export type StatusSuccessMessageKey = keyof typeof StatusSuccessMessages;
export type SuccessMessageKey = keyof typeof SuccessMessages;
