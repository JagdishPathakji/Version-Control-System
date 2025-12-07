const { google } = require("googleapis");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const os = require("os");
const chalk = require("chalk");

dotenv.config();

const credDir = path.join(os.homedir(), ".jvcs");
const credFile = path.join(credDir, "config.json");

function getDriveClient() {
    
    if(!fs.existsSync(credFile)) {
        return null;
    }

    const data = JSON.parse(fs.readFileSync(credFile, "utf-8"));
    const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN } = data;

    if(!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        return null;
    }

    const oauth2client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const drive = google.drive({ version: "v3", auth: oauth2client });
    return drive;
}

module.exports = { getDriveClient };