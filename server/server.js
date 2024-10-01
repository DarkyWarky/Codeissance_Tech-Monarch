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

// In-memory storage for user data
let userData = {
    downloads: [],
    routine: {}
};

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Update the CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'chrome-extension://eghidbonaaignaaicojchkkjbfbplljh'
    ],
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

// Downloads routes
app.post('/downloads', (req, res) => {
    const downloadData = req.body;
    console.log('Received download data:', downloadData);
    userData.downloads.push(downloadData);
    res.json({ status: 'success', message: 'Download data received' });
});

app.get('/downloads', (req, res) => {
    res.json(userData.downloads);
});

// Routine routes
app.post('/routine', (req, res) => {
    const routineData = req.body;
    console.log(`Received ${routineData.routine} data:`, routineData.data);
    userData.routine[routineData.routine] = routineData.data;
    res.json({ status: 'success', message: `${routineData.routine} data received` });
});

app.get('/routine', (req, res) => {
    res.json(userData.routine);
});

app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
