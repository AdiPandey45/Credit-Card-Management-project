import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig;

export function loadConfig(): EnvConfig {
  try {
    config = envSchema.parse(process.env);
    return config;
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}

export function getConfig(): EnvConfig {
  if (!config) {
    config = loadConfig();
  }
  return config;
}