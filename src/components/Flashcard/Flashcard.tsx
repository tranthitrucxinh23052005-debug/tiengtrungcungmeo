import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FlashcardView } from './FlashcardView';
import { calculateSM2, getQualityFromUserResponse } from '../../utils/sm2';
import { CheckCircle, XCircle } from 'lucide-react';
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

  useEffect(() => {
    loadReviewCards();
  }, [user]);

  async function loadReviewCards() {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('vocabulary_progress')
        .select('*, vocabulary(*)')
        .eq('user_id', user!.id)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true })
        .limit(20);

      if (progressError) throw progressError;

      const reviewCards: ReviewCard[] = (progressData || [])
        .filter((p) => p.vocabulary)
        .map((p) => ({
          vocabulary: p.vocabulary!,
          progress: {
            id: p.id,
            user_id: p.user_id,
            word_id: p.word_id,
            level: p.level,
            easiness_factor: p.easiness_factor,
            interval: p.interval,
            repetitions: p.repetitions,
            last_review_date: p.last_review_date,
            next_review_date: p.next_review_date,
            status: p.status,
            times_forgotten: p.times_forgotten,
            created_at: p.created_at,
            updated_at: p.updated_at,
          },
        }));

      setCards(reviewCards);
    } catch (error) {
      console.error('Error loading review cards:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResponse(remembered: boolean) {
    const currentCard = cards[currentIndex];
    const quality = getQualityFromUserResponse(remembered);

    const sm2Result = calculateSM2(
      quality,
      currentCard.progress.repetitions,
      currentCard.progress.easiness_factor,
      currentCard.progress.interval
    );

    try {
      await supabase
        .from('vocabulary_progress')
        .update({
          easiness_factor: sm2Result.easinessFactor,
          interval: sm2Result.interval,
          repetitions: sm2Result.repetitions,
          last_review_date: new Date().toISOString(),
          next_review_date: sm2Result.nextReviewDate.toISOString(),
          status: sm2Result.repetitions >= 3 ? 'mastered' : 'learning',
          times_forgotten: remembered
            ? currentCard.progress.times_forgotten
            : currentCard.progress.times_forgotten + 1,
        })
        .eq('id', currentCard.progress.id);

      await updateDailyStats(remembered);

      setSessionStats((prev) => ({
        correct: prev.correct + (remembered ? 1 : 0),
        incorrect: prev.incorrect + (remembered ? 0 : 1),
      }));

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }

  async function updateDailyStats(correct: boolean) {
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: existing } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', today)
        .maybeSingle();

      const updates = {
        words_reviewed: (existing?.words_reviewed || 0) + 1,
        cards_studied: (existing?.cards_studied || 0) + 1,
        correct_answers: (existing?.correct_answers || 0) + (correct ? 1 : 0),
        total_answers: (existing?.total_answers || 0) + 1,
        xp_gained: (existing?.xp_gained || 0) + (correct ? 10 : 5),
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

      await supabase
        .from('user_profiles')
        .update({
          total_xp: supabase.rpc('increment', { x: correct ? 10 : 5 }),
          last_study_date: today,
        })
        .eq('id', user!.id);
    } catch (error) {
      console.error('Error updating daily stats:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h2>
        <p className="text-gray-600">No cards to review right now. Great job!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Flashcard Review</h2>
          <p className="text-gray-600">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-700">{sessionStats.correct}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-700">{sessionStats.incorrect}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
        />
      </div>

      <FlashcardView
        card={cards[currentIndex]}
        onResponse={handleResponse}
      />
    </div>
  );
}
