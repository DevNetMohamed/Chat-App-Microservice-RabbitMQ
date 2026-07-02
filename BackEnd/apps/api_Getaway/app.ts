import express from "express";
import cors from "cors";
import { generalRateLimiter } from "./src/middleware/rateLimiter.js";
import router from "./src/routes/index.js";
import { errorHandler } from "../../src/index.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalRateLimiter);
app.use(cookieParser());
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, service: "api_Getaway", status: "ok" });
});

app.use("/api", router);


app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

app.use(errorHandler);
export default app;
