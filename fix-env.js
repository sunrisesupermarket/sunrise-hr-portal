const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    let modified = false;

    // 1. Fix Full URLs (containing /folders/ or /d/)

    // Drive URL
    const driveUrlRegex = /GOOGLE_DRIVE_FOLDER_ID=.*\/folders\/([a-zA-Z0-9-_]+).*/;
    const driveUrlMatch = envContent.match(driveUrlRegex);
    if (driveUrlMatch) {
        const fullLine = driveUrlMatch[0];
        const id = driveUrlMatch[1];
        console.log(`Found Drive URL Line: ${fullLine}`);
        console.log(`Extracted ID: ${id}`);
        envContent = envContent.replace(fullLine, `GOOGLE_DRIVE_FOLDER_ID=${id}`);
        modified = true;
    }

    // Sheet URL
    const sheetUrlRegex = /GOOGLE_SHEET_ID=.*\/d\/([a-zA-Z0-9-_]+).*/;
    const sheetUrlMatch = envContent.match(sheetUrlRegex);
    if (sheetUrlMatch) {
        const fullLine = sheetUrlMatch[0];
        const id = sheetUrlMatch[1];
        console.log(`Found Sheet URL Line: ${fullLine}`);
        console.log(`Extracted ID: ${id}`);
        envContent = envContent.replace(fullLine, `GOOGLE_SHEET_ID=${id}`);
        modified = true;
    }

    // 2. Fix Dirty IDs (IDs with suffixes like /edit...)
    // Only run this if we haven't already fixed it above (or run it anyway, it won't match clean IDs)

    // Sheet Dirty ID: ID followed by / or ?
    // Regex: GOOGLE_SHEET_ID= followed by ID, then / or ?
    const sheetDirtyRegex = /GOOGLE_SHEET_ID=([a-zA-Z0-9-_]+)[\/?].*/;
    const sheetDirtyMatch = envContent.match(sheetDirtyRegex);

    if (sheetDirtyMatch) {
        const fullLine = sheetDirtyMatch[0];
        const id = sheetDirtyMatch[1];
        // Double check it's not a URL (doesn't contain http)
        if (!fullLine.includes('http')) {
            console.log(`Found Dirty Sheet ID Line: ${fullLine}`);
            console.log(`Extracted ID: ${id}`);
            envContent = envContent.replace(fullLine, `GOOGLE_SHEET_ID=${id}`);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(envPath, envContent);
        console.log('✓ Successfully updated .env file with extracted IDs.');
    } else {
        console.log('No issues found in .env variables.');

        // Debug: print current values (masked)
        const driveLine = envContent.match(/GOOGLE_DRIVE_FOLDER_ID=(.*)/);
        const sheetLine = envContent.match(/GOOGLE_SHEET_ID=(.*)/);
        if (driveLine) console.log('Current Drive Value:', driveLine[1].substring(0, 10) + '...');
        if (sheetLine) console.log('Current Sheet Value:', sheetLine[1].substring(0, 10) + '...');
    }

} catch (error) {
    console.error('Error fixing .env:', error.message);
}
