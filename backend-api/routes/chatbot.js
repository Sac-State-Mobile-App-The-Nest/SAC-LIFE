const express = require('express');
require('dotenv').config();
const router = express.Router();
const axios = require('axios');
const sql = require('mssql');
const config = require('../config'); 


// Chat message handler
router.post('/message', async (req, res) => {
  try {
    const { message, std_id } = req.body;

    if (!message || !std_id) {
      return res.status(400).json({ error: 'Message and std_id are required.' });
    }

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
      ? `This student has the following tags: ${tags.join(', ')}.`
      : 'No tag data is available for this student.';

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `
              You are HerkyBot, an AI assistant for Sac State students.
              Answer using the following context:
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
              - **Campus transportation:** [herky streetcar](https://www.csus.edu/parking-transportation/shuttle/)

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
    console.error('OpenAI API Error:', error.message);
    res.status(500).json({ error: 'Failed to process message.' });
  }
});

// Get chat history
router.get('/chat-history/:stdId', async (req, res) => {
  try {
    const stdId = req.params.stdId;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('stdId', sql.Int, stdId)
      .query(`
        SELECT id, student_question, bot_response, timestamp 
        FROM chat_logs 
        WHERE std_id = @stdId 
        ORDER BY id ASC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Chat history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Delete chat logs for a user
router.delete('/clear-chat/:stdId', async (req, res) => {
  try {
    const stdId = req.params.stdId;
    const pool = await sql.connect(config);

    await pool.request()
      .input('stdId', sql.Int, stdId)
      .query('DELETE FROM chat_logs WHERE std_id = @stdId');

    res.json({ message: 'Chat history cleared.' });
  } catch (err) {
    console.error('Clear chat error:', err.message);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router;
