import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'test', 'production']).default('development');

const providerSchema = z.enum(['mock']).default('mock');

export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.url(),
  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  IMAGE_PROVIDER: providerSchema,
  VIDEO_PROVIDER: providerSchema,
  AUDIO_PROVIDER: providerSchema,
});

export const workerEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  REDIS_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  IMAGE_PROVIDER: providerSchema,
  VIDEO_PROVIDER: providerSchema,
  AUDIO_PROVIDER: providerSchema,
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;

export function parseApiEnv(environment: NodeJS.ProcessEnv = process.env): ApiEnv {
  return apiEnvSchema.parse(environment);
}

export function parseWorkerEnv(environment: NodeJS.ProcessEnv = process.env): WorkerEnv {
  return workerEnvSchema.parse(environment);
}
