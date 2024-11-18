import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Card from './Card';
import '../css/MainContent.css';

function MainContent() {
  return (
    <div className="main-content">
      <h1>Admin Dashboard of the Sac State Mobile App</h1>
      <div className="dashboard-cards">
        <Link to="/Users" style={{ textDecoration: 'none' }}>
          <Card title="Users" content="Manage and view user data" />
        </Link>
        <Link to="/Analytics" style={{ textDecoration: 'none' }}>
          <Card title="Analytics" content="Monitor analytics and performance" />
        </Link>
        <Link to="/Chatbotlogs" style={{ textDecoration: 'none' }}>
          <Card title="Chatbot Logs" content="Access chatbot interaction logs" />
        </Link>
      </div>
    </div>
  );
}

export default MainContent;
