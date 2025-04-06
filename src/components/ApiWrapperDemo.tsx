import { useState } from 'react';
import { HttpClient } from '../api/core/HttpClient';
import { useGet, usePost, useFileUpload } from '../api/hooks/QueryHooks';
import { useQueryClient } from '../api/core/ApiProvider';
import { globalQueryOptions } from '../api/core/ApiProvider';

// Demo using QueryHooks
export function ApiWrapperDemo() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Example 1: Using global default settings (no options)
  const {
    data: defaultPosts,
    isLoading: isDefaultLoading,
    isError: isDefaultError,
    error: defaultError,
    refetch: refetchDefault
  } = useGet<any[]>(
    'https://jsonplaceholder.typicode.com/posts',
    { _limit: 3 }
    // No options, will use global defaults
  );

  // Example 2: Override specific options
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    response: postsResponse
  } = useGet<any[]>(
    'https://jsonplaceholder.typicode.com/posts',
    { _limit: 5 },
    {
      staleTime: 60000,  // Override global default
      onError: (err) => console.error('Failed to fetch posts:', err)
    }
  );

  // Using usePost to create a new post
  const {
    mutate: createPost,
    isLoading: isCreating,
    isSuccess: isCreateSuccess,
    data: createdPost,
    response: createdPostResponse
  } = usePost<any, { title: string; body: string; userId: number }>(
    'https://jsonplaceholder.typicode.com/posts',
    {
      invalidateQueriesOnSuccess: 'posts',
      onSuccess: (response) => {
        console.log('Post created successfully:', response.data);
        setNewTitle('');
        setNewBody('');
      }
    },
    queryClient
  );

  // Using useFileUpload to upload files
  const {
    upload,
    isLoading: isUploading
  } = useFileUpload(
    'https://jsonplaceholder.typicode.com/upload',
    {
      onProgress: (progressEvent) => {
        // 確保 total 有值，如果沒有則使用 100 作為預設值
        const total = progressEvent.total || progressEvent.loaded || 100;
        const percent = Math.round((progressEvent.loaded * 100) / total);
        setUploadProgress(percent);
      },
      onSuccess: () => {
        setFile(null);
        setUploadProgress(0);
      }
    }
  );

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim() && newBody.trim()) {
      createPost({
        title: newTitle,
        body: newBody,
        userId: 1
      });
    } else {
      alert('Please fill in title and content!');
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = () => {
    if (file) {
      upload(file);
    }
  };

  if (isLoading && isDefaultLoading) {
    return <div>Loading...</div>;
  }

  if (isError && isDefaultError) {
    return <div>Error: {error?.message || defaultError?.message}</div>;
  }

  return (
    <div className="api-wrapper-demo">
      <h2>QueryHooks Demo</h2>
      
      <div className="section">
        <h3>Global Options</h3>
        <pre>{JSON.stringify(globalQueryOptions, null, 2)}</pre>
      </div>

      <div className="section">
        <h3>HttpClient Configuration</h3>
        <pre>{JSON.stringify({
          baseUrl: HttpClient.getBaseUrl(),
          // 不再訪問私有屬性
          withCredentials: 'Use HttpClient.setWithCredentials() to configure'
        }, null, 2)}</pre>
      </div>

      <div className="section">
        <h3>Posts with Default Options</h3>
        <div className="action-buttons">
          <button onClick={() => refetchDefault()} disabled={isDefaultLoading}>
            Refresh
          </button>
        </div>
        <ul className="posts-list">
          {defaultPosts?.map((post) => (
            <li key={post.id}>
              <strong>[Default] {post.title}</strong>
              <p>{post.body.substring(0, 100)}...</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h3>Posts with Custom Options</h3>
        <div className="action-buttons">
          <button onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </button>
        </div>
        <ul className="posts-list">
          {posts?.map((post) => (
            <li key={post.id}>
              <strong>[Custom Cache] {post.title}</strong>
              <p>{post.body.substring(0, 100)}...</p>
            </li>
          ))}
        </ul>
        <p className="hint">This list has custom caching with a stale time of 60 seconds</p>
        
        {postsResponse && (
          <div className="response-details">
            <h4>Response Details</h4>
            <p>Status: {postsResponse.status}</p>
            <p>Status Text: {postsResponse.statusText}</p>
            <p>Headers: {JSON.stringify(postsResponse.headers)}</p>
          </div>
        )}
      </div>

      <div className="section">
        <h3>Add New Post</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="body">Content:</label>
            <textarea
              id="body"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Enter content"
              rows={4}
              required
            />
          </div>
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Submitting...' : 'Add Post'}
          </button>
        </form>

        {isCreateSuccess && (
          <div className="success-message">
            <h4>Created Successfully!</h4>
            <pre>{JSON.stringify(createdPost, null, 2)}</pre>
            
            {createdPostResponse && (
              <div className="response-details">
                <h4>Response Details</h4>
                <p>Status: {createdPostResponse.status}</p>
                <p>Status Text: {createdPostResponse.statusText}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="section">
        <h3>File Upload</h3>
        <div className="file-upload">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        {isUploading && (
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
} 