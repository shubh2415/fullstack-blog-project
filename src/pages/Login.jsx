import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/login`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, loginType: 'user' }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/home');
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Server connection error. Please try again later.');
        }
    };

    return (
        <div className="login-container">
            <h1 className="main-heading">Welcome to MobiBlog</h1>
            <div className="login-card">
                <form onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    {message && <p className="error-message">{message}</p>}
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <div className="extra-links">
                    <Link to="/signup">Signup</Link>
                    <Link to="/guest-login">Guest Author</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;