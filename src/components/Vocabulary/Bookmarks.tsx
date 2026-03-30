import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookmarkCheck, Trash2, Volume2, Sparkles, Sprout } from 'lucide-react';

export function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadBookmarks();
  }, [user]);

  // Hàm lấy dữ liệu từ bảng bookmarks và join với bảng vocabulary
  async function loadBookmarks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*, vocabulary:word_id(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Lỗi chăm sóc khu vườn:', error);
    } finally {
      setLoading(false);
    }
  }

  // Hàm xóa khỏi khu vườn (Unbookmark)
  async function removeBookmark(wordId: string) {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user!.id)
        .eq('word_id', wordId);

      if (error) throw error;
      
      // Cập nhật state cục bộ để biến mất ngay lập tức cho mượt
      setBookmarks(prev => prev.filter(b => b.word_id !== wordId));
      
      const audio = new Audio('/sounds/incorrect.mp3'); // Tiếng "tách" nhẹ khi xóa
      audio.volume = 0.3;
      audio.play().catch(() => {});
      
    } catch (error) {
      console.error('Lỗi khi nhổ cỏ:', error);
    }
  }

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  if (loading) return <div className="text-center py-20 font-bold text-green-500 animate-pulse">Mèo đang tưới cây... 💧🐱</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Khu Vườn */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-green-400 to-emerald-500 p-8 rounded-[3rem] text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
            Khu Vườn Của Bạn <Sprout className="w-10 h-10" />
          </h2>
          <p className="font-medium opacity-90 mt-1">Nơi lưu giữ {bookmarks.length} đóa hoa từ vựng khó nhằn~</p>
        </div>
        <Sparkles className="absolute right-10 top-10 w-24 h-24 opacity-20 rotate-12" />
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-green-100">
          <img src="https://media.tenor.com/z69_S-O6v_kAAAAi/cat-peach.gif" className="w-40 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-bold text-xl">Khu vườn đang trống trơn, bạn đi "hái hoa" ở Thư Viện nhé! 🐾</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((item) => (
            <div key={item.id} className="bg-white border-4 border-green-50 rounded-[2.5rem] p-6 hover:shadow-xl transition-all group relative">
              <div className="flex justify-between items-start">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="text-4xl font-black text-gray-800">{item.vocabulary?.hanzi}</h3>
                    <div className="flex flex-col">
                      <span className="text-green-500 font-bold">{item.vocabulary?.pinyin}</span>
                      <span className="text-[10px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full w-fit">
                        HSK {item.vocabulary?.hsk_level}
                      </span>
                    </div>
                  </div>

                  <p className="text-xl text-gray-700 font-bold bg-green-50/50 px-4 py-2 rounded-2xl w-fit border border-green-50">
                    {item.vocabulary?.meaning_vi}
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                    <p className="text-gray-800 font-medium italic">"{item.vocabulary?.example_sentence}"</p>
                    <p className="text-sm text-gray-400 mt-1">{item.vocabulary?.example_pinyin}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => speak(item.vocabulary?.hanzi)}
                    className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => removeBookmark(item.word_id)}
                    className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    title="Nhổ cỏ khỏi vườn"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}