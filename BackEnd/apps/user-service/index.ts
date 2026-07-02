import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import * as PORT from "../../src/common/index.js";
import { connectMongoDB } from "../../src/database/connectionDB.js";
import { connectRabbitMQ } from "../../src/RabbitMQ/connections.js";
import { startAuthConsumer } from "./src/RPC/auth.handler.js";
import { redisClient } from "../../src/index.js";

import app from "./app.js";
import { startUserConsumer } from "./src/events/Consumer.js";

async function bootstrap() {
  try {
    await connectMongoDB(process.env.MONGO_URI as string);
    await connectRabbitMQ();

    const redis = redisClient();
    await redis.set("Service", "user_service");
    await startAuthConsumer();
    await startUserConsumer();
   

    app.listen(PORT.SERVICES_PORTS.USER_SERVICE, () => {
      console.log(
        `[user-service] Is running on port ${PORT.SERVICES_PORTS.USER_SERVICE}`,
      );
    });
  } catch (error) {
    console.error("[user-service] Failed to start:", error);
    process.exit(1);
  }
}

bootstrap();
