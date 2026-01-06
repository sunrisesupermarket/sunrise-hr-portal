require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function checkFolder() {
    console.log('--- Checking Drive Folder Access ---');

    try {
        const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        console.log(`Folder ID: ${folderId}`);

        try {
            const folder = await drive.files.get({
                fileId: folderId,
                fields: 'id, name, capabilities'
            });
            console.log('✓ Folder found:', folder.data.name);
            console.log('  Can edit:', folder.data.capabilities.canEdit);
        } catch (err) {
            console.log('✗ Cannot access folder:', err.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkFolder();
