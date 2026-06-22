import type { ConsumeMessage } from "amqplib";
import { getChannel } from "../../../../src/RabbitMQ/connections.js";
import { sendOtpEmail } from "../service/mail.service.js";
import * as PORT from "../../../../src/common/index.js";
const MAIL_EVENTS_EXCHANGE = "mail.events";
const QUEUE_NAME = "mail-service.otpEmail";
const ROUTING_KEY = "user.otp.send.requested";

interface OtpEmailEnvelope {
  routingKey: string;
  payload: {
    email: string;
    username: string;
    otpCode: string;
  };
  publishedAt: string;
}

export async function startOtpEmailSubscriber(): Promise<void> {
  const channel = await getChannel();
  await channel.assertExchange(MAIL_EVENTS_EXCHANGE, "topic", {
    durable: true,
  });

  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(queue.queue, MAIL_EVENTS_EXCHANGE, ROUTING_KEY);

  await channel.consume(
    queue.queue,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const envelope = JSON.parse(msg.content.toString()) as OtpEmailEnvelope;
        await sendOtpEmail(envelope.payload);
        channel.ack(msg as any);
      } catch (err) {
        console.error("[mail-service] Failed to send OTP email:", err);
        // Don't requeue indefinitely — avoid poison-message loops.
        // Consider a dead-letter exchange for production use.
        channel.nack(msg as any, false, false);
      }
    },
    { noAck: false },
  );

  console.log(
    `[mail-service] Listening for "${ROUTING_KEY}" on "${MAIL_EVENTS_EXCHANGE}"`,
  );
}
