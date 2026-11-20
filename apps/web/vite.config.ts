import { fileURLToPath } from 'node:url';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tanstackRouter({ target: 'react' }), react()],
  resolve: { alias: { '@web': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    host: process.env.WEB_HOST ?? '127.0.0.1',
    port: Number(process.env.WEB_PORT ?? '5173'),
    strictPort: true,
    proxy: {
      '/api/': {
        target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000',
        rewrite: (path) => path.slice('/api'.length),
      },
    },
  },
});
