const { api, web, modules, layers, slices } = require('./scripts/architecture.cjs');

const apiModule = `${api}/modules`;
const assembly = '\\.module\\.ts$';
const publicEntry = '/public\\.ts$';
const indexEntry = '/index\\.tsx?$';
const forbidden = [
  {
    name: 'no-cycles',
    severity: 'error',
    from: { path: `^(?:${api}|${web})/` },
    to: { circular: true },
  },
  {
    name: 'resolve-local-imports',
    severity: 'error',
    from: { path: `^(?:${api}|${web})/` },
    to: { couldNotResolve: true },
  },
  {
    name: 'web-imports-api-over-http',
    severity: 'error',
    from: { path: '^apps/web/' },
    to: { path: '^apps/api/' },
  },
  {
    name: 'nest-assembly-only',
    severity: 'error',
    from: { path: `^${api}/`, pathNot: assembly },
    to: { path: `^${apiModule}/[^/]+/[^/]+${assembly}` },
  },
  {
    name: 'transport-and-application-use-domain-public-api',
    severity: 'error',
    from: { path: `^${api}/(?:transport|application)/`, pathNot: assembly },
    to: { path: `^${apiModule}/`, pathNot: publicEntry },
    comment: 'Import from the module public.ts.',
  },
  {
    name: 'domain-does-not-depend-on-application-or-transport',
    severity: 'error',
    from: { path: `^${apiModule}/` },
    to: { path: `^${api}/(?:application|transport)/` },
  },
];

for (const [domain, allowed] of Object.entries(modules)) {
  const source = `^${apiModule}/${domain}/`;
  const peer = `^${apiModule}/(?!${domain}/)`;
  forbidden.push({
    name: `${domain}-allowed-module-dependencies`,
    severity: 'error',
    from: { path: source },
    to: { path: peer, pathNot: allowed.map((target) => `^${apiModule}/${target}/`) },
  }, {
    name: `${domain}-use-peer-public.ts`,
    severity: 'error',
    from: { path: source, pathNot: assembly },
    to: { path: peer, pathNot: publicEntry },
    comment: 'Import from the other module public.ts.',
  }, {
    name: `${domain}-assembly-uses-peer-entry-points`,
    severity: 'error',
    from: { path: `${source}.*${assembly}` },
    to: { path: peer, pathNot: [publicEntry, assembly] },
  });
}

for (const [position, layer] of layers.entries()) {
  const above = layers.slice(0, position);
  if (above.length > 0) {
    forbidden.push({
      name: `fsd-${layer}-imports-downward`,
      severity: 'error',
      from: { path: `^${web}/${layer}/` },
      to: { path: `^${web}/(?:${above.join('|')})/` },
    });
  }
  if (layer === 'app' || layer === 'shared') continue;
  for (const slice of slices(layer)) {
    const escaped = slice.replace(/[.*+?^$(){}|\[\]\\]/g, '\\$&');
    const source = `^${web}/${layer}/${escaped}/`;
    forbidden.push({
      name: `fsd-${layer}-${slice}-no-peer-slice`,
      severity: 'error',
      from: { path: source },
      to: { path: `^${web}/${layer}/(?!${escaped}/)` },
    }, {
      name: `fsd-${layer}-${slice}-public-entry`,
      severity: 'error',
      from: { path: `^${web}/`, pathNot: source },
      to: { path: source, pathNot: `${source.slice(0, -1)}${indexEntry}` },
      comment: 'Import from the slice index.ts.',
    }, {
      name: `fsd-${layer}-${slice}-no-self-barrel`,
      severity: 'error',
      from: { path: source },
      to: { path: `${source.slice(0, -1)}${indexEntry}` },
    });
  }
}

forbidden.push({
  name: 'fsd-shared-public-entry',
  severity: 'error',
  from: { path: `^${web}/`, pathNot: `^${web}/shared/` },
  to: {
    path: `^${web}/shared/`,
    pathNot: [
      `^${web}/shared/[^/]+${indexEntry}`,
      `^${web}/shared/[^/]+/[^/]+${indexEntry}`,
    ],
  },
  comment: 'Import from the Shared segment or library index.ts.',
});

module.exports = {
  forbidden,
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.architecture.json' },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      conditionNames: ['types', 'import', 'require', 'node', 'default'],
    },
  },
};
