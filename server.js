require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist (temporary storage)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Services
// Services
const supabaseService = require('./services/supabase');
const excelExportService = require('./services/excelExport');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'staff-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG and PNG allowed.'));
        }
    }
});

// Routes

// 1. Config for Frontend
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseKey: process.env.SUPABASE_KEY
    });
});

// 2. Add New Staff (Protected by Client Auth, server just proxies to Storage)
app.post('/api/staff', upload.single('staffPicture'), async (req, res) => {
    try {
        console.log('Processing new staff submission...');
        const { fullName, resumptionDate, location, designation, hiringOfficer } = req.body;

        if (!req.file) return res.status(400).json({ error: 'Picture required' });

        // Upload Image
        const uploadResult = await supabaseService.uploadImage(req.file, fullName);

        // Save Data
        const staffData = {
            fullName,
            resumptionDate,
            location,
            designation,
            hiringOfficer,
            exitDate: '',
            pictureUrl: uploadResult.shareableLink
        };

        const savedRecord = await supabaseService.saveStaffData(staffData);

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.json({ success: true, data: savedRecord });
    } catch (error) {
        console.error('Error adding staff:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message });
    }
});

// 3. Update Staff (e.g. Exit Date)
// Note: Ideally we use Supabase Client for this, but if we want a server route:
app.put('/api/staff/:id', async (req, res) => {
    // We can implement this via Supabase Service or just let the frontend do it directly.
    // For simplicity given the Supabase setup, let's strictly use the frontend for updates 
    // to utilize the RLS and Auth context of the logged-in user.
    // However, if we need a server proxy:
    res.status(501).json({ message: 'Update via client-side Supabase recommended' });
});

// 4. Admin Export to Excel
app.get('/api/admin/export-excel', async (req, res) => {
    try {
        console.log('Generating Excel report...');
        const staffList = await supabaseService.getAllStaff();
        const buffer = excelExportService.generateExcel(staffList);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Staff_Records.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).send('Failed to generate report');
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}`);
    console.log(`Mode: Secure HR Portal`);
});
