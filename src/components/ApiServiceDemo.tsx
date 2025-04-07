import React, { useState, ChangeEvent, FormEvent } from 'react';
import { userApi, postApi, commentApi, uploadApi } from '../api/services';
import { AxiosProgressEvent } from 'axios';
import { User, Post, Comment } from '../api/services';

/**
 * API 服務演示組件
 */
export const ApiServiceDemo: React.FC = () => {
    const { data: users, isLoading: isLoadingUsers, error: usersError } = userApi.useGetUsers({ limit: 5 }, {enabled: true});
    const { data: userData, isLoading: isLoadingUser, error: userError } = userApi.useGetUserById(1);
    
    // 貼文資料
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const { data: posts, isLoading: isLoadingPosts, error: postsError } = postApi.useGetPosts({ limit: 5 });
    const { data: postDetail, isLoading: isLoadingPost, error: postError } = postApi.useGetPostById(1);
    const { mutate: createPost, isLoading: isCreatingPost, error: createPostError } = postApi.useCreatePost();
    
    // 評論資料
    const { data: comments, isLoading: isLoadingComments, error: commentsError } = commentApi.useGetCommentsByPostId(1);
    const { mutate: addComment, isLoading: isAddingComment, error: addCommentError } = commentApi.useAddComment();
    const [commentName, setCommentName] = useState('');
    const [commentEmail, setCommentEmail] = useState('');
    const [commentBody, setCommentBody] = useState('');
    
    // 文件上傳
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const handleProgress = (event: AxiosProgressEvent) => {
        if (event.total) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
        }
    };
    
    const { upload, isLoading: isUploading, error: uploadError } = uploadApi.useUploadFile(handleProgress);
    
    // 提交新貼文
    const handleSubmitPost = (e: FormEvent) => {
        e.preventDefault();
        if (postTitle && postBody) {
            createPost({
                title: postTitle,
                body: postBody,
                userId: 1
            });
            setPostTitle('');
            setPostBody('');
        }
    };
    
    // 提交新評論
    const handleSubmitComment = (e: FormEvent) => {
        e.preventDefault();
        if (commentName && commentEmail && commentBody) {
            addComment({
                postId: 1,
                name: commentName,
                email: commentEmail,
                body: commentBody
            });
            setCommentName('');
            setCommentEmail('');
            setCommentBody('');
        }
    };
    
    // 處理文件選擇
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target?.files[0]);
            setUploadProgress(0);
        }
    };
    
    // 上傳文件
    const handleUpload = () => {
        if (file) {
            upload(file);
        }
    };
    
    return (
        <div className="api-demo">
            <h2>集中式 API 服務演示</h2>
            
            {/* 錯誤顯示 */}
            {(usersError || userError || postsError || postError || createPostError || commentsError || addCommentError || uploadError) && (
                <div className="error-section">
                    <h3>錯誤信息</h3>
                    {usersError && <p>載入使用者列表失敗: {usersError.message}</p>}
                    {userError && <p>載入使用者詳情失敗: {userError.message}</p>}
                    {postsError && <p>載入貼文列表失敗: {postsError.message}</p>}
                    {postError && <p>載入貼文詳情失敗: {postError.message}</p>}
                    {createPostError && <p>創建貼文失敗: {createPostError.message}</p>}
                    {commentsError && <p>載入評論失敗: {commentsError.message}</p>}
                    {addCommentError && <p>添加評論失敗: {addCommentError.message}</p>}
                    {uploadError && <p>上傳文件失敗: {uploadError.message}</p>}
                </div>
            )}
            
            {/* 使用者資料展示 */}
            <section className="section">
                <h3>使用者資料</h3>
                
                {isLoadingUsers ? (
                    <p>載入使用者列表中...</p>
                ) : usersError ? (
                    <p>無法載入使用者列表</p>
                ) : (
                    <div className="data-section">
                        <h4>使用者列表</h4>
                        <ul className="item-list">
                            {users?.data?.map((user: User) => (
                                <li key={user.id} className="item">
                                    <strong>{user.name}</strong> - {user.email}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {isLoadingUser ? (
                    <p>載入使用者詳情中...</p>
                ) : userError ? (
                    <p>無法載入使用者詳情</p>
                ) : userData?.data && (
                    <div className="data-section">
                        <h4>使用者詳情</h4>
                        <div className="detail-card">
                            <p><strong>名稱:</strong> {userData.data.name}</p>
                            <p><strong>信箱:</strong> {userData.data.email}</p>
                            <p><strong>電話:</strong> {userData.data.phone}</p>
                            <p><strong>網站:</strong> {userData.data.website}</p>
                            <p><strong>公司:</strong> {userData.data.company.name}</p>
                        </div>
                    </div>
                )}
            </section>
            
            {/* 貼文資料展示 */}
            <section className="section">
                <h3>貼文資料</h3>
                
                <div className="form-panel">
                    <h4>創建新貼文</h4>
                    <form onSubmit={handleSubmitPost}>
                        <div className="form-group">
                            <label htmlFor="postTitle">標題</label>
                            <input
                                type="text"
                                id="postTitle"
                                value={postTitle}
                                onChange={(e) => setPostTitle(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="postBody">內容</label>
                            <textarea
                                id="postBody"
                                value={postBody}
                                onChange={(e) => setPostBody(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isCreatingPost || !postTitle || !postBody}
                        >
                            {isCreatingPost ? '提交中...' : '發布貼文'}
                        </button>
                    </form>
                </div>
                
                {isLoadingPosts ? (
                    <p>載入貼文列表中...</p>
                ) : postsError ? (
                    <p>無法載入貼文列表</p>
                ) : (
                    <div className="data-section">
                        <h4>貼文列表</h4>
                        <ul className="item-list">
                            {posts?.data?.map((post: Post) => (
                                <li key={post.id} className="item">
                                    <strong>{post.title}</strong>
                                    <p>{post.body.substring(0, 100)}...</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {isLoadingPost ? (
                    <p>載入貼文詳情中...</p>
                ) : postError ? (
                    <p>無法載入貼文詳情</p>
                ) : postDetail?.data && (
                    <div className="data-section">
                        <h4>貼文詳情</h4>
                        <div className="detail-card">
                            <h5>{postDetail.data.title}</h5>
                            <p>{postDetail.data.body}</p>
                        </div>
                    </div>
                )}
            </section>
            
            {/* 評論資料展示 */}
            <section className="section">
                <h3>評論資料</h3>
                
                <div className="form-panel">
                    <h4>添加評論</h4>
                    <form onSubmit={handleSubmitComment}>
                        <div className="form-group">
                            <label htmlFor="commentName">名稱</label>
                            <input
                                type="text"
                                id="commentName"
                                value={commentName}
                                onChange={(e) => setCommentName(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="commentEmail">信箱</label>
                            <input
                                type="email"
                                id="commentEmail"
                                value={commentEmail}
                                onChange={(e) => setCommentEmail(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="commentBody">內容</label>
                            <textarea
                                id="commentBody"
                                value={commentBody}
                                onChange={(e) => setCommentBody(e.target.value)}
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isAddingComment || !commentName || !commentEmail || !commentBody}
                        >
                            {isAddingComment ? '提交中...' : '發布評論'}
                        </button>
                    </form>
                </div>
                
                {isLoadingComments ? (
                    <p>載入評論中...</p>
                ) : commentsError ? (
                    <p>無法載入評論</p>
                ) : (
                    <div className="data-section">
                        <h4>貼文評論</h4>
                        <ul className="item-list">
                            {comments?.data?.map((comment: Comment) => (
                                <li key={comment.id} className="item">
                                    <strong>{comment.name}</strong> ({comment.email})
                                    <p>{comment.body}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
            
            {/* 文件上傳展示 */}
            <section className="section">
                <h3>文件上傳</h3>
                
                <div className="upload-panel">
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />
                    
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                    >
                        {isUploading ? '上傳中...' : '上傳文件'}
                    </button>
                    
                    {isUploading && (
                        <div className="progress-bar">
                            <div 
                                className="progress" 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                            <span>{uploadProgress}%</span>
                        </div>
                    )}
                    
                    {file && !isUploading && (
                        <div className="file-info">
                            <p>已選擇: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}; 