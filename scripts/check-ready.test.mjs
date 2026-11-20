import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';

test('checks the page and API through the web address', async (context) => {
  const paths = [];
  let proxyStatus = 200;
  let proxyBody = JSON.stringify({ postgres: 'ready', rabbitmq: 'ready' });
  const server = createServer((request, response) => {
    paths.push(request.url);
    const page = request.url === '/system';
    response.writeHead(page ? 200 : proxyStatus);
    response.end(page ? '<main></main>' : proxyBody);
  });
  context.after(() => server.close());
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const env = { ...process.env, WEB_PORT: String(server.address().port) };
  const check = async () => {
    const child = spawn(process.execPath, ['scripts/local.mjs', 'check:ready'], { env });
    const [code] = await once(child, 'exit');
    return code;
  };

  assert.equal(await check(), 0);
  assert.deepEqual(paths, ['/system', '/api/health/ready']);
  proxyBody = '<main>Vite fallback</main>';
  assert.equal(await check(), 1);
  proxyStatus = 503;
  assert.equal(await check(), 1);
});
