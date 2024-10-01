const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// In-memory storage for user data
let userData = {};

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
router.post('/downloads', (req, res) => {
    const downloadData = req.body;
    console.log('Received download data:', downloadData);
    
    // Store the download data
    if (!userData.downloads) {
        userData.downloads = [];
    }
    userData.downloads.push(downloadData);
    
    res.json({ status: 'success', message: 'Download data received' });
});

router.post('/routine',  (req, res) => {
    const routineData = req.body;
    console.log(`Received ${routineData.routine} data:`, routineData.data);
    
    // Store the routine data
    if (!userData.routine) {
        userData.routine = {};
    }
    userData.routine[routineData.routine] = routineData.data;
    
    res.json({ status: 'success', message: `${routineData.routine} data received` });
});

router.post('/passwordgen', (req, res) => {
    console.log('Received request body:', req.body);
    const { password, domain } = req.body;
    
    if (!password || !domain) {
        return res.status(400).json({ error: 'Password and domain are required' });
    }

    // Store the password data
    if (!passwordData[req.user.googleId]) {
        passwordData[req.user.googleId] = {};
    }
    passwordData[req.user.googleId][domain] = password;

    console.log('Received generated password for domain:', domain);
    console.log('Password:', password);

    res.json({ 
        status: 'success', 
        message: 'Password received and stored successfully',
    });
});

router.get('/password-data', (req, res) => {
    const userPasswords = passwordData[req.user.googleId] || {};
    res.json(userPasswords);
});

// Add GET routes to retrieve the stored data
router.get('/routine', (req, res) => {
    const userRoutine = userData.routine || {};
    res.json(userRoutine);
});

router.get('/downloads', (req, res) => {
    const userDownloads = userData.downloads || [];
    res.json(userDownloads);
});

module.exports = router;
