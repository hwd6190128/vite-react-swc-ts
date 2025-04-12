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

/**
 * HttpClient 版本的用戶服務 - 使用基本的 fetch API
 */
export const httpUserService: IUserService = {
  getUsers: async (params?: { limit?: number }): Promise<User[]> => {
    const limit = params?.limit || 10;
    const response = await fetch(`${API_PATHS.users}?_limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`獲取用戶列表失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  getUserById: async (id: number): Promise<User> => {
    const response = await fetch(API_PATHS.user(id));
    
    if (!response.ok) {
      throw new Error(`獲取用戶詳情失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  createUser: async (user: Partial<User>): Promise<User> => {
    const response = await fetch(API_PATHS.users, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    
    if (!response.ok) {
      throw new Error(`創建用戶失敗: ${response.status}`);
    }
    
    return await response.json();
  }
};

/**
 * HttpClient 版本的貼文服務
 */
export const httpPostService: IPostService = {
  getPosts: async (params?: { limit?: number }): Promise<Post[]> => {
    const limit = params?.limit || 10;
    const response = await fetch(`${API_PATHS.posts}?_limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`獲取貼文列表失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  getPostById: async (id: number): Promise<Post> => {
    const response = await fetch(API_PATHS.post(id));
    
    if (!response.ok) {
      throw new Error(`獲取貼文詳情失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  createPost: async (post: Partial<Post>): Promise<Post> => {
    const response = await fetch(API_PATHS.posts, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });
    
    if (!response.ok) {
      throw new Error(`創建貼文失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  updatePost: async (id: number, post: Partial<Post>): Promise<Post> => {
    const response = await fetch(API_PATHS.post(id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });
    
    if (!response.ok) {
      throw new Error(`更新貼文失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  deletePost: async (id: number): Promise<void> => {
    const response = await fetch(API_PATHS.post(id), {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`刪除貼文失敗: ${response.status}`);
    }
  }
};

/**
 * HttpClient 版本的評論服務
 */
export const httpCommentService: ICommentService = {
  getCommentsByPostId: async (postId: number): Promise<Comment[]> => {
    const response = await fetch(API_PATHS.comments(postId));
    
    if (!response.ok) {
      throw new Error(`獲取評論列表失敗: ${response.status}`);
    }
    
    return await response.json();
  },
  
  createComment: async (comment: Partial<Comment>): Promise<Comment> => {
    const response = await fetch(API_PATHS.comments(comment.postId!), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    });
    
    if (!response.ok) {
      throw new Error(`創建評論失敗: ${response.status}`);
    }
    
    return await response.json();
  }
};

/**
 * HttpClient 版本的上傳服務
 */
export const httpUploadService: IUploadService = {
  uploadFile: async (file: File, onProgress?: (percentage: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // 使用普通的 fetch，但無法追蹤進度
    const response = await fetch(API_PATHS.upload, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`上傳文件失敗: ${response.status}`);
    }
    
    // 模擬進度
    if (onProgress) {
      // 模擬 100% 完成
      onProgress(100);
    }
    
    return await response.json();
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