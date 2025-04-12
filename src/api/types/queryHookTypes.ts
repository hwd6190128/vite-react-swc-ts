import { AxiosResponse, AxiosProgressEvent } from 'axios';
import { User, Post, Comment } from './models';

// QueryHooks 選項類型
export interface QueryHookOptions {
  // 是否啟用查詢
  enabled?: boolean;
  // 查詢成功後重新驗證其他查詢
  invalidateQueriesOnSuccess?: string | string[];
  // 成功回調
  onSuccess?: (response: AxiosResponse<any>) => void;
  // 錯誤回調
  onError?: (error: Error) => void;
}

// 全局查詢選項
export interface GlobalQueryOptions extends QueryHookOptions {
  // 緩存過期時間 (毫秒)
  staleTime?: number;
  // 自動重新獲取
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  // 自動重試
  retry?: boolean | number;
}

// 上傳選項
export interface UploadOptions extends QueryHookOptions {
  // 上傳進度處理函數
  onProgress?: (progressEvent: AxiosProgressEvent) => void;
}

// QueryHooks 類型定義
export interface UserQueryHooks {
  useGetUsers: (params?: { limit?: number }, options?: GlobalQueryOptions) => {
    data?: User[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<AxiosResponse<User[]>>;
  };
  useGetUserById: (id: number, options?: GlobalQueryOptions) => {
    data?: User;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<AxiosResponse<User>>;
  };
  useCreateUser: (options?: QueryHookOptions) => {
    mutate: (user: Partial<User>) => void;
    mutateAsync: (user: Partial<User>) => Promise<User>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
  };
}

export interface PostQueryHooks {
  useGetPosts: (params?: { limit?: number }, options?: GlobalQueryOptions) => {
    data?: Post[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<AxiosResponse<Post[]>>;
  };
  useGetPostById: (id: number, options?: GlobalQueryOptions) => {
    data?: Post;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<AxiosResponse<Post>>;
  };
  useCreatePost: (options?: QueryHookOptions) => {
    mutate: (post: Partial<Post>) => void;
    mutateAsync: (post: Partial<Post>) => Promise<Post>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
  };
  useUpdatePost: (options?: QueryHookOptions) => {
    mutate: (data: { id: number; data: Partial<Post> }) => void;
    mutateAsync: (data: { id: number; data: Partial<Post> }) => Promise<Post>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
  };
  useDeletePost: (options?: QueryHookOptions) => {
    mutate: (id: number) => void;
    mutateAsync: (id: number) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
  };
}

export interface CommentQueryHooks {
  useGetCommentsByPostId: (postId: number, options?: GlobalQueryOptions) => {
    data?: Comment[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<AxiosResponse<Comment[]>>;
  };
  useCreateComment: (options?: QueryHookOptions) => {
    mutate: (comment: Partial<Comment>) => void;
    mutateAsync: (comment: Partial<Comment>) => Promise<Comment>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
  };
}

export interface UploadQueryHooks {
  useFileUpload: (options?: UploadOptions) => {
    mutate: (data: { file: File; onProgress?: (percentage: number) => void }) => void;
    mutateAsync: (data: { file: File; onProgress?: (percentage: number) => void }) => Promise<any>;
    isLoading: boolean;
    error: Error | null;
    reset: () => void;
  };
} 