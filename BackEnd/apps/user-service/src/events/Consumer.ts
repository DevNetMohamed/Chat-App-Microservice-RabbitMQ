import type { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "../../../../src/index.js";
import { User } from "../models/User.js";


const USER_EVENTS_EXCHANGE = "user.events";

interface RequestEnvelope {
  correlationId: string;
  routingKey: string;
  payload: {
    id: string;
    
  };
  publishedAt: string;
}

export async function startUserConsumer(): Promise<void> {
  const channel: Channel = await getChannel();

  await channel.assertExchange(USER_EVENTS_EXCHANGE, "topic", {
    durable: true,
  });

  const queue = await channel.assertQueue(
    "user-service.profile.requests",
    {
      durable: true,
    },
  );

  await channel.bindQueue(
    queue.queue,
    USER_EVENTS_EXCHANGE,
    "user.profile.get.requested",
  );

  await channel.consume(
    queue.queue,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const envelope = JSON.parse(
          msg.content.toString(),
        ) as RequestEnvelope;

        const { correlationId, payload } = envelope;

        const user = await User.findOne({
          id: payload.id,
        }).lean();

        channel.publish(
          USER_EVENTS_EXCHANGE,
          user
            ? "user.profile.get.succeeded"
            : "user.profile.get.failed",
          Buffer.from(
            JSON.stringify({
              correlationId,
              routingKey: user
                ? "user.profile.get.succeeded"
                : "user.profile.get.failed",
              payload: user ?? {
                message: "User not found",
              },
              publishedAt: new Date().toISOString(),
            }),
          ),
          {
            persistent: true,
          },
        );

        channel.ack(msg);
      } catch (err) {
        console.error("[user-service] Failed to process profile request:", err);
        channel.nack(msg, false, false);
      }
    },
    { noAck: false },
  );

  console.log(
    '[user-service] Listening for "user.profile.get.requested"',
  );
}