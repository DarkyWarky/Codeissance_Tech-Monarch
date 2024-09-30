const express = require('express');
const router = express.Router();
const { authenticateGoogle, handleGoogleCallback } = require('../middleware/auth');

router.get('/google', authenticateGoogle);

router.get('/google/callback', (req, res, next) => {
    handleGoogleCallback(req, res, (err) => {
        if (err) {
            return next(err);
        }
        // Send JSON response instead of redirecting
        res.json({ 
            success: true, 
            message: 'Authentication successful',
            user: {
                id: req.user.googleId,
                name: req.user.displayName,
                email: req.user.email
            }
        });
    });
});

router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ 
            isAuthenticated: true, 
            user: {
                id: req.user.googleId,
                name: req.user.displayName,
                email: req.user.email
            }
        });
    } else {
        res.json({ isAuthenticated: false });
    }
});

router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    });
});

module.exports = router;
