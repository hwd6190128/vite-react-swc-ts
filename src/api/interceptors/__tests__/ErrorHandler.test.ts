import { AxiosError, AxiosInstance, AxiosInterceptorManager, AxiosResponse } from 'axios';
import { setupErrorInterceptor, showCommonErrorDialog } from '../ErrorHandler';
import { ErrorHandlingOptions } from '../../core/HttpClient';
import { describe, test, expect, beforeEach, afterEach, vi, SpyInstance } from 'vitest';

interface MockResponseInterceptor {
  onSuccess: (response: AxiosResponse) => AxiosResponse;
  onError: (error: AxiosError) => Promise<AxiosResponse | never>;
}

// Create a complete mock AxiosInstance type with only the properties we need
interface MockAxiosInstance {
  interceptors: {
    request: AxiosInterceptorManager<unknown>;
    response: AxiosInterceptorManager<AxiosResponse>;
  };
}

describe('ErrorHandler', () => {
  // Create a mock Axios instance
  let mockAxiosInstance: MockAxiosInstance & AxiosInstance;
  let responseInterceptor: MockResponseInterceptor;
  let mockConsoleError: SpyInstance;
  let mockAlert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAlert = vi.fn();
    global.alert = mockAlert;
    
    // Create mock Axios instance and interceptor manager
    const interceptorManager = {
      use: vi.fn((onSuccess, onError) => {
        responseInterceptor = { onSuccess, onError };
        return 0; // Return a handler ID
      }),
      eject: vi.fn(),
      clear: vi.fn()
    } as unknown as AxiosInterceptorManager<AxiosResponse>;
    
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn(),
          eject: vi.fn(),
          clear: vi.fn()
        } as unknown as AxiosInterceptorManager<unknown>,
        response: interceptorManager
      }
    } as MockAxiosInstance & AxiosInstance;
  });

  afterEach(() => {
    // Restore original functions
    console.error = originalConsoleError;
    global.alert = originalAlert;
    vi.resetAllMocks();
  });

  test('setupErrorInterceptor should set up response interceptor', () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    expect(responseInterceptor).toBeDefined();
    expect(typeof responseInterceptor.onSuccess).toBe('function');
    expect(typeof responseInterceptor.onError).toBe('function');
  });

  test('interceptor should pass through successful responses', async () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    const successResponse: AxiosResponse = {
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any // 必須使用 any 因為 AxiosResponse config 屬性需要
    };
    
    const result = await responseInterceptor.onSuccess(successResponse);
    
    expect(result).toBe(successResponse);
  });

  test('showCommonErrorDialog should display error message', () => {
    const mockError: Partial<AxiosError> = {
      message: 'Test Error',
      response: {
        status: 404,
        data: { message: 'Not Found' },
        statusText: 'Not Found',
        headers: {},
        config: {}
      } as AxiosResponse
    };
    
    showCommonErrorDialog(mockError as AxiosError);
    
    expect(mockConsoleError).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith('Error 404: Not Found');
  });

  test('network errors should be handled correctly', async () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    const networkError: Partial<AxiosError> = {
      message: 'Network Error',
      config: {} as any, // 必須使用 any，因為 AxiosError 配置需要特定屬性
      isAxiosError: true,
      name: 'Error',
      toJSON: () => ({})
    };
    
    // Test the error handling part of the interceptor
    await expect(responseInterceptor.onError(networkError as AxiosError))
      .rejects.toEqual(networkError);
    
    expect(mockConsoleError).toHaveBeenCalledWith('Network Error:', 'Network Error');
  });

  test('should throw error when propagateError is set to "throw"', async () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    const errorConfig = {
      errorHandling: {
        showCommonErrorDialog: true,
        propagateError: 'throw'
      } as ErrorHandlingOptions
    };
    
    const mockError: Partial<AxiosError> = {
      message: 'Test Error',
      response: {
        status: 500,
        data: { message: 'Server Error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {}
      } as AxiosResponse,
      config: errorConfig as any, // 必須使用 any，因為 AxiosError 配置需要特定屬性
      isAxiosError: true,
      name: 'Error',
      toJSON: () => ({})
    };
    
    await expect(responseInterceptor.onError(mockError as AxiosError))
      .rejects.toEqual(mockError);
    
    expect(mockAlert).toHaveBeenCalled();
  });

  test('should return error response when propagateError is set to "resolve"', async () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    const errorConfig = {
      errorHandling: {
        showCommonErrorDialog: false,
        propagateError: 'resolve'
      } as ErrorHandlingOptions
    };
    
    const mockError: Partial<AxiosError> = {
      message: 'Test Error',
      response: {
        status: 400,
        data: { message: 'Bad Request' },
        statusText: 'Bad Request',
        headers: {},
        config: {}
      } as AxiosResponse,
      config: errorConfig as any, // 必須使用 any，因為 AxiosError 配置需要特定屬性
      isAxiosError: true,
      name: 'Error',
      toJSON: () => ({})
    };
    
    const result = await responseInterceptor.onError(mockError as AxiosError);
    
    expect(result).toEqual(expect.objectContaining({
      data: null,
      status: 400,
      statusText: 'Bad Request'
    }));
    
    expect(mockAlert).not.toHaveBeenCalled();
  });

  test('should return empty response when propagateError is set to "ignore"', async () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    const errorConfig = {
      errorHandling: {
        showCommonErrorDialog: false,
        propagateError: 'ignore'
      } as ErrorHandlingOptions
    };
    
    const mockError: Partial<AxiosError> = {
      message: 'Test Error',
      response: {
        status: 403,
        data: { message: 'Forbidden' },
        statusText: 'Forbidden',
        headers: {},
        config: {}
      } as AxiosResponse,
      config: errorConfig as any, // 必須使用 any，因為 AxiosError 配置需要特定屬性
      isAxiosError: true,
      name: 'Error',
      toJSON: () => ({})
    };
    
    const result = await responseInterceptor.onError(mockError as AxiosError);
    
    expect(result).toEqual(expect.objectContaining({
      data: null,
      status: 200,
      statusText: 'OK'
    }));
    
    expect(mockAlert).not.toHaveBeenCalled();
  });

  test('should use default options when error handling options are not specified', async () => {
    setupErrorInterceptor(mockAxiosInstance);
    
    const mockError: Partial<AxiosError> = {
      message: 'Test Error',
      response: {
        status: 500,
        data: { message: 'Server Error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {}
      } as AxiosResponse,
      config: {} as any, // 必須使用 any，因為 AxiosError 配置需要特定屬性
      isAxiosError: true,
      name: 'Error',
      toJSON: () => ({})
    };
    
    // Default should show error dialog and throw error
    await expect(responseInterceptor.onError(mockError as AxiosError))
      .rejects.toEqual(mockError);
    
    expect(mockAlert).toHaveBeenCalled();
  });
});

// Mock console.error and global.alert (需要移到頂部)
const originalConsoleError = console.error;
const originalAlert = global.alert; 