import axios, { AxiosInstance, AxiosError } from 'axios';
import { setupErrorInterceptor, showCommonErrorDialog  } from '../ErrorHandler';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandlingOptions } from '../../core/HttpClient';

// Mock axios
vi.mock('axios');

describe('ErrorHandler', () => {
  let mockAxiosInstance: AxiosInstance;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock axios instance
    mockAxiosInstance = {
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    } as unknown as AxiosInstance;

    // Mock console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.alert
    globalThis.alert = vi.fn();
    alertSpy = vi.spyOn(globalThis, 'alert');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('setupErrorInterceptor', () => {
    test('should set up interceptor with default error handling options', () => {
      setupErrorInterceptor(mockAxiosInstance);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    test('should set up interceptor with custom error handling options', () => {
      const customOptions: ErrorHandlingOptions = {
        showErrorDialog: false,
        ignoreErrors: [404]
      };
      setupErrorInterceptor(mockAxiosInstance, customOptions);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    test('interceptor should handle request cancellation', async () => {
      // Set up interceptor
      setupErrorInterceptor(mockAxiosInstance);

      // Get interceptor function
      const useFunction = mockAxiosInstance.interceptors.response.use as ReturnType<typeof vi.fn>;
      const [, errorHandler] = useFunction.mock.calls[0];

      // Mock axios.isCancel to return true
      vi.mocked(axios.isCancel).mockReturnValueOnce(true);

      // Create cancel error
      const cancelError = new Error('Request canceled') as AxiosError;
      
      // Execute error handler
      await expect(errorHandler(cancelError)).rejects.toEqual(cancelError);
      
      // Verify console.log was not called
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('interceptor should handle API errors and show error dialog', async () => {
      // Set up interceptor
      setupErrorInterceptor(mockAxiosInstance);

      // Get interceptor function
      const useFunction = mockAxiosInstance.interceptors.response.use as ReturnType<typeof vi.fn>;
      const [, errorHandler] = useFunction.mock.calls[0];

      // Mock axios.isCancel to return false
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      // Create API error
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
      
      // Execute error handler
      await expect(errorHandler(apiError)).rejects.toEqual(apiError);
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', { message: 'Internal Server Error' });
    });

    test('interceptor should ignore specified error status codes', async () => {
      // Set up interceptor, ignoring 404 errors
      setupErrorInterceptor(mockAxiosInstance, {
        showErrorDialog: true,
        ignoreErrors: [404]
      });

      // Get interceptor function
      const useFunction = mockAxiosInstance.interceptors.response.use as ReturnType<typeof vi.fn>;
      const [, errorHandler] = useFunction.mock.calls[0];

      // Mock axios.isCancel to return false
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      // Create 404 error
      const notFoundError = {
        config: {},
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      } as unknown as AxiosError;
      
      // Execute error handler
      await expect(errorHandler(notFoundError)).rejects.toEqual(notFoundError);
      
      // Verify console.error was not called
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('interceptor should call custom error handler function', async () => {
      // Create custom error handler function
      const onError = vi.fn();
      
      // Set up interceptor with custom error handling
      setupErrorInterceptor(mockAxiosInstance, {
        showErrorDialog: false,
        onError
      });

      // Get interceptor function
      const useFunction = mockAxiosInstance.interceptors.response.use as ReturnType<typeof vi.fn>;
      const [, errorHandler] = useFunction.mock.calls[0];

      // Mock axios.isCancel to return false
      vi.mocked(axios.isCancel).mockReturnValueOnce(false);

      // Create error
      const apiError = {
        config: {},
        response: {
          status: 500,
          data: { message: 'Server Error' }
        }
      } as unknown as AxiosError;
      
      // Execute error handler
      await expect(errorHandler(apiError)).rejects.toEqual(apiError);
      
      // Verify custom error handler function was called
      expect(onError).toHaveBeenCalledWith(apiError);
    });
  });

  describe('showCommonErrorDialog', () => {
    test('should display error dialog', () => {
      // Create error
      const error = {
        message: 'Network Error',
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      } as unknown as AxiosError;
      
      // Call function
      showCommonErrorDialog(error);
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error 500: Internal Server Error',
        error
      );
      
      // Verify alert was shown
      expect(alertSpy).toHaveBeenCalledWith('Error 500: Internal Server Error');
    });

    test('should handle errors without response data', () => {
      // Create error without response data
      const error = {
        message: 'Network Error',
        response: {
          status: 0
        }
      } as unknown as AxiosError;
      
      // Call function
      showCommonErrorDialog(error);
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error 0: Network Error',
        error
      );
      
      // Verify alert was shown
      expect(alertSpy).toHaveBeenCalledWith('Error 0: Network Error');
    });

    test('should handle errors without response', () => {
      // Create error without response
      const error = {
        message: 'Network Error'
      } as unknown as AxiosError;
      
      // Call function
      showCommonErrorDialog(error);
      
      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'HTTP Error undefined: Network Error',
        error
      );
      
      // Verify alert was shown
      expect(alertSpy).toHaveBeenCalledWith('Error undefined: Network Error');
    });
  });
}); 