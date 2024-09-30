const gmailRoutes = require('./gmailapi');
const passport = require('passport');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 8000;
const { google } = require('googleapis');
const axios = require('axios');
require('./passport')(passport); // Pass passport to the require function

async function fetchEmails(accessToken) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        // Get the user's inbox messages
        const result = await gmail.users.messages.list({
            userId: 'me', // Special value 'me' indicates the authenticated user
            maxResults: 1000, // Number of messages to fetch
            labelIds: ['INBOX'] // Specify the inbox label
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

// Enable CORS for requests coming from the frontend (React app running on localhost:5173)
app.use(cors({
    origin: 'http://localhost:5173', // React app running on Vite, change port if necessary
    credentials: true // Allow cookies and credentials to be passed
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Session middleware to store user session data
app.use(session({ secret: 'S3cureR@nd0mString!2024', resave: false, saveUninitialized: true }));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Route for Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] }));

// Google OAuth callback route
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), async (req, res) => {
    try {
        // Successful authentication, redirect to React frontend home page
        res.redirect('http://localhost:5173/home');
    } catch (error) {
        console.error('Error during authentication callback:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('Unauthorized');
}

// Protected route to get the authenticated user's profile
app.get('/profile', isAuthenticated, (req, res) => {
    res.json(req.user); // Send the authenticated user's profile information
});

// Route to fetch Gmail inbox emails (this should only work for authenticated users)
app.use(gmailRoutes);

// Route to handle download data (Example route for other tasks)
app.post('/downloads', isAuthenticated, (req, res) => {
    const downloadData = req.body;
    console.log('Received download data:', downloadData);
    res.json({ status: 'success', message: 'Download data received' });
});

// Route to handle periodic data (history, bookmarks, etc.)
app.post('/routine', isAuthenticated, (req, res) => {
    const routineData = req.body;
    res.json({ status: 'success', message: `${routineData.routine} data received` });
});

// Example route to check for email data breach using LeakCheck API
app.get('/checkleak', isAuthenticated, (req, res) => {
    const userEmail = req.user.profile.emails[0].value; // Get email from authenticated user's profile

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

// Route to fetch Gmail inbox emails
app.get('/fetch-emails', isAuthenticated, async (req, res) => {
    try {
        // Pass the authenticated user's access token to fetch emails
        const emails = await fetchEmails(req.user.accessToken);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
