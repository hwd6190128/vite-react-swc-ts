import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 擴展斷言
expect.extend(matchers);

// 每個測試後清理
afterEach(() => {
  cleanup();
}); 