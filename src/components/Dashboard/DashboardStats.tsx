import { BookOpen, Target, Trophy, TrendingUp, Brain, CheckCircle } from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '../../types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  onStartStudy: () => void;
}

export function DashboardStats({ stats, onStartStudy }: DashboardStatsProps) {
  const statCards = [
    {
      icon: Target,
      label: 'Due Today',
      value: stats.wordsToReviewToday,
      color: 'bg-red-50 text-red-600',
      borderColor: 'border-red-200',
    },
    {
      icon: BookOpen,
      label: 'Total Words',
      value: stats.wordsLearned,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      icon: Brain,
      label: 'Learning',
      value: stats.learningWords,
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200',
    },
    {
      icon: CheckCircle,
      label: 'Mastered',
      value: stats.masteredWords,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200',
    },
    {
      icon: TrendingUp,
      label: 'Accuracy',
      value: `${stats.accuracyRate.toFixed(0)}%`,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200',
    },
    {
      icon: Trophy,
      label: 'Total XP',
      value: stats.totalXP,
      color: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back!</h2>
        <p className="text-gray-600">
          {stats.wordsToReviewToday > 0
            ? `You have ${stats.wordsToReviewToday} word${stats.wordsToReviewToday > 1 ? 's' : ''} to review today`
            : 'Great job! No reviews due today'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white border ${card.borderColor} rounded-xl p-6 transition hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.wordsToReviewToday > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to study?</h3>
          <p className="mb-4 text-blue-100">
            Keep your streak going by reviewing your flashcards
          </p>
          <button
            onClick={onStartStudy}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Start Studying
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Learning Tips</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Study consistently every day to maintain your streak</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Focus on context - read the example sentences carefully</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Use pinyin toggle to test your character recognition</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Take regular tests to reinforce your learning</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
