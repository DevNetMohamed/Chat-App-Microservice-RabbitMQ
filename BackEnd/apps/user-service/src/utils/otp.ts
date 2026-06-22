const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

/**
 * Generates a numeric OTP code, e.g. "482913".
 */
export function generateOtp(): string {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
}

export function isOtpExpired(expiresAt: Date | undefined): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}
