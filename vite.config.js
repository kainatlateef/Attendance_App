import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  host: true, // 👈 allow LAN access
  server: {
    allowedHosts: [''], // you already have this
    proxy: {
      '/api': {
        target: 'http://localhost/abbey_app/Abbey_backend', // your PHP backend root
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // remove /api prefix
      },
    },
  },

});
