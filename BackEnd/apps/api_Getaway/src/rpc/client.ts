import { randomUUID } from "crypto";
import type { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "../../../../src/RabbitMQ/connections.js";
import { AppError } from "../../../../src/error/AppError.js";

/**
 * Generic RPC request helper over RabbitMQ.
 *
 * Pattern: sends a message to `queue` with a unique correlationId and a
 * dedicated reply queue, then waits for a matching response on that
 * reply queue. Times out if no response arrives in time.
 *
 * Mirrors the RPC pattern already used between chat-service and
 * message-service, but generalized so api_Getaway can call any
 * downstream service (user-service, chat-service, message-service).
 */

interface RpcRequestOptions {
  /** Target RPC queue name, e.g. "user-service.auth" */
  queue: string;
  /** Payload to send */
  payload: unknown;
  /** Timeout in ms before the request is considered failed (default 5000) */
  timeoutMs?: number;
}

interface RpcErrorPayload {
  error: true;
  message: string;
  statusCode?: number;
}

export async function rpcRequest<TResponse = unknown>(
  options: RpcRequestOptions,
): Promise<TResponse> {
  const { queue, payload, timeoutMs = 5000 } = options;

  const channel: Channel = await getChannel();

  // Dedicated, exclusive, auto-delete reply queue per request.
  const replyQueue = await channel.assertQueue("", {
    exclusive: true,
    autoDelete: true,
  });

  const correlationId = randomUUID();

  return new Promise<TResponse>((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      channel.deleteQueue(replyQueue.queue).catch(() => {});
      reject(
        new AppError(
          `RPC request to "${queue}" timed out after ${timeoutMs}ms`,
          504,
        ),
      );
    }, timeoutMs);

    channel
      .consume(
        replyQueue.queue,
        (msg: ConsumeMessage | null) => {
          if (!msg) return;
          if (msg.properties.correlationId !== correlationId) return;
          if (settled) return;

          settled = true;
          clearTimeout(timer);

          try {
            const parsed = JSON.parse(msg.content.toString());

            if (parsed && parsed.error === true) {
              const errPayload = parsed as RpcErrorPayload;
              reject(new AppError(errPayload.message, errPayload.statusCode ?? 500));
              return;
            }

            resolve(parsed as TResponse);
          } catch (err) {
            reject(
              new AppError(
                `Failed to parse RPC response from "${queue}"`,
                500,
              ),
            );
          } finally {
            channel.deleteQueue(replyQueue.queue).catch(() => {});
          }
        },
        { noAck: true },
      )
      .catch((err: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err instanceof Error ? err : new AppError("RPC consume failed", 500));
      });

    try {
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
        correlationId,
        replyTo: replyQueue.queue,
      });
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(err instanceof Error ? err : new AppError("RPC publish failed", 500));
      }
    }
  });
}
