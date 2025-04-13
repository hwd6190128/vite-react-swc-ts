import axios from 'axios';
import { HttpClient, ErrorHandlingOptions } from '../HttpClient';
import { setupErrorInterceptor } from '../../interceptors/ErrorHandler';
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';

// Mock axios
vi.mock('axios', async () => {
  return {
    default: {
      create: vi.fn(),
      isCancel: vi.fn()
    },
    create: vi.fn(),
    isCancel: vi.fn()
  };
});

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
    (axios.create as Mock).mockReturnValue(mockAxiosInstance);
  });

  describe('Constructor', () => {
    test('should create instance with default options', () => {
      const client = new HttpClient();
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(setupErrorInterceptor).toHaveBeenCalledWith(
        mockAxiosInstance,
        expect.objectContaining({
          showErrorDialog: true,
          ignoreErrors: []
        })
      );
    });

    test('should create instance with custom options', () => {
      const customOptions: ErrorHandlingOptions = {
        showErrorDialog: false,
        ignoreErrors: [404]
      };
      const client = new HttpClient('https://api.example.com', customOptions);
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
          baseURL: 'https://api.example.com',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(setupErrorInterceptor).toHaveBeenCalledWith(
        mockAxiosInstance,
        customOptions
      );
    });
  });

  describe('Configuration methods', () => {
    test('should set base URL', () => {
      const client = new HttpClient();
      client.setBaseUrl('https://api.example.com');
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://api.example.com');
    });

    test('should set timeout', () => {
      const client = new HttpClient();
      client.setTimeout(5000);
      expect(mockAxiosInstance.defaults.timeout).toBe(5000);
    });

    test('should set header', () => {
      const client = new HttpClient();
      client.setHeader('Authorization', 'Bearer token');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer token');
    });

    test('should set default error handling', () => {
      const client = new HttpClient();
      const errorHandling: ErrorHandlingOptions = {
        showErrorDialog: false,
        ignoreErrors: [404]
      };
      client.setDefaultErrorHandling(errorHandling);
      
      // 使用 spy 檢查私有屬性 (間接測試)
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      
      return client.get('/test').then(() => {
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(
          expect.objectContaining({
            errorHandling: expect.objectContaining({
              showErrorDialog: false,
              ignoreErrors: [404]
            })
          })
        );
      });
    });
  });

  describe('HTTP methods', () => {
    test('should make GET request', async () => {
      const client = new HttpClient();
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
      const client = new HttpClient();
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
      const client = new HttpClient();
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
      const client = new HttpClient();
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
      const client = new HttpClient();
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

    test('should support upload progress callback in POST request', async () => {
      const client = new HttpClient();
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      const progressCallback = vi.fn();

      const response = await client.post('/test', { data: 'value' }, { onUploadProgress: progressCallback });
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/test',
          data: { data: 'value' },
          onUploadProgress: progressCallback
        })
      );
    });
  });

  describe('File upload', () => {
    test('should upload file using FormData', async () => {
      const client = new HttpClient();
      const mockFile = new File(['test'], 'test.txt');
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.uploadFile('/upload', mockFile);
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/upload',
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    });

    test('should upload existing FormData', async () => {
      const client = new HttpClient();
      const mockFormData = new FormData();
      mockFormData.append('file', new File(['test'], 'test.txt'));
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.uploadFile('/upload', mockFormData);
      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/upload',
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          })
        })
      );
    });

    test('should support upload progress callback', async () => {
      const client = new HttpClient();
      const mockFile = new File(['test'], 'test.txt');
      const mockResponse = { data: 'test' };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);
      const progressCallback = vi.fn();

      const response = await client.uploadFile('/upload', mockFile, {
        onUploadProgress: progressCallback
      });

      expect(response).toBe(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/upload',
          headers: expect.objectContaining({
            'Content-Type': 'multipart/form-data'
          }),
          onUploadProgress: progressCallback
        })
      );
    });
  });

  describe('Error handling', () => {
    test('should handle network errors', async () => {
      const client = new HttpClient();
      const networkError = new Error('Network error');
      mockAxiosInstance.request.mockRejectedValue(networkError);

      await expect(client.get('/test')).rejects.toThrow(networkError);
    });

    test('should handle request cancellation', async () => {
      const client = new HttpClient();
      const cancelError = new Error('Request was canceled');
      (axios.isCancel as Mock).mockReturnValueOnce(true);
      mockAxiosInstance.request.mockRejectedValue(cancelError);

      await expect(client.get('/test')).rejects.toThrow(cancelError);
    });
  });

  describe('Default instance', () => {
    test('should export default instance', () => {
      expect(HttpClient).toBeDefined();
    });
  });
}); 