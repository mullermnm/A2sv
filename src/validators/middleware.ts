import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '@helpers/index';
import { HttpStatus } from '@src/types';

/**
 * Joi Validation Middleware Factory
 * Creates a middleware function that validates request body against a Joi schema
 *
 * @param schema - Joi validation schema
 * @returns Express middleware function
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const validationResult = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove unknown fields from the validated data
    });

    if (validationResult.error) {
      // Extract error messages from Joi validation errors
      const errorMessages = validationResult.error.details.map((detail) => detail.message);

      return ErrorResponse.send(res, 'Validation failed', HttpStatus.BAD_REQUEST, errorMessages);
    }

    // Replace request body with validated and sanitized value
    Object.assign(req.body, validationResult.value as Record<string, unknown>);
    next();
  };
};

export default validate;
