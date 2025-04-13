import { User, Post, Comment } from './models';
import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

// QueryHooks 選項類型
export interface QueryHookOptions<TData = unknown> {
  // 是否啟用查詢
  enabled?: boolean;
  // 查詢成功後重新驗證其他查詢
  invalidateQueriesOnSuccess?: string | string[];
  // 成功回調 - 直接使用數據類型而非AxiosResponse
  onSuccess?: (data: TData) => void;
  // 錯誤回調
  onError?: (error: Error) => void;
}

// 全局查詢選項
export interface GlobalQueryOptions<TData = unknown> extends QueryHookOptions<TData> {
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
export interface UploadOptions<TData = string> extends QueryHookOptions<TData> {
  // 上傳進度處理函數
  onProgress?: (percentCompleted: number) => void;
}

// QueryHooks 類型定義 - 使用TanStack Query的返回類型
export interface UserQueryHooks {
  useGetUsers: (params?: { limit?: number }, options?: GlobalQueryOptions<User[]>) => UseQueryResult<User[], Error>;
  useGetUserById: (id: number, options?: GlobalQueryOptions<User>) => UseQueryResult<User, Error>;
  useCreateUser: (options?: QueryHookOptions<User>) => UseMutationResult<User, Error, Partial<User>>;
}

export interface PostQueryHooks {
  useGetPosts: (params?: { limit?: number }, options?: GlobalQueryOptions<Post[]>) => UseQueryResult<Post[], Error>;
  useGetPostById: (id: number, options?: GlobalQueryOptions<Post>) => UseQueryResult<Post, Error>;
  useCreatePost: (options?: QueryHookOptions<Post>) => UseMutationResult<Post, Error, Partial<Post>>;
  useUpdatePost: (options?: QueryHookOptions<Post>) => UseMutationResult<Post, Error, { id: number; post: Partial<Post> }>;
  useDeletePost: (options?: QueryHookOptions<void>) => UseMutationResult<void, Error, number>;
}

export interface CommentQueryHooks {
  useGetCommentsByPostId: (postId: number, options?: GlobalQueryOptions<Comment[]>) => UseQueryResult<Comment[], Error>;
  useCreateComment: (options?: QueryHookOptions<Comment>) => UseMutationResult<Comment, Error, { postId: number; comment: Partial<Comment> }>;
}

export interface UploadQueryHooks {
  useUploadFile: (options?: UploadOptions<string>) => UseMutationResult<string, Error, { file: File; type: string }>;
} 