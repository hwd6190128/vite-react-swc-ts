import { useCallback } from 'react';
import { QueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { ErrorHandlingOptions, httpClient } from '../core/HttpClient';
import { AxiosProgressEvent, AxiosResponse } from 'axios';

/**
 * Global query options that can be shared across all hooks
 */
export interface GlobalQueryOptions {
    /** Time in milliseconds after which the data is considered stale */
    staleTime?: number;
    /** Whether to refetch on window focus */
    refetchOnWindowFocus?: boolean;
    /** Whether to refetch on mount */
    refetchOnMount?: boolean;
    /** Whether to refetch on reconnect */
    refetchOnReconnect?: boolean;
    /** Number of retries on failure */
    retry?: number;
    /** Whether to enable the query */
    enabled?: boolean;
}

/**
 * Common options for all query hooks
 */
export interface QueryHookOptions extends GlobalQueryOptions {
    /** Error handling options */
    errorHandling?: ErrorHandlingOptions;
    /** Invalidate queries on mutation success */
    invalidateQueriesOnSuccess?: string | string[];
    /** Custom success callback */
    onSuccess?: <T>(data: AxiosResponse<T>) => void;
    /** Custom error callback */
    onError?: (error: Error) => void;
}

// Default query options
export const defaultOptions: QueryHookOptions = {
    staleTime: 0, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 0,
    enabled: true
};

/**
 * Hook for GET requests
 * @param url - API endpoint
 * @param params - Query parameters
 * @param options - Query options
 */
export const useGet = <TData>(
    url: string,
    params?: Record<string, unknown>,
    options: QueryHookOptions = {}
) => {
    // Merge default options with user options
    const mergedOptions = { ...defaultOptions, ...options };
    const {
        staleTime,
        refetchOnWindowFocus,
        refetchOnMount,
        refetchOnReconnect,
        retry,
        enabled,
        errorHandling,
        onSuccess,
        onError
    } = mergedOptions;

    // Generate query key
    const queryKey = params ? [url, params] : [url];

    // Use React Query's useQuery
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            return await httpClient.get<TData>(url, params, {
                errorHandling
            });
        },
        enabled,
        staleTime: staleTime || 0,
        gcTime: staleTime || 0,
        refetchOnWindowFocus,
        refetchOnMount,
        refetchOnReconnect,
        retry
    });

    // Handle onSuccess callback
    if (onSuccess && query.data) {
        onSuccess(query.data);
    }

    // Handle onError callback
    if (onError && query.error) {
        onError(query.error as unknown as Error);
    }

    return query;
};

/**
 * Hook for POST requests
 * @param url - API endpoint
 * @param options - Mutation options
 * @param queryClient - Optional QueryClient for cache invalidation
 */
export const usePost = <TData, TVariables = Record<string, unknown>>(
    url: string,
    options: QueryHookOptions = {},
    queryClient?: QueryClient
) => {
    // Merge default options with user options
    const mergedOptions = { ...defaultOptions, ...options };
    const { errorHandling, invalidateQueriesOnSuccess, onSuccess, onError } = mergedOptions;

    // Use React Query's useMutation
    const mutation = useMutation({
        mutationFn: async (variables: TVariables) => {
            return await httpClient.post<TData, TVariables>(url, variables, { errorHandling });
        },
        onSuccess: (data) => {
            // Call custom onSuccess
            onSuccess?.(data);
            
            // Invalidate queries if needed
            if (invalidateQueriesOnSuccess && queryClient) {
                if (typeof invalidateQueriesOnSuccess === 'string') {
                    void queryClient.invalidateQueries({ queryKey: [invalidateQueriesOnSuccess] });
                } else if (Array.isArray(invalidateQueriesOnSuccess)) {
                    invalidateQueriesOnSuccess.forEach(key => {
                        void queryClient.invalidateQueries({ queryKey: [key] });
                    });
                }
            }
        },
        onError: (error) => {
            // Call custom onError
            onError?.(error as Error);
        }
    });

    // Simplify API to return data directly 
    return {
        mutate: (variables: TVariables) => mutation.mutate(variables),
        mutateAsync: async (variables: TVariables): Promise<TData> => {
            const response = await mutation.mutateAsync(variables);
            return response.data;
        },
        data: mutation.data?.data as TData | undefined,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error as Error | null,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset,
        // Return the full response for when it's needed
        response: mutation.data
    };
};

/**
 * Hook for PUT requests
 * @param url - API endpoint
 * @param options - Mutation options
 * @param queryClient - Optional QueryClient for cache invalidation
 */
export const usePut = <TData, TVariables = Record<string, unknown>>(
    url: string,
    options: QueryHookOptions = {},
    queryClient?: QueryClient
) => {
    // Merge default options with user options
    const mergedOptions = { ...defaultOptions, ...options };
    const { errorHandling, invalidateQueriesOnSuccess, onSuccess, onError } = mergedOptions;

    // Use React Query's useMutation
    const mutation = useMutation({
        mutationFn: async (variables: TVariables) => {
            return await httpClient.put<TData, TVariables>(url, variables, { errorHandling });
        },
        onSuccess: (data) => {
            onSuccess?.(data);
            
            if (invalidateQueriesOnSuccess && queryClient) {
                if (typeof invalidateQueriesOnSuccess === 'string') {
                    void queryClient.invalidateQueries({ queryKey: [invalidateQueriesOnSuccess] });
                } else if (Array.isArray(invalidateQueriesOnSuccess)) {
                    invalidateQueriesOnSuccess.forEach(key => {
                        void queryClient.invalidateQueries({ queryKey: [key] });
                    });
                }
            }
        },
        onError: (error) => {
            onError?.(error as Error);
        }
    });

    return {
        mutate: (variables: TVariables) => {
            return mutation.mutate(variables);
        },
        
        mutateAsync: async (variables: TVariables): Promise<TData> => {
            const response = await mutation.mutateAsync(variables);
            return response.data;
        },
        
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error as Error | null,
        isSuccess: mutation.isSuccess,
        data: mutation.data?.data as TData | undefined,
        reset: mutation.reset,
        // Return the full response for when it's needed
        response: mutation.data
    };
};

/**
 * Hook for DELETE requests
 * @param url - API endpoint
 * @param options - Mutation options
 * @param queryClient - Optional QueryClient for cache invalidation
 */
export const useDelete = <TData, TVariables = Record<string, unknown>>(
    url: string,
    options: QueryHookOptions = {},
    queryClient?: QueryClient
) => {
    // Merge default options with user options
    const mergedOptions = { ...defaultOptions, ...options };
    const { errorHandling, invalidateQueriesOnSuccess, onSuccess, onError } = mergedOptions;

    // Use React Query's useMutation
    const mutation = useMutation({
        mutationFn: async (variables?: TVariables) => {
            return await httpClient.delete<TData, TVariables>(url, variables, { errorHandling });
        },
        onSuccess: (data) => {
            onSuccess?.(data);
            
            if (invalidateQueriesOnSuccess && queryClient) {
                if (typeof invalidateQueriesOnSuccess === 'string') {
                    void queryClient.invalidateQueries({ queryKey: [invalidateQueriesOnSuccess] });
                } else if (Array.isArray(invalidateQueriesOnSuccess)) {
                    invalidateQueriesOnSuccess.forEach(key => {
                        void queryClient.invalidateQueries({ queryKey: [key] });
                    });
                }
            }
        },
        onError: (error) => {
            onError?.(error as Error);
        }
    });

    return {
        mutate: (variables?: TVariables) => {
            return mutation.mutate(variables);
        },
        
        mutateAsync: async (variables?: TVariables): Promise<TData> => {
            const response = await mutation.mutateAsync(variables);
            return response.data;
        },
        
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error as Error | null,
        isSuccess: mutation.isSuccess,
        data: mutation.data?.data as TData | undefined,
        reset: mutation.reset,
        // Return the full response for when it's needed
        response: mutation.data
    };
};

/**
 * Hook for file uploads
 * @param url - Upload endpoint
 * @param options - Upload options
 * @param queryClient - Optional QueryClient for cache invalidation
 */
export const useFileUpload = <TData>(
    url: string,
    options: QueryHookOptions & {
        onProgress?: (progressEvent: AxiosProgressEvent) => void;
    } = {},
    queryClient?: QueryClient
) => {
    // Merge default options with user options
    const mergedOptions = { ...defaultOptions, ...options };
    const { 
        errorHandling, 
        invalidateQueriesOnSuccess, 
        onSuccess, 
        onError,
        onProgress 
    } = mergedOptions;

    // Use React Query's useMutation
    const mutation = useMutation({
        mutationFn: async (file: File | FormData) => {
            return await httpClient.uploadFile<TData>(url, file, {
                onUploadProgress: onProgress,
                errorHandling
            });
        },
        onSuccess: (data) => {
            onSuccess?.(data);
            
            if (invalidateQueriesOnSuccess && queryClient) {
                if (typeof invalidateQueriesOnSuccess === 'string') {
                    void queryClient.invalidateQueries({ queryKey: [invalidateQueriesOnSuccess] });
                } else if (Array.isArray(invalidateQueriesOnSuccess)) {
                    invalidateQueriesOnSuccess.forEach(key => {
                        void queryClient.invalidateQueries({ queryKey: [key] });
                    });
                }
            }
        },
        onError: (error) => {
            onError?.(error as Error);
        }
    });

    // Wrap upload method
    const upload = useCallback((file: File | FormData) => {
        return mutation.mutate(file);
    }, [mutation]);

    const uploadAsync = useCallback(async (file: File | FormData): Promise<TData> => {
        const response = await mutation.mutateAsync(file);
        return response.data;
    }, [mutation]);

    return {
        upload,
        uploadAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error as Error | null,
        isSuccess: mutation.isSuccess,
        data: mutation.data?.data as TData | undefined,
        reset: mutation.reset,
        // Return the full response for when it's needed
        response: mutation.data
    };
};

/**
 * Collection of query hooks
 */
export const QueryHooks = {
    useGet,
    usePost,
    usePut,
    useDelete,
    useFileUpload
};

export default QueryHooks; 