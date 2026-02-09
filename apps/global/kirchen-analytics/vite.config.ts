import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const processEnv = Object.fromEntries(
    Object.entries(env)
      .filter(([k]) => k.startsWith('REACT_APP_'))
      .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
  );

  return {
  plugins: [react()],
  base: './',
  envPrefix: 'REACT_APP_',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    ...processEnv,
  },
  optimizeDeps: {
    include: ['@project/api-client'],
  },
  build: {
    commonjsOptions: {
      defaultIsModuleExports: 'auto',
      transformMixedEsModules: true,
    },
  },
};
});
