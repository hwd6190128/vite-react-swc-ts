import axios, { AxiosInstance, AxiosError } from 'axios';
import { setupErrorInterceptor, showCommonErrorDialog, DEFAULT_ERROR_OPTIONS } from '../ErrorHandler';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandlingOptions } from '../../core/HttpClient';

// 模擬 axios
vi.mock('axios');

describe('ErrorHandler', () => {
  let mockAxiosInstance: AxiosInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    // 重置所有模擬
    vi.clearAllMocks();

    // 模擬 axios 實例
    mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    } as unknown as AxiosInstance;

    // 模擬 console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // 模擬 window.alert
    globalThis.alert = vi.fn();
    alertSpy = vi.spyOn(globalThis, 'alert');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('setupErrorInterceptor', () => {
    test('應該使用默認錯誤處理選項設置攔截器', () => {
      setupErrorInterceptor(mockAxiosInstance);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    test('應該使用自定義錯誤處理選項設置攔截器', () => {
      const customOptions: ErrorHandlingOptions = {
        showErrorDialog: false,
        ignoreErrors: [404]
      };
      setupErrorInterceptor(mockAxiosInstance, customOptions);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    test('攔截器應該處理請求取消', async () => {
      // 設置攔截器
      setupErrorInterceptor(mockAxiosInstance);

      // 獲取攔截器函數
      const [, errorHandler] = mockAxiosInstance.interceptors.response.use.mock.calls[0];

      // 模擬 axios.isCancel 返回 true
      vi.mocked(axios.isCancel).mockReturnValueOnce(true);

      // 創建取消錯誤
      const cancelError = new Error('Request canceled') as AxiosError;
      
      // 執行錯誤處理器
      await expect(errorHandler(cancelError)).rejects.toEqual(cancelError);
      
      // 驗證 console.log 被調用
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('攔截器應該處理 API 錯誤並顯示錯誤對話框', async () => {
      // 設置攔截器
      setupErrorInterceptor(mockAxiosInstance);

      // 獲取攔截器函數
      const [, errorHandler] = mockAxiosInstance.interceptors.response.use.mock.calls[0];

      // 模擬 axios.isCancel 返回 false
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      // 創建 API 錯誤
      const apiError = {
        config: {
          errorHandling: {
            showErrorDialog: true
          }
        },
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      } as unknown as AxiosError;
      
      // 執行錯誤處理器
      await expect(errorHandler(apiError)).rejects.toEqual(apiError);
      
      // 驗證錯誤被記錄
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', { message: 'Internal Server Error' });
    });

    test('攔截器應該忽略指定的錯誤狀態碼', async () => {
      // 設置攔截器，忽略 404 錯誤
      setupErrorInterceptor(mockAxiosInstance, {
        showErrorDialog: true,
        ignoreErrors: [404]
      });

      // 獲取攔截器函數
      const [, errorHandler] = mockAxiosInstance.interceptors.response.use.mock.calls[0];

      // 模擬 axios.isCancel 返回 false
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      // 創建 404 錯誤
      const notFoundError = {
        config: {},
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      } as unknown as AxiosError;
      
      // 執行錯誤處理器
      await expect(errorHandler(notFoundError)).rejects.toEqual(notFoundError);
      
      // 驗證 console.error 沒有被調用
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('攔截器應該調用自定義錯誤處理函數', async () => {
      // 創建自定義錯誤處理函數
      const onError = vi.fn();
      
      // 設置攔截器，包含自定義錯誤處理
      setupErrorInterceptor(mockAxiosInstance, {
        showErrorDialog: false,
        onError
      });

      // 獲取攔截器函數
      const [, errorHandler] = mockAxiosInstance.interceptors.response.use.mock.calls[0];

      // 模擬 axios.isCancel 返回 false
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      // 創建錯誤
      const apiError = {
        config: {},
        response: {
          status: 500,
          data: { message: 'Server Error' }
        }
      } as unknown as AxiosError;
      
      // 執行錯誤處理器
      await expect(errorHandler(apiError)).rejects.toEqual(apiError);
      
      // 驗證自定義錯誤處理函數被調用
      expect(onError).toHaveBeenCalledWith(apiError);
    });
  });

  describe('showCommonErrorDialog', () => {
    test('應該顯示錯誤對話框', () => {
      // 創建錯誤
      const error = {
        message: 'Network Error',
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      } as unknown as AxiosError;
      
      // 調用函數
      showCommonErrorDialog(error);
      
      // 驗證錯誤被記錄
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error 500: Internal Server Error',
        error
      );
      
      // 驗證顯示警告
      expect(alertSpy).toHaveBeenCalledWith('Error 500: Internal Server Error');
    });

    test('應該處理沒有響應數據的錯誤', () => {
      // 創建沒有響應數據的錯誤
      const error = {
        message: 'Network Error',
        response: {
          status: 0
        }
      } as unknown as AxiosError;
      
      // 調用函數
      showCommonErrorDialog(error);
      
      // 驗證錯誤被記錄
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error 0: Network Error',
        error
      );
      
      // 驗證顯示警告
      expect(alertSpy).toHaveBeenCalledWith('Error 0: Network Error');
    });

    test('應該處理沒有響應的錯誤', () => {
      // 創建沒有響應的錯誤
      const error = {
        message: 'Network Error'
      } as unknown as AxiosError;
      
      // 調用函數
      showCommonErrorDialog(error);
      
      // 驗證錯誤被記錄
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error undefined: Network Error',
        error
      );
      
      // 驗證顯示警告
      expect(alertSpy).toHaveBeenCalledWith('Error undefined: Network Error');
    });
  });
}); 