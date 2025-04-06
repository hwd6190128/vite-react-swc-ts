import { useGet, usePost, usePut, useDelete, useFileUpload } from '../hooks/QueryHooks';
import { AxiosProgressEvent } from 'axios';
import {useQueryClient} from "@tanstack/react-query";

// API base path
const API_BASE = 'https://jsonplaceholder.typicode.com';

// Type definitions
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    }
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  }
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
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

// User API
export const userApi = {
  // Get user list
  useGetUsers: (params?: { limit?: number }) => {
    return useGet<User[]>(`${API_BASE}/users`, params);
  },
  
  // Get single user
  useGetUserById: (id: number) => {
    return useGet<User>(`${API_BASE}/users/${id}`);
  },
  
  // Create user
  useCreateUser: () => {
    const queryClient = useQueryClient();
    return usePost<User, Partial<User>>(`${API_BASE}/users`, {
      invalidateQueriesOnSuccess: 'users',
      onSuccess: (response) => {
        console.log('User created successfully:', response.data);
      }
    }, queryClient);
  }
};

// Post API
export const postApi = {
  // Get post list
  useGetPosts: (params?: { limit?: number, userId?: number }) => {
    return useGet<Post[]>(`${API_BASE}/posts`, params);
  },
  
  // Get single post
  useGetPostById: (id: number) => {
    return useGet<Post>(`${API_BASE}/posts/${id}`);
  },
  
  // Create post
  useCreatePost: () => {
    const queryClient = useQueryClient();
    return usePost<Post, CreatePostData>(
      `${API_BASE}/posts`,
      {
        invalidateQueriesOnSuccess: 'posts',
        onSuccess: (response) => {
          console.log('Post created successfully:', response.data);
        }
      },
      queryClient
    );
  },
  
  // Update post
  useUpdatePost: (id: number) => {
    const queryClient = useQueryClient();
    return usePut<Post, UpdatePostData>(
      `${API_BASE}/posts/${id}`,
      {
        invalidateQueriesOnSuccess: ['posts', `post-${id}`],
        onSuccess: (response) => {
          console.log('Post updated successfully:', response.data);
        }
      },
      queryClient
    );
  },
  
  // Delete post
  useDeletePost: () => {
    const queryClient = useQueryClient();
    return useDelete<Post, { id: number }>(
      `${API_BASE}/posts`,
      {
        invalidateQueriesOnSuccess: 'posts',
        onSuccess: (response) => {
          console.log('Post deleted successfully', response.status);
        }
      },
      queryClient
    );
  }
};

// File upload API
export const uploadApi = {
  // Upload file
  useUploadFile: (onProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    const queryClient = useQueryClient();
    return useFileUpload<{ url: string }>(
      `${API_BASE}/upload`,
      {
        onProgress,
        onSuccess: (response) => {
          console.log('File uploaded successfully:', response.data);
        }
      },
      queryClient
    );
  }
};

// Comment API
export const commentApi = {
  // Get comments for a post
  useGetCommentsByPostId: (postId: number) => {
    return useGet<Comment[]>(`${API_BASE}/posts/${postId}/comments`);
  },
  
  // Add comment
  useAddComment: () => {
    const queryClient = useQueryClient();
    return usePost<Comment, CreateCommentData>(
      `${API_BASE}/comments`,
      {
        invalidateQueriesOnSuccess: 'comments',
        onSuccess: (response) => {
          console.log('Comment added successfully:', response.data);
        }
      },
      queryClient
    );
  }
}; 