import { z } from 'zod';
import { readinessRoute } from './ready.contract';

const responses = Object.fromEntries(
  Object.entries(readinessRoute.responses).map(([status, { description, schema }]) => [
    status,
    { description, content: { 'application/json': { schema: z.toJSONSchema(schema, { target: 'openapi-3.0' }) } } },
  ]),
);
const document = {
  openapi: '3.0.3',
  info: { title: 'AI-first Platform API', version: '0.1.0' },
  paths: { [readinessRoute.path]: { get: { operationId: 'checkReadiness', responses } } },
};

process.stdout.write(JSON.stringify(document, null, 2) + '\n');
