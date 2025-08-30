import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    
    useEffect(() => {
        const updateUserState = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        };

        // Call it once on component mount
        updateUserState();

        // Listen for the custom event from the Profile page
        window.addEventListener('storageUpdated', updateUserState);
        
        // Also listen for direct storage changes (e.g., from another tab)
        window.addEventListener('storage', updateUserState);

        // Cleanup the event listeners on component unmount
        return () => {
            window.removeEventListener('storageUpdated', updateUserState);
            window.removeEventListener('storage', updateUserState);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setDropdownVisible(false);
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return `${names[0][0]}`.toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home" className="navbar-logo"><span>✒️</span>MobiBlog</Link>
                <div className="navbar-menu">
                    {user && user.user_type === 'Guest Author' && (
                        <>
                            <Link to="/add-blog" className="nav-button">Add Blog</Link>
                            <Link to="/my-posts" className="nav-button">My Posts</Link>
                        </>
                    )}
                    {user && user.user_type === 'Admin' && (
                        <>
                            <Link to="/admin/create-blog" className="nav-button">Create Blog</Link>
                            <Link to="/admin-dashboard" className="nav-button">Dashboard</Link>
                        </>
                    )}

                    {user ? (
                        <div className="profile-section">
                            <div className="profile-icon-wrapper" onClick={() => setDropdownVisible(!dropdownVisible)}>
                                {user.profile_image_url && !user.profile_image_url.includes('default.png') ? (
                                    <img src={user.profile_image_url} alt="Profile" className="profile-image"/>
                                ) : (
                                    <div className="profile-initials">{getInitials(user.name)}</div>
                                )}
                            </div>
                            {dropdownVisible && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-item user-info">
                                        <strong>{user.name}</strong><br/><small>{user.email}</small>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownVisible(false)}>Profile</Link>
                                    <div className="dropdown-divider"></div>
                                    <button onClick={handleLogout} className="dropdown-item logout-btn">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (<Link to="/" className="nav-links">Login</Link>)}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;