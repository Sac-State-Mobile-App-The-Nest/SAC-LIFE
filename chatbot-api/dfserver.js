require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sql = require('mssql'); 

const app = express();
app.use(cors());
app.use(express.json());

//SQL Server connection configuration.
const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, 
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true, 
  }
};

//Function to insert a chat log into the SQL database
async function insertChatLog(studentQuestion, botResponse) {
  try {
    let pool = await sql.connect(config);
    await pool.request()
      .input('student_question', sql.NVarChar(sql.MAX), studentQuestion)
      .input('bot_response', sql.NVarChar(sql.MAX), botResponse)
      .query('INSERT INTO chat_logs (student_question, bot_response) VALUES (@student_question, @bot_response)');
    console.log('Chat log inserted successfully');
    sql.close(); 
  } catch (err) {
    console.error('SQL error:', err);
    sql.close();
  }
}

app.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', 
        messages: [
          { 
            role: "system", 
            content: "You are SacLifeBot, a helpful chatbot for Sac State students. You assist students in navigating campus, finding resources, and answering common university-related questions. Keep responses friendly, concise, and helpful. If possible provide a link to your source you got your information. When asked about restaurants on campus, ensure the restaurant exists on campus and isn't a random one and give this link: https://www.dining.csus.edu/campus-eateries-2/. When giving a date regarding the academic affair calendar, provide this link: https://events.csus.edu/sac-state-academic-calendar#/?i=6. For requests regarding graduation applications give this link https://www.csus.edu/student-life/records-transcripts/graduation-advising/apply-to-graduate.html . any requets involving building or location and directions  give this link as well https://www.csus.edu/campusmap/ . any requests on registering for or adding classes give this link https://www.csus.edu/student-life/class-schedules/registration/ . any questions regarding the well give this website unless its directions then give the map https://thewellatsacstate.com/# . questions regarding the union give the union website https://theuniversityunion.com/ . If a request has nothing to do with Sac State, respond vaguely with 'I'm not sure' and guide the conversation back to Sacramento State." 
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

    // Extract the bot response
    const botResponse = response.data.choices[0].message.content;
    res.json({ response: botResponse });

    // Log the chat into the SQL database
    insertChatLog(message, botResponse);
  } catch (error) {
    console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
