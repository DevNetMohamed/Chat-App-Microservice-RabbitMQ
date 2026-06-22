import { otpTemplate, sendEmail } from "../../../../src/index.js";
import { EmailLog } from "../models/EmailLog.js";

interface SendOtpEmailInput {
  email: string;
  username: string;
  otpCode: string;
}

export async function sendOtpEmail(input: SendOtpEmailInput): Promise<void> {
  const { email, username, otpCode } = input;

  try {
    const html = otpTemplate(username, otpCode);

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html,
    });

    await EmailLog.create({
      recipient: email,
      template: "otpTemplate",
      status: "sent",
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";

    await EmailLog.create({
      recipient: email,
      template: "otpTemplate",
      status: "failed",
      error,
    });

    throw err;
  }
}
