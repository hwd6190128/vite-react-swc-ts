// API 基本路徑
export const API_BASE = 'https://jsonplaceholder.typicode.com';

// 使用者數據模型
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  company?: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// 貼文數據模型
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// 評論數據模型
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface CreatePostData {
  title: string;
  body: string;
  userId: number;
}

export interface UpdatePostData {
  title?: string;
  body?: string;
}

export interface CreateCommentData {
  postId: number;
  name: string;
  email: string;
  body: string;
}

// API 路徑常量
export const API_PATHS = {
  users: `${API_BASE}/users`,
  user: (id: number) => `${API_BASE}/users/${id}`,
  posts: `${API_BASE}/posts`,
  post: (id: number) => `${API_BASE}/posts/${id}`,
  comments: (postId: number) => `${API_BASE}/posts/${postId}/comments`,
  upload: 'https://httpbin.org/post' // 使用 httpbin 測試上傳
}; 