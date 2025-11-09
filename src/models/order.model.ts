import { Schema, model, Document, Types } from 'mongoose';
import { OrderStatus } from '../types/common.types';

/**
 * Order Product Item Interface
 */
export interface IOrderProduct {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Order Document Interface
 */
export interface IOrder extends Document {
  userId: Types.ObjectId;
  products: IOrderProduct[];
  totalPrice: number;
  status: OrderStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Product Schema (subdocument)
 */
const OrderProductSchema = new Schema<IOrderProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

/**
 * Order Schema
 */
const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: {
      type: [OrderProductSchema],
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Indexes for performance
 */
// Compound indexes for common queries
OrderSchema.index({ userId: 1, createdAt: -1 }); // User's orders sorted by date
OrderSchema.index({ userId: 1, status: 1 }); // User's orders by status
OrderSchema.index({ status: 1, createdAt: -1 }); // Orders by status and date
OrderSchema.index({ createdAt: -1 }); // All orders by date
OrderSchema.index({ totalPrice: 1 }); // For price range queries

/**
 * Virtual: Calculate total items in order
 */
OrderSchema.virtual('totalItems').get(function () {
  return this.products.reduce((sum, item) => sum + item.quantity, 0);
});

/**
 * Pre-save hook: Calculate total price if not provided
 */
OrderSchema.pre('save', function (next) {
  const order = this as IOrder;

  // Calculate total price from products
  if (order.products && order.products.length > 0) {
    const calculatedTotal = order.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Round to 2 decimal places
    order.totalPrice = Math.round(calculatedTotal * 100) / 100;
  }

  next();
});

/**
 * Static method: Find orders by user
 */
OrderSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

/**
 * Static method: Find orders by status
 */
OrderSchema.statics.findByStatus = function (status: OrderStatus) {
  return this.find({ status }).sort({ createdAt: -1 });
};

/**
 * Instance method: Update order status
 */
OrderSchema.methods.updateStatus = async function (newStatus: OrderStatus): Promise<void> {
  this.status = newStatus;
  await this.save();
};

/**
 * Instance method: Cancel order
 */
OrderSchema.methods.cancel = async function (): Promise<boolean> {
  if (this.status === OrderStatus.PENDING || this.status === OrderStatus.PROCESSING) {
    this.status = OrderStatus.CANCELLED;
    await this.save();
    return true;
  }
  return false;
};

/**
 * Order Model
 */
export default model<IOrder>('Order', OrderSchema);
