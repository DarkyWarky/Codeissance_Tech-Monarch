const { google } = require('googleapis');

async function fetchEmails(accessToken, labelIds = ['INBOX']) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const result = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 100,
            labelIds: labelIds
        });

        const messages = result.data.messages || [];
        const emailSenders = [];
        for (const message of messages) {
            const messageDetails = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });

            const headers = messageDetails.data.payload.headers;
            const fromHeader = headers.find(header => header.name === 'From');

            if (fromHeader) {
                emailSenders.push(fromHeader.value);
            }
        }

        return emailSenders;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

async function fetchInboxEmails(accessToken) {
    return fetchEmails(accessToken, ['INBOX']);
}

async function fetchSpamEmails(accessToken) {
    return fetchEmails(accessToken, ['SPAM']);
}

module.exports = { fetchInboxEmails, fetchSpamEmails,fetchEmails };
