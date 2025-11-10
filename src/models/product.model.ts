import { Schema, model, Document, Types } from 'mongoose';

/**
 * Product Document Interface
 */
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  userId: Types.ObjectId;
  productImage?: string; // Optional: path to product image
  status: 'active' | 'deleted'; // Status for soft delete
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Schema
 */
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'deleted'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Indexes for performance
 */
// Text index for search functionality
ProductSchema.index({ name: 'text', description: 'text' });

// Compound indexes for common queries
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, createdAt: -1 });
ProductSchema.index({ userId: 1, createdAt: -1 });
ProductSchema.index({ stock: 1 }); // For checking availability
ProductSchema.index({ price: 1 }); // For price range queries
ProductSchema.index({ createdAt: -1 }); // For sorting by newest

/**
 * Virtual: Check if product is available
 */
ProductSchema.virtual('isAvailable').get(function () {
  return this.stock > 0;
});

/**
 * Static method: Find products by category
 */
ProductSchema.statics.findByCategory = function (category: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return this.find({ category: category.toLowerCase() }).sort({ createdAt: -1 });
};

/**
 * Static method: Find products in stock
 */
ProductSchema.statics.findInStock = function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return this.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 });
};

/**
 * Instance method: Reduce stock
 */
ProductSchema.methods.reduceStock = async function (quantity: number): Promise<boolean> {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.save();
    return true;
  }
  return false;
};

/**
 * Instance method: Increase stock
 */
ProductSchema.methods.increaseStock = async function (quantity: number): Promise<boolean> {
  this.stock += quantity;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await this.save();
  return true;
};

/**
 * Product Model
 */
export default model<IProduct>('Product', ProductSchema);
