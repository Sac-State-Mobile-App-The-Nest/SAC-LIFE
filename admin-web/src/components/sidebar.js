import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav>
      <ul>
        <li><Link to="/Users">Users</Link></li>
        <li><Link to="/Content">Content</Link></li>
        <li><Link to="/Chatbotlogs">Chatbot Logs</Link></li>
        <li><Link to="/Analytics">Analytics</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;