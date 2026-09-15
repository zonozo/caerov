import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

import { parseWorkerEnv } from '@caerov/config';
import { createWorkerProviderRegistry } from './provider-registry.js';

import { GENERATION_QUEUE, workerStartupMessage } from './constants.js';

loadDotenv();
loadDotenv({ path: resolve(process.cwd(), '../../.env') });

interface GenerationJobData {
  taskId?: string;
  nodeId?: string;
  input?: Record<string, unknown>;
}

async function bootstrap() {
  const env = parseWorkerEnv();
  const providers = createWorkerProviderRegistry(env);
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      console.log(`Received placeholder job ${job.id ?? 'unknown'}`);
      if (job.name === 'mock-image') {
        return providers.image.generate({
          taskId: String(job.data?.taskId ?? job.id ?? 'unknown'),
          nodeId: String(job.data?.nodeId ?? 'unknown'),
          input: job.data?.input ?? {},
        });
      }

      return { status: 'placeholder' };
    },
    { connection },
  );

  await worker.waitUntilReady();
  console.log(workerStartupMessage(env.REDIS_URL));
  console.log(`Worker is ready and listening on queue "${GENERATION_QUEUE}"`);

  const shutdown = async (signal: string) => {
    console.log(`Worker received ${signal}; shutting down`);
    await worker.close();
    await connection.quit();
    process.exit(0);
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

void bootstrap().catch((error: unknown) => {
  console.error('Worker failed to start', error);
  process.exitCode = 1;
});
