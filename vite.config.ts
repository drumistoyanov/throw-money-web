import { defineConfig } from 'vite';

export default defineConfig({
  base: '/throw-money-web/', // Replace with your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3000,
  },
});
