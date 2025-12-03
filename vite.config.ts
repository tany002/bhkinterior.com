import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use '.' to refer to the current working directory to avoid TS errors with process.cwd()
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Prevents "process is not defined" error in browser
      'process.env': {},
      // Inject the API Key specifically
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});