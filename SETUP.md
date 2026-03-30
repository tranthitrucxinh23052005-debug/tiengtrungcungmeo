# Quick Setup Guide

## Step 1: Configure Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project (note: it takes 2-3 minutes to provision)
3. Once ready, go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

## Step 2: Update Environment Variables

Open the `.env` file in the project root and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Add Sample Vocabulary (Optional)

The database schema is already created. To add sample Chinese words:

1. Go to your Supabase project
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy and paste the contents of `sample-vocabulary.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

This will add 20 sample Chinese words to your vocabulary library.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run the App

```bash
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173)

## Step 6: Create Your Account

1. Click "Sign up"
2. Enter your email, password, and name
3. Click "Sign Up"
4. After success, click "Go to Sign In"
5. Sign in with your credentials

## Step 7: Start Learning

1. Go to the **Vocabulary** tab
2. Click "Learn" on any word to add it to your study queue
3. Go to **Study** to review flashcards
4. Take **Tests** to reinforce your learning
5. Check your **Dashboard** for progress tracking

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure you've updated the `.env` file with your actual Supabase credentials
- Restart the dev server after updating `.env`

### No vocabulary appears
- Run the `sample-vocabulary.sql` file in Supabase SQL Editor
- Or add words manually via the Vocabulary tab

### Authentication not working
- Verify your Supabase URL and anon key are correct
- Check the browser console for detailed error messages
- Make sure your Supabase project is active

### Database errors
- The migrations are already applied
- Check the Supabase dashboard → Database → Tables to verify tables exist
- Re-run the migration if needed via the Supabase dashboard

## Next Steps

- Study 10-15 new words daily
- Review flashcards when they're due
- Maintain your streak
- Take tests to check your progress
- Bookmark difficult words

Happy learning! 加油！
