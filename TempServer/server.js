const express = require("express");
const { google } = require("googleapis");
const credentials = require("./credentials.json");
const cors = require("cors");

const app = express();
const port = 4000;

app.use(cors());

const bodyParser = require("body-parser");

// Parse application/json
app.use(bodyParser.json());

// Configure Google Sheets API
const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

// Create a new sheet and write data
app.post("/write-to-sheet", async (req, res) => {
  try {
    const { name, checked, time } = req.body;

    // Authorize and authenticate the client
    await client.authorize();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Define the spreadsheet ID and range
    const spreadsheetId = "1Vv91Fi1aeUbyzvuEZPkB7LrnrjUbwaC1_z54k0YW4H8";
    const sheetName = "Sheet1";

    // Get the last row number
    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: `${sheetName}!A:A`,
      majorDimension: "COLUMNS",
    });

    const lastRowNumber = response.data.values?.[0]?.length + 1 || 1;

    // Prepare the data to be written
    const data = [[lastRowNumber, name, checked, time]];

    // Write the data to the sheet
    const writeResponse = await sheets.spreadsheets.values.update({
      auth: client,
      spreadsheetId,
      range: `${sheetName}!A${lastRowNumber}:D${lastRowNumber}`,
      valueInputOption: "USER_ENTERED",
      resource: { values: data },
    });

    console.log("Data written successfully:", writeResponse.data);
    res.send("Data written successfully!");
  } catch (error) {
    console.error("Error writing data:", error);
    res.status(500).send("Error writing data!");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
