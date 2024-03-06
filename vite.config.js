import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react(), svgr(), nodePolyfills()],
    resolve: {
      alias: [
        { find: '~', replacement: path.resolve(__dirname, './src') },
        {
          find: /@uniswap\/sdk$/,
          replacement: path.resolve(
            __dirname,
            'node_modules',
            '@uniswap',
            'sdk',
            'dist',
            'index.js',
          ),
        },
        {
          find: /@uniswap\/token-lists$/,
          replacement: path.resolve(
            __dirname,
            'node_modules',
            '@uniswap',
            'token-lists',
            'dist',
            'index.js',
          ),
        },
      ],
    },
  };
});
