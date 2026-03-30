import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardStats } from './DashboardStats';
import { Flashcard } from '../Flashcard/Flashcard';
import { VocabularyList } from '../Vocabulary/VocabularyList';
import { TestMode } from '../Test/TestMode';
import { Header } from './Header';
import { Bookmarks } from '../Vocabulary/Bookmarks';
// 🐾 THÊM: Import component Ngữ pháp mới
import { GrammarList } from './GrammarList'; 
import { BookOpen, Brain, ClipboardCheck, Upload, Flower2, GraduationCap, Sparkles } from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '../../types';

// Giao diện hiển thị các giai đoạn phát triển của hoa Tulip 🌷
const TulipGarden = ({ cardsStudied }: { cardsStudied: number }) => {
  let stageIcon = '🌱';
  let stageText = 'Hạt giống (Chưa học từ nào nha)';
  let stageColor = 'text-green-500';

  if (cardsStudied >= 15) {
    stageIcon = '🌷';
    stageText = 'Hoa Tulip nở rộ';
    stageColor = 'text-pink-500';
  } else if (cardsStudied >= 10) {
    stageIcon = '🥀';
    stageText = 'Nụ hoa';
    stageColor = 'text-rose-400';
  } else if (cardsStudied >= 5) {
    stageIcon = '🌿';
    stageText = 'Mầm non';
    stageColor = 'text-green-500';
  }

  return (
    <div className="bg-pink-50/50 p-6 rounded-3xl shadow-sm border border-pink-100 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <h3 className="text-xl font-extrabold text-gray-800 mb-6">Trạng thái hôm nay 🌷</h3>
      <div className={`text-7xl mb-6 transition-transform duration-500 hover:scale-110 hover:-rotate-6 cursor-pointer ${stageColor}`}>
        {stageIcon}
      </div>
      <p className="font-bold text-gray-700">{stageText}</p>
      
      <div className="w-full bg-white rounded-full h-3 mt-6 mb-2 shadow-inner">
        <div 
          className="bg-pink-400 h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
          style={{ width: `${Math.min((cardsStudied / 15) * 100, 100)}%` }}
        >
          <div className="absolute top-0 bottom-0 right-0 w-4 bg-white/40 blur-sm"></div>
        </div>
      </div>
      <p className="text-sm font-semibold text-pink-500 mt-2">
        Đã tưới nước: {cardsStudied} / 15 thẻ
      </p>
    </div>
  );
};

// 🐾 CẬP NHẬT: Thêm 'grammar' vào kiểu View
type View = 'dashboard' | 'flashcard' | 'vocabulary' | 'test' | 'garden' | 'grammar';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardsStudiedToday, setCardsStudiedToday] = useState(0);
  const [initialVocabFilter, setInitialVocabFilter] = useState<'all' | 'learning' | 'mastered' | 'not_started'>('all');

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user, currentView]);

  async function loadDashboardStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [vocabCount, progressData, dailyStatsData] = await Promise.all([
        supabase.from('vocabulary').select('*', { count: 'exact', head: true }),
        supabase.from('vocabulary_progress').select('*').eq('user_id', user!.id),
        supabase.from('daily_stats').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle(),
      ]);

      const progress = (progressData.data || []) as any[];

      const wordsToReviewToday = progress.filter((p) => {
        const nextReview = new Date(p.next_review_date || new Date());
        return nextReview <= new Date();
      }).length;

      const masteredWords = progress.filter((p) => p.status === 'mastered').length;
      const learningWords = progress.filter((p) => p.status === 'learning').length;

      const dailyData = dailyStatsData.data as any;
      setCardsStudiedToday(dailyData?.total_answers || 0);

      setStats({
        wordsToReviewToday,
        wordsLearned: vocabCount.count || 0,
        currentStreak: (profile as any)?.current_streak || 0,
        totalXP: (profile as any)?.total_xp || 0,
        accuracyRate: dailyData?.accuracy || 0,
        masteredWords,
        learningWords,
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  }

  // 🐾 CẬP NHẬT: Thêm mục Ngữ Pháp vào Navigation
  const navigationItems = [
    { id: 'dashboard' as View, icon: BookOpen, label: 'Trang Chủ' },
    { id: 'garden' as View, icon: Flower2, label: 'Khu Vườn' },
    { id: 'flashcard' as View, icon: Brain, label: 'Trạm Ôn Tập' },
    { id: 'vocabulary' as View, icon: Upload, label: 'Kho Từ Vựng' },
    { id: 'grammar' as View, icon: GraduationCap, label: 'Ngữ Pháp' }, // <-- Mục mới
    { id: 'test' as View, icon: ClipboardCheck, label: 'Thử Thách' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80">
      <Header
        profile={profile}
        onSignOut={signOut}
        onMenuToggle={() => setMenuOpen(!menuOpen)}
      />

      <div className="flex">
        <aside className={`${menuOpen ? 'block shadow-2xl' : 'hidden'} lg:block w-64 bg-white border-r border-gray-100 min-h-screen pt-16 fixed lg:sticky top-0 z-20 transition-all`}>
          <nav className="p-4 space-y-2 mt-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold ${
                  currentView === item.id
                    ? 'bg-pink-100/50 text-pink-600 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-pink-500'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 pt-16 min-h-screen">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-400"></div>
                <p className="text-pink-500 font-black tracking-widest">MÈO ĐANG CHĂM VƯỜN...</p>
              </div>
            ) : (
              <div className="w-full">
                {currentView === 'dashboard' && stats && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <DashboardStats 
                        stats={stats} 
                        onNavigate={(view, filter) => {
                          setCurrentView(view as View);
                          if (filter) setInitialVocabFilter(filter as any);
                        }} 
                      />
                      <div className="mt-8 bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-pink-50 rotate-12"><Sparkles size={100} /></div>
                        <h3 className="text-xl font-black text-gray-800 mb-4 relative z-10">Mẹo Học Tập 🐾</h3>
                        <ul className="space-y-3 text-gray-600 font-medium relative z-10">
                          <li>✨ Học đều đặn mỗi ngày để duy trì chuỗi Streak nhé!</li>
                          <li>✨ Tập trung vào ngữ cảnh - đọc kỹ các câu ví dụ meo meo~</li>
                          <li>✨ Dùng nút Ẩn/Hiện Pinyin để kiểm tra trí nhớ mặt chữ.</li>
                          <li>✨ Tham gia Thử Thách thường xuyên để củng cố kiến thức.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <TulipGarden cardsStudied={cardsStudiedToday} />
                    </div>
                  </div>
                )}
                
                {currentView === 'garden' && <Bookmarks />}
                
                {currentView === 'flashcard' && (
                  <Flashcard onComplete={() => {
                    loadDashboardStats();
                    setCurrentView('dashboard');
                  }} />
                )}
                
                {currentView === 'vocabulary' && (
                  <VocabularyList initialFilter={initialVocabFilter} />
                )}

                {/* 🐾 THÊM: Hiển thị trang Ngữ Pháp */}
                {currentView === 'grammar' && (
                  <GrammarList />
                )}
                
                {currentView === 'test' && (
                  <TestMode onComplete={() => {
                    loadDashboardStats();
                    setCurrentView('dashboard');
                  }} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}