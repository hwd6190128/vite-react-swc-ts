import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosProgressEvent,
    RawAxiosRequestHeaders,
    AxiosHeaders, HeadersDefaults, AxiosInstance
} from 'axios';
import { setupErrorInterceptor } from '../interceptors/ErrorHandler';

/**
 * HTTP method enum
 */
export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch'
}

/**
 * Error handling options interface
 */
export interface ErrorHandlingOptions {
    /** Whether to show an error dialog for this request */
    showErrorDialog?: boolean;
    /** HTTP status codes to ignore */
    ignoreErrors?: number[];
    /** Custom error message to display */
    customErrorMessage?: string;
    /** Custom error handler function */
    onError?: (error: AxiosError) => void;
}

/**
 * Request options interface
 */
export interface RequestOptions {
    /** Error handling options */
    errorHandling?: ErrorHandlingOptions;
    /** Abort signal for cancellation */
    signal?: AbortSignal;
    /** Additional headers for the request */
    headers?: Record<string, string>;
    /** Progress handler for file upload */
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
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
        showErrorDialog: true,
        ignoreErrors: []
    }
};

/**
 * HttpClient class for handling API requests
 */
export class HttpClient {
    private instance: AxiosInstance;
    private defaultErrorHandling: ErrorHandlingOptions | undefined;

    /**
     * Create a new HttpClient instance
     * @param baseURL - Base URL for all requests
     * @param defaultErrorHandling - Default error handling options
     */
    constructor(baseURL?: string, defaultErrorHandling?: ErrorHandlingOptions) {
        // Ensure defaultErrorHandling is not undefined
        const errorHandlingOptions: ErrorHandlingOptions = defaultErrorHandling || DEFAULT_HTTP_OPTIONS.defaultErrorHandling || {};
        const mergedOptions: HttpClientOptions = {...DEFAULT_HTTP_OPTIONS, baseUrl: baseURL, defaultErrorHandling: errorHandlingOptions};

        // Create axios instance
        this.instance = axios.create({
            timeout: mergedOptions.timeout,
            baseURL: mergedOptions.baseUrl,
            headers: mergedOptions.headers
        });

        // Set up error interceptor
        setupErrorInterceptor(this.instance, errorHandlingOptions);

        this.defaultErrorHandling = errorHandlingOptions;
    }

    /**
     * Set base URL for API requests
     */
    setBaseUrl(url: string): void {
        this.instance.defaults.baseURL = url;
    }

    /**
     * Set timeout for API requests
     */
    setTimeout(timeout: number): void {
        this.instance.defaults.timeout = timeout;
    }

    /**
     * Set header for API requests
     */
    setHeader(name: string, value: string): void {
        this.instance.defaults.headers.common[name] = value;
    }

    /**
     * Set default error handling options
     */
    setDefaultErrorHandling(options: ErrorHandlingOptions): void {
        this.defaultErrorHandling = {
            ...this.defaultErrorHandling,
            ...options
        };
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
            const errorHandling = {
                ...this.defaultErrorHandling,
                ...options.errorHandling
            };

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { errorHandling: _, ...restOptions } = options;

            // Ensure type consistency when creating the configuration
            const config: AxiosRequestConfig = {
                method,
                url,
                headers: restOptions.headers,
                signal: restOptions.signal,
                onUploadProgress: restOptions.onUploadProgress
            };

            if (method === HttpMethod.GET && data) {
                config.params = data;
            } else if (data) {
                config.data = data;
            }

            // Add custom error handling options
            (config as AxiosRequestConfig & { errorHandling: ErrorHandlingOptions }).errorHandling = errorHandling;

            return await this.instance.request<T>(config);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            }
            throw error;
        }
    }

    /**
     * Make GET request
     */
    async get<T, D = Record<string, unknown>>(
        url: string,
        params?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.GET, url, params, options);
    }

    /**
     * Make POST request
     */
    async post<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.POST, url, data, options);
    }

    /**
     * Make PUT request
     */
    async put<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.PUT, url, data, options);
    }

    /**
     * Make DELETE request
     */
    async delete<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.DELETE, url, data, options);
    }

    /**
     * Make PATCH request
     */
    async patch<T, D = unknown>(
        url: string,
        data?: D,
        options?: RequestOptions
    ): Promise<AxiosResponse<T>> {
        return this.request<T, D>(HttpMethod.PATCH, url, data, options);
    }

    /**
     * Upload file
     */
    async uploadFile<T>(
        url: string,
        file: File | FormData,
        options: RequestOptions = {}
    ): Promise<AxiosResponse<T>> {
        const formData = file instanceof FormData ? file : new FormData();
        if (file instanceof File) {
            formData.append('file', file);
        }

        return this.post<T>(url, formData as unknown as Record<string, unknown>, {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}

// Create default HttpClient instance
export const httpClient = new HttpClient();

// Export default instance
export default httpClient;