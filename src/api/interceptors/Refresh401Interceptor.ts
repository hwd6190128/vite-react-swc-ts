import { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

let refreshPromise: Promise<string> | null = null;
let refreshTokenFn: (() => Promise<string>) | null = null;

export function setRefreshTokenHandler(fn: () => Promise<string>) {
    refreshTokenFn = fn;
}

export function setup401Interceptor(instance: AxiosInstance) {
    instance.interceptors.response.use(
        response => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
            if (error.response?.status === 401 && !originalRequest._retry && refreshTokenFn) {
                if (!refreshPromise) {
                    refreshPromise = refreshTokenFn().finally(() => {
                        refreshPromise = null;
                    });
                }
                try {
                    const newToken = await refreshPromise;
                    originalRequest._retry = true;
                    instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers = {
                        ...originalRequest.headers,
                        Authorization: `Bearer ${newToken}`
                    };
                    return instance(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
} 