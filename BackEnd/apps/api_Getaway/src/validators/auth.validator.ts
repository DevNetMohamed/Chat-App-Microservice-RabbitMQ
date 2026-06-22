import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});
