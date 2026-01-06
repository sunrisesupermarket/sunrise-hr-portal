require('dotenv').config();
const googleDriveService = require('./services/googleDrive');
const googleSheetsService = require('./services/googleSheets');
const emailService = require('./services/emailService');
const path = require('path');
const fs = require('fs');

async function testFullFlow() {
    console.log('--- Testing Full Submission Flow ---');

    // 1. Mock Data
    const fullName = 'Test User ' + Date.now();
    const mockFile = {
        path: path.join(__dirname, 'test-upload.txt'),
        originalname: 'test-upload.txt',
        mimetype: 'text/plain'
    };

    // Create dummy file
    fs.writeFileSync(mockFile.path, 'Test content');

    try {
        // Step 1: Drive Upload
        console.log('\nStep 1: Uploading to Drive...');
        const driveResult = await googleDriveService.uploadImage(mockFile, fullName);
        console.log('✓ Drive Upload Success:', driveResult.shareableLink);

        // Step 2: Sheet Append
        console.log('\nStep 2: Appending to Sheet...');
        const staffData = {
            fullName: fullName,
            resumptionDate: '2024-01-01',
            exitDate: 'Still Working',
            location: 'Test Location',
            designation: 'Test Role',
            hiringOfficer: 'Test Officer',
            pictureUrl: driveResult.shareableLink
        };
        await googleSheetsService.appendStaffData(staffData);
        console.log('✓ Sheet Append Success');

        // Step 3: Email (Optional, might fail if not configured but shouldn't block 500 if handled)
        // We'll skip email for now to focus on the main data path, or test it if needed.
        // console.log('\nStep 3: Sending Email...');
        // await emailService.sendStaffDataEmail(Buffer.from('test'), 'test.xlsx', staffData);
        // console.log('✓ Email Success');

        console.log('\n--- Full Flow Success! ---');

    } catch (error) {
        console.log('ERROR_MESSAGE_START');
        console.log(error.message);
        console.log('ERROR_MESSAGE_END');
        console.error('\n✗ Flow Failed!');
        if (error.stack) console.error(error.stack);
    } finally {
        // Cleanup
        if (fs.existsSync(mockFile.path)) fs.unlinkSync(mockFile.path);
    }
}

testFullFlow();
