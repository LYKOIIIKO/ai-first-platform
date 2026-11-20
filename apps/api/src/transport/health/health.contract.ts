import { z } from 'zod';

const dependency = z.enum(['ready', 'unavailable']);
const ready = z.object({
  postgres: z.literal('ready'),
  rabbitmq: z.literal('ready'),
});
const unavailable = z.union([
  z.object({ postgres: z.literal('unavailable'), rabbitmq: dependency }),
  z.object({ postgres: dependency, rabbitmq: z.literal('unavailable') }),
]);

export const livenessRoute = {
  path: '/health/live',
  operationId: 'checkLiveness',
  responses: {
    200: { description: 'API process is alive', schema: z.object({ status: z.literal('alive') }) },
  },
};

export const readinessRoute = {
  path: '/health/ready',
  operationId: 'checkReadiness',
  responses: {
    200: { description: 'Both dependencies are ready', schema: ready },
    503: { description: 'A dependency is unavailable', schema: unavailable },
  },
};
