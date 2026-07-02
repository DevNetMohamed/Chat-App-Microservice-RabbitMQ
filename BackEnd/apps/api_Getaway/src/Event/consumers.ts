import type { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "../../../../src/index.js";
import {
  resolveCorrelation,
  clearCorrelation,
} from "../redis/correlationStore.js";
import { getIO } from "../socket/index.js";
interface ResultEnvelope {
  correlationId: string;
  routingKey: string;
  payload: unknown;
  publishedAt: string;
}

const RESULT_EXCHANGES = [
  "user.events",
  "chat.events",
  "message.events",
] as const;
/**
 * Binds a queue to each service's exchange, listening only for
 * "*.succeeded" and "*.failed" result events (gateway never needs to
 * see "*.requested" events — those are commands services consume).
 *
 * On receiving a result, looks up the originating socketId via Redis
 * (keyed by correlationId) and emits the result down that socket.
 */

export async function startResultConsumer(): Promise<void> {
  const channel: Channel = await getChannel();
  for (const exchange of RESULT_EXCHANGES) {
    await channel.assertExchange(exchange, "topic", { durable: true });
    const queueName = `api_Getaway.results.${exchange}`;
    const queue = await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queue.queue, exchange, "*.*.succeeded");
    await channel.bindQueue(queue.queue, exchange, "*.*.failed");
    // Covers 3-segment result keys too, e.g. user.profile.update.succeeded
    await channel.bindQueue(queue.queue, exchange, "*.*.*.succeeded");
    await channel.bindQueue(queue.queue, exchange, "*.*.*.failed");

    await channel.consume(
      queue.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        try {
          const envelope = JSON.parse(msg.content.toString()) as ResultEnvelope;
          const { correlationId, routingKey, payload } = envelope;
          console.log("Envelope:", envelope);
          console.log("Correlation:", correlationId);
          const socketId = await resolveCorrelation(correlationId);
          console.log("Socket ID:", socketId);
          if (!socketId) {
            // No one is listening anymore (client disconnected, or
            // the entry expired). Nothing to do but ack and move on.
            channel.ack(msg);
            return;
          }

          const io = getIO();
          io.to(socketId).emit(routingKey, payload);
          console.log("Publishing:", exchange, routingKey, payload);
          await clearCorrelation(correlationId);
          channel.ack(msg);
          console.log(msg);
          
        } catch (err) {
          console.error("[api_Getaway] Failed to process result event:", err);
          // Reject without requeue to avoid poison-message loops.
          channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    console.log(`[api_Getaway] Listening for result events on "${exchange}"`);
  }
}
