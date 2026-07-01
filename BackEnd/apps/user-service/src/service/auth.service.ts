import { User, type IUser } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { generateOtp, getOtpExpiry, isOtpExpired } from "../utils/otp.js";
import { signAccessToken, issueRefreshToken } from "../utils/tokens.js";
import { publishOtpEmailRequested } from "../events/otpEmail.publisher.js";
import { redisClient } from "../../../../src/index.js";

interface LoginInput {
  email: string;
}


export async function login(input: LoginInput): Promise<{ success: true }> {
  let user = await User.findOne({ email: input.email });

  if (!user) {
    user = await User.create({
      email: input.email,
      username: input.email.split("@")[0],
      verified: false,
    });
  }

  const otpCode = generateOtp();

  user.otpCode = otpCode;
  user.otpExpiresAt = getOtpExpiry();

  const redis =  redisClient();
  await redis.set(`otp:${user._id}`, JSON.stringify({ username: user.email, otpCode }), { EX: 300 });

  await user.save();

  await publishOtpEmailRequested({
    email: user.email,
    username: user.username,
    otpCode,
  });

  return { success: true };
}



export async function verifyOtp(
  userId: string,
  otp: string,
): Promise<{ verified: true }> {
  const user = await User.findById(userId).select("+otpCode +otpExpiresAt");

  if (!user) {
    throw new Error("User not found");
  }

  if (user.verified) {
    return { verified: true };
  }

  if (isOtpExpired(user.otpExpiresAt)) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (user.otpCode !== otp) {
    throw new Error("Invalid OTP code");
  }

  user.verified = true;
  // user.otpCode = undefined;
  // user.otpExpiresAt = undefined;
  await user.save();
  await User.updateOne(
    { _id: user._id },
    { $unset: { otpCode: "", otpExpiresAt: "" } },
  );
  return { verified: true };
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

// export async function login(input: LoginInput): Promise<AuthResult> {
//   const user = await User.findOne({ email: input.email });

//   if (!user) {
//     throw AppError.notFound("Invalid email");
//   }
//   const accessToken = signAccessToken(user);
//   const refreshToken = await issueRefreshToken(user);

//   return { user: toPublicUser(user), accessToken, refreshToken };
// }

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
