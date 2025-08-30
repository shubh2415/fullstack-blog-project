import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import './SingleBlog.css';

function SingleBlog() {
    const { blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newComment, setNewComment] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);
    
    const fetchBlog = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`);
            if (!response.ok) throw new Error('Could not find the blog!');
            const data = await response.json();
            setBlog(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [blogId]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        try {
            const response = await fetch(`http://localhost:5000/api/blogs/${blogId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment, userId: currentUser.id }),
            });
            if (response.ok) {
                setNewComment('');
                fetchBlog();
            } else {
                alert("Failed to add comment.");
            }
        } catch (err) {
            alert("Server error.");
        }
    };
    
    const handleCommentDelete = async (commentId) => {
        if (!currentUser || !window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id }),
            });
            if(response.ok) {
                alert("Comment deleted.");
                fetchBlog();
            } else {
                const data = await response.json();
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert("Server error.");
        }
    };

    if (loading) return <div className="loading-message">Loading blog...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!blog) return <div className="error-message">Blog not found.</div>;

    return (
        <div className="single-blog-wrapper">
            <Navbar />
            <div className="single-blog-page">
                <div className="blog-container">
                    <Link to="/home" className="back-link">← All Blogs</Link>
                    
                    <article className="blog-post">
                        <div className="blog-hero"><img src={blog.image_url} alt={blog.title} /></div>
                        <div className="blog-header">
                            <h1 className="blog-title">{blog.title}</h1>
                            {/* --- Author Meta block yahan se hata diya gaya hai --- */}
                        </div>
                        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} />
                    </article>
                    
                    <section className="comments-section">
                        <h3>Comments ({blog.comments?.length || 0})</h3>
                        {currentUser && (
                            <form onSubmit={handleCommentSubmit} className="comment-form">
                                <div className="comment-input-area">
                                    <img src={currentUser.profile_image_url} alt="Your avatar" className="comment-form-avatar" />
                                    <textarea 
                                        value={newComment} 
                                        onChange={(e) => setNewComment(e.target.value)} 
                                        placeholder="Add a public comment..." 
                                        rows="3" 
                                        required 
                                    />
                                </div>
                                <div className="comment-form-actions">
                                    <button type="submit">Post Comment</button>
                                </div>
                            </form>
                        )}
                        <div className="comment-list">
                            {blog.comments && blog.comments.length > 0 ? (
                                blog.comments.map(comment => (
                                    <div key={comment.id} className="comment-card">
                                        <div className="comment-author-avatar">
                                            <img src={comment.commenter_image_url} alt={comment.commenter_name} />
                                        </div>
                                        <div className="comment-body">
                                            <div className="comment-header">
                                                <strong className="comment-author-name">{comment.commenter_name}</strong>
                                                <div className="comment-meta">
                                                    <span>{comment.pub_date}</span>
                                                    {currentUser && currentUser.id === comment.commenter_id && (
                                                        <button onClick={() => handleCommentDelete(comment.id)} className="delete-comment-btn">Delete</button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="comment-text">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-comments-message">Be the first to comment!</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SingleBlog;