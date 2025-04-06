import { HttpClient, HttpMethod, RequestOptions } from '../HttpClient';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { AxiosInstance, AxiosResponse } from 'axios';

interface HttpClientTestAccess {
  instance: AxiosInstance;
}

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        defaults: {
          baseURL: '',
          timeout: 0,
          headers: { common: {} },
          withCredentials: false
        },
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        patch: vi.fn(),
        request: vi.fn()
      })),
      isAxiosError: vi.fn()
    }
  };
});

// Mock ErrorHandler
vi.mock('../../interceptors/ErrorHandler', () => ({
  setupErrorInterceptor: vi.fn()
}));

describe('HttpClient', () => {
  // Since HttpClient is a singleton instance, we test it directly
  let mockAxiosInstance: AxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = (HttpClient as unknown as HttpClientTestAccess).instance;
  });

  describe('Configuration methods', () => {
    test('setBaseUrl should correctly set the base URL', () => {
      const baseUrl = 'https://api.example.com';
      HttpClient.setBaseUrl(baseUrl);
      expect(mockAxiosInstance.defaults.baseURL).toBe(baseUrl);
    });

    test('setTimeout should correctly set the timeout', () => {
      const timeout = 5000;
      HttpClient.setTimeout(timeout);
      expect(mockAxiosInstance.defaults.timeout).toBe(timeout);
    });

    test('setHeader should correctly set request headers', () => {
      HttpClient.setHeader('Content-Type', 'application/json');
      expect(mockAxiosInstance.defaults.headers.common['Content-Type']).toBe('application/json');
    });

    test('setWithCredentials should correctly set the credentials option', () => {
      HttpClient.setWithCredentials(true);
      expect(mockAxiosInstance.defaults.withCredentials).toBe(true);
    });
  });

  describe('HTTP methods', () => {
    const url = '/test';
    const data = { key: 'value' };
    const options: RequestOptions = { headers: { 'X-Test': 'test' } };

    test('get method should correctly call axios request', async () => {
      (mockAxiosInstance.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'response',
        status: 200,
        statusText: 'OK',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.get(url, data, options);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
        method: HttpMethod.GET,
        url,
        params: data
      }));
      expect(response.data).toBe('response');
    });

    test('post method should correctly call axios request', async () => {
      (mockAxiosInstance.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'response',
        status: 201,
        statusText: 'Created',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.post(url, data, options);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
        method: HttpMethod.POST,
        url,
        data
      }));
      expect(response.data).toBe('response');
    });

    test('put method should correctly call axios request', async () => {
      (mockAxiosInstance.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'response',
        status: 200,
        statusText: 'OK',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.put(url, data, options);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
        method: HttpMethod.PUT,
        url,
        data
      }));
      expect(response.data).toBe('response');
    });

    test('delete method should correctly call axios request', async () => {
      (mockAxiosInstance.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'response',
        status: 204,
        statusText: 'No Content',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.delete(url, data, options);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
        method: HttpMethod.DELETE,
        url,
        data
      }));
      expect(response.data).toBe('response');
    });

    test('patch method should correctly call axios request', async () => {
      (mockAxiosInstance.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'response',
        status: 200,
        statusText: 'OK',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.patch(url, data, options);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
        method: HttpMethod.PATCH,
        url,
        data
      }));
      expect(response.data).toBe('response');
    });
  });

  describe('uploadFile method', () => {
    test('should correctly handle File object upload', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const url = '/upload';
      const onUploadProgress = vi.fn();
      
      (mockAxiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'upload-response',
        status: 200,
        statusText: 'OK',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.uploadFile(url, file, { onUploadProgress });
      
      expect(mockAxiosInstance.post).toHaveBeenCalled();
      const callArgs = (mockAxiosInstance.post as ReturnType<typeof vi.fn>).mock.calls[0];
      
      // Check if URL is correct
      expect(callArgs[0]).toBe(url);
      
      // Check if FormData contains the file
      expect(callArgs[1] instanceof FormData).toBe(true);
      
      // Check if options include onUploadProgress
      expect(callArgs[2]).toHaveProperty('onUploadProgress');
      
      // Check the response
      expect(response.data).toBe('upload-response');
    });

    test('should correctly handle FormData object upload', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.txt'));
      formData.append('name', 'test-file');
      
      const url = '/upload-form';
      
      (mockAxiosInstance.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'formdata-response',
        status: 200,
        statusText: 'OK',
        headers: {}
      } as AxiosResponse);
      
      const response = await HttpClient.uploadFile(url, formData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, formData, expect.any(Object));
      expect(response.data).toBe('formdata-response');
    });
  });

  describe('Error handling', () => {
    test('should pass error handling options to request', async () => {
      const url = '/test-error';
      const options: RequestOptions = {
        errorHandling: {
          showCommonErrorDialog: false,
          propagateError: 'resolve'
        }
      };
      
      (mockAxiosInstance.request as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ 
        data: 'response',
        status: 200,
        statusText: 'OK',
        headers: {}
      } as AxiosResponse);
      
      await HttpClient.get(url, {}, options);
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
        errorHandling: options.errorHandling
      }));
    });
  });
}); 