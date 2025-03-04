import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Card from './Card';
import '../css/MainContent.css';

function MainContent() {
  return (
    <div className="main-content">
      <h1>Admin Dashboard of the Sac LIFE Mobile App</h1>
      <div className="dashboard-cards">
        <Link to="/Students" style={{ textDecoration: 'none' }}>
          <Card title="Students" content="Manage and view student data" />
        </Link>
        <Link to="/Analytics" style={{ textDecoration: 'none' }}>
          <Card title="Analytics" content="Monitor analytics and performance" />
        </Link>
        <Link to="/Chatbotlogs" style={{ textDecoration: 'none' }}>
          <Card title="Chatbot Logs" content="Access chatbot interaction logs" />
        </Link>
        <Link to="/AdminRoles" style={{ textDecoration: 'none' }}>
          <Card title="Admin Roles" content="Access logs for admin roles" />
        </Link>
      </div>
    </div>
  );
}

export default MainContent;
