require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai'); 
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); 
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);


app.post('/message', async (req, res) => {
  try {
      const { message } = req.body;

      const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
              model: 'gpt-3.5-turbo',
              messages: [
                { 
                    role: "system", 
                    content: "You are SacLifeBot, a helpful chatbot for Sac State students. You assist students in navigating campus, finding resources, and answering common university-related questions. Keep responses friendly, concise, and helpful." 
                },
                { 
                    role: "user", 
                    content: message 
                }
            ],
          },
          {
              headers: {
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json'
              }
          }
      );

      res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
      console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
  }
});



app.listen(3000, () => console.log('Server running on port 3000'));

