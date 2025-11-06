const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//



const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID, CLIENT_SECRET, REDIRECT_URI
);
//Opens Main Website 
const path = require('path');
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Step 1: Redirect user to Google's OAuth 2.0 server
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  res.redirect(url);
});

// Step 2: Handle OAuth2

app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    // Redirect to frontend with tokens in URL
    const redirectUrl = `http://localhost:3000/?access_token=${tokens.access_token}`;
    res.redirect(redirectUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 3: Endpoint to add event to calendar
app.post('/add-event', async (req, res) => {
  const { access_token, event } = req.body;
  oAuth2Client.setCredentials({ access_token });
  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));