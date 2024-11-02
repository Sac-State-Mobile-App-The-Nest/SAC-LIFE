import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/sidebar'; 
import MainContent from './components/mainContent'; 
import Users from './components/Users';
import './App.css'; 

function App() {
  return (
    <Router>
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/users" element={<Users />} />
          {/* Default route */}
          <Route path="/" element={<MainContent />} />
        </Routes>
      </div>
    </div>
  </Router>
  );
}

export default App;
