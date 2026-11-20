import { Controller, Get, Inject, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { Readiness } from './readiness';
import { readinessRoute } from './ready.contract';

@Controller()
export class HealthController {
  constructor(@Inject(Readiness) private readonly readiness: Readiness) {}

  @Get('/health/live')
  live() {
    return { status: 'alive' };
  }

  @Get(readinessRoute.path)
  async ready(@Res({ passthrough: true }) reply: FastifyReply) {
    const dependencies = await this.readiness.check();
    const status = dependencies.postgres === 'ready' && dependencies.rabbitmq === 'ready' ? 200 : 503;
    reply.code(status);
    return readinessRoute.responses[status].schema.parse(dependencies);
  }
}
