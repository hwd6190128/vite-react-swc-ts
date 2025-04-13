import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { useUserService, usePostService, useCommentService, useUploadService } from '../api/services/queryHooksServices.ts';

/**
 * QueryHooks Pattern Demo Component
 */
const QueryHooksDemo: React.FC = () => {
  // Form states
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Get services
  const userService = useUserService();
  const postService = usePostService();
  const commentService = useCommentService();
  const uploadService = useUploadService();
  
  // Query hooks
  const { 
    data: users, 
    isLoading: isLoadingUsers, 
    error: userError 
  } = userService.useGetUsers({ limit: 5 });
  
  const { 
    data: userDetail, 
    isLoading: isLoadingUserDetail, 
    error: userDetailError 
  } = userService.useGetUserById(1);
  
  const { 
    data: posts, 
    isLoading: isLoadingPosts, 
    error: postError 
  } = postService.useGetPosts({ limit: 10 });
  
  const { data: postDetail } = postService.useGetPostById(1);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 
    data: comments, 
    isLoading: isLoadingComments, 
    error: commentError 
  } = commentService.useGetCommentsByPostId(1);
  
  // Mutations
  const { 
    mutate: createPost, 
    isLoading: isSubmittingPost 
  } = postService.useCreatePost({
    onSuccess: () => {
      setPostTitle('');
      setPostBody('');
    }
  });
  
  const { 
    mutate: createComment, 
    isLoading: isSubmittingComment
  } = commentService.useCreateComment({
    onSuccess: () => {
      setCommentBody('');
    }
  });
  
  const { 
    mutate: uploadFile,
    isLoading: isUploading
  } = uploadService.useUploadFile({
    onSuccess: () => {
      setUploadSuccess(true);
      setSelectedFile(null);
    }
  });
  
  // Handle post submission
  const handlePostSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    if (!postTitle || !postBody) return;
    
    createPost({
      title: postTitle,
      body: postBody,
      userId: 1
    });
  }, [postTitle, postBody, createPost]);
  
  // Handle comment submission
  const handleCommentSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    if (!commentBody) return;
    
    createComment({
      postId: 1,
      name: 'Current User',
      email: 'user@example.com',
      body: commentBody
    });
  }, [commentBody, createComment]);
  
  // Handle file change
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);
  
  // Handle file upload
  const handleFileUpload = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    setUploadSuccess(false);
    uploadFile({
      file: selectedFile
    });
  }, [selectedFile, uploadFile]);
  
  return (
    <div className="query-hooks-demo">
      <div className="pattern-explanation">
        <h2>QueryHooks Pattern</h2>
        <p>
          The QueryHooks pattern encapsulates TanStack Query functionality into custom hooks, 
          providing automatic caching, loading states, and automatic refetching.
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
              {users?.map(user => (
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
              {posts?.slice(0, 3).map(post => (
                <li key={post.id}>{post.title}</li>
              ))}
              {posts && posts.length > 3 && <li>...and {posts.length - 3} more</li>}
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
        
        <div className="form-section">
          <h4>Upload File</h4>
          <form onSubmit={handleFileUpload}>
            <div className="form-field">
              <input 
                type="file" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            
            {selectedFile && (
              <button 
                type="submit" 
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </button>
            )}
          </form>
          
          {uploadSuccess && (
            <div className="success-message">
              <p>File uploaded successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryHooksDemo; 