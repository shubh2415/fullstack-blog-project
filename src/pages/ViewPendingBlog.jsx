import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import './SingleBlog.css'; // We can reuse the CSS

function ViewPendingBlog() {
    const { pendingId } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingBlog = useCallback(async () => {
    try {
        setLoading(true);
        setError(''); // Reset error on new fetch

        // SIRF YEH EK LINE HONI CHAHIYE
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/admin/pending-blogs/${pendingId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error('Could not find the pending blog!');
        }

        const data = await response.json();
        setBlog(data);

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}, [pendingId]);

    useEffect(() => {
        fetchPendingBlog();
    }, [fetchPendingBlog]);

    if (loading) return <div className="loading-message">Loading blog preview...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!blog) return <div className="error-message">Blog not found.</div>;

    return (
        <>
            <Navbar />
            <div className="single-blog-page">
                <div className="blog-container">
                    <Link to="/admin-dashboard" className="back-link">← Back to Dashboard</Link>
                    
                    <article className="blog-post">
                        <div className="blog-hero"><img src={blog.image_url} alt={blog.title} /></div>
                        <div className="blog-header">
                            <h1 className="blog-title">{blog.title}</h1>
                            <div className="blog-meta">
                                <img src={blog.author_image_url} alt={blog.author_name} className="author-avatar"/>
                                <div className="author-info">
                                    <span className="author-name">{blog.author_name}</span>
                                    <span className="publish-date">Submitted on: {blog.submitted_date}</span>
                                </div>
                            </div>
                            <div style={{marginTop: '1rem', fontWeight: 'bold'}}>Category: {blog.category}</div>
                        </div>
                        <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} />
                    </article>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ViewPendingBlog;
