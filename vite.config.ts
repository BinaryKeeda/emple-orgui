import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {


  return {
    plugins: [react(), tailwindcss()],
    base: '/campus-admin/' ,
    server: {
      port: 5175,
      open: true,
    },
  };
});
