import type { Channel } from "amqplib";
import { getChannel } from "../../../../src/RabbitMQ/connections.js";

const MAIL_EVENTS_EXCHANGE = "mail.events";

interface SendOtpEmailPayload {
  email: string;
  username: string;
  otpCode: string;
}

/**
 * Publishes a "user.otp.send.requested" event. mail-service subscribes
 * to this and sends the actual email using the shared OTP template.
 * Fire-and-forget — user-service does not wait for delivery confirmation.
 */
export async function publishOtpEmailRequested(
  payload: SendOtpEmailPayload,
): Promise<void> {
  const channel: Channel = await getChannel();
  await channel.assertExchange(MAIL_EVENTS_EXCHANGE, "topic", {
    durable: true,
  });

  const envelope = {
    routingKey: "user.otp.send.requested",
    payload,
    publishedAt: new Date().toISOString(),
  };

  channel.publish(
    MAIL_EVENTS_EXCHANGE,
    "user.otp.send.requested",
    Buffer.from(JSON.stringify(envelope)),
    { persistent: true },
  );
}
