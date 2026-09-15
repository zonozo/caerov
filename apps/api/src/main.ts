import 'reflect-metadata';

import cors from '@fastify/cors';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

import { AppModule } from './app.module.js';
import { parseApiRuntimeEnv } from './env.js';

loadDotenv();
loadDotenv({ path: resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const env = parseApiRuntimeEnv();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(cors, { origin: env.WEB_URL, credentials: true });
  app.enableShutdownHooks();
  await app.listen(env.API_PORT, '0.0.0.0');

  Logger.log(`API listening on http://localhost:${env.API_PORT}`, 'Bootstrap');
}

void bootstrap();
