require('dotenv').config();
const googleDriveService = require('./services/googleDrive');
const path = require('path');
const fs = require('fs');

async function testDriveUpload() {
    console.log('--- Testing Google Drive Upload ---');

    // Create a dummy file for testing
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test file to verify Google Drive permissions.');

    const mockFile = {
        path: testFilePath,
        originalname: 'test-upload.txt',
        mimetype: 'text/plain'
    };

    try {
        console.log('Attempting to upload file...');
        const result = await googleDriveService.uploadImage(mockFile, 'Test User');
        console.log('✓ Success! File uploaded.');
        console.log('File ID:', result.fileId);
        console.log('Link:', result.shareableLink);

        // Clean up
        console.log('Cleaning up test file...');
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }

        // Optional: Try to delete the uploaded file to be clean
        // await googleDriveService.deleteFile(result.fileId);

    } catch (error) {
        console.error('✗ Failed to upload file.');
        console.error('Error details:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testDriveUpload();
