# Production Environment Configuration for Render

Create a `.env` file with these values:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_KEY=your-production-anon-key-here

# Server Configuration
PORT=3000
NODE_ENV=production
```

## Instructions:

1. **Get Supabase Credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy Project URL and anon/public key

2. **Update .env File:**
   - Replace placeholder values with actual credentials
   - Save the file

3. **Push to GitHub:**
   - Commit the .env file (it's gitignored for security)
   - You'll add these as Environment Variables in Render dashboard

4. **Security:**
   - NEVER commit .env to public repositories
   - Use Render's Environment Variables feature instead
   - Keep production and development credentials separate

## For Render Deployment:

You'll add these values in Render dashboard under "Environment Variables":
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `NODE_ENV`

**Note:** No BASE_PATH needed for Render deployment!
