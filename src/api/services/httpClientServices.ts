import { 
  User, 
  Post, 
  Comment,
  API_PATHS
} from '../types/models';
import {
  IUserService,
  IPostService,
  ICommentService,
  IUploadService
} from '../types/httpClientTypes';
import { httpClient } from '../core/HttpClient';
import axios, { AxiosProgressEvent } from 'axios';

/**
 * HttpClient 版本的用戶服務 - 使用封裝的 HttpClient
 */
export const httpUserService: IUserService = {
  getUsers: async (params?: { limit?: number }): Promise<User[]> => {
    try {
      const response = await httpClient.get<User[]>(API_PATHS.users, params);
      return response.data;
    } catch (error) {
      throw new Error(`獲取用戶列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await httpClient.get<User>(API_PATHS.user(id));
      return response.data;
    } catch (error) {
      throw new Error(`獲取用戶詳情失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  createUser: async (user: Partial<User>): Promise<User> => {
    try {
      const response = await httpClient.post<User>(API_PATHS.users, user);
      return response.data;
    } catch (error) {
      throw new Error(`創建用戶失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
};

/**
 * HttpClient 版本的貼文服務
 */
export const httpPostService: IPostService = {
  getPosts: async (params?: { limit?: number }): Promise<Post[]> => {
    try {
      const response = await httpClient.get<Post[]>(API_PATHS.posts, params);
      return response.data;
    } catch (error) {
      throw new Error(`獲取貼文列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  getPostById: async (id: number): Promise<Post> => {
    try {
      const response = await httpClient.get<Post>(API_PATHS.post(id));
      return response.data;
    } catch (error) {
      throw new Error(`獲取貼文詳情失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  createPost: async (post: Partial<Post>): Promise<Post> => {
    try {
      const response = await httpClient.post<Post>(API_PATHS.posts, post);
      return response.data;
    } catch (error) {
      throw new Error(`創建貼文失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  updatePost: async (id: number, post: Partial<Post>): Promise<Post> => {
    try {
      const response = await httpClient.patch<Post>(API_PATHS.post(id), post);
      return response.data;
    } catch (error) {
      throw new Error(`更新貼文失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  deletePost: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(API_PATHS.post(id));
    } catch (error) {
      throw new Error(`刪除貼文失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
};

/**
 * HttpClient 版本的評論服務
 */
export const httpCommentService: ICommentService = {
  getCommentsByPostId: async (postId: number): Promise<Comment[]> => {
    try {
      const response = await httpClient.get<Comment[]>(API_PATHS.comments(postId));
      return response.data;
    } catch (error) {
      throw new Error(`獲取評論列表失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  },
  
  createComment: async (comment: Partial<Comment>): Promise<Comment> => {
    try {
      const response = await httpClient.post<Comment>(API_PATHS.comments(comment.postId!), comment);
      return response.data;
    } catch (error) {
      throw new Error(`創建評論失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
};

/**
 * HttpClient 版本的上傳服務
 */
export const httpUploadService: IUploadService = {
  uploadFile: async (file: File, onProgress?: (percentage: number) => void): Promise<{url: string}> => {
    try {
      // 使用 HttpClient 的 uploadFile 方法，現在支援上傳進度回調
      const response = await httpClient.uploadFile<{url: string}>(API_PATHS.upload, file, {
        onUploadProgress: onProgress ? (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (onProgress) {
              onProgress(percentCompleted);
            }
          }
        } : undefined
      });
      
      return response.data;
    } catch (error) {
      throw new Error(`上傳文件失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  }
};

// 統一導出所有服務
export const httpClientServices = {
  userService: httpUserService,
  postService: httpPostService,
  commentService: httpCommentService,
  uploadService: httpUploadService
};

// Add default export
export default httpClientServices; 