const express = require('express');
const { google } = require('googleapis');

const app = express();

// Configuration
const spreadsheetId = 'YOUR_SPREADSHEET_ID';

// Google Sheets API credentials
const credentials = require('./credentials.json');
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(credentials.token);

// Google Sheets API insert method
async function insertDataIntoSheet(data) {
  const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
  const resource = {
    values: [Object.values(data)],
  };

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:B',
      valueInputOption: 'USER_ENTERED',
      resource,
    });
    console.log(`Data inserted successfully: ${response.data.updates.updatedCells} cells updated.`);
  } catch (error) {
    console.error('Error inserting data into Google Sheets:', error);
  }
}

// Express.js endpoint for form submission
app.post('/submit-form', express.json(), (req, res) => {
  const formData = req.body;
  console.log('Form data received:', formData);

  // Insert data into Google Sheets
  insertDataIntoSheet(formData);

  res.status(200).json({ message: 'Form submitted successfully.' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
