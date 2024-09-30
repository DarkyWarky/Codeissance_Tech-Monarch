const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent'
}));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        if (req.user && req.user.accessToken) {
            res.cookie('access_token', req.user.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
        }
        res.redirect('http://localhost:5173/home');
    }
);

router.get('/check', (req, res) => {
    if (req.isAuthenticated() || req.cookies.access_token) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.clearCookie('access_token');
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
