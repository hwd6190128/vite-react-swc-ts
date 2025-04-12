import { User, Post, Comment } from './models';

// 服務接口 - 用於定義所有服務的通用方法
export interface IUserService {
  getUsers: (params?: { limit?: number }) => Promise<User[]>;
  getUserById: (id: number) => Promise<User>;
  createUser: (user: Partial<User>) => Promise<User>;
}

export interface IPostService {
  getPosts: (params?: { limit?: number }) => Promise<Post[]>;
  getPostById: (id: number) => Promise<Post>;
  createPost: (post: Partial<Post>) => Promise<Post>;
  updatePost: (id: number, post: Partial<Post>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

export interface ICommentService {
  getCommentsByPostId: (postId: number) => Promise<Comment[]>;
  createComment: (comment: Partial<Comment>) => Promise<Comment>;
}

export interface IUploadService {
  uploadFile: (file: File, onProgress?: (percentage: number) => void) => Promise<any>;
} 