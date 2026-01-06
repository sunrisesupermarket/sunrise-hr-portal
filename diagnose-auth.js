require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

/**
 * Diagnostic Script for Google Service Account Authentication
 * This script helps identify and troubleshoot authentication issues
 */

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║  Google Service Account Diagnostic Tool       ║');
console.log('╚════════════════════════════════════════════════╝\n');

let errorCount = 0;
let warningCount = 0;

function logSuccess(message) {
    console.log(`✓ ${message}`);
}

function logError(message) {
    console.log(`✗ ERROR: ${message}`);
    errorCount++;
}

function logWarning(message) {
    console.log(`⚠️  WARNING: ${message}`);
    warningCount++;
}

function logInfo(message) {
    console.log(`ℹ️  ${message}`);
}

async function diagnose() {
    console.log('Step 1: Checking Environment Variables\n');
    console.log('─'.repeat(50));

    // Check GOOGLE_SERVICE_ACCOUNT_PATH
    const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
    if (!credentialsPath) {
        logError('GOOGLE_SERVICE_ACCOUNT_PATH not set in .env file');
        logInfo('Add this to your .env file:');
        logInfo('GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json\n');
    } else {
        logSuccess(`GOOGLE_SERVICE_ACCOUNT_PATH is set: ${credentialsPath}`);
    }

    // Check GOOGLE_SHEET_ID
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
        logError('GOOGLE_SHEET_ID not set in .env file');
        logInfo('Add this to your .env file:');
        logInfo('GOOGLE_SHEET_ID=your_sheet_id_here\n');
    } else {
        logSuccess(`GOOGLE_SHEET_ID is set: ${sheetId}`);
    }

    // Check GOOGLE_DRIVE_FOLDER_ID
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
        logError('GOOGLE_DRIVE_FOLDER_ID not set in .env file');
        logInfo('Add this to your .env file:');
        logInfo('GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here\n');
    } else {
        logSuccess(`GOOGLE_DRIVE_FOLDER_ID is set: ${folderId}`);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('\nStep 2: Checking Credentials File\n');
    console.log('─'.repeat(50));

    if (!credentialsPath) {
        logError('Cannot proceed without GOOGLE_SERVICE_ACCOUNT_PATH');
        return printSummary();
    }

    // Check if file exists
    if (!fs.existsSync(credentialsPath)) {
        logError(`Credentials file not found at: ${credentialsPath}`);
        logInfo('\nHow to get service account credentials:');
        logInfo('1. Go to https://console.cloud.google.com/');
        logInfo('2. Select or create a project');
        logInfo('3. Navigate to "IAM & Admin" > "Service Accounts"');
        logInfo('4. Click "Create Service Account" or select existing one');
        logInfo('5. Click "Keys" > "Add Key" > "Create new key"');
        logInfo('6. Choose JSON format and download');
        logInfo(`7. Save the file to: ${path.resolve(credentialsPath)}\n`);
        return printSummary();
    } else {
        logSuccess(`Credentials file exists at: ${credentialsPath}`);
    }

    // Check file permissions
    try {
        fs.accessSync(credentialsPath, fs.constants.R_OK);
        logSuccess('Credentials file is readable');
    } catch (error) {
        logError('Cannot read credentials file - check file permissions');
        return printSummary();
    }

    // Parse JSON
    let credentials;
    try {
        const fileContent = fs.readFileSync(credentialsPath, 'utf8');
        credentials = JSON.parse(fileContent);
        logSuccess('Credentials file has valid JSON format');
    } catch (error) {
        logError(`Invalid JSON in credentials file: ${error.message}`);
        logInfo('The credentials file must be a valid JSON file downloaded from Google Cloud Console\n');
        return printSummary();
    }

    // Validate required fields
    const requiredFields = ['client_email', 'private_key', 'project_id', 'type'];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
        logError(`Credentials file is missing required fields: ${missingFields.join(', ')}`);
        logInfo('Please download a fresh credentials file from Google Cloud Console\n');
        return printSummary();
    } else {
        logSuccess('All required fields present in credentials');
    }

    // Check credential type
    if (credentials.type !== 'service_account') {
        logWarning(`Credential type is "${credentials.type}", expected "service_account"`);
    } else {
        logSuccess('Credential type is "service_account"');
    }

    // Display service account info
    console.log('\nService Account Details:');
    logInfo(`  Email: ${credentials.client_email}`);
    logInfo(`  Project ID: ${credentials.project_id}`);
    if (credentials.client_id) {
        logInfo(`  Client ID: ${credentials.client_id}`);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('\nStep 3: Testing Google Drive API Authentication\n');
    console.log('─'.repeat(50));

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        const drive = google.drive({ version: 'v3', auth: auth });

        // Test authentication
        const aboutResponse = await drive.about.get({ fields: 'user' });
        logSuccess('Google Drive API authentication successful');

        // Test folder access if folder ID is provided
        if (folderId) {
            try {
                const folderResponse = await drive.files.get({
                    fileId: folderId,
                    fields: 'id, name, mimeType'
                });
                logSuccess(`Google Drive folder access successful: "${folderResponse.data.name}"`);
            } catch (folderError) {
                if (folderError.code === 404) {
                    logError('Google Drive folder not found or not accessible');
                    logInfo(`\nFolder ID: ${folderId}`);
                    logInfo('To fix:');
                    logInfo('1. Verify the GOOGLE_DRIVE_FOLDER_ID in your .env file');
                    logInfo('2. Open the folder in Google Drive');
                    logInfo('3. Click "Share" and add: ' + credentials.client_email);
                    logInfo('4. Give it "Editor" permissions\n');
                } else {
                    logError(`Error accessing Google Drive folder: ${folderError.message}`);
                }
            }
        }

    } catch (error) {
        if (error.message.includes('invalid_grant') || error.message.includes('account not found')) {
            logError('Authentication failed: Invalid grant or account not found');
            logInfo('\nThis means the service account no longer exists or credentials are outdated.');
            logInfo('To fix:');
            logInfo('1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts');
            logInfo('2. Verify the service account exists');
            logInfo('3. Create NEW credentials (do not reuse old ones)');
            logInfo(`4. Replace the file at: ${credentialsPath}\n`);
        } else if (error.message.includes('API has not been used') || error.message.includes('not enabled')) {
            logError('Google Drive API is not enabled');
            logInfo('\nTo fix:');
            logInfo('1. Go to https://console.cloud.google.com/apis/library/drive.googleapis.com');
            logInfo('2. Click "Enable" for Google Drive API');
            logInfo('3. Wait a few minutes and run this diagnostic again\n');
        } else {
            logError(`Google Drive API error: ${error.message}`);
        }
    }

    console.log('\n' + '─'.repeat(50));
    console.log('\nStep 4: Testing Google Sheets API Authentication\n');
    console.log('─'.repeat(50));

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth: auth });

        // Test Sheet access if sheet ID is provided
        if (sheetId) {
            try {
                const sheetResponse = await sheets.spreadsheets.get({
                    spreadsheetId: sheetId,
                    fields: 'properties.title'
                });
                logSuccess(`Google Sheet access successful: "${sheetResponse.data.properties.title}"`);
            } catch (sheetError) {
                if (sheetError.code === 404 || sheetError.message.includes('not found')) {
                    logError('Google Sheet not found or not accessible');
                    logInfo(`\nSheet ID: ${sheetId}`);
                    logInfo('To fix:');
                    logInfo('1. Verify the GOOGLE_SHEET_ID in your .env file');
                    logInfo('2. Open the Google Sheet');
                    logInfo('3. Click "Share" and add: ' + credentials.client_email);
                    logInfo('4. Give it "Editor" permissions\n');
                } else {
                    logError(`Error accessing Google Sheet: ${sheetError.message}`);
                }
            }
        } else {
            logWarning('Skipping Sheet test - GOOGLE_SHEET_ID not set');
        }

    } catch (error) {
        if (error.message.includes('invalid_grant') || error.message.includes('account not found')) {
            logError('Authentication failed: Invalid grant or account not found');
        } else if (error.message.includes('API has not been used') || error.message.includes('not enabled')) {
            logError('Google Sheets API is not enabled');
            logInfo('\nTo fix:');
            logInfo('1. Go to https://console.cloud.google.com/apis/library/sheets.googleapis.com');
            logInfo('2. Click "Enable" for Google Sheets API');
            logInfo('3. Wait a few minutes and run this diagnostic again\n');
        } else {
            logError(`Google Sheets API error: ${error.message}`);
        }
    }

    printSummary();
}

function printSummary() {
    console.log('\n' + '═'.repeat(50));
    console.log('\nDiagnostic Summary\n');
    console.log('═'.repeat(50) + '\n');

    if (errorCount === 0 && warningCount === 0) {
        console.log('✓ All checks passed! Your configuration looks good.\n');
        console.log('If you\'re still experiencing issues, try:');
        console.log('1. Restarting the server: npm start');
        console.log('2. Running the test flow: node test-full-flow.js');
        console.log('3. Checking the server health: curl http://localhost:3000/api/health\n');
    } else {
        console.log(`Found ${errorCount} error(s) and ${warningCount} warning(s)\n`);
        console.log('Please fix the errors above before running the application.\n');
        console.log('Common next steps:');
        console.log('1. Update your .env file with correct values');
        console.log('2. Download fresh service account credentials');
        console.log('3. Share Google Drive folder and Sheet with the service account');
        console.log('4. Enable required APIs in Google Cloud Console\n');
    }

    console.log('Need more help? Check the documentation:');
    console.log('- README.md for general setup');
    console.log('- SETUP.md for detailed Google Cloud configuration\n');

    process.exit(errorCount > 0 ? 1 : 0);
}

// Run diagnostic
diagnose().catch(error => {
    console.error('\n✗ Unexpected error during diagnostic:', error.message);
    console.error(error.stack);
    process.exit(1);
});
