import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isProd = env.VITE_MODE === 'production';

  return {
    plugins: [react(), tailwindcss()],
    base: isProd ? '/campus-admin/' : '/',
    server: {
      port: 5175,
      open: true,
    },
  };
});
