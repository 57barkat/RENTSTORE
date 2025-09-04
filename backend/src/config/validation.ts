import Joi from "joi";

export const validationSchema: Joi.ObjectSchema<Record<string, unknown>> =
  Joi.object({
    NODE_ENV: Joi.string()
      .valid("development", "test", "production")
      .default("development"),
    PORT: Joi.number().default(3000),
  }) as Joi.ObjectSchema<Record<string, unknown>>;
