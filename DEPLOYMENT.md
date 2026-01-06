# Quick Deployment Checklist

## Step 1: Clean Your .env File

Open `e:\Sunrise\Database\.env` and ensure it contains **ONLY** these two lines:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
```

**Delete everything else** - all Google credentials, email settings, etc. are no longer needed.

---

## Step 2: Secure Supabase (CRITICAL)

### Enable Row Level Security

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS on staff_records table
ALTER TABLE staff_records ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for registration form)
CREATE POLICY "Allow public insert" ON staff_records
FOR INSERT TO anon
WITH CHECK (true);

-- Allow authenticated read (for HR/Admin)
CREATE POLICY "Allow authenticated read" ON staff_records
FOR SELECT TO authenticated
USING (true);

-- Allow authenticated update (for HR only)
CREATE POLICY "Allow authenticated update" ON staff_records
FOR UPDATE TO authenticated
USING (true);
```

### Secure Storage Bucket

```sql
-- Allow public upload to staff-photos
CREATE POLICY "Allow public upload" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'staff-photos');

-- Allow public read from staff-photos
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'staff-photos');
```

---

## Step 3: Deploy to Production

### Option A: Vercel (Recommended - Free)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`

### Option B: Railway (Easy - Free tier available)

1. Go to railway.app
2. Create new project from GitHub
3. Add environment variables in Railway dashboard

### Option C: Your Own Server

1. Upload files via FTP/SSH
2. Install Node.js on server
3. Set environment variables in hosting control panel
4. Run: `npm install && npm start`
5. Use PM2 for process management: `pm2 start server.js`

---

## Step 4: Test Before Going Live

- [ ] Test public registration form
- [ ] Test HR login and dashboard
- [ ] Test Admin login and dashboard
- [ ] Test Excel export
- [ ] Test real-time updates
- [ ] Verify images upload correctly
- [ ] Check that unauthorized users can't access HR/Admin portals

---

## Security Notes

✅ **Your .env is already protected** by .gitignore
✅ **Never commit .env to GitHub**
✅ **Use different Supabase projects for dev/production** (recommended)
✅ **Always use HTTPS in production** (automatic on Vercel/Railway)

---

## Need Help?

Refer to the detailed `security_guide.md` for comprehensive security measures and troubleshooting.
