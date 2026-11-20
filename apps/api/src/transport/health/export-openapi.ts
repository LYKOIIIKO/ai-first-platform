import { z } from 'zod';
import { livenessRoute, readinessRoute } from './health.contract';

const document = {
  openapi: '3.0.3',
  info: { title: 'AI-first Platform API', version: '0.1.0' },
  paths: Object.fromEntries([livenessRoute, readinessRoute].map(({ path, operationId, responses }) => [
    path,
    {
      get: {
        operationId,
        responses: Object.fromEntries(Object.entries(responses).map(([status, { description, schema }]) => [
          status,
          {
            description,
            content: { 'application/json': { schema: z.toJSONSchema(schema, { target: 'openapi-3.0' }) } },
          },
        ])),
      },
    },
  ])),
};

process.stdout.write(JSON.stringify(document, null, 2) + '\n');
