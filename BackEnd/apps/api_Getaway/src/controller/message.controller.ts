import type { Request, Response } from "express";
import { asyncHandler } from "../../../../src/middleware/asyncHandler.js";
import { AppError } from "../../../../src/error/AppError.js";
import { publishEvent } from "../Event/publisher.js";

const MESSAGE_EVENTS_EXCHANGE = "message.events";

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.socketId)
    throw AppError.unauthorized("Not authenticated");

  const { correlationId } = await publishEvent({
    exchange: MESSAGE_EVENTS_EXCHANGE,
    routingKey: "message.send.requested",
    payload: { ...req.body, senderId: req.user.id },
    socketId: req.socketId,
  });

  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'message.send.succeeded' on your socket.",
    correlationId,
  });
});

export const getMessagesByChat = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.socketId) throw AppError.badRequest("Missing socket connection");

    const { chatId } = req.params;
    const { before, limit } = req.query;

    const { correlationId } = await publishEvent({
      exchange: MESSAGE_EVENTS_EXCHANGE,
      routingKey: "message.listForChat.requested",
      payload: { chatId, before, limit },
      socketId: req.socketId,
    });

    res.status(202).json({
      success: true,
      message:
        "Request accepted. Listen for 'message.listForChat.succeeded' on your socket.",
      correlationId,
    });
  },
);

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.socketId)
    throw AppError.unauthorized("Not authenticated");

  const { chatId } = req.params;

  const { correlationId } = await publishEvent({
    exchange: MESSAGE_EVENTS_EXCHANGE,
    routingKey: "message.markRead.requested",
    payload: { chatId, userId: req.user.id },
    socketId: req.socketId,
  });

  res.status(202).json({
    success: true,
    message:
      "Request accepted. Listen for 'message.markRead.succeeded' on your socket.",
    correlationId,
  });
});
