import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Vocabulary } from '../../types';

interface TestModeProps {
  onComplete: () => void;
}

interface TestQuestion {
  vocabulary: Vocabulary;
  options: string[];
  correctAnswer: string;
}

export function TestMode({ onComplete }: TestModeProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'zh-to-vi' | 'vi-to-zh'>('zh-to-vi');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [testComplete, setTestComplete] = useState(false);

  // --- HÀM PHÁT ÂM THANH (GIỚI HẠN 3 GIÂY) ---
  const playSound = (type: 'correct' | 'incorrect' | 'finish') => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.4;

    // Chốt chặn 3 giây thần thánh
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= 1.7) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    audio.play().catch(() => console.log("Mèo bị nghẹt mũi rồi bạn ơi!"));
  };

  useEffect(() => {
    loadTestQuestions();
  }, [mode]);

  async function loadTestQuestions() {
    try {
      setLoading(true);
      // 🐾 THỬ THÁCH NGẪU NHIÊN: Lấy 50 từ đã học để làm kho trộn
      const { data: progressData } = await supabase
        .from('vocabulary_progress')
        .select('word_id')
        .eq('user_id', user!.id);

      const wordIds = (progressData || []).map((p) => p.word_id);

      if (wordIds.length < 4) { // Cần tối nhất 4 từ để làm trắc nghiệm
        setQuestions([]);
        return;
      }

      // Lấy ngẫu nhiên từ kho từ vựng của user
      const { data: vocabData } = await supabase
        .from('vocabulary')
        .select('*')
        .in('id', wordIds);

      if (!vocabData || vocabData.length < 4) return;

      // Trộn và lấy đúng 10 câu cho mỗi lượt challenge
      const shuffledVocab = vocabData.sort(() => Math.random() - 0.5).slice(0, 10);

      const testQuestions: TestQuestion[] = shuffledVocab.map((vocab) => {
        const otherOptions = vocabData
          .filter((v) => v.id !== vocab.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => (mode === 'zh-to-vi' ? v.meaning_vi : v.hanzi));

        const correctAnswer = mode === 'zh-to-vi' ? vocab.meaning_vi : vocab.hanzi;
        const options = [...otherOptions, correctAnswer].sort(() => Math.random() - 0.5);

        return { vocabulary: vocab, options, correctAnswer };
      });

      setQuestions(testQuestions);
      setCurrentIndex(0);
      setTestComplete(false);
      setScore({ correct: 0, total: 0 });
    } catch (error) {
      console.error('Lỗi challenge:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(answer: string) {
    const isCorrect = answer === questions[currentIndex].correctAnswer;
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (isCorrect) {
      playSound('correct');
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      playSound('incorrect');
    }
    setScore((prev) => ({ ...prev, total: prev.total + 1 }));

    // Cập nhật XP ngay lập tức (Thử thách cho nhiều XP hơn)
    await updateChallengeStats(isCorrect);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setTestComplete(true);
        playSound('finish');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    }, 1000);
  }

  async function updateChallengeStats(correct: boolean) {
    const xpGain = correct ? 10 : 2; // Thử thách: Đúng +10, Sai +2
    await supabase.rpc('increment_xp', { user_id: user!.id, amount: xpGain });
    
    // Cập nhật accuracy vào daily_stats (logic upsert đã có ở Flashcard)
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('daily_stats').select('*').eq('user_id', user!.id).eq('date', today).maybeSingle();
    
    const updates = {
      user_id: user!.id,
      date: today,
      correct_answers: (existing?.correct_answers || 0) + (correct ? 1 : 0),
      total_answers: (existing?.total_answers || 0) + 1,
      xp_gained: (existing?.xp_gained || 0) + xpGain,
    };
    await supabase.from('daily_stats').upsert(updates, { onConflict: 'user_id,date' });
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="animate-bounce text-6xl mb-4">⚡</div>
      <p className="text-blue-500 font-bold animate-pulse">Đang nạp năng lượng thử thách...</p>
    </div>
  );

  if (questions.length === 0) return (
    <div className="bg-white rounded-[2rem] p-12 text-center border-4 border-blue-50 shadow-xl max-w-lg mx-auto">
      <div className="text-6xl mb-4">📭</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa đủ từ vựng rồi bạn ơi!</h2>
      <p className="text-gray-500 mb-6">Bạn cần học ít nhất 4 từ để mèo có thể tạo bài trắc nghiệm nhé.</p>
      <button onClick={onComplete} className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold">Đi học ngay meo~</button>
    </div>
  );

  if (testComplete) return (
    <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-10 text-center shadow-2xl border-4 border-yellow-100">
      <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-4xl font-black text-gray-800 mb-2">KẾT QUẢ RỰC RỠ!</h2>
      <p className="text-6xl font-black text-blue-600 mb-6">{((score.correct / score.total) * 100).toFixed(0)}%</p>
      
      <div className="bg-blue-50 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
        <div><p className="text-gray-500 text-sm">Đúng</p><p className="text-3xl font-bold text-green-500">{score.correct}</p></div>
        <div><p className="text-gray-500 text-sm">EXP Nhận được</p><p className="text-3xl font-bold text-orange-500">+{score.correct * 10 + (score.total - score.correct) * 2}</p></div>
      </div>

      <div className="flex gap-4">
        <button onClick={loadTestQuestions} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-lg">
          <RotateCcw className="w-6 h-6" /> Thử thách lại!
        </button>
        <button onClick={onComplete} className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-bold text-xl hover:bg-gray-200 transition-all">Nghỉ ngơi</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Challenge */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-black italic">
          <Zap className="w-6 h-6 fill-blue-600" /> CHALLENGE MODE
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button onClick={() => setMode('zh-to-vi')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${mode === 'zh-to-vi' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Hán tự → Nghĩa</button>
          <button onClick={() => setMode('vi-to-zh')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${mode === 'vi-to-zh' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Nghĩa → Hán tự</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-inner">
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border-4 border-blue-50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-4 right-8 text-gray-300 font-black text-4xl opacity-20">#{currentIndex + 1}</div>
        
        <div className="text-center mb-10">
          <p className="text-blue-400 font-black uppercase tracking-widest text-sm mb-4">Chọn đáp án đúng nhất</p>
          <p className="text-7xl font-black text-gray-800 mb-4">{mode === 'zh-to-vi' ? questions[currentIndex].vocabulary.hanzi : questions[currentIndex].vocabulary.meaning_vi}</p>
          {mode === 'zh-to-vi' && <p className="text-2xl text-gray-400 font-medium italic">{questions[currentIndex].vocabulary.pinyin}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {questions[currentIndex].options.map((option, idx) => {
            const isCorrect = option === questions[currentIndex].correctAnswer;
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={idx}
                disabled={showResult}
                onClick={() => handleAnswer(option)}
                className={`p-6 rounded-[1.5rem] text-xl font-bold transition-all border-4 flex items-center justify-between ${
                  showResult 
                    ? isCorrect ? 'bg-green-50 border-green-500 text-green-700' : isSelected ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-100 opacity-50'
                    : 'bg-white border-gray-100 hover:border-blue-300 hover:bg-blue-50 text-gray-700 shadow-sm'
                }`}
              >
                <span>{option}</span>
                {showResult && isCorrect && <CheckCircle className="w-8 h-8 text-green-500" />}
                {showResult && isSelected && !isCorrect && <XCircle className="w-8 h-8 text-red-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}