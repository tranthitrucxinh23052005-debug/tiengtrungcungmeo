import type { Database } from './database';

export type Vocabulary = Database['public']['Tables']['vocabulary']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type VocabularyProgress = Database['public']['Tables']['vocabulary_progress']['Row'];
export type DailyStats = Database['public']['Tables']['daily_stats']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];

export interface VocabularyWithProgress extends Vocabulary {
  progress?: VocabularyProgress;
  bookmarked?: boolean;
}

export interface ReviewCard {
  vocabulary: Vocabulary;
  progress: VocabularyProgress;
}

export interface DashboardStats {
  wordsToReviewToday: number;
  wordsLearned: number;
  currentStreak: number;
  totalXP: number;
  accuracyRate: number;
  masteredWords: number;
  learningWords: number;
}

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}
export interface Grammar {
  id: string;
  hsk_level: number;
  title: string;
  explanation: string;
  formula: string;
  examples: { zh: string; py: string; vi: string }[];
  category: string;
}
export type StudyMode = 'flashcard' | 'test' | 'learn';
export type TestMode = 'zh-to-vi' | 'vi-to-zh';
