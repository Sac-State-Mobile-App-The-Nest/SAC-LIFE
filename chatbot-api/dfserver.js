const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());

//path to the Google service account credentials JSON file
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'credentials', 'service-accountFile.json');

const projectId = "saclifebot-vddv";
const sessionClient = new dialogflow.SessionsClient();

//Route to handle incoming POST requests to the /message endpoint
app.post('/message', async (req, res) => {
  //Extract message from request body
  const { message } = req.body;
  if (!message) {
    console.log('No message in request body');
    return res.status(400).json({ error: 'Message is required' });
  }
  //gen new session id
  const sessionId = uuid.v4();

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0]?.queryResult;

    console.log('Dialogflow response:', responses);
    if (result && result.fulfillmentText) {
      //Send Dialogflow's response text back to the client
      res.json({ response: result.fulfillmentText });
    } else {
      console.log('No fulfillment text found');
      res.status(500).json({ error: 'No response from Dialogflow' });
    }
  } catch (error) {
    console.error('Dialogflow request error:', error);
    // Send JSON error response with error message
    res.status(500).json({ error: 'Error communicating with Dialogflow', details: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));