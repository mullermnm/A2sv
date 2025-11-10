/**
 * Order Request Types
 */

/**
 * Product item in order request
 */
export interface OrderProductItem {
  productId: string;
  quantity: number;
}

/**
 * Order placement request interface (from service layer)
 */
export interface PlaceOrderRequest {
  products: OrderProductItem[];
  description?: string;
}

/**
 * Order placement body interface (from controller layer)
 */
export interface PlaceOrderBody {
  products: OrderProductItem[];
  description?: string;
}
