import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '@helpers/index';
import { HttpStatus } from '../../types/common.types';

/**
 * Register Validation Schema (User Story 1)
 *
 * Requirements:
 * - Username: Alphanumeric only (letters and numbers, no special characters or spaces)
 * - Email: Valid email format, required
 * - Password: At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
 * - Role: Optional, defaults to 'user'
 */
export const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum() // Only alphanumeric characters (letters and numbers)
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum':
        'Username must be alphanumeric (letters and numbers only, no special characters or spaces)',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: true } })
    .required()
    .messages({
      'string.email': 'Email must be a valid email address format (e.g., user@example.com)',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must include at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character (e.g., !@#$%^&*)',
      'any.required': 'Password is required',
    }),

  role: Joi.string().valid('user', 'admin').default('user').messages({
    'any.only': 'Role must be either "user" or "admin"',
  }),
});

/**
 * Login Validation Schema (User Story 2)
 *
 * Requirements:
 * - Email: Valid email format, required
 * - Password: Required
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: true } })
    .required()
    .messages({
      'string.email': 'Email must be a valid email address format',
      'any.required': 'Email is required',
    }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export default {
  registerSchema,
  loginSchema,
};
