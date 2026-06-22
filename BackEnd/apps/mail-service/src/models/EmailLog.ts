import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  recipient: string;
  template: string;
  status: "sent" | "failed";
  error?: string;
  sentAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>({
  recipient: { type: String, required: true },
  template: { type: String, required: true },
  status: { type: String, enum: ["sent", "failed"], required: true },
  error: { type: String },
  sentAt: { type: Date, default: Date.now },
});

export const EmailLog = mongoose.model<IEmailLog>("EmailLog", emailLogSchema);
