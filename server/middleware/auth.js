const passport = require('passport');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
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
