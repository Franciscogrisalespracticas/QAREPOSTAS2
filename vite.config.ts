import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El sitio de GitHub Pages se sirve desde /QAREPOSTAS2/, no desde /.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/QAREPOSTAS2/' : '/',
  server: { host: '0.0.0.0' },
}));
