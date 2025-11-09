import Joi from 'joi';

/**
 * Create Product Validation Schema (User Story 3)
 *
 * Requirements:
 * - name: Non-empty string, 3-100 characters
 * - description: Non-empty string, at least 10 characters
 * - price: Positive number greater than 0
 * - stock: Non-negative integer (0 or more)
 * - category: Required string
 *
 * Authorization: Admin only
 */
export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim().required().messages({
    'string.min': 'Product name must be at least 3 characters long',
    'string.max': 'Product name cannot exceed 100 characters',
    'string.empty': 'Product name cannot be empty',
    'any.required': 'Product name is required',
  }),

  description: Joi.string().min(10).trim().required().messages({
    'string.min': 'Product description must be at least 10 characters long',
    'string.empty': 'Product description cannot be empty',
    'any.required': 'Product description is required',
  }),

  price: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Price must be a valid number',
    'number.positive': 'Price must be a positive number greater than 0',
    'any.required': 'Price is required',
  }),

  stock: Joi.number().integer().min(0).required().messages({
    'number.base': 'Stock must be a valid number',
    'number.integer': 'Stock must be an integer',
    'number.min': 'Stock must be a non-negative integer (0 or more)',
    'any.required': 'Stock is required',
  }),

  category: Joi.string().trim().required().messages({
    'string.empty': 'Category cannot be empty',
    'any.required': 'Category is required',
  }),
});

/**
 * Update Product Validation Schema (User Story 4)
 *
 * Requirements:
 * - All fields are optional (partial update)
 * - name: Non-empty string if provided
 * - description: Non-empty string if provided
 * - price: Positive number if provided
 * - stock: Non-negative integer if provided
 * - category: Non-empty string if provided
 *
 * Authorization: Admin only
 */
export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).trim().messages({
    'string.min': 'Product name must be at least 3 characters long',
    'string.max': 'Product name cannot exceed 100 characters',
    'string.empty': 'Product name cannot be empty',
  }),

  description: Joi.string().min(10).trim().messages({
    'string.min': 'Product description must be at least 10 characters long',
    'string.empty': 'Product description cannot be empty',
  }),

  price: Joi.number().positive().precision(2).messages({
    'number.base': 'Price must be a valid number',
    'number.positive': 'Price must be a positive number greater than 0',
  }),

  stock: Joi.number().integer().min(0).messages({
    'number.base': 'Stock must be a valid number',
    'number.integer': 'Stock must be an integer',
    'number.min': 'Stock must be a non-negative integer (0 or more)',
  }),

  category: Joi.string().trim().messages({
    'string.empty': 'Category cannot be empty',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

/**
 * Query Parameters Validation for Product List (User Stories 5 & 6)
 *
 * Requirements:
 * - page: Page number, defaults to 1
 * - limit/pageSize: Items per page, defaults to 10
 * - search: Optional search term for product name (case-insensitive, partial match)
 */
export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a valid number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),

  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a valid number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),

  pageSize: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Page size must be a valid number',
    'number.integer': 'Page size must be an integer',
    'number.min': 'Page size must be at least 1',
    'number.max': 'Page size cannot exceed 100',
  }),

  search: Joi.string().trim().allow('', null).optional().messages({
    'string.base': 'Search term must be a string',
  }),
}).options({ allowUnknown: false });

export default {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
};
