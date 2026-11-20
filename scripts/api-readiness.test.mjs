import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server.address().port;
}

test('reports unavailable dependencies within the deadline and stays alive', async (context) => {
  const sockets = new Set();
  const dependency = createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.resume();
  });
  const dependencyPort = await listen(dependency);
  context.after(() => {
    for (const socket of sockets) socket.destroy();
    dependency.close();
  });

  const reservation = createServer();
  const apiPort = await listen(reservation);
  await new Promise((resolve) => reservation.close(resolve));

  const child = spawn(process.execPath, ['--import', 'tsx', 'src/main.ts'], {
    cwd: new URL('../apps/api/', import.meta.url),
    env: {
      ...process.env,
      API_HOST: '127.0.0.1',
      API_PORT: String(apiPort),
      PGHOST: '127.0.0.1',
      PGPORT: String(dependencyPort),
      PGDATABASE: 'platform',
      PGUSER: 'platform',
      PGPASSWORD: 'test',
      AMQP_HOST: '127.0.0.1',
      AMQP_PORT: String(dependencyPort),
      AMQP_USER: 'platform',
      AMQP_PASSWORD: 'test',
    },
    stdio: 'ignore',
  });
  const closed = once(child, 'close');
  context.after(async () => {
    child.kill();
    await closed;
  });

  const base = `http://127.0.0.1:${apiPort}`;
  const live = () => fetch(`${base}/health/live`, { signal: AbortSignal.timeout(500) });
  let response;
  for (let attempt = 0; attempt < 50; attempt++) {
    response = await live().catch(() => undefined);
    if (response || child.exitCode !== null) break;
    await delay(100);
  }
  assert.equal(response?.status, 200);
  assert.deepEqual(await response.json(), { status: 'alive' });

  const ready = await fetch(`${base}/health/ready`, { signal: AbortSignal.timeout(3500) });
  assert.equal(ready.status, 503);
  assert.deepEqual(await ready.json(), { postgres: 'unavailable', rabbitmq: 'unavailable' });
  assert.equal((await live()).status, 200);
});
