import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    sourcemap: true
  },
  publicDir: resolve(__dirname, 'public'),
  server: {
    port: 5173,
    strictPort: false
  }
});
