import React from 'react';
import BackButton from '../utils/navigationUtils'; // Update path if needed
import '../css/ChatbotLogs.css';

function ChatbotLogs() {
  return (
    <div className="chatbotlogs-container">
      <BackButton />
      <h2>Chatbot Logs</h2>

      <div className="chatbotlogs-grid">
        {/* Example cards - replace with mapped data */}
        <div className="chatbotlog-card">
          <h3>User: JohnDoe</h3>
          <p>Prompt: "How do I drop a class?"</p>
          <p>Bot Response: "You can drop a class in your Student Center under Enrollment."</p>
          <p className="log-timestamp">March 24, 2025 · 3:45 PM</p>
        </div>

        <div className="chatbotlog-card">
          <h3>User: JaneSmith</h3>
          <p>Prompt: "Where’s the financial aid office?"</p>
          <p>Bot Response: "It's located in Lassen Hall, Room 1003."</p>
          <p className="log-timestamp">March 23, 2025 · 1:18 PM</p>
        </div>

        {/* Map your logs here */}
      </div>
    </div>
  );
}

export default ChatbotLogs;