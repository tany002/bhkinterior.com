
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy API requests to the Vercel dev server default port
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      // Prevents "process is not defined" error in browser
      // and injects specific public variables.
      // NOTE: Do NOT add RESEND_API_KEY here. It is for backend use only.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.NEXT_PUBLIC_CASHFREE_ENV': JSON.stringify(env.CASHFREE_ENV || 'sandbox'),
      'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173'),
      // Fallback empty object for other libs accessing process.env
      'process.env': {} 
    }
  };
});
