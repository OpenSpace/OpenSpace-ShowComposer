import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// The "showbuilder.js" REST API (save/load/export/upload projects + images) is served by the
// OpenSpace WebGui backend, which OpenSpace already runs while it's up. Override the origin with
// SHOWCOMPOSER_BACKEND if OpenSpace is serving on a different host/port
const DEFAULT_BACKEND_ORIGIN = 'http://localhost:4680';

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const backend = env.SHOWCOMPOSER_BACKEND || DEFAULT_BACKEND_ORIGIN;

  return {
    // The base is used for both dev and build. The backend serves the built dist app AND the API under
    // /showcomposer/ in production, so mounting dev at the same base makes every URL
    // identical across dev and production
    base: '/showcomposer/',
    plugins: [react(), eslintPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    },
    // The dev server forwards the REST api calls to the running OpenSpace backend. Ignored in
    // production
    server: {
      host: true, // reachable via both localhost and 127.0.0.1
      proxy: {
        '/showcomposer/api': { target: backend, changeOrigin: true },
        '/showcomposer/uploads': { target: backend, changeOrigin: true },
        '/showcomposer/projects': { target: backend, changeOrigin: true }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/lodash')) return 'lodash'; // Split Lodash into its own chunk
            if (id.includes('node_modules')) return 'vendor'; // Other node modules go into the vendor chunk
            // Optionally, add more conditions here to split your own code into chunks.
          }
        }
      }
    }
  };
});
