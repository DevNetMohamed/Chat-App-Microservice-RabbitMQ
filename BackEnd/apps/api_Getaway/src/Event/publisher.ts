import { randomUUID } from "node:crypto";
import type { Channel } from "amqplib";
import { getChannel } from "../../../../src/index.js";
import { trackCorrelation } from "../redis/correlationStore.js";

interface PublishEventOptions {
  exchange: string;
  routingKey: string;
  payload: unknown;
  socketId: string;
}

interface PublishedEvent {
  correlationId: string;
}

export async function publishEvent(
  options: PublishEventOptions,
): Promise<PublishedEvent> {
  const { exchange, routingKey, payload, socketId } = options;

  const channel: Channel = await getChannel();
  await channel.assertExchange(exchange, "topic", { durable: true });

  const correlationId = randomUUID();

  await trackCorrelation(correlationId, socketId);

  const envelope = {
    correlationId,
    routingKey,
    payload,
    publishedAt: new Date().toISOString(),
  };

  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(envelope)), {
    persistent: true,
    correlationId,
  });

  return { correlationId };
}
