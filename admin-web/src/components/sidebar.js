import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav>
      <ul>
        <li><Link to="/users">Users</Link></li>
      </ul>
    </nav>
  );
}

export default Sidebar;