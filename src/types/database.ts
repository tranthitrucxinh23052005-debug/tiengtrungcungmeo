export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vocabulary: {
        Row: {
          id: string
          hanzi: string
          pinyin: string
          meaning_vi: string
          example_sentence: string
          example_pinyin: string
          chunk: string
          chunk_pinyin: string
          hsk_level: number
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hanzi: string
          pinyin: string
          meaning_vi: string
          example_sentence: string
          example_pinyin: string
          chunk?: string
          chunk_pinyin?: string
          hsk_level?: number
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hanzi?: string
          pinyin?: string
          meaning_vi?: string
          example_sentence?: string
          example_pinyin?: string
          chunk?: string
          chunk_pinyin?: string
          hsk_level?: number
          audio_url?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          total_xp: number
          current_streak: number
          longest_streak: number
          last_study_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          last_study_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          last_study_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vocabulary_progress: {
        Row: {
          id: string
          user_id: string
          word_id: string
          level: number
          easiness_factor: number
          interval: number
          repetitions: number
          last_review_date: string | null
          next_review_date: string
          status: 'learning' | 'mastered'
          times_forgotten: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          level?: number
          easiness_factor?: number
          interval?: number
          repetitions?: number
          last_review_date?: string | null
          next_review_date?: string
          status?: 'learning' | 'mastered'
          times_forgotten?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          level?: number
          easiness_factor?: number
          interval?: number
          repetitions?: number
          last_review_date?: string | null
          next_review_date?: string
          status?: 'learning' | 'mastered'
          times_forgotten?: number
          created_at?: string
          updated_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          words_learned: number
          words_reviewed: number
          cards_studied: number
          correct_answers: number
          total_answers: number
          accuracy: number
          xp_gained: number
          study_time_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          words_learned?: number
          words_reviewed?: number
          cards_studied?: number
          correct_answers?: number
          total_answers?: number
          accuracy?: number
          xp_gained?: number
          study_time_minutes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          words_learned?: number
          words_reviewed?: number
          cards_studied?: number
          correct_answers?: number
          total_answers?: number
          accuracy?: number
          xp_gained?: number
          study_time_minutes?: number
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          word_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word_id?: string
          note?: string | null
          created_at?: string
        }
      }
    }
  }
}
