import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './AddBlog.css'; // We can reuse the CSS from AddBlog

function UpdateBlog() {
    const { blogId } = useParams();
    const navigate = useNavigate();
    
    // --- NEW: State to hold current user info ---
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('General');
    const [image, setImage] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // --- NEW: Get user from localStorage when component loads ---
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const fetchBlogDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/blogs/${blogId}`);
                const data = await response.json();
                setTitle(data.title);
                setContent(data.content);
                setCurrentImageUrl(data.image_url);
                setCategory(data.category);
            } catch (error) {
                setMessage("Failed to fetch blog details.");
            }
        };
        fetchBlogDetails();
    }, [blogId]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // --- FIX: Check if user exists before submitting ---
        if (!user) {
            setMessage("Could not verify admin user. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        if (image) {
            formData.append('image', image);
        }
        // --- FIX: Append the admin's user ID for backend authorization ---
        formData.append('adminUserId', user.id);

        try {
          const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/blogs/${blogId}`;
          const response = await fetch(apiUrl,{
                method: 'PUT',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                navigate('/admin-dashboard');
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Could not connect to the server.');
        }
    };

    return (
        <>
            <Navbar />
            <div className="add-blog-container">
                <div className="add-blog-card">
                    <h2>Update Blog Post</h2>
                    {message && <p className="message">{message}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="title">Blog Title</label>
                            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="content">Blog Content</label>
                            <textarea id="content" rows="10" value={content} onChange={(e) => setContent(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="category">Category</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                <option value="General">General</option>
                                <option value="Tech">Tech</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="News">News</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Current Image</label>
                            {currentImageUrl && <img src={currentImageUrl} alt="Current" style={{width: '150px', marginBottom: '10px'}}/>}
                            <br/>
                            <label htmlFor="image">Change Featured Image (Optional)</label>
                            <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                        </div>
                        <button type="submit">Update Blog</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default UpdateBlog;