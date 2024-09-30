const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for blocked cookies
let blockedCookies = [];

// POST endpoint to receive blocked cookie data
app.post('/api/blocked-cookies', (req, res) => {
  const { cookie } = req.body;
  
  if (cookie) {
    // Store only the name=value part of the cookie
    const simpleCookie = cookie.split(';')[0];
    blockedCookies.push(simpleCookie);
    console.log('Received blocked cookie:', simpleCookie);
    res.status(200).json({ message: 'Cookie received and stored' });
  } else {
    res.status(400).json({ error: 'No cookie data provided' });
  }
});

// GET endpoint to retrieve all blocked cookies
app.get('/api/blocked-cookies', (req, res) => {
  res.status(200).json(blockedCookies);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});