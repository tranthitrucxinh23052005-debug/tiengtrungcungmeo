import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { VocabularyUpload } from './VocabularyUpload';
import { Plus, Search, BookmarkPlus, BookmarkCheck, Play, CheckCircle, GraduationCap, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';
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

  // 🐾 QUẢN LÝ ÂM THANH
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset về trang 1 khi thay đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterHsk, filterStatus]);

  useEffect(() => {
    if (user) loadVocabulary();
  }, [user, currentPage, searchTerm, filterHsk, filterStatus, initialFilter]);

  // 🐾 HÀM PHÁT ÂM THANH - ÉP BUỘC NGẮT Ở 1.7S
  const handleSpeak = (text: string) => {
    if (!text) return;

    // 1. Dọn dẹp âm thanh cũ ngay lập tức
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Quay về đầu
      audioRef.current.src = ""; // Xóa nguồn
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=zh-CN&client=tw-ob`;
    const audio = new Audio(url);
    
    // Lưu vào ref để mình có quyền kiểm soát "sự sống" của nó
    audioRef.current = audio;
    
    // 2. Bắt đầu phát
    audio.play().catch(error => console.error("Lỗi phát:", error));

    // 3. 🔪 LỆNH TRUY SÁT: Sau đúng 1700ms là phải im lặng!
    setTimeout(() => {
      if (audioRef.current === audio) {
        audio.pause();
        audio.currentTime = 0; 
        audio.src = ""; 
        audioRef.current = null; // Giải phóng Ref hoàn toàn
        console.log("Đã dọn dẹp xong xuôi ở 1.7s cho TS nhé! 🧹🐾");
      }
    }, 1700);
  };

  const playSystemSound = (type: 'correct' | 'finish') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  async function loadVocabulary() {
    try {
      setLoading(true);
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('vocabulary').select('*', { count: 'exact' });

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

      setVocabulary(enrichedVocab);
    } catch (error) {
      console.error('Lỗi tải kho:', error);
    } finally {
      setLoading(false);
    }
  }

 async function startLearning(word: VocabularyWithProgress) {
    try {
      // 1. Lưu tiến độ vào Database
      await supabase.from('vocabulary_progress').insert({
        user_id: user!.id,
        word_id: word.id,
        status: 'learning',
        next_review_date: new Date().toISOString(),
      });

      // 2. PHÁT ÂM THANH HỆ THỐNG - ÉP BUỘC DỪNG Ở 1.7S
      const systemAudio = new Audio('/sounds/correct.mp3');
      systemAudio.volume = 0.4;
      systemAudio.play().catch(() => {});

      // 🔪 LỆNH TRẢM: Đúng 1.7 giây là im lặng, không nói nhiều!
      setTimeout(() => {
        systemAudio.pause();
        systemAudio.src = "";
        systemAudio.load();
        console.log("Mèo đã 'trảm' âm thanh hệ thống ở 1.7s! 🐾🧹");
      }, 1700);

      // 3. Cập nhật giao diện ngay lập tức
      setVocabulary(prev => prev.map(v => v.id === word.id ? { ...v, progress: { status: 'learning' } as any } : v));
      
    } catch (error) { 
      console.error("Lỗi khi bắt đầu học:", error); 
    }
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
            placeholder="Tìm kiếm từ vựng..."
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
                    <div className="flex items-center gap-2">
                      <span className="text-pink-500 font-bold">{word.pinyin}</span>
                      <button 
                        onClick={() => handleSpeak(word.hanzi)}
                        className="p-1.5 bg-pink-50 text-pink-500 rounded-lg hover:bg-pink-500 hover:text-white transition-colors"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <span className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full w-fit mt-1 shadow-sm">HSK {word.hsk_level}</span>
                  </div>
                </div>
                <p className="text-xl text-gray-700 font-bold bg-pink-50/50 px-4 py-2 rounded-2xl w-fit border border-pink-50">{word.meaning_vi}</p>
                <div className="flex items-start gap-2">
                  <p className="text-gray-500 italic leading-snug flex-1">"{word.example_sentence}"</p>
                  <button onClick={() => handleSpeak(word.example_sentence || '')} className="text-gray-300 hover:text-pink-400 p-1">
                    <Volume2 size={14} />
                  </button>
                </div>
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
          </div>
        ))}
      </div>

      {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
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