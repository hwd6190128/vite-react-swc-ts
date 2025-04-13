import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { httpClient } from '../core/HttpClient';
import { API_PATHS, User, Post, Comment } from '../types/models';
import { UserQueryHooks, PostQueryHooks, CommentQueryHooks, UploadQueryHooks, QueryHookOptions, GlobalQueryOptions, UploadOptions } from '../types/queryHookTypes';
import axios, { AxiosProgressEvent } from 'axios';

// 查詢鍵值，用於緩存管理
export const QueryKeys = {
  users: 'users',
  user: (id: number) => ['user', id],
  posts: 'posts',
  post: (id: number) => ['post', id],
  comments: (postId: number) => ['comments', postId]
};

// 使用者服務
export const useUserService = (): UserQueryHooks => {
  const queryClient = useQueryClient();

  const useGetUsers = (params?: { limit?: number }, options?: GlobalQueryOptions): UseQueryResult<User[], Error> => {
    const result = useQuery<User[], Error, User[]>({
      queryKey: [QueryKeys.users, params],
      queryFn: async () => {
        const response = await httpClient.get<User[]>(API_PATHS.users, { params });
        return response.data;
      },
      staleTime: options?.staleTime,
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      refetchOnMount: options?.refetchOnMount,
      refetchOnReconnect: options?.refetchOnReconnect,
      retry: options?.retry
    });

    // 手動處理成功和錯誤回調
    if (result.isSuccess && options?.onSuccess) {
      options.onSuccess(result.data);
    }
    if (result.isError && options?.onError) {
      options.onError(result.error);
    }

    return result;
  };

  const useGetUserById = (id: number, options?: GlobalQueryOptions): UseQueryResult<User, Error> => {
    const result = useQuery<User, Error, User>({
      queryKey: QueryKeys.user(id),
      queryFn: async () => {
        const response = await httpClient.get<User>(`${API_PATHS.users}/${id}`);
        return response.data;
      },
      staleTime: options?.staleTime,
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      refetchOnMount: options?.refetchOnMount,
      refetchOnReconnect: options?.refetchOnReconnect,
      retry: options?.retry
    });

    // 手動處理成功和錯誤回調
    if (result.isSuccess && options?.onSuccess) {
      options.onSuccess(result.data);
    }
    if (result.isError && options?.onError) {
      options.onError(result.error);
    }

    return result;
  };

  const useCreateUser = (options?: QueryHookOptions): UseMutationResult<User, Error, Partial<User>> => {
    return useMutation<User, Error, Partial<User>>({
      mutationFn: async (userData: Partial<User>) => {
        const response = await httpClient.post<User>(API_PATHS.users, userData);
        return response.data;
      },
      onSuccess: (data) => {
        // 成功後自動重新獲取用戶列表
        queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
        
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        if (options?.invalidateQueriesOnSuccess) {
          const queriesToInvalidate = Array.isArray(options.invalidateQueriesOnSuccess)
            ? options.invalidateQueriesOnSuccess
            : [options.invalidateQueriesOnSuccess];
          
          queriesToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      },
      onError: options?.onError
    });
  };

  return {
    useGetUsers,
    useGetUserById,
    useCreateUser
  };
};

// 文章服務
export const usePostService = (): PostQueryHooks => {
  const queryClient = useQueryClient();

  const useGetPosts = (params?: { limit?: number }, options?: GlobalQueryOptions): UseQueryResult<Post[], Error> => {
    const result = useQuery<Post[], Error, Post[]>({
      queryKey: [QueryKeys.posts, params],
      queryFn: async () => {
        const response = await httpClient.get<Post[]>(API_PATHS.posts, { params });
        return response.data;
      },
      staleTime: options?.staleTime,
      enabled: options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      refetchOnMount: options?.refetchOnMount,
      refetchOnReconnect: options?.refetchOnReconnect,
      retry: options?.retry
    });

    // 手動處理成功和錯誤回調
    if (result.isSuccess && options?.onSuccess) {
      options.onSuccess(result.data);
    }
    if (result.isError && options?.onError) {
      options.onError(result.error);
    }

    return result;
  };

  const useGetPostById = (id: number, options?: GlobalQueryOptions): UseQueryResult<Post, Error> => {
    const result = useQuery<Post, Error, Post>({
      queryKey: QueryKeys.post(id),
      queryFn: async () => {
        const response = await httpClient.get<Post>(`${API_PATHS.posts}/${id}`);
        return response.data;
      },
      staleTime: options?.staleTime,
      enabled: id !== undefined && options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      refetchOnMount: options?.refetchOnMount,
      refetchOnReconnect: options?.refetchOnReconnect,
      retry: options?.retry
    });

    // 手動處理成功和錯誤回調
    if (result.isSuccess && options?.onSuccess) {
      options.onSuccess(result.data);
    }
    if (result.isError && options?.onError) {
      options.onError(result.error);
    }

    return result;
  };

  // 創建文章
  const useCreatePost = (options?: QueryHookOptions): UseMutationResult<Post, Error, Partial<Post>> => {
    return useMutation<Post, Error, Partial<Post>>({
      mutationFn: async (postData: Partial<Post>) => {
        const response = await httpClient.post<Post>(API_PATHS.posts, postData);
        return response.data;
      },
      onSuccess: (data) => {
        // 成功後自動重新獲取文章列表
        queryClient.invalidateQueries({ queryKey: [QueryKeys.posts] });
        
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        if (options?.invalidateQueriesOnSuccess) {
          const queriesToInvalidate = Array.isArray(options.invalidateQueriesOnSuccess)
            ? options.invalidateQueriesOnSuccess
            : [options.invalidateQueriesOnSuccess];
          
          queriesToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      },
      onError: options?.onError
    });
  };

  // 更新文章
  const useUpdatePost = (options?: QueryHookOptions): UseMutationResult<Post, Error, { id: number; post: Partial<Post> }> => {
    return useMutation<Post, Error, { id: number; post: Partial<Post> }>({
      mutationFn: async ({ id, post }: { id: number; post: Partial<Post> }) => {
        const response = await httpClient.put<Post>(`${API_PATHS.posts}/${id}`, post);
        return response.data;
      },
      onSuccess: (data, variables) => {
        // 成功後自動重新獲取文章列表與詳情
        queryClient.invalidateQueries({ queryKey: [QueryKeys.posts] });
        queryClient.invalidateQueries({ queryKey: QueryKeys.post(variables.id) });
        
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        if (options?.invalidateQueriesOnSuccess) {
          const queriesToInvalidate = Array.isArray(options.invalidateQueriesOnSuccess)
            ? options.invalidateQueriesOnSuccess
            : [options.invalidateQueriesOnSuccess];
          
          queriesToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      },
      onError: options?.onError
    });
  };

  // 刪除文章
  const useDeletePost = (options?: QueryHookOptions): UseMutationResult<void, Error, number> => {
    return useMutation<void, Error, number>({
      mutationFn: async (id: number) => {
        await httpClient.delete(`${API_PATHS.posts}/${id}`);
      },
      onSuccess: (_data, id) => {
        // 成功後自動重新獲取文章列表與移除文章詳情緩存
        queryClient.invalidateQueries({ queryKey: [QueryKeys.posts] });
        queryClient.removeQueries({ queryKey: QueryKeys.post(id) });
        
        if (options?.onSuccess) {
          options.onSuccess(_data);
        }
        
        if (options?.invalidateQueriesOnSuccess) {
          const queriesToInvalidate = Array.isArray(options.invalidateQueriesOnSuccess)
            ? options.invalidateQueriesOnSuccess
            : [options.invalidateQueriesOnSuccess];
          
          queriesToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      },
      onError: options?.onError
    });
  };

  return {
    useGetPosts,
    useGetPostById,
    useCreatePost,
    useUpdatePost,
    useDeletePost
  };
};

// 留言服務
export const useCommentService = (): CommentQueryHooks => {
  const queryClient = useQueryClient();

  const useGetCommentsByPostId = (postId: number, options?: GlobalQueryOptions): UseQueryResult<Comment[], Error> => {
    const result = useQuery<Comment[], Error, Comment[]>({
      queryKey: QueryKeys.comments(postId),
      queryFn: async () => {
        const response = await httpClient.get<Comment[]>(`${API_PATHS.posts}/${postId}/comments`);
        return response.data;
      },
      staleTime: options?.staleTime,
      enabled: postId !== undefined && options?.enabled !== false,
      refetchOnWindowFocus: options?.refetchOnWindowFocus,
      refetchOnMount: options?.refetchOnMount,
      refetchOnReconnect: options?.refetchOnReconnect,
      retry: options?.retry
    });

    // 手動處理成功和錯誤回調
    if (result.isSuccess && options?.onSuccess) {
      options.onSuccess(result.data);
    }
    if (result.isError && options?.onError) {
      options.onError(result.error);
    }

    return result;
  };

  // 創建留言
  const useCreateComment = (options?: QueryHookOptions): UseMutationResult<Comment, Error, { postId: number; comment: Partial<Comment> }> => {
    return useMutation<Comment, Error, { postId: number; comment: Partial<Comment> }>({
      mutationFn: async ({ postId, comment }: { postId: number; comment: Partial<Comment> }) => {
        const response = await httpClient.post<Comment>(`${API_PATHS.posts}/${postId}/comments`, comment);
        return response.data;
      },
      onSuccess: (data, variables) => {
        // 成功後自動重新獲取留言列表
        queryClient.invalidateQueries({ queryKey: QueryKeys.comments(variables.postId) });
        
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        if (options?.invalidateQueriesOnSuccess) {
          const queriesToInvalidate = Array.isArray(options.invalidateQueriesOnSuccess)
            ? options.invalidateQueriesOnSuccess
            : [options.invalidateQueriesOnSuccess];
          
          queriesToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      },
      onError: options?.onError
    });
  };

  return {
    useGetCommentsByPostId,
    useCreateComment
  };
};

// 上傳服務
export const useUploadService = (): UploadQueryHooks => {
  const queryClient = useQueryClient();

  const useUploadFile = (options?: UploadOptions): UseMutationResult<string, Error, { file: File; type: string }> => {
    return useMutation<string, Error, { file: File; type: string }>({
      mutationFn: async ({ file, type }: { file: File; type: string }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // 直接使用 axios 而非 httpClient 以支援上傳進度
        const axiosInstance = axios.create({
          baseURL: httpClient['instance']?.defaults.baseURL
        });

        const response = await axiosInstance.post<{url: string}>(API_PATHS.upload, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (options?.onProgress) {
                options.onProgress(percentCompleted);
              }
            }
          }
        });
        
        return response.data.url;
      },
      onSuccess: (data) => {
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        if (options?.invalidateQueriesOnSuccess) {
          const queriesToInvalidate = Array.isArray(options.invalidateQueriesOnSuccess)
            ? options.invalidateQueriesOnSuccess
            : [options.invalidateQueriesOnSuccess];
          
          queriesToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      },
      onError: options?.onError
    });
  };

  return {
    useUploadFile
  };
};

// Group all query hooks services
export const queryHooksServices = {
  useUserService,
  usePostService,
  useCommentService,
  useUploadService,
  QueryKeys
};

// Add default export
export default queryHooksServices; 