import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/sidebar'; 
import MainContent from './components/mainContent'; 
import Users from './components/Users';
import Content from './components/Content.js';
import ChatbotLogs from './components/Chatbotlogs.js';
import Analytics from './components/Analytics.js';
import './App.css'; 

function App() {
  return (
    <Router>
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/Users" element={<Users />} />
          <Route path="/Content" element={<Content />} />
          <Route path="/Chatbotlogs" element={<ChatbotLogs />} />
          <Route path="/Analytics" element={<Analytics />} />
          {/* Default route */}
          <Route path="/" element={<MainContent />} />
        </Routes>
      </div>
    </div>
  </Router>
  );
}

export default App;
