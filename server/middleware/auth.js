const passport = require('passport');

function isAuthenticated(req, res, next) {
    console.log('Checking authentication...');
    console.log('req.isAuthenticated():', req.isAuthenticated());
    console.log('req.user:', req.user);
    console.log('req.cookies:', req.cookies);

    if (req.isAuthenticated()) {
        console.log('User is authenticated via session');
        return next();
    }
    if (req.cookies && req.cookies.access_token) {
        console.log('Access token found in cookies');
        // Here you should verify the access token
        // For now, we'll assume it's valid if it exists
        req.user = { 
            accessToken: req.cookies.access_token,
            googleId: req.cookies.user_id,
            email: req.cookies.user_email,
            displayName: req.cookies.user_name
        };
        return next();
    }
    console.log('User is not authenticated');
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
        // Set cookies here
        res.cookie('access_token', req.user.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('user_id', req.user.googleId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('user_email', req.user.email, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.cookie('user_name', req.user.displayName, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.redirect('http://localhost:5173/home');
    });
}

module.exports = { 
    isAuthenticated, 
    authenticateGoogle, 
    handleGoogleCallback 
};
