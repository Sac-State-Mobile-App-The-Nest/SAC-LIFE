// components/LogIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/LogIn.css';
import { api, refreshAccessToken, logoutAdmin } from '../api/api'; // ✅ Import missing functions

function LogIn({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate(); 

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(''); 
    setLoading(true);
    
    try {
      const response = await api.post('/admin_login', { username, password });
      
      if (response.data.token && response.data.refreshToken) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        setError('Login successful, but no token received.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
      <h2 className="login-title">Sac LIFE Admin Portal</h2>
        
        {error && <p className="error-message">{error}</p>} {/* Inline Error Message */}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

export default LogIn;
