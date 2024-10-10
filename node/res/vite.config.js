import { defineConfig } from 'vite';

export default defineConfig({
  // Tus otras configuraciones
  optimizeDeps: {
    include: ['bootstrap'],
  },
});
