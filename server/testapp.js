const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with database in production)
let storage = {
  cookieRules: {},
  sitePermissions: {},
  containers: {},
  phishingBlacklist: [],
  blockedCookies: []
};

// Get all data
app.get('/api/all', (req, res) => {
  res.json(storage);
});

// Get cookie rules
app.get('/api/cookieRules', (req, res) => {
  res.json(storage.cookieRules);
});

// Get site permissions
app.get('/api/sitePermissions', (req, res) => {
  res.json(storage.sitePermissions);
});

// Get containers
app.get('/api/containers', (req, res) => {
  res.json(storage.containers);
});

// Get phishing blacklist
app.get('/api/phishingBlacklist', (req, res) => {
  res.json(storage.phishingBlacklist);
});

// Get blocked cookies
app.get('/api/blockedCookies', (req, res) => {
  res.json(storage.blockedCookies);
});

// Update cookie rules
app.post('/api/cookieRules', (req, res) => {
  storage.cookieRules = {...storage.cookieRules, ...req.body};
  res.json({ message: 'Cookie rules updated', cookieRules: storage.cookieRules });
});

// Update site permissions
app.post('/api/sitePermissions', (req, res) => {
  storage.sitePermissions = {...storage.sitePermissions, ...req.body};
  res.json({ message: 'Site permissions updated' });
});

// Update containers
app.post('/api/containers', (req, res) => {
  storage.containers = {...storage.containers, ...req.body};
  res.json({ message: 'Containers updated' });
});

// Update phishing blacklist
app.post('/api/phishingBlacklist', (req, res) => {
  if (Array.isArray(req.body)) {
    storage.phishingBlacklist = [...new Set([...storage.phishingBlacklist, ...req.body])];
  } else if (typeof req.body === 'string') {
    storage.phishingBlacklist = [...new Set([...storage.phishingBlacklist, req.body])];
  } else {
    return res.status(400).json({ error: 'Invalid input. Expected array or string.' });
  }
  res.json({ message: 'Phishing blacklist updated' });
});

// Add blocked cookie
app.post('/api/blockedCookies', (req, res) => {
  const { cookie, domain } = req.body;
  storage.blockedCookies.push({ cookie, domain, timestamp: new Date() });
  console.log(`Blocked cookie for ${domain}:`, cookie);
  res.json({ message: 'Blocked cookie added' });
});

// Get blocked cookies
app.get('/api/blockedCookies', (req, res) => {
  res.json(storage.blockedCookies);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});