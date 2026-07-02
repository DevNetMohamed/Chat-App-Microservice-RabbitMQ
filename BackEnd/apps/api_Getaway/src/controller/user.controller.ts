import type { Request, Response } from "express";
import { asyncHandler } from "../../../../src/middleware/asyncHandler.js";
import { AppError } from "../../../../src/error/AppError.js";
import { publishEvent } from "../Event/publisher.js";

const USER_EVENTS_EXCHANGE = "user.events";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id || !req.socketId) {
    throw AppError.unauthorized("Not authenticated");
  }

  const { correlationId } = await publishEvent({
    exchange: USER_EVENTS_EXCHANGE,
    routingKey: "user.profile.get.requested",
    payload: { email: req.user.email },
    socketId: req.socketId,
  });
  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'user.profile.get.succeeded' on your socket.",
    correlationId,
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.socketId) {
    throw AppError.badRequest("Missing socket connection");
  }

  const { id } = req.params;
    console.log(req.params);

  const { correlationId } = await publishEvent({
    exchange: USER_EVENTS_EXCHANGE,
    routingKey: "user.profile.get.requested",
    payload: { id },
    socketId: req.socketId,
  });

  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'user.profile.get.succeeded' on your socket.",
    correlationId,
  });
});

export const getUsersByIds = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.socketId) {
      throw AppError.badRequest("Missing socket connection");
    }

    const { correlationId } = await publishEvent({
      exchange: USER_EVENTS_EXCHANGE,
      routingKey: "user.profile.batchGet.requested",
      payload: req.body,
      socketId: req.socketId,
    });

    res.status(202).json({
      success: true,
      message:
        "Request accepted. Listen for 'user.profile.batchGet.succeeded' on your socket.",
      correlationId,
    });
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.socketId) {
      throw new AppError("Not authenticated", 401);
    }

    const { correlationId } = await publishEvent({
      exchange: USER_EVENTS_EXCHANGE,
      routingKey: "user.profile.update.requested",
      payload: { email: req.user.email, updates: req.body },
      socketId: req.socketId,
    });

    res.status(202).json({
      success: true,
      message:
        "Request accepted. Listen for 'user.profile.update.succeeded' on your socket.",
      correlationId,
    });
  },
);

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.socketId) {
    throw new AppError("Missing socket connection", 400);
  }

  const { correlationId } = await publishEvent({
    exchange: USER_EVENTS_EXCHANGE,
    routingKey: "user.search.requested",
    payload: req.query,
    socketId: req.socketId,
  });

  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'user.search.succeeded' on your socket.",
    correlationId,
  });
});
