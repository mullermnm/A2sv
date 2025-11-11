import Joi from 'joi';

export const createOrderSchema = Joi.object({
  products: Joi.array()
    .required()
    .min(1)
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().positive().required(),
      })
    )
    .messages({
      'array.min': 'Order must contain at least one product',
      'any.required': 'Products array is required',
      'items.base': 'Each product must have productId and quantity',
      'items.productId': 'Product ID is required',
      'items.quantity': 'Quantity is required',
    }),
  description: Joi.string().optional(),
});

export default {
  createOrderSchema,
};
