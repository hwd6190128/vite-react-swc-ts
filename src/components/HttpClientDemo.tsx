import React, { useState, useEffect, FormEvent, ChangeEvent, useCallback } from 'react';
import { User, Post, Comment } from '../api/types/models';
import httpClientServices from "../api/services/httpClientServices.ts";
import { useUserService } from '../api/services/UserService';
import httpClient from '../api/core/HttpClient';

/**
 * HttpClient Pattern Demo Component
 */
const HttpClientDemo: React.FC = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [userDetail, setUserDetail] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postDetail, setPostDetail] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingPostDetail, setIsLoadingPostDetail] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Error states
  const [userError, setUserError] = useState<Error | null>(null);
  const [userDetailError, setUserDetailError] = useState<Error | null>(null);
  const [postError, setPostError] = useState<Error | null>(null);
  const [postDetailError, setPostDetailError] = useState<Error | null>(null);
  const [commentError, setCommentError] = useState<Error | null>(null);
  
  // Form states
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Submission states
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Service instances
  const { userService, postService, commentService, uploadService } = httpClientServices;
  
  // 用 useUserService 取得 user list，會自動帶 baseurl & header
  const userServiceByHook = useUserService(httpClient);
  const [usersByHook, setUsersByHook] = useState<any[]>([]);
  const [loadingUsersByHook, setLoadingUsersByHook] = useState(false);
  const [errorUsersByHook, setErrorUsersByHook] = useState<string | null>(null);
  
  // Load users data
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUserError(null);
    
    try {
      const data = await userService.getUsers({ limit: 5 });
      setUsers(data);
    } catch (error) {
      setUserError(error as Error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [userService]);
  
  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);
  
  // Load user details
  const fetchUserDetail = useCallback(async () => {
    setIsLoadingUserDetail(true);
    setUserDetailError(null);
    
    try {
      const data = await userService.getUserById(1);
      setUserDetail(data);
    } catch (error) {
      setUserDetailError(error as Error);
    } finally {
      setIsLoadingUserDetail(false);
    }
  }, [userService]);
  
  useEffect(() => {
    void fetchUserDetail();
  }, [fetchUserDetail]);
  
  // Load posts data
  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    setPostError(null);
    
    try {
      const data = await postService.getPosts({ limit: 10 });
      setPosts(data);
    } catch (error) {
      setPostError(error as Error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, [postService]);
  
  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);
  
  // Load post details
  const fetchPostDetail = useCallback(async () => {
    setIsLoadingPostDetail(true);
    setPostDetailError(null);
    
    try {
      const data = await postService.getPostById(1);
      setPostDetail(data);
    } catch (error) {
      setPostDetailError(error as Error);
    } finally {
      setIsLoadingPostDetail(false);
    }
  }, [postService]);
  
  useEffect(() => {
    void fetchPostDetail();
  }, [fetchPostDetail]);
  
  // Load comments data
  const fetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    setCommentError(null);
    
    try {
      const data = await commentService.getCommentsByPostId(1);
      setComments(data);
    } catch (error) {
      setCommentError(error as Error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [commentService]);
  
  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);
  
  // Submit post
  const handlePostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!postTitle || !postBody) return;
    
    setIsSubmittingPost(true);
    
    try {
      await postService.createPost({
        title: postTitle,
        body: postBody,
        userId: 1
      });
      
      // Reload posts list
      await fetchPosts();
      
      // Reset form
      setPostTitle('');
      setPostBody('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmittingPost(false);
    }
  };
  
  // Submit comment
  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!commentBody) return;
    
    setIsSubmittingComment(true);
    
    try {
      await commentService.createComment({
        postId: 1,
        name: 'Current User',
        email: 'user@example.com',
        body: commentBody
      });
      
      // Reload comments list
      await fetchComments();
      
      // Reset form
      setCommentBody('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    
    try {
      await uploadService.uploadFile(selectedFile, (progress: number) => {
        setUploadProgress(progress);
      });
      
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 按鈕點擊時才呼叫 getUsers
  const handleFetchUsersByHook = async () => {
    setLoadingUsersByHook(true);
    setErrorUsersByHook(null);
    try {
      const data = await userServiceByHook.getUsers();
      setUsersByHook(data);
    } catch (err: any) {
      setErrorUsersByHook(err.message);
    } finally {
      setLoadingUsersByHook(false);
    }
  };

  return (
    <div className="http-client-demo">
      <div className="pattern-explanation">
        <h2>HttpClient Pattern</h2>
        <p>
          The HttpClient pattern uses a wrapped HttpClient class for API calls. This pattern gives complete control over the request lifecycle.
        </p>
      </div>
      
      <div className="demo-section">
        <h3>Data Fetching Examples</h3>
        
        <div className="data-section">
          <h4>Users</h4>
          {isLoadingUsers ? (
            <p>Loading users...</p>
          ) : userError ? (
            <p className="error">Error: {userError.message}</p>
          ) : (
            <ul className="data-list">
              {users.map(user => (
                <li key={user.id}>{user.name}</li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="data-section">
          <h4>User Details</h4>
          {isLoadingUserDetail ? (
            <p>Loading user details...</p>
          ) : userDetailError ? (
            <p className="error">Error: {userDetailError.message}</p>
          ) : userDetail && (
            <div className="data-detail">
              <p><strong>Name:</strong> {userDetail.name}</p>
              <p><strong>Email:</strong> {userDetail.email}</p>
              <p><strong>Phone:</strong> {userDetail.phone}</p>
            </div>
          )}
        </div>
        
        <div className="data-section">
          <h4>Posts</h4>
          {isLoadingPosts ? (
            <p>Loading posts...</p>
          ) : postError ? (
            <p className="error">Error: {postError.message}</p>
          ) : (
            <ul className="data-list">
              {posts.slice(0, 3).map(post => (
                <li key={post.id}>{post.title}</li>
              ))}
              {posts.length > 3 && <li>...and {posts.length - 3} more</li>}
            </ul>
          )}
        </div>
      </div>
      
      <div className="demo-section">
        <h3>Data Mutation Examples</h3>
        
        <div className="form-section">
          <h4>Create Post</h4>
          <form onSubmit={handlePostSubmit}>
            <div className="form-field">
              <label htmlFor="postTitle">Title:</label>
              <input
                id="postTitle"
                type="text"
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="postBody">Body:</label>
              <textarea
                id="postBody"
                value={postBody}
                onChange={e => setPostBody(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={isSubmittingPost}>
              {isSubmittingPost ? 'Submitting...' : 'Create Post'}
            </button>
          </form>
        </div>
        
        <div className="form-section">
          <h4>Add Comment</h4>
          <form onSubmit={handleCommentSubmit}>
            <div className="form-field">
              <label htmlFor="commentBody">Comment:</label>
              <textarea
                id="commentBody"
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" disabled={isSubmittingComment}>
              {isSubmittingComment ? 'Submitting...' : 'Add Comment'}
            </button>
          </form>
        </div>
      </div>

      <section style={{margin: '24px 0', padding: 12, border: '1px solid #eee', borderRadius: 8}}>
        <h3>用 useUserService + httpClient (帶 baseurl & header) 取得 User List</h3>
        <button onClick={handleFetchUsersByHook} disabled={loadingUsersByHook} style={{marginBottom: 8}}>
          {loadingUsersByHook ? 'Loading...' : '取得 User List'}
        </button>
        {errorUsersByHook && <div style={{color: 'red'}}>Error: {errorUsersByHook}</div>}
        <ul>
          {usersByHook.map(user => (
            <li key={user.id}>{user.name} (id: {user.id})</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HttpClientDemo; 