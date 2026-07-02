import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../../../src/error/AppError.js";
import { asyncHandler } from "../../../../src/middleware/asyncHandler.js";
import type { AuthenticatedUser } from "../types/express.js";


interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

export const isAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    const token = req.cookies?.accessToken ?? bearerToken;

    if (!token) {
      throw AppError.unauthorized("Authentication token missing");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw AppError.internal("Server misconfiguration: JWT_SECRET not set");
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
      throw AppError.unauthorized("Invalid or expired token");
    }

    const user: AuthenticatedUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    req.user = user;
    next();
  },
);