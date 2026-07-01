import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import app from "./app.js";
import { connectMongoDB } from "../../src/database/connectionDB.js";
import { connectRabbitMQ } from "../../src/RabbitMQ/connections.js";
import { redisClient } from "../../src/Redis/redis.js";

import * as PORT from "../../src/common/index.js";
import { initSocketServer } from "./src/socket/index.js";
import { startResultConsumer } from "./src/Event/consumers.js";

// -------------------- PATH SETUP --------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const httpServer = http.createServer(app);

async function bootstrap() {
  try {
    console.log("[API Gateway] Starting...");

    await connectMongoDB(
      process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/Chat-App",
    );
    await connectRabbitMQ();

    const redis = redisClient();
    await redis.set("service:api-gateway", "online");
    console.log("[API Gateway] Redis connected");

    startServer(PORT.SERVICES_PORTS.API_GETAWAY);

    initSocketServer(httpServer);
    console.log("[API Gateway] Socket initialized");

    await startResultConsumer();
    console.log("[API Gateway] Event consumers started");

    console.log("[API Gateway] Fully started successfully");
  } catch (error) {
    console.error("[API Gateway] Failed to start:", error);
    process.exit(1);
  }
}

// -------------------- SERVER START (SAFE) --------------------
function startServer(port: number) {
  httpServer
    .listen(port)
    .on("listening", () => {
      console.log(`[API Gateway] Running on port ${port}`);
    })
    .on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.log(`[API Gateway] Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error("[API Gateway] Server error:", err);
      }
    });
}

bootstrap();
