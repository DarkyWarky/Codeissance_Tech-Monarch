const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: "762108892863-ag22uus524n9f6msbeir0ke9hiniib0b.apps.googleusercontent.com",
                clientSecret: "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",
                callbackURL: "http://localhost:8000/auth/google/callback",
            },
            function(accessToken, refreshToken, profile, done) {
                // Store the tokens along with the profile
                const user = {
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                };
                console.log("User authenticated:", user);
                done(null, user);
            }
        )
    );
    
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
