import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/.next/**',
      '**/coverage/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/.turbo/**',
      '**/*.d.ts',
      'e2e/**',
      'playwright.config.ts',
      '**/next.config.ts',
      '**/prisma.config.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    },
  },
  {
    files: ['**/*.config.ts', 'e2e/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
