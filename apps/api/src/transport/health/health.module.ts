import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { Readiness } from './readiness';

@Module({ controllers: [HealthController], providers: [Readiness] })
export class HealthModule {}
