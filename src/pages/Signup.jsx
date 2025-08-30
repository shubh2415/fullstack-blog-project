import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState('Normal User');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/signup`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, confirmPassword, userType }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                navigate('/');
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Could not connect to the server. Please try again later.');
        }
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                {message && <p className="error-message" style={{color: 'red'}}>{message}</p>}
                <div className="input-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="userType">User Type</label>
                    <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option value="Normal User">Normal User</option>
                        <option value="Guest Author">Guest Author</option>
                    </select>
                </div>
                <button type="submit">Sign Up</button>
                <div className="form-links">
                    <p>Already have an account? <Link to="/">Login</Link></p>
                </div>
            </form>
        </div>
    );
}

export default Signup;