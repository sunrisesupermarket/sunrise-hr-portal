# Render Deployment Quick Reference

## Your Live URLs

After deployment, your app will be at:

**Public Registration:**
`https://your-app-name.onrender.com`

**HR Portal:**
`https://your-app-name.onrender.com/hr`

**Admin Portal:**
`https://your-app-name.onrender.com/admin`

---

## Required Credentials

### Supabase Production
- Project URL: `https://your-project.supabase.co`
- Anon Key: `eyJ...` (from Settings > API)

### GitHub
- Repository: `sunrise-hr-portal`
- Branch: `main`

### Render
- Account: Sign up with GitHub
- Service Name: `sunrise-hr`
- Instance: Free tier

---

## Environment Variables (Add in Render)

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon key |
| `NODE_ENV` | `production` |

---

## User Accounts (Create in Supabase)

**Admin:**
- Email: `admin@sunrise.com` (must contain "admin")
- Password: (strong password)

**HR:**
- Email: `hr@sunrise.com` (no "admin")
- Password: (strong password)

---

## Deployment Steps Summary

1. ✅ Create Supabase production project
2. ✅ Setup database schema and RLS
3. ✅ Create storage bucket
4. ✅ Push code to GitHub
5. ✅ Create Render account
6. ✅ Connect GitHub repository
7. ✅ Configure environment variables
8. ✅ Deploy and test

---

## Important Notes

**Free Tier:**
- App sleeps after 15 min inactivity
- First load after sleep: 30-60 seconds
- Subsequent loads: Fast
- 750 hours/month free

**Auto-Deploy:**
- Push to GitHub = Auto-deploy on Render
- Takes 2-3 minutes

**Support:**
- Render: render.com/docs
- Supabase: supabase.com/docs
