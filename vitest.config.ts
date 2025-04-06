import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: [
          'node_modules',
          'dist',
          '**/*.d.ts',
          'src/types',
          '**/index.{ts,tsx}',
          '**/*.{test,spec}.{ts,tsx}',
          '**/__tests__/**'
        ],
        thresholds: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      },
      deps: {
        inline: ['react', '@tanstack/react-query'],
      },
      reporters: ['default', 'html'],
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  })
); 