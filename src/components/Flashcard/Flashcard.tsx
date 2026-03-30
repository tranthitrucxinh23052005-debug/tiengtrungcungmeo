import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FlashcardView } from './FlashcardView';
import { calculateSM2, getQualityFromUserResponse } from '../../utils/sm2';
import { Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ReviewCard } from '../../types';

interface FlashcardProps {
  onComplete: () => void;
}

export function Flashcard({ onComplete }: FlashcardProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // --- HÀM PHÁT ÂM THANH (GIỚI HẠN 3 GIÂY) ---
  const playSound = (type: 'correct' | 'incorrect' | 'finish') => {
    const audioPath = {
      correct: '/sounds/correct.mp3',
      incorrect: '/sounds/incorrect.mp3',
      finish: '/sounds/finish.mp3'
    };
    const audio = new Audio(audioPath[type]);
    audio.volume = 0.5;
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= 1.7) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    audio.play().catch(() => console.log("Mèo bị nghẹt mũi rồi TS!"));
  };

  useEffect(() => {
    if (user) {
      const audioFiles = ['/sounds/correct.mp3', '/sounds/incorrect.mp3', '/sounds/finish.mp3'];
      audioFiles.forEach(path => { new Audio(path).preload = 'auto'; });
      loadReviewCards();
    }
  }, [user]);

  useEffect(() => {
    if (isFinished) {
      playSound('finish');
      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FF85A1', '#FFB7C5'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#AEE67F', '#D4F1BE'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isFinished]);

  async function loadReviewCards() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vocabulary_progress')
        .select('*, vocabulary:word_id(*)')
        .eq('user_id', user!.id)
        .limit(100);

      if (error) throw error;

      if (data) {
        // 🐾 GIẢI QUYẾT VẤN ĐỀ 1: RANDOM TỪ VỰNG
        const shuffled = data
          .filter(p => p.vocabulary)
          .sort(() => Math.random() - 0.5) // Trộn ngẫu nhiên mảng
          .map(p => ({ vocabulary: p.vocabulary!, progress: { ...p } }));
        
        setCards(shuffled);
      }
    } catch (error) {
      console.error("Lỗi tải thẻ:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateDailyStats(correct: boolean) {
    const today = new Date().toISOString().split('T')[0];
    const xpGain = correct ? 15 : 5;

    try {
      await supabase.rpc('increment_xp', { user_id: user!.id, amount: xpGain });

      const { data: existing } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .maybeSingle();

      const updates = {
        user_id: user!.id,
        date: today,
        words_reviewed: (existing?.words_reviewed || 0) + 1,
        correct_answers: (existing?.correct_answers || 0) + (correct ? 1 : 0),
        total_answers: (existing?.total_answers || 0) + 1,
        xp_gained: (existing?.xp_gained || 0) + xpGain,
      };

      await supabase.from('daily_stats').upsert(updates, { onConflict: 'user_id,date' });
    } catch (err) {
      console.error("Lỗi stats:", err);
    }
  }

  async function handleResponse(remembered: boolean) {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    remembered ? playSound('correct') : playSound('incorrect');
    const quality = getQualityFromUserResponse(remembered);
    const sm2 = calculateSM2(quality, currentCard.progress.repetitions, currentCard.progress.easiness_factor, currentCard.progress.interval);

    try {
      await Promise.all([
        updateDailyStats(remembered),
        supabase.from('vocabulary_progress').update({
          easiness_factor: sm2.easinessFactor,
          interval: sm2.interval,
          repetitions: sm2.repetitions,
          last_review_date: new Date().toISOString(),
          next_review_date: sm2.nextReviewDate.toISOString(),
          times_forgotten: remembered ? currentCard.progress.times_forgotten : currentCard.progress.times_forgotten + 1,
        }).eq('id', currentCard.progress.id)
      ]);

      setSessionStats(prev => ({
        correct: prev.correct + (remembered ? 1 : 0),
        incorrect: prev.incorrect + (remembered ? 0 : 1),
      }));

      if (currentIndex + 1 < cards.length) setCurrentIndex(currentIndex + 1);
      else setIsFinished(true);
    } catch (error) {
      console.error("Lỗi lưu kết quả:", error);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="relative animate-bounce">🐱</div>
      <p className="text-pink-500 font-bold mt-4">Mấy bé mèo đang xáo bài...</p>
    </div>
  );

  if (!isFinished && cards.length === 0) return (
    <div className="text-center p-10 bg-white rounded-[3rem] shadow-xl border-4 border-pink-100 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-pink-600">Trạm Ôn Tập Trống Trơn!</h2>
      <p className="text-gray-500 mt-2 mb-6">TS phải thêm từ vào lộ trình học thì mèo mới có bài đố chứ! 🐱</p>
      <button onClick={onComplete} className="bg-pink-400 text-white px-8 py-3 rounded-2xl font-bold">Quay lại Dashboard</button>
    </div>
  );

  if (isFinished) return (
    <div className="bg-white rounded-[3rem] p-10 text-center shadow-xl max-w-lg mx-auto border-4 border-pink-100">
      <h2 className="text-4xl font-black text-pink-600 mb-2">QUÁ XỊN! 🎉</h2>
      <div className="bg-pink-50 rounded-2xl py-4 mb-6 flex justify-around">
        <div><p className="text-xs text-gray-500 uppercase font-bold">EXP</p><p className="text-2xl font-bold text-pink-500">+{sessionStats.correct * 15 + sessionStats.incorrect * 5}</p></div>
        <div><p className="text-xs text-gray-500 uppercase font-bold">Đúng</p><p className="text-2xl font-bold text-green-500">{sessionStats.correct}</p></div>
      </div>
      <button onClick={onComplete} className="w-full bg-pink-400 text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-lg hover:-translate-y-1">Hoàn thành lượt học</button>
    </div>
  );

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-4 px-2">
         <h2 className="text-3xl font-black text-gray-800 tracking-tight">Trạm Mèo Học Tập 🐾</h2>
         <div className="text-pink-500 font-bold bg-white px-4 py-1 rounded-full shadow-sm border border-pink-50">
            Thẻ {currentIndex + 1} / {cards.length}
         </div>
      </div>
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white">
        <div className="mb-6 h-4 bg-pink-100 rounded-full overflow-hidden p-1">
          <div className="bg-gradient-to-r from-pink-400 to-rose-400 h-full rounded-full transition-all duration-500" 
               style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
        </div>
        <FlashcardView card={currentCard} onResponse={handleResponse} />
      </div>
    </div>
  );
}