const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/profile', isAuthenticated, (req, res) => {
    res.json(req.user);
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
