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
async function insertChatLog(stdId, studentQuestion, botResponse) {
  try {
      let pool = await sql.connect(config);
      let request = pool.request()
          .input('student_question', sql.NVarChar(sql.MAX), studentQuestion)
          .input('bot_response', sql.NVarChar(sql.MAX), botResponse);

      let query;

      if (stdId) {
          request.input('stdId', sql.Int, stdId);
          query = `
              INSERT INTO chat_logs (std_id, student_question, bot_response) 
              VALUES (@stdId, @student_question, @bot_response)
          `;
      } else {
          query = `
              INSERT INTO chat_logs (student_question, bot_response) 
              VALUES (@student_question, @bot_response)
          `;
      }

      await request.query(query);
      console.log('Chat log inserted successfully');
      sql.close();
  } catch (err) {
      console.error('SQL error:', err);
      sql.close();
  }
}




app.post('/message', async (req, res) => {
  try {
    const { message, username } = req.body;

    let pool = await sql.connect(config);
    let stdId = null;

    if (username) {
        // Fetch std_id from login_info based on username
        let stdIdResult = await pool.request()
            .input('username', sql.NVarChar(255), username)
            .query('SELECT std_id FROM login_info WHERE username = @username');

        if (stdIdResult.recordset.length > 0) {
            stdId = stdIdResult.recordset[0].std_id;
        }
    }
   

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', 
        messages: [
          { 
            role: "system", 
            content: `
            You are SacLifeBot, a helpful chatbot for Sac State students. 
            You assist students in navigating campus, finding resources, and answering common university-related questions. 
            Keep responses friendly, concise, and helpful. 
            If possible provide a link to your source you got your information. 
            When asked about restaurants on campus, ensure the restaurant exists on campus and isn't a random one and give this link: https://www.dining.csus.edu/campus-eateries-2/. 
            When giving a date regarding the academic affair calendar, provide this link: https://events.csus.edu/sac-state-academic-calendar#/?i=6. 
            For requests regarding graduation applications give this link https://www.csus.edu/student-life/records-transcripts/graduation-advising/apply-to-graduate.html . 
            requets involving building or location and directions  give this link as well https://www.csus.edu/campusmap/ . 
            requests on registering for or adding classes give this link https://www.csus.edu/student-life/class-schedules/registration/ . 
            questions regarding the well give this website unless its directions then give the map https://thewellatsacstate.com/# . 
            questions regarding the union give the union website https://theuniversityunion.com/ . 
            questions regarding clubs give this link https://csus.campusgroups.com/club_signup .
            regarding the athletic center questions give this link https://www.csus.edu/student-affairs/centers-programs/student-athlete-resource-center/ . 
            if someone wants to know whats going on on campus event wise give this link to show all events https://events.csus.edu/ .

            for sport schedule questions give this link and tell them that you can filter home and away game along with the sport in question https://hornetsports.com/calendar .
            If a request has nothing to do with Sac State, respond  with 'I'm not sure' and guide the conversation back to Sacramento State." 
          `
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
    insertChatLog(stdId, message, botResponse);
 
  } catch (error) {
    console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch response from OpenAI' });
    }
  }
});
app.get('/api/students/getLoggedInUser', async (req, res) => {
  try {
      const token = req.headers.authorization?.split(' ')[1]; // Extract JWT token
      if (!token) return res.status(401).json({ error: "Unauthorized" });

      let pool = await sql.connect(config);

      // Assuming JWT token is associated with a user in login_info
      let userResult = await pool.request()
          .input('token', sql.NVarChar(255), token)
          .query(`
              SELECT username 
              FROM login_info
              WHERE token = @token
          `);

      if (userResult.recordset.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      res.json(userResult.recordset[0]); // Return { username: "exampleUser" }

  } catch (err) {
      console.error('SQL error:', err);
      res.status(500).json({ error: "Failed to retrieve logged-in user" });
  }
});



app.listen(3000, () => console.log('Server running on port 3000'));
