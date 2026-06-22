import type { Request, Response, NextFunction } from "express";
import type { ObjectSchema } from "joi";
import { AppError } from "../../../../src/error/AppError.js";

/**
 * Returns an Express middleware that validates req.body against the
 * given Joi schema. On failure, throws an AppError with a 400 status
 * and a combined message of all validation issues.
 */
export function validateBody(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
    }

    req.body = value;
    next();
  };
}

/**
 * Same as validateBody, but validates req.query instead.
 */
export function validateQuery(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(", ");
      return next(new AppError(message, 400));
    }

    req.query = value;
    next();
  };
}
