import type { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "../../../../src/RabbitMQ/connections.js";
import * as authService from "../service/auth.service.js";

const AUTH_QUEUE = "user-service.auth";

interface RpcRequestBody {
  action:
    | "register"
    | "login"
    | "verifyOtp"
    | "resendOtp"
    | "refresh"
    | "logout";
  data: Record<string, unknown>;
}

/**
 * Replies to an RPC caller using the replyTo/correlationId from the
 * original message properties — mirrors the reply-queue pattern
 * api_Getaway's rpc/client.ts expects.
 */
function reply(
  channel: Channel,
  msg: ConsumeMessage,
  body: unknown,
  isError = false,
) {
  if (!msg.properties.replyTo) return;

  const payload = isError
    ? { error: true, message: (body as Error).message, statusCode: 400 }
    : body;

  channel.sendToQueue(
    msg.properties.replyTo,
    Buffer.from(JSON.stringify(payload)),
    { correlationId: msg.properties.correlationId },
  );
}

export async function startAuthConsumer(): Promise<void> {
  const channel: Channel = await getChannel();
  await channel.assertQueue(AUTH_QUEUE, { durable: true });

  await channel.consume(
    AUTH_QUEUE,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const body = JSON.parse(msg.content.toString()) as RpcRequestBody;
        const { action, data } = body;

        let result: unknown;

        switch (action) {
          case "register":
            result = await authService.login(
              data as { email: string;  username: string; },
            );
            break;

          case "login":
            result = await authService.login(
              data as { email: string; },
            );
            break;

          case "verifyOtp":
            result = await authService.verifyOtp(
              data.userId as string,
              data.otp as string,
            );
            break;

          case "resendOtp":
            await authService.resendOtp(data.userId as string);
            result = { success: true };
            break;

          case "refresh":
            result = await authService.refresh(data.refreshToken as string);
            break;

          case "logout":
            await authService.logout(data.refreshToken as string);
            result = { success: true };
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }

        reply(channel, msg, result);
        channel.ack(msg);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        reply(channel, msg, error, true);
        channel.ack(msg);
      }
    },
    { noAck: false },
  );

  console.log(`[user-service] Listening for RPC requests on "${AUTH_QUEUE}"`);
}
