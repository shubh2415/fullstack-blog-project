// filename: src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
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
        body: JSON.stringify({ email, password, loginType: 'admin' }),
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
      setMessage('Could not connect to the server. Is the backend running?');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <form onSubmit={handleSubmit}>
          <h2>Admin Panel Login</h2>
          {message && <p className="error-message">{message}</p>}
          <div className="input-group">
            <label htmlFor="email">Admin Email</label>
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
          <button type="submit">Login as Admin</button>
        </form>
        <div className="back-link">
          <Link to="/">Go to User Login</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;