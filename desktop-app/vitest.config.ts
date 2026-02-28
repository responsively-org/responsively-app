import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    css: {modules: {classNameStrategy: 'non-scoped'}},
    exclude: ['**/node_modules/**', '**/dist/**', '.erb/**', 'release/**'],
  },
  resolve: {
    alias: {
      renderer: path.resolve(__dirname, 'src/renderer'),
      common: path.resolve(__dirname, 'src/common'),
      main: path.resolve(__dirname, 'src/main'),
      store: path.resolve(__dirname, 'src/store'),
    },
  },
});
