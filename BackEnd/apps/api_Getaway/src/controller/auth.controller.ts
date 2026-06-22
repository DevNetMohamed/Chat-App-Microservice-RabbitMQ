import type { Request, Response } from "express";
import { asyncHandler } from "../../../../src/index.js";
import { rpcRequest } from "../rpc/client.js";

const USER_SERVICE_AUTH_QUEUE = "user-service.auth";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await rpcRequest<AuthResponse>({
    queue: USER_SERVICE_AUTH_QUEUE,
    payload: { action: "register", data: req.body },
  });

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await rpcRequest<AuthResponse>({
    queue: USER_SERVICE_AUTH_QUEUE,
    payload: { action: "login", data: req.body },
  });
  res.status(200).json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await rpcRequest<AuthResponse>({
    queue: USER_SERVICE_AUTH_QUEUE,
    payload: { action: "refresh", data: req.body },
  });
  res.status(200).json({ success: true, data: result });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await rpcRequest<{ success: boolean }>({
    queue: USER_SERVICE_AUTH_QUEUE,
    payload: { action: "logout", data: req.body },
  });
  res.status(200).json({ success: true, message: "Logged out" });
});

export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    await rpcRequest<{ success: boolean }>({
      queue: USER_SERVICE_AUTH_QUEUE,
      payload: { action: "requestPasswordReset", data: req.body },
    });

    res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    await rpcRequest<{ success: boolean }>({
      queue: USER_SERVICE_AUTH_QUEUE,
      payload: { action: "resetPassword", data: req.body },
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  },
);

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await rpcRequest<{ verified: boolean }>({
    queue: USER_SERVICE_AUTH_QUEUE,
    payload: { action: "verifyOtp", data: req.body },
  });

  res.status(200).json({ success: true, data: result });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  await rpcRequest<{ success: boolean }>({
    queue: USER_SERVICE_AUTH_QUEUE,
    payload: { action: "resendOtp", data: req.body },
  });

  res.status(200).json({ success: true, message: "OTP resent" });
});
