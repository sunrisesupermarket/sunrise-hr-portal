require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');

async function debugEmail() {
    const logFile = 'email_debug.log';
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Clear previous log
    fs.writeFileSync(logFile, '--- Email Debug Log ---\n');

    log(`1. Checking Environment Variables...`);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (!user) log('❌ EMAIL_USER is missing');
    else log(`✅ EMAIL_USER is set: ${user}`);

    if (!pass) log('❌ EMAIL_PASSWORD is missing');
    else log(`✅ EMAIL_PASSWORD is set (length: ${pass.length})`);

    log('\n2. Configuring Transporter (Gmail SMTP)...');
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: pass
        },
        debug: true // Include SMTP traffic in logs
    });

    log('\n3. Verifying Connection...');
    try {
        await transporter.verify();
        log('✅ Connection Verified Successfully!');

        log('\n4. Sending Test Email...');
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to self for testing
            subject: 'Debug Test Email',
            text: 'If you receive this, email sending is working.'
        });
        log(`✅ Email sent: ${info.messageId}`);

    } catch (error) {
        log('\n❌ ERROR OCCURRED:');
        log(`Code: ${error.code}`);
        log(`Message: ${error.message}`);
        if (error.response) log(`Response: ${error.response}`);
        log(`Stack: ${error.stack}`);
    }
}

debugEmail();
