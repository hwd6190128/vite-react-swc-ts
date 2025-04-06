/** @type {import('jest').Config} */
module.exports = {
  // 使用 jsdom 環境來測試 React 組件
  testEnvironment: 'jsdom',
  
  // 測試根目錄
  roots: ['<rootDir>/src'],
  
  // 使用 ts-jest 處理 TypeScript 文件
  preset: 'ts-jest',
  
  // 包含測試的文件模式
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(tsx?|jsx?)$',
  
  // 支持的模塊文件擴展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // 模塊名稱映射，用於 TypeScript 路徑
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 設置 coverage 收集
  collectCoverage: true,
  
  // 指定收集覆蓋率的文件
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  
  // 覆蓋率報告輸出目錄
  coverageDirectory: 'coverage',
  
  // 覆蓋率閾值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 設置文件以在所有測試前運行
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // 忽略的目錄
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // 不顯示覆蓋率的路徑
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    '.d.ts$',
    'types',
    'index.ts',
    '.test.',
    '__tests__'
  ],
  
  // 測試超時時間
  testTimeout: 10000,
  
  // 清除所有模擬
  clearMocks: true,
  
  // 在 CI 環境中啟用時報告覆蓋率
  coverageReporters: ['text', 'lcov', 'clover'],
  
  // 允許測試模塊引用模擬文件
  unmockedModulePathPatterns: [
    'node_modules/react/',
    'node_modules/enzyme/'
  ],
  
  // 最大並行工作數
  maxWorkers: '50%'
}; 