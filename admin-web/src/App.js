import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import MainContent from './components/mainContent'; 
import Students from './components/Students';
import ChatbotLogs from './components/Chatbotlogs';
import Analytics from './components/Analytics';
import LogIn from './components/LogIn';
import AdminRoles from './components/AdminRoles';
import './css/App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if user is logged in

  return (
    <Router>
      <div className="dashboard fade-in">
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<LogIn />} />
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
