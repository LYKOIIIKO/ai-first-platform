import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { apiSettings } from './infrastructure/settings';

async function main() {
  const settings = apiSettings();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableShutdownHooks();
  await app.listen(settings.port, settings.host);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'API failed to start.');
  process.exitCode = 1;
});
