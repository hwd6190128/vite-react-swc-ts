import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setup401Interceptor, setRefreshTokenHandler } from './Refresh401Interceptor';

 
function createMockAxiosInstance() {
  const instance = (function(config: AxiosRequestConfig) {
     
    return instance.request(config);
  }) as AxiosInstance & ((config: AxiosRequestConfig) => Promise<unknown>);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance.defaults = { headers: { common: {} } as any };
  instance.interceptors = {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
      clear: vi.fn()
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
      clear: vi.fn()
    }
  };
  instance.request = vi.fn();
  return instance;
}

describe('401 refresh token interceptor', () => {
  let mockAxiosInstance: AxiosInstance & ((config: AxiosRequestConfig) => Promise<unknown>);
  let refreshTokenSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = createMockAxiosInstance();
    setup401Interceptor(mockAxiosInstance);
  });

  it('should refresh token and retry original request on 401, only once for concurrent requests', async () => {
    let refreshCount = 0;
    let resolveRefresh: (token: string) => void;
    const refreshPromise = new Promise<string>(resolve => { resolveRefresh = resolve; });
    refreshTokenSpy = vi.fn(() => {
      refreshCount++;
      return refreshPromise;
    });
    setRefreshTokenHandler(refreshTokenSpy);

    // 模擬 2 個同時 401 的 request
    const error401: any = {
      response: { status: 401 },
      config: { url: '/test', headers: {}, _retry: false },
      isAxiosError: true
    };

    // 取得 interceptor function
    const useFn = mockAxiosInstance.interceptors.response.use as ReturnType<typeof vi.fn>;
    expect(useFn).toHaveBeenCalled();
    const [, errorHandler] = useFn.mock.calls[0];

    // 兩個 request 同時 401
     
    (mockAxiosInstance.request as unknown) = vi.fn().mockResolvedValue({ data: 'ok' });
    const retryPromise1 = errorHandler(error401);
    const retryPromise2 = errorHandler(error401);

    // refreshToken 只會被呼叫一次
    expect(refreshCount).toBe(1);

    // resolve refresh
    resolveRefresh!('new_token_123');

    const result1 = await retryPromise1;
    const result2 = await retryPromise2;
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(2);
    expect(result1).toEqual({ data: 'ok' });
    expect(result2).toEqual({ data: 'ok' });
  });

  it('should reject all waiting requests if refresh fails', async () => {
    let rejectRefresh: (err: unknown) => void;
    const refreshPromise = new Promise<string>((_, reject) => { rejectRefresh = reject; });
    refreshTokenSpy = vi.fn(() => refreshPromise);
    setRefreshTokenHandler(refreshTokenSpy);

     
    const error401: any = {
      response: { status: 401 },
      config: { url: '/test', headers: {}, _retry: false },
      isAxiosError: true
    };

    const useFn = mockAxiosInstance.interceptors.response.use as ReturnType<typeof vi.fn>;
    const [, errorHandler] = useFn.mock.calls[0];

    const retryPromise1 = errorHandler(error401);
    const retryPromise2 = errorHandler(error401);

    // refreshToken 只會被呼叫一次
    expect(refreshTokenSpy).toHaveBeenCalledTimes(1);

    // 讓 refresh 失敗
    rejectRefresh!(new Error('refresh failed'));

    await expect(retryPromise1).rejects.toThrow('refresh failed');
    await expect(retryPromise2).rejects.toThrow('refresh failed');
  });
}); 