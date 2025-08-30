import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AddBlog.css';

function AddBlog({ isAdmin = false }) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    // --- NEW: State for category ---
    const [category, setCategory] = useState('General'); 
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
            return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        const userType = parsedUser.user_type;

        if (isAdmin && userType !== 'Admin') {
            alert("You do not have permission to access this page.");
            navigate('/home');
        } else if (!isAdmin && userType !== 'Guest Author') {
            alert("You do not have permission to access this page.");
            navigate('/home');
        } else {
            setUser(parsedUser);
        }
    }, [navigate, isAdmin]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !image || !user || !category) {
            setMessage('Please fill in all fields, select a category, and select an image.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', image);
        formData.append('userId', user.id);
        // --- UPDATE: Append category to form data ---
        formData.append('category', category);

        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const endpoint = isAdmin ? `${baseUrl}/api/admin/blogs/create` : `${baseUrl}/api/blogs/submit`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                navigate(isAdmin ? '/admin-dashboard' : '/home');
            } else {
                setMessage(data.message || 'An error occurred.');
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
                    <h2>{isAdmin ? 'Create a New Blog' : 'Submit a New Blog'}</h2>
                    <p>{isAdmin ? 'This blog will be published immediately.' : 'Your blog will be reviewed by an administrator before publishing.'}</p>
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
                        {/* --- NEW: Category Select Dropdown --- */}
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
                            <label htmlFor="image">Featured Image</label>
                            <input type="file" id="image" accept="image/*" onChange={handleImageChange} required />
                        </div>
                        <button type="submit">{isAdmin ? 'Publish Blog' : 'Submit for Review'}</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AddBlog;