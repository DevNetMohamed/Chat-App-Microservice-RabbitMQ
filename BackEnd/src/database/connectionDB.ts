import mongoose from "mongoose";

let isConnected = false;

export const connectMongoDB = async (uri: string): Promise<void> => {
  if (isConnected) return;

  await mongoose.connect(uri);

  isConnected = true;

  console.log("[MongoDB] Connected");
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();

  isConnected = false;

  console.log("[MongoDB] Disconnected");
};
