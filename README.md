# 中文 Learn - Chinese Vocabulary Learning App

A comprehensive Chinese vocabulary learning application based on scientifically proven methods: Spaced Repetition (SM-2 Algorithm), Active Recall, Context-based Learning, and Chunking.

## Features

### Learning Methods
- **Spaced Repetition**: Uses SM-2 algorithm (Anki-style) to optimize review timing
- **Active Recall**: Flashcard system that tests your memory before revealing answers
- **Context-Based Learning**: Every word includes example sentences and common phrases
- **Chunking**: Learn words in meaningful chunks and phrases

### Core Features
- **Flashcard System**: Study with context-first approach, toggle Pinyin visibility
- **Mini Tests**: Test yourself with Chinese ↔ Vietnamese translations
- **Progress Tracking**: Personal dashboard with detailed statistics
- **Streak System**: Maintain daily learning streaks with XP rewards
- **Bookmark System**: Save difficult words for later review
- **Text-to-Speech**: Listen to Chinese pronunciation (browser-based)
- **Vocabulary Management**: Add words manually or upload in bulk

### User Features
- Email/password authentication
- Personal learning progress
- Daily statistics and accuracy tracking
- Mastery levels (Learning → Mastered)
- HSK level organization

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Setup Instructions

### 1. Supabase Setup

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Wait for your database to be provisioned

### 2. Database Migration

1. Go to your Supabase project
2. Navigate to SQL Editor
3. The database schema has already been applied via migrations
4. (Optional) Run the `sample-vocabulary.sql` file to add 20 sample Chinese words

### 3. Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy your project URL and anon/public key
3. Update the `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## How to Use

### Getting Started

1. **Sign Up**: Create an account with your email and password
2. **Add Vocabulary**:
   - Use the sample data by running `sample-vocabulary.sql` in Supabase
   - Or add words manually via the Vocabulary tab
3. **Start Learning**: Click "Learn" on any word to add it to your review queue
4. **Study Daily**: Review flashcards and maintain your streak

### Study Flow

1. **Learn New Words**: Add 10-15 words per day
2. **Review Flashcards**: Study cards due today
3. **Take Tests**: Reinforce learning with mini tests
4. **Track Progress**: Monitor your stats and streak

### Flashcard System

- **Front**: Shows the example sentence in Chinese
- **Toggle Pinyin**: Show/hide romanization
- **Listen**: Use text-to-speech for pronunciation
- **Flip Card**: Reveal the answer with full breakdown
- **Rate Memory**: Mark "Remembered" or "Forgot"

### Spaced Repetition Schedule

Based on SM-2 algorithm:
- First review: 1 day
- Second review: 3 days
- Third review: 7 days
- Fourth review: 14 days
- Continues with increasing intervals

If you mark "Forgot", the word resets to day 1.

### Test Modes

- **Chinese → Vietnamese**: See Chinese characters, select Vietnamese meaning
- **Vietnamese → Chinese**: See Vietnamese meaning, select Chinese characters

## Database Schema

### Tables

- **vocabulary**: Word data (hanzi, pinyin, meaning, examples, HSK level)
- **user_profiles**: User information, XP, streak data
- **vocabulary_progress**: Individual word progress per user (SM-2 data)
- **daily_stats**: Daily learning statistics per user
- **bookmarks**: Saved words per user

## Learning Tips

1. **Study Consistently**: Aim for 10-15 minutes daily
2. **Focus on Context**: Read example sentences carefully
3. **Use Pinyin Toggle**: Test character recognition by hiding pinyin
4. **Review Regularly**: Check your dashboard for due cards
5. **Test Yourself**: Take mini tests to reinforce learning
6. **Bookmark Difficult Words**: Mark challenging words for extra practice

## Features Explained

### Dashboard Stats

- **Due Today**: Words scheduled for review
- **Total Words**: All words in your learning queue
- **Learning**: Words still being learned
- **Mastered**: Words you've mastered (3+ successful reviews)
- **Accuracy**: Your overall test accuracy
- **Total XP**: Experience points earned

### XP System

- Flashcard correct: 10 XP
- Flashcard incorrect: 5 XP
- Test correct: 5 XP
- Test incorrect: 2 XP

### Streak System

- Study at least once per day to maintain streak
- Current streak shows consecutive days
- Longest streak tracks your best performance

## Vocabulary Format

When adding vocabulary, include:
- **Hanzi** (汉字): Chinese characters
- **Pinyin**: Romanized pronunciation
- **Meaning**: Vietnamese translation
- **Example Sentence**: Sentence in Chinese
- **Example Pinyin**: Romanization of example
- **Chunk**: Common phrase using the word
- **Chunk Pinyin**: Romanization of chunk
- **HSK Level**: 1-6

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Text-to-speech requires browser support for Web Speech API
- Mobile responsive design

## Contributing

This is an educational project demonstrating:
- Spaced repetition implementation
- Full-stack TypeScript development
- Supabase integration
- Modern React patterns
- Scientific learning methods

## License

MIT License - Feel free to use for learning and education

## Support

For issues or questions:
1. Check your Supabase connection in `.env`
2. Verify database migrations are applied
3. Check browser console for errors
4. Ensure you have sample data loaded

---

Happy learning! 加油！(jiā yóu - Keep it up!)
