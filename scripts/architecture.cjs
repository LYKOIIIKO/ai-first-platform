const { existsSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const api = 'apps/api/src';
const web = 'apps/web/src';
const modules = {
  access: ['employees', 'projects', 'integrations'],
  'agent-connections': ['employees'],
  employees: [],
  integrations: [],
  projects: [],
};
const layers = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'];

function slices(layer) {
  const path = join(__dirname, '..', web, layer);
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

module.exports = { api, web, modules, layers, slices };
