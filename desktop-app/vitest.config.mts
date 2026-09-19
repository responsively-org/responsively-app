import path from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    css: {modules: {classNameStrategy: 'non-scoped'}},
    exclude: ['**/node_modules/**', '**/dist/**', '.erb/**', 'release/**', 'e2e/**'],
  },
  resolve: {
    alias: {
      renderer: path.resolve(dirname, 'src/renderer'),
      common: path.resolve(dirname, 'src/common'),
      main: path.resolve(dirname, 'src/main'),
      store: path.resolve(dirname, 'src/store'),
    },
  },
});
