const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { fetchInboxEmails, fetchSpamEmails } = require('../services/gmailService');

router.get('/fetch-emails', isAuthenticated, async (req, res) => {
    try {
        if (!req.user || !req.user.accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }
        const emails = await fetchEmails(req.user.accessToken);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

router.get('/fetch-inbox-emails', isAuthenticated, async (req, res) => {
    try {
        if (!req.user || !req.user.accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }
        const emails = await fetchInboxEmails(req.user.accessToken);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching inbox emails:', error);
        res.status(500).json({ error: 'Failed to fetch inbox emails' });
    }
});

router.get('/fetch-spam-emails', isAuthenticated, async (req, res) => {
    try {
        if (!req.user || !req.user.accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        }
        const spamEmails = await fetchSpamEmails(req.user.accessToken);
        res.json(spamEmails);
    } catch (error) {
        console.error('Error fetching spam emails:', error);
        res.status(500).json({ error: 'Failed to fetch spam emails' });
    }
});

module.exports = router;
