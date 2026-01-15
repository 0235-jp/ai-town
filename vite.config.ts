import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ai-town',
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0) for LAN access
    allowedHosts: true, // Allow all hosts
  },
});
