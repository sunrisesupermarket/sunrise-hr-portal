# Staff Data Capture System - Setup Guide

This guide will walk you through setting up the Staff Data Capture System with Google Drive, Google Sheets, and Email integration.

## Prerequisites

- Node.js (v14 or higher)
- A Google Cloud account
- A Gmail account (or SMTP email service)

---

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. Enter project name: `Staff Database System`
4. Click **"Create"**

### 1.2 Enable Required APIs

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for and enable the following APIs:
   - **Google Drive API**
   - **Google Sheets API**

### 1.3 Create Service Account

1. Go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"Create Service Account"**
3. Enter details:
   - **Service account name**: `staff-database-service`
   - **Description**: `Service account for staff database operations`
4. Click **"Create and Continue"**
5. Skip the optional steps and click **"Done"**

### 1.4 Generate Service Account Key

1. Click on the newly created service account
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **JSON** format
5. Click **"Create"** - a JSON file will be downloaded
6. **Important**: Save this file securely!

### 1.5 Save Credentials

1. Create a `credentials` folder in your project directory:
   ```
   e:\Sunrise\Database\credentials\
   ```
2. Move the downloaded JSON file to this folder
3. Rename it to `service-account.json`

---

## Step 2: Google Drive Setup

### 2.1 Create Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder named `Staff Pictures`
3. Open the folder and copy the **Folder ID** from the URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### 2.2 Share Folder with Service Account

1. Right-click the folder → **"Share"**
2. Paste the service account email (found in the JSON file under `client_email`)
   - It looks like: `staff-database-service@project-id.iam.gserviceaccount.com`
3. Set permission to **"Editor"**
4. Uncheck **"Notify people"**
5. Click **"Share"**

---

## Step 3: Google Sheets Setup

### 3.1 Create Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it: `Staff Database`
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

### 3.2 Share Sheet with Service Account

1. Click **"Share"** button
2. Paste the service account email
3. Set permission to **"Editor"**
4. Uncheck **"Notify people"**
5. Click **"Share"**

> **Note**: The system will automatically create headers in the sheet on first run.

---

## Step 4: Email Configuration

### Option A: Gmail (Recommended)

1. **Enable 2-Step Verification**:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable **2-Step Verification**

2. **Create App Password**:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: `Staff Database`
   - Click **"Generate"**
   - Copy the 16-character password (remove spaces)

3. **Save Credentials**:
   - Email User: Your Gmail address
   - Email Password: The generated app password

### Option B: Custom SMTP

If using a different email service:
1. Get SMTP server details from your email provider
2. Note the host, port, and security settings
3. Configure in `.env` file (see Step 5)

---

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your actual values:

```env
# Server Configuration
PORT=3000

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json

# Google Sheets (paste your Sheet ID)
GOOGLE_SHEET_ID=1abc123def456ghi789jkl

# Google Drive (paste your Folder ID)
GOOGLE_DRIVE_FOLDER_ID=1xyz987uvw654rst321opq

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
RECIPIENT_EMAIL=admin@company.com
```

3. **Important**: Replace all placeholder values with your actual credentials!

---

## Step 6: Install Dependencies

Open terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- express
- multer
- googleapis
- xlsx
- nodemailer
- dotenv
- cors

---

## Step 7: Test the Setup

### 7.1 Start the Server

```bash
npm start
```

You should see:
```
✓ Server running on http://localhost:3000
✓ Google Drive API initialized successfully
✓ Google Sheets API initialized successfully
✓ Email service initialized successfully
```

### 7.2 Check Health Status

Open browser and visit:
```
http://localhost:3000/api/health
```

You should see all services showing "OK".

### 7.3 Test Email (Optional)

Visit:
```
http://localhost:3000/api/test-email
```

Check if test email was received.

---

## Step 8: Use the Application

1. Open browser and go to:
   ```
   http://localhost:3000/index.html
   ```

2. Fill in the staff data form:
   - Enter all required information
   - Upload a staff picture (JPG/PNG, max 5MB)
   - Click **"Submit Staff Data"**

3. Verify the submission:
   - Check Google Drive folder for uploaded image
   - Check Google Sheet for new row
   - Check email inbox for Excel attachment

---

## Troubleshooting

### Issue: "Service account credentials file not found"
- **Solution**: Ensure `service-account.json` is in the `credentials` folder
- Check the path in `.env` matches the actual file location

### Issue: "Permission denied" errors
- **Solution**: Make sure you shared both Drive folder and Sheet with the service account email
- Verify the service account has "Editor" permissions

### Issue: "Email authentication failed"
- **Solution**: 
  - For Gmail: Ensure 2-Step Verification is enabled and you're using an App Password
  - Verify EMAIL_USER and EMAIL_PASSWORD are correct in `.env`

### Issue: "Cannot find module"
- **Solution**: Run `npm install` again to ensure all dependencies are installed

### Issue: Port 3000 already in use
- **Solution**: Change PORT in `.env` to a different number (e.g., 3001)

---

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit** `.env` or `service-account.json` to version control
2. Keep your service account credentials secure
3. Regularly rotate your email app passwords
4. Use environment-specific `.env` files for different deployments
5. Consider implementing authentication for production use

---

## Deployment Options

### Option 1: Heroku

1. Install Heroku CLI
2. Create new app: `heroku create staff-database`
3. Set environment variables: `heroku config:set GOOGLE_SHEET_ID=...`
4. Deploy: `git push heroku main`

### Option 2: VPS (DigitalOcean, AWS, etc.)

1. SSH into your server
2. Clone the repository
3. Install Node.js and dependencies
4. Configure `.env` file
5. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name staff-database
   pm2 save
   pm2 startup
   ```

### Option 3: Google Cloud Run

1. Create `Dockerfile`
2. Build and push to Google Container Registry
3. Deploy to Cloud Run
4. Set environment variables in Cloud Run console

---

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all Google APIs are enabled
4. Confirm service account has proper permissions

---

## Next Steps

- Customize the email template in `services/emailService.js`
- Add authentication for production use
- Implement data validation rules
- Add analytics and reporting features
- Set up automated backups
