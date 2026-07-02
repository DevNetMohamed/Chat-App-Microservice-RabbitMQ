import { User, type IUser } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { generateOtp, getOtpExpiry, isOtpExpired } from "../utils/otp.js";
import { signAccessToken, issueRefreshToken } from "../utils/tokens.js";
import { publishOtpEmailRequested } from "../events/otpEmail.publisher.js";
import { AppError, redisClient } from "../../../../src/index.js";

interface LoginInput {
  email: string;
}

export async function login(input: LoginInput): Promise<{ success: true }> {
  let user = await User.findOne({ email: input.email });

  if (!user) {
    const [localPart] = input.email.split("@");
    user = await User.create({
      email: input.email,
      username: localPart ?? input.email,
      verified: false,
    });
  }

  const otpCode = generateOtp();

  user.otpCode = otpCode;
  user.otpExpiresAt = getOtpExpiry();

  const redis = redisClient();
  await redis.set(
    `otp:${user.email}`,
    JSON.stringify({ username: user.email, OTPCode: otpCode }),
    { ex: 300 },
  );

  await user.save();

  await publishOtpEmailRequested({
    email: user.email,
    username: user.username,
    otpCode,
  });

  return { success: true };
}

export async function verifyOtp(
  email: string,
  otp: string,
): Promise<{
  verified: true;
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}> {
  const user = await User.findOne({ email }).select("+otpCode +otpExpiresAt");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.verified) {
    const accessToken = signAccessToken(user);
    const refreshToken = await issueRefreshToken(user);
    return {
      verified: true,
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), email: user.email },
    };
  }

  if (isOtpExpired(user.otpExpiresAt)) {
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  if (user.otpCode !== otp) {
    throw new AppError("Invalid OTP code", 404);
  }

  user.verified = true;

  await user.save();
  await User.updateOne(
    { email: user.email },
    { $unset: { otpCode: "", otpExpiresAt: "" } },
  );

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  return {
    verified: true,
    accessToken,
    refreshToken,
    user: { id: user._id.toString(), email: user.email },
  };
}

export async function resendOtp(userId: string): Promise<void> {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.verified) {
    throw new Error("Account is already verified");
  }

  const otpCode = generateOtp();
  user.otpCode = otpCode;
  user.otpExpiresAt = getOtpExpiry();
  await user.save();

  await publishOtpEmailRequested({
    email: user.email,
    username: user.username,
    otpCode,
  });
}

export async function refresh(
  refreshTokenValue: string,
): Promise<{ accessToken: string }> {
  const stored = await RefreshToken.findOne({
    token: refreshTokenValue,
    revoked: false,
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(stored.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const accessToken = signAccessToken(user);
  return { accessToken };
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await RefreshToken.updateOne(
    { token: refreshTokenValue },
    { $set: { revoked: true } },
  );
}
