import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths keep the Vite build compatible with GitHub Pages
  // project paths as well as root-domain hosting.
  base: '/TOKO-JOLIE-/',
});
