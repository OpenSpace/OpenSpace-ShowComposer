import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteUploadPlugin } from './vite-plugin-upload';

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  return {
    // base: isBuild ? './' : '/',
    base: './',
    plugins: [viteUploadPlugin(), react(), eslintPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/lodash')) return 'lodash'; // Split Lodash into its own chunk
            if (id.includes('node_modules')) return 'vendor'; // Other node modules go into the vendor chunk
            // Optionally, add more conditions here to split your own code into chunks.
          },
        },
      },
    },
  };
});
