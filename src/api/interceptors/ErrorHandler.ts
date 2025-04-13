import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ErrorHandlingOptions } from '../core/HttpClient';

/**
 * Default error handling options
 */
export const DEFAULT_ERROR_OPTIONS: ErrorHandlingOptions = {
  showErrorDialog: true,
  ignoreErrors: []
};

/**
 * Extended Axios request configuration with error handling options
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  errorHandling?: ErrorHandlingOptions;
}

/**
 * Setup error handling interceptor
 * @param axiosInstance - Axios instance
 * @param defaultErrorHandling - Default error handling options
 */
export function setupErrorInterceptor(
  axiosInstance: AxiosInstance, 
  defaultErrorHandling: ErrorHandlingOptions = DEFAULT_ERROR_OPTIONS
): void {
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      // Handle request cancellation
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return Promise.reject(error);
      }

      // Get error handling options from request configuration
      const config = error.config as ExtendedAxiosRequestConfig;
      const errorHandling: ErrorHandlingOptions = config?.errorHandling || defaultErrorHandling;

      // Handle error based on options
      if (error.response) {
        const status = error.response.status;
        
        // Skip processing if the status code is in the ignore list
        if (errorHandling.ignoreErrors?.includes(status)) {
          return Promise.reject(error);
        }
        
        // If a custom error handler function is provided, call it
        if (errorHandling.onError) {
          errorHandling.onError(error);
        }
        
        // If error dialog is enabled, display the error
        if (errorHandling.showErrorDialog) {
          // Implementation depends on your UI framework
          console.error('API Error:', error.response.data);
        }
      }

      return Promise.reject(error);
    }
  );
}

/**
 * Show common error dialog
 * @param error - Axios error
 */
export function showCommonErrorDialog(error: AxiosError): void {
  const status = error.response?.status;
  let message = error.message;
  
  // Try to extract message from response data if available
  if (error.response?.data) {
    if (typeof error.response.data === 'object') {
      const errorData = error.response.data as Record<string, unknown>;
      message = (errorData.message as string) || (errorData.error as string) || message;
    }
  }

  console.error(`HTTP Error ${status}: ${message}`, error);
  alert(`Error ${status}: ${message}`);
} 