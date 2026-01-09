import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VERCEL_API_KEY': JSON.stringify(env.VERCEL_API_KEY),
      'process.env.VERCEL_MODEL': JSON.stringify(env.VERCEL_MODEL),
      'process.env.AIML_API_KEY': JSON.stringify(env.AIML_API_KEY),
      'process.env.AIML_MODEL': JSON.stringify(env.AIML_MODEL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
