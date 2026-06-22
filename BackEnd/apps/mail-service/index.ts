import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { connectMongoDB } from "../../src/database/connectionDB.js";
import { connectRabbitMQ } from "../../src/RabbitMQ/connections.js";
import { startOtpEmailSubscriber } from "./src/events/otpEmail.subscriber.js";
import { redisClient } from "../../src/index.js";
import * as PORT from "../../src/common/index.js";
import app from "./app.js";

async function bootstrap() {
  try {
    await connectMongoDB(process.env.MONGO_URI as string);
    await connectRabbitMQ();
    await startOtpEmailSubscriber();

    const redis = redisClient();

    redis.set("service", "mail");

    app.listen(PORT.SERVICES_PORTS.MAIL_SERVICE, () => {
      console.log(
        `[mail-service] is runinng on port ${PORT.SERVICES_PORTS.MAIL_SERVICE}`,
      );
    });
  } catch (error) {
    console.error("[mail-service] Failed to start:", error);
    process.exit(1);
  }
}

bootstrap();
