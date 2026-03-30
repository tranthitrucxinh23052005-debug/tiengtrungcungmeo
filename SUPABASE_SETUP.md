# Supabase Setup Instructions

This app requires Supabase for database and authentication. Follow these steps to get your Supabase credentials.

## Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

## Create a New Project

1. After signing in, click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `chinese-vocab-app` (or any name you like)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is sufficient

4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

## Get Your API Credentials

1. Once your project is ready, click on **Settings** (gear icon) in the sidebar
2. Click **API** under Project Settings
3. You'll see two important values:

### Project URL
- Look for "Project URL"
- It looks like: `https://xxxxxxxxxxxxx.supabase.co`
- Copy this entire URL

### Anon/Public Key
- Look for "Project API keys"
- Find the **anon** **public** key (not the service_role key!)
- It's a long string starting with `eyJ...`
- Copy this entire key

## Configure Your App

1. Open the `.env` file in your project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**:
- Use your actual values, not the examples above
- Don't add quotes around the values
- Don't share these credentials publicly

## Verify Database Setup

The database schema should already be applied via migrations. To verify:

1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - `vocabulary`
   - `user_profiles`
   - `vocabulary_progress`
   - `daily_stats`
   - `bookmarks`

If tables are missing, check the Migrations section.

## Add Sample Data

1. Go to **SQL Editor** in Supabase
2. Click **New query**
3. Copy the contents of `sample-vocabulary.sql` from this project
4. Paste into the SQL Editor
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. You should see "Success. No rows returned"

7. Verify by going to **Table Editor** → **vocabulary**
8. You should see 20 Chinese vocabulary entries

## Test the Connection

1. In your terminal, run:
```bash
npm run dev
```

2. Open the app in your browser
3. If you see the login page without errors, the connection works!
4. Try signing up with a test account
5. After signup and login, you should see the dashboard

## Common Issues

### Error: "Missing Supabase environment variables"

**Solution**:
- Check that `.env` file exists in project root
- Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after updating `.env`

### Error: "Failed to fetch" or network errors

**Solution**:
- Verify your Supabase project is active (check dashboard)
- Check your internet connection
- Verify the URL doesn't have typos
- Make sure you used the anon key, not service_role key

### Can't sign up or login

**Solution**:
- Check Supabase **Authentication** → **Providers**
- Ensure "Email" provider is enabled
- Check **Authentication** → **Email Templates** are set
- Look for errors in browser console (F12)

### No tables in database

**Solution**:
- The migrations should be auto-applied
- If not, check with your system administrator
- Tables should include: vocabulary, user_profiles, vocabulary_progress, daily_stats, bookmarks

### No vocabulary data

**Solution**:
- Run the `sample-vocabulary.sql` file in SQL Editor
- Or add words manually through the app's Vocabulary tab

## Security Notes

### What's Safe to Share
- Your project URL (public)
- Your anon/public key (public, safe for frontend)

### What to Keep Secret
- Database password
- Service role key (has admin access!)
- Your `.env` file contents in production

### Row Level Security (RLS)

The app uses RLS to ensure:
- Users can only see their own progress
- Users can only modify their own data
- Vocabulary is readable by all authenticated users
- No user can access another user's data

This is already configured in the database migrations.

## Need Help?

1. Check Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
2. Check browser console for error messages (F12)
3. Verify all setup steps were completed
4. Try creating a new Supabase project if issues persist

## Next Steps

Once Supabase is configured:
1. Run the app: `npm run dev`
2. Create an account
3. Add or load vocabulary
4. Start learning!

Happy learning! 🚀
