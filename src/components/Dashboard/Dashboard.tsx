import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardStats } from './DashboardStats';
import { Flashcard } from '../Flashcard/Flashcard';
import { VocabularyList } from '../Vocabulary/VocabularyList';
import { TestMode } from '../Test/TestMode';
import { Header } from './Header';
import { BookOpen, Brain, ClipboardCheck, Upload, Menu } from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '../../types';

type View = 'dashboard' | 'flashcard' | 'vocabulary' | 'test';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  async function loadDashboardStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [progressData, dailyStatsData] = await Promise.all([
        supabase
          .from('vocabulary_progress')
          .select('*')
          .eq('user_id', user!.id),
        supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', user!.id)
          .eq('date', today)
          .maybeSingle(),
      ]);

      const progress = progressData.data || [];
      const wordsToReviewToday = progress.filter((p) => {
        const nextReview = new Date(p.next_review_date);
        return nextReview <= new Date();
      }).length;

      const masteredWords = progress.filter((p) => p.status === 'mastered').length;
      const learningWords = progress.filter((p) => p.status === 'learning').length;

      const totalAnswers = dailyStatsData.data?.total_answers || 0;
      const correctAnswers = dailyStatsData.data?.correct_answers || 0;
      const accuracyRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

      setStats({
        wordsToReviewToday,
        wordsLearned: progress.length,
        currentStreak: profile?.current_streak || 0,
        totalXP: profile?.total_xp || 0,
        accuracyRate,
        masteredWords,
        learningWords,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const navigationItems = [
    { id: 'dashboard' as View, icon: BookOpen, label: 'Dashboard' },
    { id: 'flashcard' as View, icon: Brain, label: 'Study' },
    { id: 'vocabulary' as View, icon: Upload, label: 'Vocabulary' },
    { id: 'test' as View, icon: ClipboardCheck, label: 'Test' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        profile={profile}
        onSignOut={signOut}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
      />

      <div className="flex">
        <aside className={`${menuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-screen pt-16`}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 pt-16">
          <div className="max-w-7xl mx-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {currentView === 'dashboard' && stats && (
                  <DashboardStats stats={stats} onStartStudy={() => setCurrentView('flashcard')} />
                )}
                {currentView === 'flashcard' && <Flashcard onComplete={loadDashboardStats} />}
                {currentView === 'vocabulary' && <VocabularyList />}
                {currentView === 'test' && <TestMode onComplete={loadDashboardStats} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
