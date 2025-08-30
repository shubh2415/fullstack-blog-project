import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingBlogs, setPendingBlogs] = useState([]);
    const [publishedBlogs, setPublishedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [pendingRes, publishedRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/admin/pending-blogs`),
                fetch(`${apiBaseUrl}/api/blogs`)
            ]);
            const pendingData = await pendingRes.json();
            const publishedData = await publishedRes.json();
            setPendingBlogs(pendingData.pending_blogs || []);
            setPublishedBlogs(publishedData.blogs || []);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchAllData();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve and publish this blog?")) return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/blogs/approve/${id}`, { method: 'POST' });
            if (response.ok) {
                alert("Blog approved and published!");
                await fetchAllData();
            } else {
                alert("Failed to approve blog.");
            }
        } catch (error) {
            alert("Server error during approval.");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Please provide a reason for rejecting this blog:");
        if (reason === null) return;
        if (!reason.trim()) {
            alert("Rejection reason cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/blogs/reject/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (response.ok) {
                alert("Blog rejected successfully.");
                await fetchAllData();
            } else {
                alert("There was a problem rejecting the blog.");
            }
        } catch (error) {
            console.error("Rejection error:", error);
            alert("Server error during rejection.");
        }
    };

    const handleDeletePublished = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this blog? This action cannot be undone.")) return;
        if (!user) {
            alert("Could not verify admin user. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/blogs/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUserId: user.id })
            });

            if (response.ok) {
                alert("Blog deleted successfully.");
                await fetchAllData();
            } else {
                const data = await response.json();
                alert(`Failed to delete blog: ${data.message}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Server error during deletion.");
        }
    };
    
    return (
        <div className="admin-dashboard-page-wrapper">
            <Navbar />
            <div className="admin-dashboard-container">
                <h1>Admin Dashboard</h1>
                
                <div className="dashboard-tabs">
                    <button onClick={() => setActiveTab('pending')} className={activeTab === 'pending' ? 'active' : ''}>
                        Pending Submissions ({pendingBlogs.length})
                    </button>
                    <button onClick={() => setActiveTab('published')} className={activeTab === 'published' ? 'active' : ''}>
                        Manage Published Blogs ({publishedBlogs.length})
                    </button>
                </div>
                
                <div className="dashboard-content">
                    {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
                        activeTab === 'pending' ? (
                            <div className="blogs-list">
                                {pendingBlogs.length > 0 ? pendingBlogs.map(blog => (
                                    <div key={blog.id} className="list-item">
                                        <div className="item-info">
                                            <h3>{blog.title}</h3>
                                            <p>by {blog.author_name} on {blog.submitted_date}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => navigate(`/admin/view-pending/${blog.id}`)} className="view-btn">View</button>
                                            <button onClick={() => handleApprove(blog.id)} className="approve-btn">Approve</button>
                                            <button onClick={() => handleReject(blog.id)} className="reject-btn">Reject</button>
                                        </div>
                                    </div>
                                )) : <p style={{ textAlign: 'center' }}>No blogs are currently pending for approval.</p>}
                            </div>
                        ) : (
                            <div className="blogs-list">
                                {publishedBlogs.length > 0 ? publishedBlogs.map(blog => (
                                    <div key={blog.id} className="list-item">
                                        <div className="item-info">
                                            <h3>{blog.title}</h3>
                                            <p>by {blog.author_name} on {blog.pub_date}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => navigate(`/update-blog/${blog.id}`)} className="update-btn">Update</button>
                                            <button onClick={() => handleDeletePublished(blog.id)} className="delete-btn">Delete</button>
                                        </div>
                                    </div>
                                )) : <p style={{ textAlign: 'center' }}>No blogs have been published yet.</p>}
                            </div>
                        )
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default AdminDashboard;