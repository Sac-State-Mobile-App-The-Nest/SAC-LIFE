const request = require('supertest');
const express = require('express');
const chatbotRoutes = require('../routes/chatbot');
const sql = require('mssql');
const axios = require('axios');

jest.mock('axios');
jest.mock('mssql');

const app = express();
app.use(express.json());
app.use('/api/chatbot', chatbotRoutes);

// Mock SQL request chain
const mockQuery = jest.fn();
const mockRequest = {
  input: () => mockRequest,
  query: mockQuery,
};
sql.connect.mockResolvedValue({ request: () => mockRequest });

describe(' Chatbot API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/chatbot/message', () => {
    test(' Returns a bot response when message and std_id are valid', async () => {
      // Mock DB tag lookup
      mockQuery
        .mockResolvedValueOnce({ recordset: [{ tag_name: 'freshman' }] }) 
        .mockResolvedValueOnce({}); 

      // Mock OpenAI API response
      axios.post.mockResolvedValue({
        data: {
          choices: [{ message: { content: 'This is a test bot reply' } }],
        },
      });

      const res = await request(app)
        .post('/api/chatbot/message')
        .send({ message: 'What is registration?', std_id: 123 });

      expect(res.statusCode).toBe(200);
      expect(res.body.response).toContain('test bot reply');
    });

    test(' Missing message field → should return 400', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({ std_id: 123 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Message and std_id are required.');
    });

    test(' Missing std_id field → should return 400', async () => {
      const res = await request(app)
        .post('/api/chatbot/message')
        .send({ message: 'Where is the library?' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Message and std_id are required.');
    });
  });

  describe('GET /api/chatbot/chat-history/:stdId', () => {
    test(' Returns chat history for a student', async () => {
      const mockLogs = [
        {
          id: 1,
          student_question: 'Hi?',
          bot_response: 'Hello!',
          timestamp: '2025-05-01T02:33:02.006Z',
        },
      ];

      mockQuery.mockResolvedValueOnce({ recordset: mockLogs });

      const res = await request(app).get('/api/chatbot/chat-history/123');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockLogs);
    });

    test('Invalid student ID → returns 500 error from DB', async () => {
      mockQuery.mockImplementationOnce(() => {
        throw new Error('Simulated DB error');
      });

      const res = await request(app).get('/api/chatbot/chat-history/999');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Failed to fetch chat history');
    });
  });

  describe('DELETE /api/chatbot/clear-chat/:stdId', () => {
    test(' Successfully clears chat history', async () => {
      mockQuery.mockResolvedValueOnce({});

      const res = await request(app).delete('/api/chatbot/clear-chat/123');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/cleared/i);
    });

    test(' DB error while clearing chat history → returns 500', async () => {
      mockQuery.mockImplementationOnce(() => {
        throw new Error('Simulated clear error');
      });

      const res = await request(app).delete('/api/chatbot/clear-chat/123');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('error', 'Failed to clear chat history');
    });
  });
});
