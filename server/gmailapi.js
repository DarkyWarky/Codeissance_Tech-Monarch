const { google } = require('googleapis');
const express = require("express")

const router = express.Router();

const getGmailMessages = async (accessToken) => {
  const gmail = google.gmail({ version: 'v1', auth: accessToken });

  try {
    // Fetch the first 100 messages from the inbox
    const messages = await gmail.users.messages.list({
      userId: 'me',
      q: '', // You can specify search queries here, such as filtering by date, labels, etc.
      maxResults: 100,
    });

    if (messages.data.messages) {
      const senders = [];

      // Fetch email details (sender's address)
      for (const message of messages.data.messages) {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        const headers = msg.data.payload.headers;

        // Find the "From" header to get the sender's email address
        const fromHeader = headers.find(header => header.name === 'From');

        if (fromHeader) {
          // Extract sender's email
          const senderEmail = fromHeader.value.match(/<([^>]+)>/);
          if (senderEmail && senderEmail[1]) {
            senders.push(senderEmail[1]);
          }
        }
      }
      console.log(senders)
      // Return list of senders
      return senders;
    }
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    return [];
  }
};

router.get('/emails', async (req, res) => {
    const accessToken = req.user.accessToken; // Assuming passport has added user to req
    const emails = await getGmailMessages(accessToken);
    
    console.log('Fetched Emails:', emails);  // Log to console for now
    res.send(emails);  // Optionally send response
  });
  
module.exports = router;