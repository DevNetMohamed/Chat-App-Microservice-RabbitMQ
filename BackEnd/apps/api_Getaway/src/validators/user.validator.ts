import Joi from "joi";

export const updateProfileSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  bio: Joi.string().max(300).allow("").optional(),
  avatarUrl: Joi.string().uri().optional(),
}).min(1); // require at least one field to update

export const getUsersByIdsSchema = Joi.object({
  ids: Joi.array().items(Joi.string().required()).min(1).required(),
});

export const searchUsersSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});
