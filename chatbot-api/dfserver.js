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
    const { message, std_id } = req.body;

    if (!message || !std_id) {
      return res.status(400).json({ error: 'Message and std_id are required.' });
    }

    //Fetch tags for the student
    const pool = await sql.connect(config);
    const tagResult = await pool.request()
      .input('stdId', sql.Int, std_id)
      .query(`
        SELECT t.tag_name 
        FROM test_student_tags st
        JOIN test_tags t ON st.tag_id = t.tag_id
        WHERE st.std_id = @stdId
      `);
    
    const tags = tagResult.recordset.map(row => row.tag_name);
    const tagDescription = tags.length > 0
      ? `This student has the following tags: ${tags.join(', ')}. Use this to personalize responses.`
      : 'No tag data is available for this student.';

    //Generate  response
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `
              You are HerkyBot, an AI assistant for Sac State students.
              Answer questions concisely and helpfully using the following context.
              ${tagDescription}

              - **Dining:** [Dining Info](https://www.dining.csus.edu/campus-eateries-2/)
              - **Academic Calendar:** [Events Calendar](https://events.csus.edu/sac-state-academic-calendar#/?i=6)
              - **Graduation:** [Apply to Graduate](https://www.csus.edu/student-life/records-transcripts/graduation-advising/apply-to-graduate.html)
              - **Campus Map:** [Campus Map](https://www.csus.edu/campusmap/)
              - **Registration:** [Class Schedules](https://www.csus.edu/student-life/class-schedules/registration/)
              - **The WELL:** [The WELL](https://thewellatsacstate.com/#)
              - **Union:** [University Union](https://theuniversityunion.com/)
              - **Clubs:** [Club Signup](https://csus.campusgroups.com/club_signup)
              - **Athletics:** [Athletic Center](https://www.csus.edu/student-affairs/centers-programs/student-athlete-resource-center/)
              - **Events:** [Campus Events](https://events.csus.edu/)
              - **Sports:** [Hornet Sports](https://hornetsports.com/calendar)
              - **Parking:** [Permit Pricing](https://www.csus.edu/parking-transportation/parking/permit-pricing.html)
              - **Library:** [Library](https://library.csus.edu/)

              If unrelated to Sac State, reply: "I'm not sure. Let's get back to campus-related topics!"
            `
          },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const botResponse = response.data.choices[0].message.content;

    //Save to chat_logs
    await pool.request()
      .input('stdId', sql.Int, std_id)
      .input('student_question', sql.NVarChar(sql.MAX), message)
      .input('bot_response', sql.NVarChar(sql.MAX), botResponse)
      .query(`
        INSERT INTO chat_logs (std_id, student_question, bot_response)
        VALUES (@stdId, @student_question, @bot_response)
      `);

    res.json({ response: botResponse });

  } catch (error) {
    console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message.' });
    }
  }
});



app.get('/api/students/getLoggedInUser', async (req, res) => {
  try {
      const { username } = req.query; 
      if (!username) {
          console.error("No username provided");
          return res.status(400).json({ error: "Username is required" });
      }

      console.log("Received username:", username);

      let pool = await sql.connect(config);

      let userResult = await pool.request()
          .input('username', sql.NVarChar(255), username)
          .query(`
              SELECT username, std_id 
              FROM login_info
              WHERE username = @username
          `);

      if (userResult.recordset.length === 0) {
          console.error("No user found for username:", username);
          return res.status(404).json({ error: "User not found" });
      }

      console.log("User found:", userResult.recordset[0]);

      res.json(userResult.recordset[0]); 

  } catch (err) {
      console.error(' SQL error:', err);
      res.status(500).json({ error: "Failed to retrieve logged-in user" });
  }
});

app.get('/chat-history/:stdId', async (req, res) => {
  try {
      const stdId = req.params.stdId;
      console.log(" Fetching chat history for std_id:", stdId);

      let pool = await sql.connect(config);

      let chatResult = await pool.request()
          .input('stdId', sql.Int, stdId)
          .query(`
              SELECT student_question, bot_response 
              FROM chat_logs 
              WHERE std_id = @stdId
              ORDER BY id ASC
          `);

      if (chatResult.recordset.length === 0) {
          console.error(` No chat history found for std_id: ${stdId}`);
          return res.status(404).json({ error: "No chat history found" });
      }

      console.log("Chat history retrieved:", chatResult.recordset);
      res.json(chatResult.recordset);

  } catch (err) {
      console.error(" SQL error fetching chat history:", err);
      res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

app.delete('/clear-chat/:stdId', async (req, res) => {
  try {
      const stdId = req.params.stdId;
      const pool = await sql.connect(config);

      await pool.request()
          .input('stdId', sql.Int, stdId)
          .query('DELETE FROM chat_logs WHERE std_id = @stdId');

      res.json({ message: 'Chat history cleared successfully.' });
  } catch (err) {
      console.error('Error clearing chat history:', err);
      res.status(500).json({ error: 'Failed to clear chat history.' });
  }
});












app.listen(3000, () => console.log('Server running on port 3000'));
