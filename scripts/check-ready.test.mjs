import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { test } from 'node:test';

test('checks the page and API through the web address', async (context) => {
  const paths = [];
  let proxyStatus = 200;
  const server = createServer((request, response) => {
    paths.push(request.url);
    response.writeHead(request.url === '/system' ? 200 : proxyStatus);
    response.end();
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
  proxyStatus = 503;
  assert.equal(await check(), 1);
});
