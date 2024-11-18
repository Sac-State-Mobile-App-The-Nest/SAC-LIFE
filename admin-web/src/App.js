import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainContent from './components/mainContent'; 
import Users from './components/Users';
import ChatbotLogs from './components/Chatbotlogs';
import Analytics from './components/Analytics';
import LogIn from './components/LogIn';
import './css/App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if user is logged in

  return (
    <Router>
      <div className="dashboard fade-in">
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route
              path="/"
              element={isAuthenticated ? <MainContent /> : <Navigate to="/login" />}
            />
            <Route
              path="/Users"
              element={isAuthenticated ? <Users /> : <Navigate to="/login" />}
            />
            <Route
              path="/Chatbotlogs"
              element={isAuthenticated ? <ChatbotLogs /> : <Navigate to="/login" />}
            />
            <Route
              path="/Analytics"
              element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
