const express = require('express');
const cors = require('cors'); // Import the cors package
const app = express();
const port = 8000;
// Enable CORS for all routes
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());
// Route to handle download data
app.post('/downloads', (req, res) => {
    const downloadData = req.body;
    console.log('Received download data:', downloadData);
    res.json({ status: 'success', message: 'Download data received' });
});
// Route to handle periodic data (history, bookmarks)
app.post('/routine', (req, res) => {
    const routineData = req.body;
    console.log(`Received ${routineData.routine.data} data:`, routineData.data.history);
    res.json({ status: 'success', message: `${routineData.routine} data received` });
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});