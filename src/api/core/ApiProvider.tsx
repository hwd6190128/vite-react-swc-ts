import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

// Default query options
const defaultQueryOptions = {
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 分鐘
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: 1
        }
    }
};

interface ApiProviderProps {
    children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({children}) => {
    // Create a new query client if none is provided
    const queryClient = new QueryClient(defaultQueryOptions);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    );
};