import tseslint from 'typescript-eslint';
import architecture from './scripts/architecture.cjs';

const { api, web, modules, layers } = architecture;
const restrictedImports = (patterns) => ({
  '@typescript-eslint/no-restricted-imports': ['error', { patterns }],
  'no-restricted-imports': 'off',
});

export default tseslint.config(
  { ignores: ['**/dist/**', '**/*.gen.ts'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: [`${web}/**/*.{ts,tsx}`],
    rules: restrictedImports([
      { regex: '(?:^@api/|(?:^|/)apps/api/)', message: 'Use the HTTP client for API access.' },
      {
        regex: `^@web/(?:${layers.slice(1, -1).join('|')})/[^/]+/(?!index(?:\\.tsx?)?$)`,
        message: 'Import from the slice index.ts.',
      },
    ]),
  },
  ...Object.keys(modules).map((module) => ({
    files: [`${api}/modules/${module}/**/*.ts`],
    ignores: ['**/*.module.ts'],
    rules: restrictedImports([{
      regex: `^(?:@api/modules/|(?:\\.\\./)+(?:modules/)?)(?:${Object.keys(modules).filter((peer) => peer !== module).join('|')})/(?!public(?:\\.ts)?$)`,
      message: 'Import from the other module public.ts.',
    }]),
  })),
);
