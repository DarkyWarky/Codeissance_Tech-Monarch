const gmailRoutes = require('./gmailapi')
const passport = require('passport')
const express = require('express');
const cors = require('cors'); // Import the cors package
const session = require('express-session');
const app = express();
const port = 8000;
const { google } = require('googleapis'); // Ensure this line is present
const axios = require('axios');
require('./passport')(passport); // Pass passport to the require function



// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] }));

app.use(session({ secret: 'S3cureR@nd0mString!2024', resave: false, saveUninitialized: true }));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {
        // Successful authentication, fetch emails
        try {
            const emails = await fetchEmails(req.user.accessToken);
            res.json(emails);
        } catch (error) {
            console.error('Error fetching emails:', error);
            res.status(500).json({ error: 'Failed to fetch emails' });
        }
    }
  );
  async function fetchEmails(accessToken) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        // Get the user's inbox messages
        const result = await gmail.users.messages.list({
            userId: 'me', // Special value 'me' indicates the authenticated user
            maxResults: 50, // Number of messages to fetch
            labelIds: ['SPAM'] // Specify the inbox label
        });

        const messages = result.data.messages || [];
        const emailSenders = [];
        for (const message of messages) {
            const messageDetails = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });

            const headers = messageDetails.data.payload.headers;
            const fromHeader = headers.find(header => header.name === 'From');

            if (fromHeader) {
                emailSenders.push(fromHeader.value); // Get the sender's email
            }
        }

        return emailSenders; // Return an array of sende
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error; // Re-throw the error for handling in the route
    }
}

  // Route to fetch Gmail inbox emails
app.use(gmailRoutes);

// Route to handle download data
app.post('/downloads', (req, res) => {
    const downloadData = req.body;
    console.log('Received download data:', downloadData);
    res.json({ status: 'success', message: 'Download data received' });
});

// Route to handle periodic data (history, bookmarks)
app.post('/routine', (req, res) => {
    const routineData = req.body;
    // console.log(`Received ${routineData.routine.data} data:`, routineData.data.history);
    res.json({ status: 'success', message: `${routineData.routine} data received` });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});

app.get('/checkleak', (req, res) => {
    const userEmail = req.user.profile.emails[0].value;  // Get email from query parameter
    
    if (!userEmail) {
        return res.status(400).send('Email is required');
    }

    // LeakCheck API URL with the email
    const apiUrl = `https://leakcheck.io/api/public?check=${userEmail}`;

    // Make the request to the LeakCheck API
    axios.get(apiUrl)
        .then(response => {
            // Send the response back to the user
            res.json(response.data);
        })
        .catch(error => {
            console.error('Error making API request:', error);
            res.status(500).send('Error checking the leak status');
        });
});
