import type { Request, Response } from "express";
import { asyncHandler } from "../../../../src/middleware/asyncHandler.js";
import { AppError } from "../../../../src/error/AppError.js";
import { publishEvent } from "../Event/publisher.js";

const CHAT_EVENTS_EXCHANGE = "chat.events";

export const createChat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.socketId)
    throw AppError.unauthorized("Not authenticated");

  const { correlationId } = await publishEvent({
    exchange: CHAT_EVENTS_EXCHANGE,
    routingKey: "chat.create.requested",
    payload: { ...req.body, createdBy: req.user.id },
    socketId: req.socketId,
  });

  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'chat.create.succeeded' on your socket.",
    correlationId,
  });
});

export const getChatById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.socketId) throw AppError.badRequest("Missing socket connection");

  const { id } = req.params;

  const { correlationId } = await publishEvent({
    exchange: CHAT_EVENTS_EXCHANGE,
    routingKey: "chat.get.requested",
    payload: { id },
    socketId: req.socketId,
  });

  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'chat.get.succeeded' on your socket.",
    correlationId,
  });
});

export const getUserChats = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user || !req.socketId)
      throw AppError.unauthorized("Not authenticated");

    const { correlationId } = await publishEvent({
      exchange: CHAT_EVENTS_EXCHANGE,
      routingKey: "chat.listForUser.requested",
      payload: { userId: req.user.id },
      socketId: req.socketId,
    });

    res.status(202).json({
      success: true,
      message:
        "Request accepted. Listen for 'chat.listForUser.succeeded' on your socket.",
      correlationId,
    });
  },
);
