import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    target: 'chrome120', // Electron 28 uses Chromium 120
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined // Disable code splitting for single-file output
      }
    }
  }
});
