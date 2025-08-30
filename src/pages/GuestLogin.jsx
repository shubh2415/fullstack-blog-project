import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './GuestLogin.css';

function GuestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      // **FIX:** Use the new unified login endpoint
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: 'guest' }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(data.message);
        navigate('/home');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Server connection error.');
    }
  };

  return (
    <div className="guest-login-container">
      <h1 className="main-heading">Welcome to MobiBlog</h1>
      <div className="guest-login-card">
        <form onSubmit={handleSubmit}>
          <h2>Guest Author Login</h2>
          {message && <p className="error-message">{message}</p>}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Login as Guest</button>
          <div className="form-links">
            <Link to="/">Back to Main Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GuestLogin;
