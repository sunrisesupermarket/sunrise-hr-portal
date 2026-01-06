
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

class SupabaseService {
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        // Prefer Service Key for server-side operations (bypasses RLS), fallback to Anon Key
        this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
        this.client = null;
    }

    initialize() {
        if (!this.supabaseUrl || !this.supabaseKey) {
            throw new Error('Missing Supabase credentials in .env');
        }
        this.client = createClient(this.supabaseUrl, this.supabaseKey);
        console.log('✓ Supabase client initialized');
    }

    /**
     * Upload an image to Supabase Storage
     * @param {Object} file - Multer file object
     * @param {string} fullName - Staff name for file naming
     * @returns {Promise<Object>} - Contains publicURL
     */
    async uploadImage(file, fullName) {
        if (!this.client) this.initialize();

        try {
            const fileExt = file.originalname.split('.').pop();
            const sanitizedName = fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${sanitizedName}_${Date.now()}.${fileExt}`;

            // Read file content
            const fileContent = fs.readFileSync(file.path);

            const { data, error } = await this.client.storage
                .from('staff-photos')
                .upload(fileName, fileContent, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: publicData } = this.client.storage
                .from('staff-photos')
                .getPublicUrl(fileName);

            return {
                path: data.path,
                shareableLink: publicData.publicUrl
            };
        } catch (error) {
            console.error('Supabase upload error:', error);
            throw new Error(`Failed to upload to Supabase: ${error.message}`);
        }
    }

    /**
     * Save staff data to Supabase Database
     * @param {Object} staffData 
     */
    async saveStaffData(staffData) {
        if (!this.client) this.initialize();

        try {
            const { data, error } = await this.client
                .from('staff_records')
                .insert([
                    {
                        full_name: staffData.fullName,
                        resumption_date: staffData.resumptionDate,
                        exit_date: staffData.exitDate,
                        location: staffData.location,
                        designation: staffData.designation,
                        hiring_officer: staffData.hiringOfficer,
                        picture_url: staffData.pictureUrl
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Supabase save database error:', error);
            throw new Error(`Failed to save to Supabase: ${error.message}`);
        }
    }

    /**
     * Fetch all staff records
     * @returns {Promise<Array>}
     */
    async getAllStaff() {
        if (!this.client) this.initialize();

        try {
            const { data, error } = await this.client
                .from('staff_records')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Supabase fetch error:', error);
            throw new Error(`Failed to fetch staff records: ${error.message}`);
        }
    }
}

module.exports = new SupabaseService();
