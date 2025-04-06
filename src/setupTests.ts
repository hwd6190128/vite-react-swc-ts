import '@testing-library/jest-dom';

// 全局設置，如果需要的話
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}; 