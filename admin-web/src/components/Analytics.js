import React from 'react';
import BackButton from '../utils/navigationUtils';
import '../css/Analytics.css';

function Analytics() {
  return (
    <div className="analytics-container">
      <BackButton />

      <h2>Analytics Dashboard</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
        <h3>Total Active Users</h3>
          <p>Daily: 123</p>
          <p>Weekly: 589</p>
          <p>Monthly: 2,430</p>
        </div>
        <div className="analytics-card">
        <h3>New Students</h3>
          <p>This Week: 67</p>
          <p>This Month: 240</p>
        </div>
        <div className="analytics-card">
          <h3>Feature Usage</h3>
          <ul>
            <li>Dashboard: 300 visits</li>
            <li>Calendar: 120 visits</li>
            <li>Resources: 90 visits</li>
          </ul>
        </div>
        <div className="analytics-card">
          <h3>Retention Rate</h3>
          <p>% of returning users</p>
        </div>
        <div className="analytics-card">
          <h3>Session Duration</h3>
          <p>5 min 32 sec</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
