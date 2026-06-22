import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";

interface SocketJwtPayload {
  id: string;
  email: string;
  role?: string;
}

let io: SocketIOServer | null = null;

/**
 * Initializes the Socket.io server attached to the given HTTP server.
 * Every connecting client MUST present a valid JWT (same secret used
 * for HTTP auth) in the handshake auth payload:
 *
 *   io("http://localhost:PORT", { auth: { token: "<jwt>" } })
 *
 * Unauthenticated connections are rejected before they're established.
 */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new Error("Server misconfiguration: JWT_SECRET not set"));
    }

    try {
      const decoded = jwt.verify(token, secret) as SocketJwtPayload;
      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketJwtPayload | undefined;
    console.log(
      `[api_Getaway] Socket connected: ${socket.id} (user: ${user?.id})`,
    );

    socket.on("disconnect", () => {
      console.log(`[api_Getaway] Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Returns the active Socket.io server instance. Throws if called
 * before initSocketServer() has run.
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "Socket.io server not initialized. Call initSocketServer() first.",
    );
  }
  return io;
}
