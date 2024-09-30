const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const axios = require('axios');

router.post('/checkleak', isAuthenticated, async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    console.log(email);
    const apiUrl = `https://leakcheck.io/api/public?check=${email}`;

    try {
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error making API request:', error);
        res.status(500).json({ error: 'Error checking the leak status' });
    }
});

module.exports = router;
