import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const backendTarget =
    mode === 'docker' ? 'http://127.0.0.1:3030' : 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['urbancandy.local'],
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
