import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom environment for testing React components
    environment: 'jsdom',
    
    // Test root directory
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    
    // Module name mapping for TypeScript paths
    alias: {
      '@': '/src',
    },
    
    // Setup coverage collection
    coverage: {
      enabled: false, // Disable coverage for now
    },
    
    // Set up files to run before all tests
    setupFiles: ['./vitest.setup.js'],
    
    // Ignore directories
    exclude: ['node_modules', 'dist'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Clear all mocks
    clearMocks: true,
    
    // Global variables
    globals: true
  }
}); 