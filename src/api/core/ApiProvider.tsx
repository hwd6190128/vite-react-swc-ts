import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

/**
 * Global API options for React Query
 */
export interface GlobalQueryOptions {
    /** Cache time in milliseconds */
    staleTime?: number;
    /** Auto-refetch behavior */
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
    refetchOnReconnect?: boolean;
    /** Auto-retry behavior */
    retry?: boolean | number;
}

/**
 * Default global query options
 */
export const globalQueryOptions: GlobalQueryOptions = {
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: false
};

/**
 * API Provider component
 *
 * Configures both HTTP client and React Query
 */
export const ApiProvider = ({
                                children,
                            }) => {

    // Use provided QueryClient or create a new one
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: globalQueryOptions.staleTime,
                refetchOnWindowFocus: globalQueryOptions.refetchOnWindowFocus,
                refetchOnMount: globalQueryOptions.refetchOnMount,
                refetchOnReconnect: globalQueryOptions.refetchOnReconnect,
                retry: globalQueryOptions.retry
            }
        }
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools/>
        </QueryClientProvider>
    );
};

export default ApiProvider; 