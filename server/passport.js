const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(passport) { // This function will receive passport
    passport.use(
        new GoogleStrategy(
            {
                clientID: "762108892863-ag22uus524n9f6msbeir0ke9hiniib0b.apps.googleusercontent.com",
                clientSecret: "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",
                callbackURL: "http://localhost:8000/auth/google/callback",
                passReqToCallback: true,
            },
            function(req, accessToken, refreshToken, profile, done) {
                // Here you should verify the user and call done
                // If you want to log the access token and profile for debugging
                console.log('Access Token:', accessToken);
                console.log('Profile:', profile);
                
                // Call done with user info, for example:
                return done(null, { profile, accessToken });
            }
        )
    );

    // Serialize user into the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // Deserialize user from the session
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
};
