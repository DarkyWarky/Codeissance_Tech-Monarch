const passport = require('passport');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.cookies.access_token) {
        // If you have the access token, you might want to verify it here
        // and set req.user accordingly
        // For now, we'll just pass it through
        req.user = { accessToken: req.cookies.access_token };
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}

function authenticateGoogle(req, res, next) {
    passport.authenticate('google', { 
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
        accessType: 'offline',
        prompt: 'consent'
    })(req, res, next);
}

function handleGoogleCallback(req, res, next) {
    passport.authenticate('google', { failureRedirect: '/' })(req, res, (err) => {
        if (err) {
            return next(err);
        }
        res.redirect('http://localhost:5173/home');
    });
}

module.exports = { 
    isAuthenticated, 
    authenticateGoogle, 
    handleGoogleCallback 
};
