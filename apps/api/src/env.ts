import { z } from 'zod';

const apiRuntimeEnvSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.url().default('http://localhost:3000'),
});

export type ApiRuntimeEnv = z.infer<typeof apiRuntimeEnvSchema>;

export function parseApiRuntimeEnv(environment: NodeJS.ProcessEnv = process.env): ApiRuntimeEnv {
  return apiRuntimeEnvSchema.parse(environment);
}
