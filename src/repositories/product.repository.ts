import { BaseRepository } from './BaseRepository';
import Product, { IProduct } from '@models/product.model';

/**
 * Product Repository
 * Handles all product-related database operations
 */
export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }
}

// Export singleton instance
export default new ProductRepository();
