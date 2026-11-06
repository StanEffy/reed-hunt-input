import { defineConfig } from 'vite';

// The demo site (GitHub Pages). The library itself is built by tsup.
export default defineConfig({
  root: 'demo',
  base: process.env.DEMO_BASE ?? '/',
  esbuild: { jsx: 'automatic' },
  build: { outDir: '../demo-dist', emptyOutDir: true },
  server: { port: 5199 },
});
