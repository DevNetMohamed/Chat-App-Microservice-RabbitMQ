import Joi from "joi";

export const verifyOtpSchema = Joi.object({
  userId: Joi.string().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
});

export const resendOtpSchema = Joi.object({
  userId: Joi.string().required(),
});
