// 這個文件包含了運行測試前的設置代碼
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 全局模擬 global.fetch
global.fetch = vi.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Map(),
  })
);

// 清理模擬
beforeEach(() => {
  vi.resetAllMocks();
});

// 禁用測試庫的控制台警告
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

// 模擬 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // 向後兼容
    removeListener: vi.fn(), // 向後兼容
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 模擬 window.FormData
class MockFormData {
  private entries: Record<string, any> = {};
  
  append(key: string, value: any) {
    this.entries[key] = value;
  }
}

global.FormData = MockFormData as any; 