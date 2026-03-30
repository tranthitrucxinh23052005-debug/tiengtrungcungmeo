import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { VocabularyUpload } from './VocabularyUpload';
import { Plus, Search, BookmarkPlus, BookmarkCheck, Play, CheckCircle, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import type { VocabularyWithProgress } from '../../types';

interface VocabularyListProps {
  initialFilter?: 'all' | 'learning' | 'mastered' | 'not_started';
}

export function VocabularyList({ initialFilter = 'all' }: VocabularyListProps) {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<VocabularyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  
  // 🐾 QUẢN LÝ PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20; 

  const [filterHsk, setFilterHsk] = useState<string>('all'); 
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);

  // Reset về trang 1 khi thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterHsk, filterStatus]);

  useEffect(() => {
    if (user) loadVocabulary();
  }, [user, currentPage, searchTerm, filterHsk, filterStatus, initialFilter]);

  const playSound = (type: 'correct' | 'finish') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  async function loadVocabulary() {
    try {
      setLoading(true);
      
      // 1. Tính toán vị trí lấy dữ liệu
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // 2. Xây dựng câu truy vấn từ vựng
      let query = supabase
        .from('vocabulary')
        .select('*', { count: 'exact' });

      if (filterHsk !== 'all') {
        query = query.eq('hsk_level', Number(filterHsk));
      }

      if (searchTerm) {
        query = query.or(`hanzi.ilike.%${searchTerm}%,pinyin.ilike.%${searchTerm}%,meaning_vi.ilike.%${searchTerm}%`);
      }

      const { data: vocabData, count, error: vocabError } = await query
        .order('hsk_level', { ascending: true })
        .range(from, to);

      if (vocabError) throw vocabError;
      setTotalCount(count || 0);

      // 3. Lấy tiến độ và bookmark của user
      const [progressData, bookmarksData] = await Promise.all([
        supabase.from('vocabulary_progress').select('*').eq('user_id', user!.id),
        supabase.from('bookmarks').select('word_id').eq('user_id', user!.id),
      ]);

      const progressMap = new Map((progressData.data || []).map((p) => [p.word_id, p]));
      const bookmarkSet = new Set((bookmarksData.data || []).map((b) => b.word_id));

      const enrichedVocab = (vocabData || []).map((v) => ({
        ...v,
        hsk_level: v.hsk_level ? Number(v.hsk_level) : 0,
        progress: progressMap.get(v.id),
        bookmarked: bookmarkSet.has(v.id),
      }));

      // Lọc theo trạng thái status (Filter Client-side sau khi đã lấy trang)
      // Nếu TS muốn lọc status trên toàn bộ 2000 từ, cần nâng cấp câu Query Join bảng
      setVocabulary(enrichedVocab);
    } catch (error) {
      console.error('Lỗi tải kho:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startLearning(word: VocabularyWithProgress) {
    try {
      await supabase.from('vocabulary_progress').insert({
        user_id: user!.id,
        word_id: word.id,
        status: 'learning',
        next_review_date: new Date().toISOString(),
      });
      playSound('correct');
      setVocabulary(prev => prev.map(v => v.id === word.id ? { ...v, progress: { status: 'learning' } as any } : v));
    } catch (error) { console.error(error); }
  }

  async function toggleBookmark(word: VocabularyWithProgress) {
    if (word.bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user!.id).eq('word_id', word.id);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user!.id, word_id: word.id });
    }
    setVocabulary(prev => prev.map(v => v.id === word.id ? { ...v, bookmarked: !v.bookmarked } : v));
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && vocabulary.length === 0) return <div className="text-center py-20 font-bold text-pink-500 animate-pulse">Đang tìm từ vựng cho TS... 🐾</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Thư Viện 💎</h2>
          <p className="text-gray-500 font-bold">Tổng cộng {totalCount} từ trong kho</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} className="bg-pink-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2 w-fit">
          <Plus className="w-6 h-6" /> THÊM TỪ
        </button>
      </div>

      {showUpload && <VocabularyUpload onSuccess={() => { setShowUpload(false); loadVocabulary(); }} onCancel={() => setShowUpload(false)} />}

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-4 border-pink-50 space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-pink-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm trong 2,342 từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-pink-50/30 border-2 border-transparent focus:border-pink-200 rounded-2xl outline-none transition-all font-bold"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 flex-wrap">
            <span className="text-[10px] font-black text-gray-400 px-2 uppercase">Cấp độ:</span>
            {['all', '1', '2', '3', '4', '5', '6'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterHsk(level)}
                className={`px-4 py-1.5 rounded-xl text-sm font-black transition-all ${
                  filterHsk === level ? 'bg-pink-500 text-white shadow-md scale-105' : 'text-gray-400 hover:bg-white'
                }`}
              >
                {level === 'all' ? 'Tất cả' : `HSK ${level}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black text-gray-400 px-2 uppercase">Trạng thái:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-1.5 rounded-xl text-sm font-black transition-all ${filterStatus === 'all' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}
            >
              Mọi từ
            </button>
            <button
              onClick={() => setFilterStatus('learning')}
              className={`px-4 py-1.5 rounded-xl text-sm font-black transition-all ${filterStatus === 'learning' ? 'bg-green-500 text-white shadow-md' : 'text-gray-400 hover:bg-white'}`}
            >
              Đang học
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vocabulary.map((word) => (
          <div key={word.id} className="bg-white border-4 border-pink-50 rounded-[2.5rem] p-6 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-5xl font-black text-gray-800 tracking-tighter">{word.hanzi}</h3>
                  <div className="flex flex-col">
                    <span className="text-pink-500 font-bold">{word.pinyin}</span>
                    <span className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full w-fit mt-1 shadow-sm">HSK {word.hsk_level}</span>
                  </div>
                </div>
                <p className="text-xl text-gray-700 font-bold bg-pink-50/50 px-4 py-2 rounded-2xl w-fit border border-pink-50">{word.meaning_vi}</p>
                <p className="text-gray-500 italic leading-snug">"{word.example_sentence}"</p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={() => toggleBookmark(word)} className={`p-3 rounded-2xl transition-all shadow-sm ${word.bookmarked ? 'bg-yellow-400 text-white rotate-12 scale-110' : 'bg-gray-50 text-gray-400'}`}>
                  {word.bookmarked ? <BookmarkCheck className="w-6 h-6" /> : <BookmarkPlus className="w-6 h-6" />}
                </button>

                {word.progress?.status === 'mastered' ? (
                  <div className="flex flex-col items-center gap-1 bg-purple-50 p-2 rounded-2xl border border-purple-100">
                    <GraduationCap className="w-6 h-6 text-purple-500" />
                    <span className="text-[10px] font-black text-purple-600 uppercase">Đã thuộc</span>
                  </div>
                ) : word.progress?.status === 'learning' ? (
                  <div className="flex flex-col items-center gap-1 bg-green-50 p-2 rounded-2xl border border-green-100">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-[10px] font-black text-green-600 uppercase">Đang học</span>
                  </div>
                ) : (
                  <button onClick={() => startLearning(word)} className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-2xl font-bold shadow-lg active:scale-95 flex flex-col items-center gap-1">
                    <Play className="w-6 h-6 fill-current" />
                    <span className="text-[10px] font-black uppercase">Học!</span>
                  </button>
                )}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-pink-50 text-8xl font-black opacity-20 group-hover:scale-110 transition-transform pointer-events-none select-none">🐾</div>
          </div>
        ))}
      </div>

      {/* 🐾 THANH ĐIỀU HƯỚNG PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 bg-white p-4 rounded-3xl shadow-lg border-4 border-pink-50 w-fit mx-auto">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-pink-100 rounded-xl disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-8 h-8 text-pink-500" />
          </button>
          
          <div className="flex items-center gap-3 font-black text-lg text-gray-700 px-4">
            <span className="text-pink-500 text-2xl">{currentPage}</span>
            <span className="text-gray-300">/</span>
            <span>{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-pink-100 rounded-xl disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-8 h-8 text-pink-500" />
          </button>
        </div>
      )}
    </div>
  );
}