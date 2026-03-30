import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, Search, Star, ChevronDown, ChevronUp } from 'lucide-react';
import type { Grammar } from '../../types';

export function GrammarList() {
  const [grammar, setGrammar] = useState<Grammar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadGrammar();
  }, []);

  async function loadGrammar() {
    try {
      setLoading(true);
      // 🐾 Lấy dữ liệu bao phủ từ HSK 1 đến HSK 5 [cite: 41, 62]
      const { data, error } = await supabase
        .from('grammar_hub')
        .select('*', { count: 'exact' }) 
        .order('hsk_level', { ascending: true })
        .range(0, 1000); 

      if (error) throw error;
      setGrammar(data || []);
    } catch (error) {
      console.error('Lỗi tải ngữ pháp:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredGrammar = grammar.filter(item => 
    item.hsk_level === activeTab &&
    (item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     item.formula.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="text-center py-20 font-bold text-blue-500 animate-pulse">Mèo đang lật bíp kíp ngữ pháp... 🐾</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-800 tracking-tighter">Trạm Ngữ Pháp 📖</h2>
          <p className="text-gray-500 font-bold">Làm chủ cấu trúc, tự tin giao tiếp</p>
        </div>
      </div>

      {/* Tabs Phân Cấp HSK 1-5 [cite: 41, 62] */}
      <div className="flex p-2 bg-gray-100 rounded-3xl w-fit gap-2 overflow-x-auto max-w-full">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => {
              setActiveTab(level);
              setExpandedId(null); // 🐾 Đã sửa lỗi cú pháp dấu ngoặc ở đây
            }}
            className={`px-8 py-3 rounded-2xl font-black transition-all whitespace-nowrap ${
              activeTab === level ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            HSK {level}
          </button>
        ))}
      </div>

      {/* Thanh Tìm Kiếm */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 w-6 h-6" />
        <input
          type="text"
          placeholder="Tìm điểm ngữ pháp (VD: so sánh, câu chữ 把...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border-4 border-blue-50 rounded-[2rem] outline-none focus:border-blue-200 transition-all font-bold shadow-sm"
        />
      </div>

      {/* Danh Sách Ngữ Pháp */}
      <div className="space-y-4">
        {filteredGrammar.length > 0 ? (
          filteredGrammar.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2.5rem] border-4 border-blue-50 overflow-hidden transition-all hover:shadow-md"
            >
              <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800">{item.title}</h3>
                    <code className="text-blue-500 font-mono text-sm">{item.formula}</code>
                  </div>
                </div>
                {expandedId === item.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </div>

              {expandedId === item.id && (
                <div className="px-6 pb-8 pt-2 space-y-6 border-t-2 border-dashed border-blue-50">
                  <div className="bg-blue-50/50 p-5 rounded-3xl">
                    <p className="text-gray-700 font-bold leading-relaxed">
                      💡 {item.explanation}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Star size={14} className="fill-current" /> Ví dụ minh họa
                    </h4>
                    <div className="grid gap-3">
                      {item.examples && item.examples.map((ex, idx) => (
                        <div key={idx} className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                          <p className="text-2xl font-black text-gray-800">{ex.zh}</p>
                          <p className="text-blue-500 font-bold italic">{ex.py}</p>
                          <p className="text-gray-500 font-bold mt-1">→ {ex.vi}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 font-bold">Chưa có dữ liệu cho cấp độ này meo~ 🐾</div>
        )}
      </div>
    </div>
  );
}