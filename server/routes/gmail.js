const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { fetchEmails , fetchSpamEmails } = require('../services/gmailService');

router.get('/fetch-emails', isAuthenticated, async (req, res) => {
    try {
        const accessToken = req.cookies.access_token || (req.user && req.user.accessToken);
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }
        const emails = await fetchEmails(accessToken);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

router.get('/fetch-spams', isAuthenticated, async (req, res) => {
    try {
        const accessToken = req.cookies.access_token || (req.user && req.user.accessToken);
        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }
        const emails = await fetchSpamEmails(accessToken);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

module.exports = router;
