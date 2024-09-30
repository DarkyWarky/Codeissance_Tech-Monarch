const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const axios = require('axios');

router.get('/checkleak', isAuthenticated, (req, res) => {
    const userEmail = req.user.profile.emails[0].value;

    if (!userEmail) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const apiUrl = `https://leakcheck.io/api/public?check=${userEmail}`;

    axios.get(apiUrl)
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            console.error('Error making API request:', error);
            res.status(500).json({ error: 'Error checking the leak status' });
        });
});

module.exports = router;
