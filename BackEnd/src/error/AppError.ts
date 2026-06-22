export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(message: string) {
    return new AppError(message, 400);
  }
  static unauthorized(message: string) {
    return new AppError(message, 401);
  }
  static forbidden(message: string) {
    return new AppError(message, 403);
  }
  static notFound(message: string) {
    return new AppError(message, 404);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
  static internal(message: string) {
    return new AppError(message, 500, false);
  }
}
