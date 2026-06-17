import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // Use the browser-compatible path module in the Tauri frontend bundle.
      path: 'path-browserify',
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
