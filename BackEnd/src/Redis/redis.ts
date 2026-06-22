import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;

export const redisClient = (): Redis => {
  try {
    const url = process.env.REDIS_URI;
    const token = process.env.REDIS_TOKEN;

    if (!url) {
      throw new Error("REDIS_URI is missing");
    }

    if (!token) {
      throw new Error("REDIS_TOKEN is missing");
    }

    if (!redisInstance) {
      redisInstance = new Redis({
        url,
        token,
      });

      console.log("[Redis] Client initialized");
    }

    return redisInstance;
  } catch (error) {
    console.error("[Redis] Initialization failed:", error);

    throw error;
  }
};
