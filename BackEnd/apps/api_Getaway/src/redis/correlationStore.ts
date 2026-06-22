import { redisClient } from "../../../../src/index.js";

const CORRELATION_PREFIX = "corr:";
const DEFAULT_TTL_SECONDS = 60; // pending requests expire after 60s if no reply arrives

/**
 * Stores a mapping from a request's correlationId to the socketId that
 * should receive the eventual result. Used so the gateway can publish
 * an event, return 202 immediately, and later route the async result
 * back to the correct connected client.
 */
export async function trackCorrelation(
  correlationId: string,
  socketId: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): Promise<void> {
  const redis = redisClient();
  await redis.set(`${CORRELATION_PREFIX}${correlationId}`, socketId, {
    ex: ttlSeconds,
  });
}

/**
 * Looks up which socketId should receive the result for a given
 * correlationId. Returns null if not found (expired, already
 * consumed, or never existed).
 */
export async function resolveCorrelation(
  correlationId: string,
): Promise<string | null> {
  const redis = redisClient();
  const socketId = await redis.get(`${CORRELATION_PREFIX}${correlationId}`);
  return (socketId as string) ?? null;
}

/**
 * Removes a correlationId mapping once its result has been delivered,
 * so Redis doesn't accumulate stale entries before the TTL expires.
 */
export async function clearCorrelation(correlationId: string): Promise<void> {
  const redis = redisClient();
  await redis.del(`${CORRELATION_PREFIX}${correlationId}`);
}
