import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Post, 
  Comment,
} from '../types/models';
import { 
  UserQueryHooks, 
  PostQueryHooks, 
  CommentQueryHooks, 
  UploadQueryHooks,
  QueryHookOptions,
  GlobalQueryOptions
} from '../types/queryHookTypes';
import { httpClientServices } from './httpClientServices';

// 查詢鍵名稱
export const QueryKeys = {
  users: 'users',
  user: (id: number) => ['user', id],
  posts: 'posts',
  post: (id: number) => ['post', id],
  comments: (postId: number) => ['comments', postId]
};

/**
 * 用戶服務 Hooks
 */
export const useUserService = (): UserQueryHooks => {
  const queryClient = useQueryClient();
  const { userService } = httpClientServices;
  
  // 獲取用戶列表
  const useGetUsers = (params?: { limit?: number }, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: [QueryKeys.users, params],
      queryFn: () => userService.getUsers(params),
      enabled: options.enabled !== false,
      ...options
    });
  };
  
  // 獲取用戶詳情
  const useGetUserById = (id: number, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: QueryKeys.user(id),
      queryFn: () => userService.getUserById(id),
      enabled: !!id && options.enabled !== false,
      ...options
    });
  };
  
  // 創建用戶
  const useCreateUser = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: (user: Partial<User>) => userService.createUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError
    });
  };
  
  return {
    useGetUsers,
    useGetUserById,
    useCreateUser
  };
};

/**
 * 貼文服務 Hooks
 */
export const usePostService = (): PostQueryHooks => {
  const queryClient = useQueryClient();
  const { postService } = httpClientServices;
  
  // 獲取貼文列表
  const useGetPosts = (params?: { limit?: number }, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: [QueryKeys.posts, params],
      queryFn: () => postService.getPosts(params),
      enabled: options.enabled !== false,
      ...options
    });
  };
  
  // 獲取貼文詳情
  const useGetPostById = (id: number, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: QueryKeys.post(id),
      queryFn: () => postService.getPostById(id),
      enabled: !!id && options.enabled !== false,
      ...options
    });
  };
  
  // 創建貼文
  const useCreatePost = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: (post: Partial<Post>) => postService.createPost(post),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.posts] });
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError
    });
  };
  
  // 更新貼文
  const useUpdatePost = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) => postService.updatePost(id, data),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.posts] });
        queryClient.invalidateQueries({ queryKey: QueryKeys.post(variables.id) });
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError
    });
  };
  
  // 刪除貼文
  const useDeletePost = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: (id: number) => postService.deletePost(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.posts] });
        queryClient.invalidateQueries({ queryKey: QueryKeys.post(id) });
        if (options.onSuccess) {
          options.onSuccess({} as any);
        }
      },
      onError: options.onError
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

/**
 * 評論服務 Hooks
 */
export const useCommentService = (): CommentQueryHooks => {
  const queryClient = useQueryClient();
  const { commentService } = httpClientServices;
  
  // 獲取評論列表
  const useGetCommentsByPostId = (postId: number, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: QueryKeys.comments(postId),
      queryFn: () => commentService.getCommentsByPostId(postId),
      enabled: !!postId && options.enabled !== false,
      ...options
    });
  };
  
  // 創建評論
  const useCreateComment = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: (comment: Partial<Comment>) => commentService.createComment(comment),
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeys.comments(variables.postId!) });
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError
    });
  };
  
  return {
    useGetCommentsByPostId,
    useCreateComment
  };
};

/**
 * 上傳服務 Hooks
 */
export const useUploadService = (): UploadQueryHooks => {
  const { uploadService } = httpClientServices;
  
  // 上傳文件
  const useFileUpload = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percentage: number) => void }) => {
        return uploadService.uploadFile(file, onProgress);
      },
      onSuccess: (data) => {
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError
    });
  };
  
  return {
    useFileUpload
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