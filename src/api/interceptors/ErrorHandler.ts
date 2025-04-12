import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ErrorHandlingOptions } from '../core/HttpClient';

/**
 * 默認錯誤處理選項
 */
export const DEFAULT_ERROR_OPTIONS: ErrorHandlingOptions = {
  showErrorDialog: true,
  ignoreErrors: []
};

/**
 * 擴展的 Axios 請求配置，包含錯誤處理選項
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  errorHandling?: ErrorHandlingOptions;
}

/**
 * 設置錯誤處理攔截器
 * @param axiosInstance - Axios 實例
 * @param defaultErrorHandling - 默認錯誤處理選項
 */
export function setupErrorInterceptor(
  axiosInstance: AxiosInstance, 
  defaultErrorHandling: ErrorHandlingOptions = DEFAULT_ERROR_OPTIONS
): void {
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      // 處理請求取消
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return Promise.reject(error);
      }

      // 從請求配置中獲取錯誤處理選項
      const config = error.config as ExtendedAxiosRequestConfig;
      const errorHandling: ErrorHandlingOptions = config?.errorHandling || defaultErrorHandling;

      // 根據選項處理錯誤
      if (error.response) {
        const status = error.response.status;
        
        // 如果狀態碼在忽略列表中，跳過處理
        if (errorHandling.ignoreErrors?.includes(status)) {
          return Promise.reject(error);
        }
        
        // 如果提供了自定義錯誤處理函數，調用它
        if (errorHandling.onError) {
          errorHandling.onError(error);
        }
        
        // 如果啟用了錯誤對話框，顯示錯誤
        if (errorHandling.showErrorDialog) {
          // 實現取決於您的 UI 框架
          console.error('API Error:', error.response.data);
        }
      }

      return Promise.reject(error);
    }
  );
}

/**
 * 顯示通用錯誤對話框
 * @param error - Axios 錯誤
 */
export function showCommonErrorDialog(error: AxiosError): void {
  const status = error.response?.status;
  let message = error.message;
  
  // 如果可用，嘗試從響應數據中提取消息
  if (error.response?.data) {
    if (typeof error.response.data === 'object') {
      const errorData = error.response.data as Record<string, unknown>;
      message = (errorData.message as string) || (errorData.error as string) || message;
    }
  }

  console.error(`HTTP Error ${status}: ${message}`, error);
  alert(`Error ${status}: ${message}`);
} 