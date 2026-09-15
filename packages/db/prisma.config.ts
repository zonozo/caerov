import { defineConfig } from 'prisma/config';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

loadDotenv({ path: resolve(process.cwd(), '../../.env') });

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: '../../infra/migrations',
  },
});
