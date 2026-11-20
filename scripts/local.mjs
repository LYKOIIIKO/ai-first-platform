import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { parseEnv } from 'node:util';

const envFile = new URL('../.env', import.meta.url);
const env = {
  ...(existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {}),
  ...process.env,
};
const webPort = env.WEB_PORT ?? '5173';
const apiPort = env.API_PORT ?? '3000';
const waitTimeout = '120';

function start(command, args, childEnv = env, cwd = process.cwd()) {
  return spawn(command, args, { cwd, env: childEnv, stdio: 'inherit' });
}

function exitCode(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
}

async function composeUp(services = []) {
  const args = ['compose', 'up', '--wait', '--wait-timeout', waitTimeout, ...services];
  if (await exitCode(start('docker', args)) !== 0) {
    throw new Error('Docker Compose не подтвердил готовность стека.');
  }
}

async function checkReady() {
  for (const path of ['/system', '/api/health/ready']) {
    const url = new URL(path, `http://127.0.0.1:${webPort}`);
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.status !== 200) throw new Error(`${url} вернул HTTP ${response.status}.`);
    await response.body?.cancel();
  }
  console.log('Web и API через прокси готовы.');
}

async function dev() {
  await composeUp(['db', 'rabbitmq']);
  const runtime = Object.fromEntries(Object.entries(process.env).filter(([name]) =>
    /^(?:path|systemroot|windir|temp|tmp|home|userprofile|comspec)$/i.test(name)
  ));
  const api = start(process.execPath, ['--watch', '--import', 'tsx', 'src/main.ts'], {
    ...runtime,
    API_HOST: '127.0.0.1',
    API_PORT: apiPort,
    PGHOST: '127.0.0.1',
    PGPORT: env.DB_PORT ?? '5432',
    PGDATABASE: env.POSTGRES_DB,
    PGUSER: env.API_POSTGRES_USER || env.POSTGRES_USER,
    PGPASSWORD: env.API_POSTGRES_PASSWORD || env.POSTGRES_PASSWORD,
    AMQP_HOST: '127.0.0.1',
    AMQP_PORT: env.RABBITMQ_PORT ?? '5672',
    AMQP_USER: env.API_RABBITMQ_USER || env.RABBITMQ_DEFAULT_USER,
    AMQP_PASSWORD: env.API_RABBITMQ_PASSWORD || env.RABBITMQ_DEFAULT_PASS,
  }, 'apps/api');
  const web = start(process.execPath, ['node_modules/vite/bin/vite.js'], {
    ...runtime,
    WEB_HOST: '127.0.0.1',
    WEB_PORT: webPort,
    API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`,
  }, 'apps/web');
  const stop = () => {
    api.kill();
    web.kill();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    process.exitCode = await Promise.race([exitCode(api), exitCode(web)]);
  } finally {
    stop();
  }
}

try {
  switch (process.argv[2]) {
    case 'check:ready':
      await checkReady();
      break;
    case 'smoke':
      await composeUp();
      await checkReady();
      break;
    case 'dev':
      await dev();
      break;
    default:
      throw new Error('Укажите dev, smoke или check:ready.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
