require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

async function listDriveFiles() {
    console.log('--- Listing Accessible Drive Files ---');

    try {
        const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        console.log('Service Account Email:', credentials.client_email);

        const res = await drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name, mimeType, parents)',
        });

        const files = res.data.files;
        if (files.length === 0) {
            console.log('No files found.');
        } else {
            console.log('Files found:');
            files.forEach((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        }

        // Check specifically for the configured folder
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        console.log(`\nChecking access to configured folder ID: '${folderId}'`);

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

        // Check specifically for the configured sheet
        const sheetId = process.env.GOOGLE_SHEET_ID;
        console.log(`\nChecking access to configured sheet ID: '${sheetId}'`);

        try {
            const sheet = await drive.files.get({
                fileId: sheetId,
                fields: 'id, name, capabilities'
            });
            console.log('✓ Sheet found:', sheet.data.name);
            console.log('  Can edit:', sheet.data.capabilities.canEdit);
        } catch (err) {
            console.log('✗ Cannot access sheet:', err.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

listDriveFiles();
