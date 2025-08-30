import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './MyPosts.css';

function MyPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    const fetchMyPosts = async (userId) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}/api/author/my-posts/${userId}`);
            const data = await response.json();
            setPosts(data.my_posts || []);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
        if (storedUser && storedUser.id) {
            fetchMyPosts(storedUser.id);
        }
    }, []);

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this submission? This cannot be undone.")) {
            return;
        }
        try {
            const response = await fetch(`${apiBaseUrl}/api/author/my-posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (response.ok) {
                alert("Submission deleted successfully.");
                fetchMyPosts(user.id); // Refresh the list
            } else {
                const data = await response.json();
                alert(`Failed to delete submission: ${data.message}`);
            }
        } catch (error) {
            alert("Server error while deleting.");
        }
    };

    const getStatusClass = (status) => {
        if (status === 'approved') return 'status-approved';
        if (status === 'rejected') return 'status-rejected';
        return 'status-pending';
    };

    return (
        <div className="my-posts-page-wrapper">
            <Navbar />
            <div className="my-posts-container">
                <h1>My Blog Submissions</h1>
                <div className="posts-list">
                    {loading ? <p className="loading-message">Loading your submissions...</p> :
                        posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="post-item-wrapper">
                                    <div className="post-item">
                                        <div className="post-info">
                                            <h3>{post.title}</h3>
                                            <p>Submitted on: {post.submitted_date}</p>
                                        </div>
                                        <div className="post-status">
                                            <span className={`status-badge ${getStatusClass(post.status)}`}>
                                                {post.status}
                                            </span>
                                            {(post.status === 'pending' || post.status === 'rejected') && (
                                                 <button onClick={() => handleDelete(post.id)} className="delete-btn" style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}>Delete</button>
                                            )}
                                        </div>
                                    </div>
                                    {post.status === 'rejected' && post.rejection_reason && (
                                        <div className="rejection-reason">
                                            <strong>Reason for rejection:</strong> {post.rejection_reason}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-posts-message">You have not submitted any blogs yet.</p>
                        )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default MyPosts;