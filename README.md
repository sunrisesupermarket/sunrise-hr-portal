# 📋 Staff Data Capture System

A comprehensive web application for capturing and managing staff information with automatic Google Drive image uploads, Google Sheets data storage, Excel export, and email delivery.

![Staff Data Capture System](https://img.shields.io/badge/Node.js-v14+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![License](https://img.shields.io/badge/License-ISC-yellow.svg)

## ✨ Features

- **📝 Responsive Web Form**: Modern, mobile-friendly interface for data capture
- **📸 Image Upload**: Automatic upload to Google Drive with shareable links
- **📊 Google Sheets Integration**: Real-time data storage and synchronization
- **📑 Excel Export**: Automatic generation of Excel files from sheet data
- **📧 Email Notifications**: Automated email delivery with Excel attachments
- **✅ Form Validation**: Client and server-side validation
- **🎨 Premium UI**: Modern design with smooth animations and transitions

## 📸 Screenshots

### Main Form
The responsive data capture form with all required fields and image upload functionality.

### Success Message
Confirmation message displayed after successful submission.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Google Cloud account
- Gmail account or SMTP service

### Installation

1. **Clone or download the project**
   ```bash
   cd e:\Sunrise\Database
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Set up Google Cloud** (see [SETUP.md](SETUP.md) for detailed instructions)
   - Create Google Cloud project
   - Enable Drive and Sheets APIs
   - Create service account
   - Share Drive folder and Sheet with service account

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open the application**
   ```
   http://localhost:3000/index.html
   ```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Comprehensive setup guide
- **[.env.example](.env.example)** - Environment variables template

## 🏗️ Project Structure

```
e:\Sunrise\Database\
├── index.html              # Frontend form
├── styles.css              # Styling and design system
├── script.js               # Client-side JavaScript
├── server.js               # Express server
├── package.json            # Dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── SETUP.md                # Setup instructions
├── README.md               # This file
├── services/
│   ├── googleDrive.js      # Google Drive integration
│   ├── googleSheets.js     # Google Sheets integration
│   ├── excelExport.js      # Excel generation
│   └── emailService.js     # Email functionality
└── credentials/
    └── service-account.json # Google service account (not in repo)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
GOOGLE_SERVICE_ACCOUNT_PATH=./credentials/service-account.json
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
RECIPIENT_EMAIL=admin@company.com
```

See [SETUP.md](SETUP.md) for detailed configuration instructions.

## 📋 Data Fields

The system captures the following information:

1. **Staff Full Name** (required)
2. **Work Duration**:
   - Resumption Date (required)
   - Exit Date (optional if "Still Working")
3. **Location** (required) - Dropdown with options:
   - NTC
   - Ringroad
   - Akala
   - Akobo
   - Bodija
   - Jericho
4. **Designation / Job Title** (required)
5. **Staff Picture** (required) - JPG/PNG, max 5MB
6. **Hiring Officer Name** (required)

## 🔄 Workflow

1. User fills out the form and uploads a staff picture
2. Form validates all required fields
3. On submission:
   - Image uploads to Google Drive
   - Shareable link is generated
   - Data appends to Google Sheet
   - Excel file is generated from sheet data
   - Email is sent with Excel attachment
4. Success message is displayed to user

## 🛠️ API Endpoints

### POST `/api/submit-staff`
Submit staff data with image upload.

**Request**: `multipart/form-data`
- All form fields
- `staffPicture` file

**Response**:
```json
{
  "success": true,
  "message": "Staff data submitted successfully!",
  "data": {
    "name": "John Doe",
    "pictureUrl": "https://drive.google.com/...",
    "emailSent": true,
    "recipient": "admin@company.com"
  }
}
```

### GET `/api/health`
Check system health and service status.

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-12-02T14:00:00.000Z",
  "services": {
    "drive": "OK",
    "sheets": "OK",
    "email": "OK"
  }
}
```

### GET `/api/test-email`
Send a test email to verify configuration.

## 🎨 Technologies Used

### Frontend
- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript
- Google Fonts (Inter)

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- Google APIs (Drive & Sheets)
- XLSX (Excel generation)
- Nodemailer (email)

## 🔒 Security

- Environment variables for sensitive data
- File type and size validation
- Service account authentication
- CORS configuration
- Input sanitization
- Secure file handling

**Important**: Never commit `.env` or service account credentials to version control!

## 🐛 Troubleshooting

### Quick Diagnostic

If you encounter any errors, run the diagnostic script first:

```bash
node diagnose-auth.js
```

This will check your credentials, environment variables, and API access, providing specific guidance on how to fix any issues found.

### Common Issues

**Server won't start**
- Check if port 3000 is available
- Verify all dependencies are installed (`npm install`)

**500 Internal Server Error on submission**
- Run `node diagnose-auth.js` to identify the issue
- Most commonly caused by invalid or missing service account credentials

**Google API Authentication Errors**

**Error: "Invalid grant: account not found"**
- The service account has been deleted or credentials are outdated
- **Fix**:
  1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
  2. Create a new service account or verify existing one
  3. Download NEW credentials (JSON key)
  4. Replace `credentials/service-account.json`
  5. Run `node diagnose-auth.js` to verify

**Error: "API has not been used" or "not enabled"**
- Required APIs are not enabled in Google Cloud Console
- **Fix**:
  1. Enable Google Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com
  2. Enable Google Sheets API: https://console.cloud.google.com/apis/library/sheets.googleapis.com
  3. Wait a few minutes for changes to propagate

**Error: "File/Sheet not found" or "not accessible"**
- Service account doesn't have access to the resources
- **Fix**:
  1. Open your Google Drive folder
  2. Click "Share" and add your service account email (found in credentials file or diagnostic output)
  3. Give it "Editor" permissions
  4. Repeat for the Google Sheet

**Email not sending**
- For Gmail: Use App Password, not regular password
- Verify 2-Step Verification is enabled
- Check email credentials in `.env`

### Diagnostic Tools

**Health Check Endpoint**
```bash
curl http://localhost:3000/api/health
```
Shows the status of all services (Drive, Sheets, Email)

**Test Full Flow**
```bash
node test-full-flow.js
```
Tests the complete submission workflow without the frontend

**Diagnostic Script**
```bash
node diagnose-auth.js
```
Comprehensive check of credentials, environment variables, and API access

See [SETUP.md](SETUP.md) for more troubleshooting tips.

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Data export in multiple formats (CSV, PDF)
- [ ] Advanced search and filtering
- [ ] Dashboard with analytics
- [ ] Bulk data import
- [ ] Audit logs
- [ ] Role-based access control

## 📄 License

ISC License

## 👥 Support

For setup assistance or issues:
1. Check [SETUP.md](SETUP.md) for detailed instructions
2. Review server logs for error messages
3. Verify all environment variables are configured
4. Ensure Google Cloud services are properly set up

## 🙏 Acknowledgments

- Google Cloud Platform for Drive and Sheets APIs
- Express.js community
- All open-source contributors

---

**Made with ❤️ for Sunrise Database**
