const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/profile', isAuthenticated, (req, res) => {
    console.log('User profile request received');
    console.log('req.user:', req.user);
    console.log('req.isAuthenticated():', req.isAuthenticated());
    console.log('req.cookies:', req.cookies);

    if (req.user) {
        res.json({
            username: req.user.username || req.user.displayName || 'N/A',
            email: req.user.email || 'N/A',
            accessToken: req.user.accessToken || req.cookies.access_token || 'N/A',
            // Include the full user object for debugging
            fullUser: req.user
        });
    } else {
        res.status(404).json({ error: 'User profile not found' });
    }
});

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

module.exports = router;
