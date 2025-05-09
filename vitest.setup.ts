// This file contains setup code to run before tests
import { vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock global.fetch
global.fetch = vi.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Map(),
  })
);

// Clean up mocks and DOM after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// Disable console warnings in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // backward compatibility
    removeListener: vi.fn(), // backward compatibility
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.FormData
class MockFormData {
  private entries: Record<string, any> = {};
  
  append(key: string, value: any) {
    this.entries[key] = value;
  }
}

global.FormData = MockFormData as any; 