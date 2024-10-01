const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// In-memory storage for password data (Note: This is not persistent and will reset when the server restarts)
let passwordData = {};

// Remove the isAuthenticated middleware
router.get('/profile', isAuthenticated, (req, res) => {
    console.log('User profile request received');
    console.log('req.user:', req.user);
    console.log('req.isAuthenticated():', req.isAuthenticated());
    console.log('req.cookies:', req.cookies);

    // Check if user data is available in the request
    if (req.user) {
        res.json({
            username: req.user.displayName || 'N/A',
            email: req.user.email || 'N/A',
            accessToken: req.user.accessToken || req.cookies.access_token || 'N/A',
            fullUser: {
                googleId: req.user.googleId || req.user.id,
                email: req.user.email,
                displayName: req.user.displayName
            }
        });
    } else {
        // If no user data is available, send a default response
        res.status(401).json({ error: 'User not authenticated' });
    }
});

// Keep the authentication for other routes that may require it
router.post('/downloads', isAuthenticated, (req, res) => {
    const downloadData = req.body;
    console.log('Received download data:', downloadData);
    res.json({ status: 'success', message: 'Download data received' });
});

router.post('/routine', isAuthenticated, (req, res) => {
    const routineData = req.body;
    console.log(`Received ${routineData.routine} data:`, routineData.data);
    res.json({ status: 'success', message: `${routineData.routine} data received` });
});

router.post('/passwordgen', (req, res) => {
    console.log('Received request body:', req.body);
    const { password, domain } = req.body;
    
    if (!password || !domain) {
        return res.status(400).json({ error: 'Password and domain are required' });
    }

    // Generate a unique identifier for the password entry
    const passwordId = Date.now().toString();

    // Store the password data without relying on req.user
    if (!passwordData[passwordId]) {
        passwordData[passwordId] = {};
    }
    passwordData[passwordId] = { domain, password };

    console.log('Received generated password for domain:', domain);
    console.log('Password:', password);

    res.json({ 
        status: 'success', 
        message: 'Password received and stored successfully',
        passwordId: passwordId
    });
});

router.get('/password-data', (req, res) => {
    // Return all stored passwords without user-specific filtering
    res.json(passwordData);
});

module.exports = router;
