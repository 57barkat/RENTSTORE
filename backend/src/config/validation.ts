import Joi from "joi";

export const validationSchema: Joi.ObjectSchema<Record<string, unknown>> =
  Joi.object({
    NODE_ENV: Joi.string()
      .valid("development", "test", "production")
      .default("development"),
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default("api/v1"),
    JWT_SECRET: Joi.string().min(16).required(),
    JWT_EXPIRES_IN: Joi.string().default("15m"),
    MONGO_URI: Joi.string()
      .pattern(/^mongodb(\+srv)?:\/\//)
      .required(),
    MONGO_DB_NAME: Joi.string().optional(),
    MONGO_MAX_POOL_SIZE: Joi.number().integer().min(1).default(100),
    MONGO_MIN_POOL_SIZE: Joi.number().integer().min(0).default(5),
    MONGO_SERVER_SELECTION_TIMEOUT_MS: Joi.number()
      .integer()
      .min(1000)
      .default(5000),
    MONGO_SOCKET_TIMEOUT_MS: Joi.number().integer().min(1000).default(45000),
    CORS_ORIGINS: Joi.string().allow("").optional(),
    TRUST_PROXY: Joi.boolean().truthy("true").falsy("false").default(false),
    JSON_BODY_LIMIT: Joi.string().default("1mb"),
    URLENCODED_BODY_LIMIT: Joi.string().default("1mb"),
    CHAT_EVENT_BUS_ENABLED: Joi.boolean()
      .truthy("true")
      .falsy("false")
      .default(false),
    FCM_SERVICE_ACCOUNT_JSON: Joi.string().optional(),
    FCM_SERVICE_ACCOUNT_PATH: Joi.string().optional(),
  }) as Joi.ObjectSchema<Record<string, unknown>>;
