const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const gmailRoutes = require('./routes/gmail');
const privacyRoutes = require('./routes/privacy');
const userRoutes = require('./routes/user');

const app = express();
const port = 8000;

require('./config/passport')(passport);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'S3cureR@nd0mString!2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/user', userRoutes);

app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
