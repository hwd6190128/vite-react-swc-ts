import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosProgressEvent,
    RawAxiosRequestHeaders,
    AxiosHeaders, HeadersDefaults
} from 'axios';
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
    headers?: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>;
    /** Default error handling options */
    defaultErrorHandling?: ErrorHandlingOptions;
}

/**
 * Default HTTP client options
 */
const DEFAULT_HTTP_OPTIONS: HttpClientOptions = {
    baseUrl: '',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    },
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
    headers: RawAxiosRequestHeaders | AxiosHeaders | Partial<HeadersDefaults>;
}

/**
 * Create a new HTTP client instance
 */
export const createHttpClient = (options: HttpClientOptions = DEFAULT_HTTP_OPTIONS) => {
    const mergedOptions: HttpClientOptions = {...DEFAULT_HTTP_OPTIONS, ...options};
    
    // Create axios instance
    const instance = axios.create({
        timeout: mergedOptions.timeout,
        baseURL: mergedOptions.baseUrl,
        headers: mergedOptions.headers
    });

    // Set up error interceptor
    setupErrorInterceptor(instance);

    // Configuration methods
    const setBaseUrl = (url: string) => {
        instance.defaults.baseURL = url;
    };

    const setTimeout = (timeout: number) => {
        instance.defaults.timeout = timeout;
    };

    const setHeader = (name: string, value: string) => {
        instance.defaults.headers.common[name] = value;
    };

    const setWithCredentials = (value: boolean) => {
        instance.defaults.withCredentials = value;
    };

    const setDefaultErrorHandling = (options: ErrorHandlingOptions) => {
        mergedOptions.defaultErrorHandling = {
            ...mergedOptions.defaultErrorHandling,
            ...options
        };
    };

    // Generic request method
    const request = async <T, D = unknown>(
        method: HttpMethod,
        url: string,
        data?: D,
        options: RequestOptions = {}
    ): Promise<AxiosResponse<T>> => {
        try {
            const errorHandling = {
                ...mergedOptions.defaultErrorHandling,
                ...options.errorHandling
            };

            const { errorHandling: _, ...axiosOptions } = options;

            const config: AxiosRequestConfig = {
                method,
                url,
                ...axiosOptions
            };

            if (method === HttpMethod.GET && data) {
                config.params = data;
            } else if (data) {
                config.data = data;
            }

            (config as AxiosRequestConfig & { errorHandling: ErrorHandlingOptions }).errorHandling = errorHandling;

            return await instance.request<T>(config);
        } catch (error) {
            if ((error as AxiosError).response) {
                throw error;
            }
            throw new Error(`Request failed: ${(error as Error).message}`);
        }
    };

    // HTTP methods
    const get = async <T, D = Record<string, unknown>>(
        url: string,
        params?: D,
        options?: RequestOptions
    ) => {
        return request<T, D>(HttpMethod.GET, url, params, options);
    };

    const post = async <T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ) => {
        return request<T, D>(HttpMethod.POST, url, data, options);
    };

    const put = async <T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ) => {
        return request<T, D>(HttpMethod.PUT, url, data, options);
    };

    const deleteRequest = async <T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ) => {
        return request<T, D>(HttpMethod.DELETE, url, data, options);
    };

    const patch = async <T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ) => {
        return request<T, D>(HttpMethod.PATCH, url, data, options);
    };

    const uploadFile = async <T>(
        url: string,
        file: File | FormData,
        options: RequestOptions & {
            onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
        } = {}
    ) => {
        const formData = file instanceof FormData ? file : new FormData();
        if (file instanceof File) {
            formData.append('file', file);
        }

        return instance.post<T>(url, formData, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: options.onUploadProgress
        });
    };

    return {
        instance,
        setBaseUrl,
        setTimeout,
        setHeader,
        setWithCredentials,
        setDefaultErrorHandling,
        get,
        post,
        put,
        delete: deleteRequest,
        patch,
        uploadFile
    };
};

// Create default instance
export const httpClient = createHttpClient();

// 導出默認實例，同時允許創建其他實例
export default httpClient;