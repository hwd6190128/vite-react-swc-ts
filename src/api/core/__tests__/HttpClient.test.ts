import axios from 'axios';
import { createHttpClient, ErrorHandlingOptions } from '../HttpClient';
import { setupErrorInterceptor } from '../../interceptors/ErrorHandler';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock axios
vi.mock('axios');
const mockAxiosInstance = {
  defaults: {
    baseURL: '',
    timeout: 30000,
    headers: {
      common: {} as Record<string, string>
    },
    withCredentials: false
  },
  request: vi.fn(),
  post: vi.fn(),
  interceptors: {
    response: {
      use: vi.fn()
    }
  }
};

// Mock ErrorHandler
vi.mock('../../interceptors/ErrorHandler', () => ({
  setupErrorInterceptor: vi.fn()
}));

describe('HttpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockAxiosInstance);
  });

  describe('Configuration methods', () => {
    test('should set base URL', () => {
      const client = createHttpClient();
      client.setBaseUrl('https://api.example.com');
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://api.example.com');
    });

    test('should set timeout', () => {
      const client = createHttpClient();
      client.setTimeout(5000);
      expect(mockAxiosInstance.defaults.timeout).toBe(5000);
    });

    test('should set header', () => {
      const client = createHttpClient();
      client.setHeader('Authorization', 'Bearer token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer token');
    });

    test('should set withCredentials', () => {
      const client = createHttpClient();
      client.setWithCredentials(true);
      expect(mockAxiosInstance.defaults.withCredentials).toBe(true);
    });

    test('should set default error handling', () => {
      const client = createHttpClient();
      const errorHandling: ErrorHandlingOptions = {
        showCommonErrorDialog: false,
        propagateError: 'ignore'
      };
      client.setDefaultErrorHandling(errorHandling);
      // 由於 errorHandling 是內部狀態，我們通過實際請求來驗證
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      return client.get('/test').then(() => {
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            errorHandling
          })
        );
      });
    });
  });

  describe('HTTP methods', () => {
    test('should make GET request', async () => {
      const client = createHttpClient();
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.get('/test', { param: 'value' });
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/test',
          params: { param: 'value' }
        })
      );
    });

    test('should make POST request', async () => {
      const client = createHttpClient();
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.post('/test', { data: 'value' });
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/test',
          data: { data: 'value' }
        })
      );
    });

    test('should make PUT request', async () => {
      const client = createHttpClient();
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.put('/test', { data: 'value' });
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'put',
          url: '/test',
          data: { data: 'value' }
        })
      );
    });

    test('should make DELETE request', async () => {
      const client = createHttpClient();
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.delete('/test', { data: 'value' });
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'delete',
          url: '/test',
          data: { data: 'value' }
        })
      );
    });

    test('should make PATCH request', async () => {
      const client = createHttpClient();
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.patch('/test', { data: 'value' });
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'patch',
          url: '/test',
          data: { data: 'value' }
        })
      );
    });
  });

  describe('File upload', () => {
    test('should upload file using FormData', async () => {
      const client = createHttpClient();
      const mockFile = new File(['test'], 'test.txt');
      const mockResponse = { data: 'test' };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const response = await client.uploadFile('/upload', mockFile);
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    });

    test('should upload existing FormData', async () => {
      const client = createHttpClient();
      const mockFormData = new FormData();
      mockFormData.append('file', new File(['test'], 'test.txt'));
      const mockResponse = { data: 'test' };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const response = await client.uploadFile('/upload', mockFormData);
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        mockFormData,
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    });
  });

  describe('Error handling', () => {
    test('should handle network errors', async () => {
      const client = createHttpClient();
      const networkError = new Error('Network error');
      mockAxiosInstance.request.mockRejectedValue(networkError);

      await expect(client.get('/test')).rejects.toThrow('Request failed: Network error');
    });

    test('should propagate axios errors', async () => {
      const client = createHttpClient();
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };
      mockAxiosInstance.request.mockRejectedValue(axiosError);

      await expect(client.get('/test')).rejects.toEqual(axiosError);
    });
  });

  describe('Default instance', () => {
    test('should create default instance with correct configuration', () => {
      // 重置 mock
      vi.clearAllMocks();
      (axios.create as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockAxiosInstance,
        defaults: {
          ...mockAxiosInstance.defaults,
          timeout: 30000
        }
      });
      
      // 創建默認實例
      const client = createHttpClient();
      
      // 驗證配置
      expect(client.instance.defaults.timeout).toBe(30000);
      expect(setupErrorInterceptor).toHaveBeenCalledWith(client.instance);
    });

    test('should use default instance for requests', async () => {
      // 重置 mock
      vi.clearAllMocks();
      const defaultMockInstance = {
        ...mockAxiosInstance,
        defaults: {
          ...mockAxiosInstance.defaults,
          timeout: 30000
        }
      };
      (axios.create as ReturnType<typeof vi.fn>).mockReturnValue(defaultMockInstance);
      
      const mockResponse = { data: 'test' };
      defaultMockInstance.request.mockResolvedValue(mockResponse);

      const response = await createHttpClient().get('/test');
      expect(response).toBe(mockResponse);
      expect(defaultMockInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: '/test'
        })
      );
    });
  });
}); 