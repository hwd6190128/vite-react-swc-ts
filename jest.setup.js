// 這個文件包含了運行測試前的設置代碼

// 擴展 expect 的 matchers
import '@testing-library/jest-dom';

// 全局模擬 global.fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: new Map(),
  })
);

// 清理模擬
afterEach(() => {
  jest.clearAllMocks();
});

// 禁用測試庫的控制台警告
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// 模擬 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 向後兼容
    removeListener: jest.fn(), // 向後兼容
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模擬 window.FormData
global.FormData = class FormData {
  constructor() {
    this.entries = {};
  }
  
  append(key, value) {
    this.entries[key] = value;
  }
}; 