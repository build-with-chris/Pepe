/**
 * Vitest-Konfiguration.
 *
 * `vitest` stand schon in den Skripten von package.json, es gab aber weder eine
 * Konfiguration noch Tests. Ohne `environment: 'jsdom'` scheitert jeder Test,
 * der eine Komponente rendert, an einem fehlenden `document`.
 *
 * Eigene Datei statt eines `test`-Blocks in vite.config.ts: Dort steckt die
 * Bau-Konfiguration mit manualChunks und Terser, die im Test nur stoert.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
