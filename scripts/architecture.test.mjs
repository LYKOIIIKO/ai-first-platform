import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const api = 'apps/api/src';
const web = 'apps/web/src';
const cruiser = fileURLToPath(new URL('node_modules/dependency-cruiser/bin/dependency-cruiser.mjs', root));

test('checks resolved type imports, entry points, layers and cycles', (context) => {
  const fixture = mkdtempSync(join(tmpdir(), 'platform-architecture-'));
  context.after(() => rmSync(fixture, { recursive: true, force: true }));

  function write(path, content) {
    const target = join(fixture, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }

  for (const path of ['.dependency-cruiser.cjs', 'scripts/architecture.cjs', 'tsconfig.architecture.json']) {
    mkdirSync(dirname(join(fixture, path)), { recursive: true });
    copyFileSync(new URL(path, root), join(fixture, path));
  }

  const cruise = () => {
    const result = spawnSync(process.execPath, [cruiser, '--config', '.dependency-cruiser.cjs', api, web], {
      cwd: fixture,
      encoding: 'utf8',
    });
    assert.ifError(result.error);
    return { status: result.status, output: result.stdout + result.stderr };
  };

  write(`${api}/modules/employees/public.ts`, 'export type Employee = string;');
  write(`${api}/modules/employees/employees.module.ts`, 'export const EmployeesModule = {};');
  write(`${api}/modules/employees/private.ts`, 'export type InternalEmployee = string;');
  write(`${api}/modules/access/access.module.ts`, "export { EmployeesModule } from '@api/modules/employees/employees.module';");
  write(`${api}/modules/access/public.ts`, "export type { Employee } from '@api/modules/employees/public';");
  write(`${web}/shared/model/index.ts`, 'export const model = {};');
  write(`${web}/shared/other/index.ts`, "export { model } from '@web/shared/model';");
  write(`${web}/pages/system/index.ts`, "export { model } from '@web/shared/other';");
  write(`${web}/app/routes/system.ts`, "export { model } from '@web/pages/system';");
  write(`${web}/app/router.ts`, "export { model } from './routes/system';");

  const clean = cruise();
  assert.equal(clean.status, 0, clean.output);

  write(`${api}/modules/access/internal.ts`, [
    "import type { InternalEmployee } from '@api/modules/employees/private';",
    "export type RestrictedEmployee = InternalEmployee;",
    "export { EmployeesModule } from '@api/modules/employees/employees.module';",
    "export { cycle } from './cycle';",
  ].join('\n'));
  write(`${api}/modules/access/cycle.ts`, "export { cycle } from './internal';");
  write(`${api}/modules/employees/forbidden.ts`, "export type { Employee } from '@api/modules/access/public';");
  write(`${web}/pages/system/internal.ts`, "export { model } from '@web/app/router';");
  write(`${web}/pages/system/self-barrel.ts`, "export { model } from './index';");
  write(`${web}/pages/other/index.ts`, "export { model } from '@web/pages/system';");
  write(`${web}/app/bypass.ts`, [
    "export { model } from '@web/pages/system/internal';",
    "export type { Employee } from '@api/modules/employees/public';",
  ].join('\n'));

  const rejected = cruise();
  assert.notEqual(rejected.status, 0, rejected.output);
  for (const rule of [
    'access-use-peer-public.ts',
    'nest-assembly-only',
    'no-cycles',
    'employees-allowed-module-dependencies',
    'fsd-pages-imports-downward',
    'fsd-pages-system-no-self-barrel',
    'fsd-pages-other-no-peer-slice',
    'fsd-pages-system-public-entry',
    'web-imports-api-over-http',
  ]) {
    assert.ok(rejected.output.includes(rule), `Missing ${rule}\n${rejected.output}`);
  }
});
