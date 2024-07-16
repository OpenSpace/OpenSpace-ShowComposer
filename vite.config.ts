import { defineConfig } from 'vite';
import eslintPlugin from '@nabla/vite-plugin-eslint';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteUploadPlugin } from './vite-plugin-upload';

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [viteUploadPlugin(), react(), eslintPlugin()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
});
