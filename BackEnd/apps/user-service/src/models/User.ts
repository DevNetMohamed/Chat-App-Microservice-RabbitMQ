import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  verified: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      select: false, // never returned by default queries
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
