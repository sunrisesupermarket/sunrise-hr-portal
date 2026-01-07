
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

    /**
     * Delete staff record and associated photo
     * @param {string} id - Staff ID
     * @param {string} pictureUrl - Staff picture URL (optional)
     */
    async deleteStaff(id, pictureUrl) {
        if (!this.client) this.initialize();

        try {
            // 1. Delete Photo if exists
            if (pictureUrl) {
                try {
                    const u = new URL(pictureUrl);
                    const parts = u.pathname.split('/').filter(Boolean);
                    const idx = parts.indexOf('public');
                    if (idx !== -1 && parts[idx + 1]) {
                        const bucket = parts[idx + 1];
                        const path = parts.slice(idx + 2).join('/');
                        
                        if (bucket && path) {
                            const { error: storageError } = await this.client.storage
                                .from(bucket)
                                .remove([path]);
                                
                            if (storageError) {
                                console.warn('Storage cleanup warning:', storageError.message);
                            } else {
                                console.log(`Deleted file: ${bucket}/${path}`);
                            }
                        }
                    }
                } catch (urlErr) {
                    console.warn('Invalid picture URL during cleanup:', urlErr.message);
                }
            }

            // 2. Delete Record
            const { error } = await this.client
                .from('staff_records')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Supabase delete error:', error);
            throw new Error(`Failed to delete staff: ${error.message}`);
        }
    }
}

module.exports = new SupabaseService();
