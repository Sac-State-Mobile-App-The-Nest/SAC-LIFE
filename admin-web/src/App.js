import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainContent from './components/mainContent'; 
import Students from './components/Students';
import ChatbotLogs from './components/Chatbotlogs';
import Analytics from './components/Analytics';
import LogIn from './components/LogIn';
import AdminRoles from './components/AdminRoles';
import { api, logoutAdmin } from './api/api'; 
import './css/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));

   /**
   * Check authentication state and refresh the token if necessary.
   */
   useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      const refreshToken = sessionStorage.getItem('refreshToken');

      if (!token && refreshToken) {
        console.warn("No access token found, attempting refresh...");
        try {
          const response = await api.post('/admin_routes/admin_login/admin_refresh', { refreshToken });

          if (response.data.accessToken) {
            sessionStorage.setItem('token', response.data.accessToken);
            setIsAuthenticated(true);
          } else {
            console.warn("Refresh token invalid, logging out...");
            logoutAdmin();
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
          logoutAdmin();
        }
      } else {
        setIsAuthenticated(!!token);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <div className="dashboard fade-in">
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LogIn setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/" element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />}/>
            <Route path="/Students" element={isAuthenticated ? <Students /> : <Navigate to="/login" />}/>
            <Route path="/Chatbotlogs" element={isAuthenticated ? <ChatbotLogs /> : <Navigate to="/login" />}/>
            <Route path="/Analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}/>
            <Route path="/adminRoles" element={isAuthenticated ? <AdminRoles /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
