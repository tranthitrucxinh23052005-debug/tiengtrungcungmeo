/*
  # Chinese Vocabulary Learning System Database Schema

  ## 1. New Tables
  
  ### `vocabulary`
  - `id` (uuid, primary key) - Unique identifier for each word
  - `hanzi` (text) - Chinese characters
  - `pinyin` (text) - Romanized pronunciation
  - `meaning_vi` (text) - Vietnamese meaning
  - `example_sentence` (text) - Example sentence in Chinese
  - `example_pinyin` (text) - Pinyin of example sentence
  - `chunk` (text) - Common phrase/chunk containing this word
  - `chunk_pinyin` (text) - Pinyin of the chunk
  - `hsk_level` (integer) - HSK level (1-6)
  - `audio_url` (text, optional) - URL to audio pronunciation
  - `created_at` (timestamptz) - Creation timestamp
  
  ### `user_profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `name` (text) - User display name
  - `total_xp` (integer) - Total experience points
  - `current_streak` (integer) - Current learning streak in days
  - `longest_streak` (integer) - Longest streak achieved
  - `last_study_date` (date) - Last date user studied
  - `created_at` (timestamptz) - Account creation date
  - `updated_at` (timestamptz) - Last profile update
  
  ### `vocabulary_progress`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References user_profiles
  - `word_id` (uuid) - References vocabulary
  - `level` (integer) - Spaced repetition level (0-4+)
  - `easiness_factor` (decimal) - SM-2 easiness factor
  - `interval` (integer) - Days until next review
  - `repetitions` (integer) - Number of successful repetitions
  - `last_review_date` (timestamptz) - Last review timestamp
  - `next_review_date` (timestamptz) - Next scheduled review
  - `status` (text) - 'learning' or 'mastered'
  - `times_forgotten` (integer) - Count of times marked as forgotten
  - `created_at` (timestamptz) - When user first learned this word
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `daily_stats`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References user_profiles
  - `date` (date) - Date of the statistics
  - `words_learned` (integer) - New words learned that day
  - `words_reviewed` (integer) - Words reviewed that day
  - `cards_studied` (integer) - Total flashcards studied
  - `correct_answers` (integer) - Number of correct answers
  - `total_answers` (integer) - Total number of answers
  - `accuracy` (decimal) - Accuracy percentage
  - `xp_gained` (integer) - XP earned that day
  - `study_time_minutes` (integer) - Total study time in minutes
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### `bookmarks`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References user_profiles
  - `word_id` (uuid) - References vocabulary
  - `note` (text, optional) - User's personal note
  - `created_at` (timestamptz) - Bookmark creation timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Vocabulary table is readable by all authenticated users
  - Users can only modify their own progress, stats, and bookmarks

  ## 3. Indexes
  - Index on vocabulary_progress(user_id, next_review_date) for efficient review queries
  - Index on daily_stats(user_id, date) for statistics queries
  - Unique index on vocabulary_progress(user_id, word_id) to prevent duplicates
*/

-- Create vocabulary table (public data, all users can read)
CREATE TABLE IF NOT EXISTS vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hanzi text NOT NULL,
  pinyin text NOT NULL,
  meaning_vi text NOT NULL,
  example_sentence text NOT NULL,
  example_pinyin text NOT NULL,
  chunk text DEFAULT '',
  chunk_pinyin text DEFAULT '',
  hsk_level integer DEFAULT 1 CHECK (hsk_level >= 1 AND hsk_level <= 6),
  audio_url text,
  created_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text DEFAULT '',
  total_xp integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_study_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vocabulary progress table
CREATE TABLE IF NOT EXISTS vocabulary_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  word_id uuid REFERENCES vocabulary(id) ON DELETE CASCADE NOT NULL,
  level integer DEFAULT 0,
  easiness_factor decimal DEFAULT 2.5,
  interval integer DEFAULT 1,
  repetitions integer DEFAULT 0,
  last_review_date timestamptz,
  next_review_date timestamptz DEFAULT now(),
  status text DEFAULT 'learning' CHECK (status IN ('learning', 'mastered')),
  times_forgotten integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- Create daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  words_learned integer DEFAULT 0,
  words_reviewed integer DEFAULT 0,
  cards_studied integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  total_answers integer DEFAULT 0,
  accuracy decimal DEFAULT 0,
  xp_gained integer DEFAULT 0,
  study_time_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  word_id uuid REFERENCES vocabulary(id) ON DELETE CASCADE NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vocab_progress_user_next_review 
  ON vocabulary_progress(user_id, next_review_date);

CREATE INDEX IF NOT EXISTS idx_vocab_progress_user_status 
  ON vocabulary_progress(user_id, status);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date 
  ON daily_stats(user_id, date);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user 
  ON bookmarks(user_id);

-- Enable Row Level Security
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vocabulary (readable by all authenticated users)
CREATE POLICY "Vocabulary is readable by authenticated users"
  ON vocabulary FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert vocabulary"
  ON vocabulary FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vocabulary"
  ON vocabulary FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for vocabulary_progress
CREATE POLICY "Users can view own progress"
  ON vocabulary_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON vocabulary_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON vocabulary_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON vocabulary_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for daily_stats
CREATE POLICY "Users can view own stats"
  ON daily_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON daily_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON daily_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vocabulary_progress_updated_at ON vocabulary_progress;
CREATE TRIGGER update_vocabulary_progress_updated_at
  BEFORE UPDATE ON vocabulary_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();