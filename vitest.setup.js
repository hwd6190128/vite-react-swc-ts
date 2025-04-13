// This file contains setup code to run before tests

// Extend expect matchers
import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';

// Global mock for global.fetch
global.fetch = vi.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Map(),
  })
);

// Clean up mocks
afterEach(() => {
  vi.clearAllMocks();
});

// Disable test library console warnings
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Backward compatibility
    removeListener: vi.fn(), // Backward compatibility
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.FormData
global.FormData = class FormData {
  constructor() {
    this.entries = {};
  }
  
  append(key, value) {
    this.entries[key] = value;
  }
}; 