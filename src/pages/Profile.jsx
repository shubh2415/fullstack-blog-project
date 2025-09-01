import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/');
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setPreviewImage(parsedUser.profile_image_url);
        }
    }, [navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profileImage) {
            setMessage('Please select an image to upload.');
            setMessageType('error');
            return;
        }

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('profileImage', profileImage);

        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/user/profile-image`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setMessageType('success');
                
                // Update user info in localStorage
                const updatedUser = { ...user, profile_image_url: data.profile_image_url };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                
                // Signal to other components (like Navbar) that storage has changed
                window.dispatchEvent(new Event('storageUpdated'));
            } else {
                setMessage(data.message || 'An error occurred.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Could not connect to the server.');
            setMessageType('error');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <div className="profile-card">
                    <h2>My Profile</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="profile-image-section">
                            <img src={previewImage || 'https://i.ibb.co/6881v2D/default-avatar.png'} alt="Profile Preview" className="profile-preview" />
                            <label htmlFor="profile-image-upload" className="upload-button">
                                Choose Image
                            </label>
                            <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {profileImage && <p className="file-name">Selected: {profileImage.name}</p>}

                        <div className="user-details">
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.user_type}</p>
                        </div>
                        
                        {message && <p className={`message ${messageType}`}>{message}</p>}

                        <button type="submit" className="save-button">Save Changes</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Profile;
