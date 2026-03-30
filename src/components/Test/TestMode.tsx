import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
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

  useEffect(() => {
    loadTestQuestions();
  }, [mode]);

  async function loadTestQuestions() {
    try {
      const { data: progressData } = await supabase
        .from('vocabulary_progress')
        .select('word_id')
        .eq('user_id', user!.id);

      const wordIds = (progressData || []).map((p) => p.word_id);

      if (wordIds.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const { data: vocabData } = await supabase
        .from('vocabulary')
        .select('*')
        .in('id', wordIds)
        .limit(10);

      if (!vocabData || vocabData.length === 0) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const testQuestions: TestQuestion[] = vocabData.map((vocab) => {
        const otherOptions = vocabData
          .filter((v) => v.id !== vocab.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((v) => (mode === 'zh-to-vi' ? v.meaning_vi : v.hanzi));

        const correctAnswer = mode === 'zh-to-vi' ? vocab.meaning_vi : vocab.hanzi;
        const options = [...otherOptions, correctAnswer].sort(() => Math.random() - 0.5);

        return {
          vocabulary: vocab,
          options,
          correctAnswer,
        };
      });

      setQuestions(testQuestions);
    } catch (error) {
      console.error('Error loading test questions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(answer: string) {
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === questions[currentIndex].correctAnswer;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    await updateStats(isCorrect);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setTestComplete(true);
      }
    }, 1500);
  }

  async function updateStats(correct: boolean) {
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: existing } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .maybeSingle();

      const updates = {
        correct_answers: (existing?.correct_answers || 0) + (correct ? 1 : 0),
        total_answers: (existing?.total_answers || 0) + 1,
        xp_gained: (existing?.xp_gained || 0) + (correct ? 5 : 2),
      };

      const accuracy = (updates.correct_answers / updates.total_answers) * 100;

      if (existing) {
        await supabase
          .from('daily_stats')
          .update({ ...updates, accuracy })
          .eq('id', existing.id);
      } else {
        await supabase.from('daily_stats').insert({
          user_id: user!.id,
          date: today,
          ...updates,
          accuracy,
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  function resetTest() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setTestComplete(false);
    loadTestQuestions();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Words to Test</h2>
        <p className="text-gray-600">Start learning some vocabulary first!</p>
      </div>
    );
  }

  if (testComplete) {
    const percentage = (score.correct / score.total) * 100;

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-12 text-center border border-gray-200">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            percentage >= 80
              ? 'bg-green-100'
              : percentage >= 60
              ? 'bg-yellow-100'
              : 'bg-red-100'
          }`}
        >
          {percentage >= 80 ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <XCircle className="w-12 h-12 text-red-600" />
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Complete!</h2>
        <p className="text-5xl font-bold text-blue-600 mb-6">{percentage.toFixed(0)}%</p>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Correct</p>
              <p className="text-2xl font-bold text-green-600">{score.correct}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Incorrect</p>
              <p className="text-2xl font-bold text-red-600">{score.total - score.correct}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetTest}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const questionText = mode === 'zh-to-vi' ? currentQuestion.vocabulary.hanzi : currentQuestion.vocabulary.meaning_vi;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Vocabulary Test</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('zh-to-vi')}
            className={`px-4 py-2 rounded-lg transition ${
              mode === 'zh-to-vi'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chinese → Vietnamese
          </button>
          <button
            onClick={() => setMode('vi-to-zh')}
            className={`px-4 py-2 rounded-lg transition ${
              mode === 'vi-to-zh'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vietnamese → Chinese
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>
          Score: {score.correct}/{score.total}
        </span>
      </div>

      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-xl p-12 border border-gray-200">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
            {mode === 'zh-to-vi' ? 'What does this mean?' : 'How do you say this in Chinese?'}
          </p>
          <p className="text-5xl font-bold text-gray-800">{questionText}</p>
          {mode === 'zh-to-vi' && (
            <p className="text-xl text-gray-600 mt-4">{currentQuestion.vocabulary.pinyin}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => !showResult && handleAnswer(option)}
                disabled={showResult}
                className={`p-4 rounded-lg text-lg font-medium transition border-2 ${
                  showCorrect
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : showIncorrect
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-white border-gray-200 hover:border-blue-500 text-gray-800'
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showCorrect && <CheckCircle className="w-6 h-6" />}
                  {showIncorrect && <XCircle className="w-6 h-6" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
