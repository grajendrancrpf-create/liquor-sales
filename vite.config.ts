import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so preview builds also work over file://
  base: './',
  server: {
    port: 5173,
  },
});
