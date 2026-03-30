import { useState } from 'react';
import { Eye, EyeOff, Volume2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { ReviewCard } from '../../types';

interface FlashcardViewProps {
  card: ReviewCard;
  onResponse: (remembered: boolean) => void;
}

export function FlashcardView({ card, onResponse }: FlashcardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);

  function handleFlip() {
    setIsFlipped(!isFlipped);
  }

  function handleResponse(remembered: boolean) {
    setIsFlipped(false);
    setShowPinyin(true);
    onResponse(remembered);
  }

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="relative group transition-all duration-300">
      {/* Trang trí tai mèo phía trên thẻ */}
      <div className="absolute -top-6 left-10 text-4xl opacity-0 group-hover:opacity-100 transition-opacity">🐱</div>
      <div className="absolute -top-6 right-10 text-4xl opacity-0 group-hover:opacity-100 transition-opacity">🐾</div>

      <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border-4 border-pink-50 overflow-hidden min-h-[450px] flex flex-col">
        {/* Header - Màu hồng đồng bộ */}
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
               <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-black tracking-widest uppercase">HSK {card.vocabulary.hsk_level}</span>
          </div>
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-2xl transition-all font-bold text-sm"
          >
            {showPinyin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPinyin ? 'Ẩn Pinyin' : 'Hiện Pinyin'}</span>
          </button>
        </div>

        {/* Nội dung Thẻ */}
        {!isFlipped ? (
          <div className="p-10 flex-grow flex flex-col justify-center">
            <div className="text-center space-y-8">
              <div className="relative inline-block">
                <p className="text-xs font-black text-pink-300 uppercase tracking-[0.2em] mb-4">Câu ví dụ nè </p>
                <p className="text-3xl font-bold text-gray-800 leading-relaxed px-4">
                  {card.vocabulary.example_sentence}
                </p>
                {showPinyin && (
                  <p className="text-xl text-pink-400/80 mt-4 font-medium italic">{card.vocabulary.example_pinyin}</p>
                )}
              </div>

              <div>
                <button
                  onClick={() => speak(card.vocabulary.example_sentence)}
                  className="inline-flex items-center gap-3 bg-pink-50 hover:bg-pink-100 text-pink-500 px-6 py-3 rounded-2xl transition-all transform hover:scale-105 active:scale-95 font-bold border-2 border-pink-100"
                >
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <span>Nghe thử coi</span>
                </button>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={handleFlip}
                className="group relative bg-gray-900 hover:bg-black text-white px-12 py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">Lật Thẻ Meo!</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 flex-grow flex flex-col">
            <div className="space-y-8 flex-grow">
              <div className="text-center pb-8 border-b-4 border-dashed border-pink-50">
                <p className="text-7xl font-black text-gray-800 mb-2 drop-shadow-sm">{card.vocabulary.hanzi}</p>
                {showPinyin && (
                <p className="text-2xl text-pink-400 font-bold mb-3 animate-in fade-in zoom-in duration-300">{card.vocabulary.pinyin}
                </p>
        )}
                
                <div className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold text-xl shadow-md">
                  {card.vocabulary.meaning_vi}
                </div>
              </div>

              {card.vocabulary.chunk && (
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-[2rem] p-6 border-2 border-white shadow-inner">
                  <p className="text-xs text-pink-400 mb-2 uppercase font-black tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Cụm từ hay dùng
                  </p>
                  <p className="text-2xl text-gray-800 font-bold mb-1">{card.vocabulary.chunk}</p>
                  {/* --- SỬA LUÔN CHỖ NÀY CHO ĐỒNG BỘ --- */}
          {showPinyin && (
            <p className="text-gray-500 italic font-medium">{card.vocabulary.chunk_pinyin}</p>
          )}
        </div>
      )}
                 
              {/* Nút phản hồi - To, rõ, màu sắc cute */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleResponse(false)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 bg-white hover:bg-red-50 text-red-400 p-4 rounded-[2rem] font-bold text-lg transition-all border-4 border-red-50 hover:border-red-100 hover:-translate-y-1 shadow-sm"
                >
                  <XCircle className="w-8 h-8" />
                  <span>Quên rùi...</span>
                </button>
                <button
                  onClick={() => handleResponse(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 bg-white hover:bg-green-50 text-green-500 p-4 rounded-[2rem] font-bold text-lg transition-all border-4 border-green-50 hover:border-green-100 hover:-translate-y-1 shadow-sm"
                >
                  <CheckCircle className="w-8 h-8" />
                  <span>Nhớ chứ!</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}