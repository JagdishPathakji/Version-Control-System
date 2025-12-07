const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

function getDriveClient() {

    const oauth2client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
    oauth2client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    const drive = google.drive({ version: "v3", auth: oauth2client });
    return drive;
}

module.exports = getDriveClient