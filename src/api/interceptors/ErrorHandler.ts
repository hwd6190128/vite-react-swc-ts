import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ErrorHandlingOptions } from '../core/HttpClient';

/**
 * Default error handling options
 */
const DEFAULT_ERROR_OPTIONS: ErrorHandlingOptions = {
    showCommonErrorDialog: true,
    propagateError: 'throw'
};

/**
 * Extended Axios request config with error handling options
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    errorHandling?: ErrorHandlingOptions;
}

/**
 * Display error message in a common dialog
 * @param error - HTTP error
 */
export function showCommonErrorDialog(error: AxiosError): void {
    const status = error.response?.status;
    let message = error.message;
    
    // Try to extract message from response data if available
    if (error.response?.data) {
        if (typeof error.response.data === 'object') {
            message = error.response.data.message || error.response.data.error || message;
        }
    }

    console.error(`HTTP Error ${status}: ${message}`, error);
    alert(`Error ${status}: ${message}`);
}

/**
 * Set up error interceptor for Axios instance
 * @param axiosInstance - Axios instance to configure
 */
export function setupErrorInterceptor(axiosInstance: AxiosInstance): void {
    // Add a response interceptor
    axiosInstance.interceptors.response.use(
        // For successful responses
        (response: AxiosResponse) => {
            return response;
        },
        
        // For error responses
        async (error: AxiosError) => {
            if (!error.response) {
                // Network error
                console.error('Network Error:', error.message);
                return Promise.reject(error);
            }
            
            // Get error handling options from request config
            const config = error.config as ExtendedAxiosRequestConfig;
            const errorHandling: ErrorHandlingOptions = {
                ...DEFAULT_ERROR_OPTIONS,
                ...(config?.errorHandling || {})
            };
            
            // Show common error dialog if enabled
            if (errorHandling.showCommonErrorDialog) {
                showCommonErrorDialog(error);
            }
            
            // Handle error based on propagation setting
            switch (errorHandling.propagateError) {
                case 'resolve':
                    // Return error response without rejecting
                    return {
                        data: null,
                        status: error.response.status,
                        statusText: error.response.statusText,
                        headers: error.response.headers,
                        config: error.config
                    };
                    
                case 'ignore':
                    // Resolve with null data
                    return {
                        data: null,
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: error.config
                    };
                    
                case 'throw':
                default:
                    // Propagate error to caller
                    return Promise.reject(error);
            }
        }
    );
} 