export const otpTemplate = (username: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:10px;">
    
    <h2 style="text-align:center;">Verify Your Email</h2>

    <p>Hello,</p>

    <p>Thank you for signing up for <strong>Chat App</strong>.</p>

    <p>Please use the following OTP code to verify your email:</p>

    <div style="text-align:center; margin:30px 0;">
      <span style="
        display:inline-block;
        padding:15px 30px;
        font-size:28px;
        font-weight:bold;
        letter-spacing:5px;
        background:#f0f0f0;
        border-radius:8px;">
        ${otp}
      </span>
    </div>

    <p>This code will expire in <strong>10 minutes</strong>.</p>

    <p>If you did not request this verification, please ignore this email.</p>

    <hr>

    <p style="text-align:center; color:#666;">
      © Chat App
    </p>

  </div>
</body>
</html>
`;