import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainContent from './components/mainContent'; 
import Users from './components/Users';
import ChatbotLogs from './components/Chatbotlogs.js';
import Analytics from './components/Analytics.js';
import './css/App.css'; 

function App() {
  return (
    <Router>
      <div className="dashboard fade-in"> {/* Add fade-in class here */}
        <div className="main-content">
          <Routes>
            <Route path="/Users" element={<Users />} />
            <Route path="/Chatbotlogs" element={<ChatbotLogs />} />
            <Route path="/Analytics" element={<Analytics />} />
            <Route path="/" element={<MainContent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;