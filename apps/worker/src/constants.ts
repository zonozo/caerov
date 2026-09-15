export const GENERATION_QUEUE = 'generation';

export function workerStartupMessage(redisUrl: string): string {
  const url = new URL(redisUrl);
  return `Worker connected to Redis at ${url.hostname}:${url.port || '6379'}`;
}
