import express from "express";
import cors from "cors";
import { errorHandler } from "../../src/index.js";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ success: true, service: "user_Service", status: "ok" });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Centralized error handler — must be last
app.use(errorHandler);
export default app;
