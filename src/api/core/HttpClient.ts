import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {setupErrorInterceptor} from '../interceptors/ErrorHandler';

/**
 * HTTP methods enum
 */
export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch'
}

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
    /** Whether to show a common error dialog on failure */
    showCommonErrorDialog?: boolean;
    /** How to handle errors: 'throw' (default), 'resolve', or 'ignore' */
    propagateError?: 'throw' | 'resolve' | 'ignore';
}

/**
 * HTTP client configuration options
 */
export interface HttpClientOptions {
    /** Base URL for all requests */
    baseUrl?: string;
    /** Default timeout for all requests (ms) */
    timeout?: number;
    /** Default headers for all requests */
    headers?: Record<string, string>;
    /** Default error handling options */
    defaultErrorHandling?: ErrorHandlingOptions;
}

/**
 * Default HTTP client options
 */
const DEFAULT_HTTP_OPTIONS: HttpClientOptions = {
    baseUrl: '',
    timeout: 30000,
    headers: {},
    defaultErrorHandling: {
        showCommonErrorDialog: true,
        propagateError: 'throw'
    }
};

/**
 * Additional request options
 */
export interface RequestOptions extends AxiosRequestConfig {
    /** Error handling options */
    errorHandling?: ErrorHandlingOptions;
}

/**
 * API response type
 */
export interface ApiResponse<T> {
    /** Response data */
    data: T;
    /** HTTP status code */
    status: number;
    /** Status text */
    statusText: string;
    /** Response headers */
    headers: Record<string, string>;
}

/**
 * HTTP client using axios
 */
class HttpClientClass {
    private readonly instance: AxiosInstance;
    private baseUrl: string = '';
    private defaultErrorHandling: ErrorHandlingOptions;

    constructor(options: HttpClientOptions = DEFAULT_HTTP_OPTIONS) {
        const mergedOptions = {...DEFAULT_HTTP_OPTIONS, ...options};
        
        // 創建 Axios 實例
        const axiosConfig: AxiosRequestConfig = {
            timeout: mergedOptions.timeout || DEFAULT_HTTP_OPTIONS.timeout,
            baseURL: mergedOptions.baseUrl || DEFAULT_HTTP_OPTIONS.baseUrl
        };
        
        // 添加 headers 如果存在
        if (mergedOptions.headers) {
            axiosConfig.headers = mergedOptions.headers;
        }
        
        // 創建 axios 實例
        this.instance = axios.create(axiosConfig);
        
        this.baseUrl = mergedOptions.baseUrl || '';
        this.defaultErrorHandling = mergedOptions.defaultErrorHandling || DEFAULT_HTTP_OPTIONS.defaultErrorHandling!;
        
        // Set up error interceptor
        setupErrorInterceptor(this.instance);
    }

    /**
     * Set base URL for all requests
     */
    public setBaseUrl(url: string): void {
        this.baseUrl = url;
        this.instance.defaults.baseURL = url;
    }

    /**
     * Get current base URL
     */
    public getBaseUrl(): string {
        return this.baseUrl;
    }

    /**
     * Set request timeout
     */
    public setTimeout(timeout: number): void {
        this.instance.defaults.timeout = timeout;
    }

    /**
     * Set default header for all requests
     */
    public setHeader(name: string, value: string): void {
        this.instance.defaults.headers.common[name] = value;
    }

    /**
     * Set withCredentials option for CORS requests
     */
    public setWithCredentials(value: boolean): void {
        this.instance.defaults.withCredentials = value;
    }

    /**
     * Set default error handling options
     */
    public setDefaultErrorHandling(options: ErrorHandlingOptions): void {
        this.defaultErrorHandling = {...this.defaultErrorHandling, ...options};
    }

    /**
     * Generic request method
     */
    private async request<T, D = unknown>(
        method: HttpMethod,
        url: string,
        data?: D,
        options: RequestOptions = {}
    ): Promise<AxiosResponse<T>> {
        try {
            // 合併默認錯誤處理選項和用戶選項
            const errorHandling = {
                ...this.defaultErrorHandling,
                ...options.errorHandling
            };
            
            // 從 options 中移除 errorHandling（因為它不是標準的 AxiosRequestConfig 屬性）
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { errorHandling: errorHandlingOption, ...axiosOptions } = options;
            
            // 創建 Axios 請求配置
            const config: AxiosRequestConfig = {
                method,
                url: url.startsWith('http') ? url : url,
                ...axiosOptions
            };

            if (method === HttpMethod.GET && data) {
                config.params = data;
            } else if (data) {
                config.data = data;
            }

            // 直接將 errorHandling 附加到配置中（將由攔截器使用）
            // 使用類型斷言並擴展 AxiosRequestConfig 類型
            (config as AxiosRequestConfig & { errorHandling: ErrorHandlingOptions }).errorHandling = errorHandling;

            return await this.instance.request<T>(config);
        } catch (error) {
            if ((error as AxiosError).response) {
                throw error;
            }
            throw new Error(`Request failed: ${(error as Error).message}`);
        }
    }

    /**
     * GET request
     */
    public async get<T, D = Record<string, unknown>>(
        url: string,
        params?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.GET, url, params, options);
    }

    /**
     * POST request
     */
    public async post<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.POST, url, data, options);
    }

    /**
     * PUT request
     */
    public async put<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.PUT, url, data, options);
    }

    /**
     * DELETE request
     */
    public async delete<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.DELETE, url, data, options);
    }

    /**
     * PATCH request
     */
    public async patch<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.PATCH, url, data, options);
    }

    /**
     * Upload file
     */
    public async uploadFile<T>(
        url: string,
        file: File | FormData,
        options: RequestOptions = {}
    ): Promise<AxiosResponse<T>> {
        let formData: FormData;
        
        if (file instanceof File) {
            formData = new FormData();
            formData.append('file', file);
        } else {
            formData = file;
        }
        
        // 合併默認錯誤處理選項和用戶選項
        const errorHandling = {
            ...this.defaultErrorHandling,
            ...options.errorHandling
        };
        
        // 創建上傳配置
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: options.onUploadProgress
        };
        
        // 將錯誤處理選項附加到配置中
        // 使用類型斷言並擴展 AxiosRequestConfig 類型
        (config as AxiosRequestConfig & { errorHandling: ErrorHandlingOptions }).errorHandling = errorHandling;
        
        try {
            return await this.instance.post<T>(url, formData, config);
        } catch (error) {
            if ((error as AxiosError).response) {
                throw error;
            }
            throw new Error(`File upload failed: ${(error as Error).message}`);
        }
    }

    /**
     * Create a new HTTP client instance with custom options
     */
    public static create(options: HttpClientOptions = {}): HttpClientClass {
        return new HttpClientClass(options);
    }
}

// Create a singleton instance with default options
export const HttpClient = new HttpClientClass();

// Export as default and as a named export
export default HttpClient; 