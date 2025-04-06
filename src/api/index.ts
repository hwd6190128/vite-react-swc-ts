import { ApiProvider  } from './core/ApiProvider';
import HttpClient, { 
    ErrorHandlingOptions, 
    RequestOptions, 
    ApiResponse,
    HttpMethod
} from './core/HttpClient';
import QueryHooks, {
    useGet,
    usePost,
    usePut,
    useDelete,
    useFileUpload,
    QueryHookOptions
} from './hooks/QueryHooks';

// Re-export everything
export {
    // Core
    ApiProvider,
    HttpClient,
};

// Re-export types
export type {
    ErrorHandlingOptions,
    RequestOptions,
    ApiResponse,
    HttpMethod,
    QueryHookOptions,
};
    
// Re-export hooks
export {
    QueryHooks,
    useGet,
    usePost,
    usePut,
    useDelete,
    useFileUpload
};

// Default export for convenient imports
export default {
    ApiProvider,
    HttpClient,
    QueryHooks
}; 