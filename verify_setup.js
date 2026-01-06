
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function verify() {
    console.log('--- Verifying Supabase Configuration ---');

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
        console.error('❌ Error: SUPABASE_URL or SUPABASE_KEY is missing in .env');
        process.exit(1);
    }

    // Check if they are default values
    if (url.includes('your_project_url') || key.includes('your_anon_public_key')) {
        console.error('❌ Error: Default placeholders found in .env. Please replace them with actual credentials.');
        process.exit(1);
    }

    console.log('✓ Credentials found in .env');

    try {
        const supabase = createClient(url, key);

        // 1. Check Table Access
        console.log('Checking "staff_records" table...');
        const { data, error: tableError } = await supabase
            .from('staff_records')
            .select('id')
            .limit(1);

        if (tableError) {
            console.error('❌ Database Error:', tableError.message);
            console.error('  Hint: Did you run the SQL to create the table/policies?');
        } else {
            console.log('✓ Database connection successful (Table "staff_records" found)');
        }

        // 2. Check Storage Access
        console.log('Checking "staff-photos" storage bucket...');
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();

        if (storageError) {
            console.error('❌ Storage Error:', storageError.message);
        } else {
            const bucket = buckets.find(b => b.name === 'staff-photos');
            if (bucket) {
                console.log('✓ Storage bucket "staff-photos" found');
                if (bucket.public) {
                    console.log('✓ Bucket is Public');
                } else {
                    console.warn('⚠️  Warning: Bucket "staff-photos" is NOT Public. Images might not load for users.');
                }
            } else {
                console.error('❌ Error: Bucket "staff-photos" not found. Please create it in Supabase Storage.');
            }
        }

    } catch (err) {
        console.error('Unexpected error during verification:', err);
    }
    console.log('--- Verification Complete ---');
}

verify();
