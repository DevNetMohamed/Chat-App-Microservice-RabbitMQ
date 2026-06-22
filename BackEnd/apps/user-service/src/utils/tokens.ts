import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { RefreshToken } from "../models/RefreshToken.js";
import type { IUser } from "../models/User.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_DAYS = 30;

export function signAccessToken(user: IUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");

  return jwt.sign(
    { id: user._id.toString(), email: user.email, verified: user.verified },
    secret,
    { expiresIn: ACCESS_TOKEN_TTL },
  );
}

export async function issueRefreshToken(user: IUser): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await RefreshToken.create({
    userId: user._id,
    token,
    expiresAt,
  });

  return token;
}
