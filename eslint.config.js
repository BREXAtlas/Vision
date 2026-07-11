import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: [
      'dist',
      'playwright-report',
      'test-results',
      '*.js',
      'src/**/*.js',
      'scripts/**/*.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
  {
    files: [
      'scripts/**/*.ts',
      'playwright.config.ts',
      'e2e/**/*.ts',
      'vite.config.ts',
    ],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
