import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../../../src/error/AppError.js";
import { asyncHandler } from "../../../../src/middleware/asyncHandler.js";

/**
 * Event-driven endpoints need to know which socket to push the async
 * result to. The client is expected to send its current socket.id in
 * the "x-socket-id" header (set once after the socket connects).
 *
 * This does NOT verify the socket actually belongs to this user or is
 * currently connected — that's checked implicitly when the result
 * consumer tries to emit to it. If you want stricter validation,
 * cross-check against a userId -> socketId set maintained on connect/
 * disconnect in src/socket/index.ts.
 */
export const requireSocketId = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const socketId = req.header("x-socket-id");

    if (!socketId) {
      throw AppError.badRequest(
        "Missing x-socket-id header. Connect a socket before making this request.",
      );
    }

    req.socketId = socketId;
    next();
  },
);
