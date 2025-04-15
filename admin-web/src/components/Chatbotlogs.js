import React, { useState, useEffect, useCallback } from 'react';
import '../css/ChatbotLogs.css';
import BackButton from '../utils/navigationUtils';
import { useNavigate } from 'react-router-dom';
import { api, logoutAdmin, refreshAccessToken } from '../api/api';

function ChatbotLogs() {
  const [logs, setLogs] = useState([]);
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();


  const handleDelete = async (logId) => {
    let token = sessionStorage.getItem('token');
    if (!token) {
      logoutAdmin(navigate);
      return;
    }

    try {
      await api.delete(`/adminRoutes/chatbot-logs/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      
      setLogs((prev) => prev.filter((log) => log.id !== logId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete log');
    }
  };

  
  const getAdminRole = useCallback(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        setRole(decodedPayload.role);
      } catch (err) {
        console.error('Error decoding token:', err);
        logoutAdmin(navigate);
      }
    }
  }, [navigate]);

  
  const fetchLogs = useCallback(async () => {
    let token = sessionStorage.getItem('token');
    if (!token) {
      logoutAdmin(navigate);
      return;
    }

    try {
      const response = await api.get('/adminRoutes/chatbot-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("Token expired. Trying refresh...");
        token = await refreshAccessToken();
        if (!token) return;

        const retry = await api.get('/adminRoutes/chatbot-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(retry.data);
      } else {
        console.error('Failed to fetch chatbot logs:', error.message);
        setError('Failed to load logs');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchLogs();
    getAdminRole();
  }, [fetchLogs, getAdminRole]);

 
  const filteredLogs = logs.filter((log) =>
    (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (log.student_question && log.student_question.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="chatbotlogs-container">
      <BackButton />
      <h2>Chatbot Logs</h2>

      <input
        type="text"
        placeholder="Search by username or question..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="chatbotlogs-grid">
        {filteredLogs.map((log, index) => (
          <div key={index} className="chatbotlog-card">
            <h3>User: {log.username}</h3>
            <p><strong>Prompt:</strong> {log.student_question}</p>
            <p><strong>Bot Response:</strong> {log.bot_response}</p>
            <p className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</p>
            {role === 'super-admin' && (
  <button className="delete-button" onClick={() => handleDelete(log.id)}>
    Delete
  </button>
)}


          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatbotLogs;
