import type { OnApplicationShutdown } from '@nestjs/common';
import { withinDeadline } from '../../infrastructure/deadline';
import { createPostgresProbe } from '../../infrastructure/postgres';
import { createRabbitmqProbe } from '../../infrastructure/rabbitmq';

const probeTimeout = 2000;

export class Readiness implements OnApplicationShutdown {
  private readonly postgres = createPostgresProbe(probeTimeout);
  private readonly rabbitmq = createRabbitmqProbe(probeTimeout);

  async check() {
    const [postgres, rabbitmq] = await Promise.all([
      withinDeadline(this.postgres.check, probeTimeout),
      withinDeadline(this.rabbitmq, probeTimeout),
    ]);
    return { postgres, rabbitmq };
  }

  async onApplicationShutdown() {
    await this.postgres.close();
  }
}
