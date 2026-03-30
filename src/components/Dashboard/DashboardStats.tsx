import { Target, Book, Brain, CheckCircle, TrendingUp, Trophy } from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '../../types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
  onNavigate: (view: 'flashcard' | 'vocabulary' | 'test', filter?: string) => void;
}

export function DashboardStats({ stats, onNavigate }: DashboardStatsProps) {
  const cards = [
    {
      label: 'Cần Ôn Hôm Nay',
      value: stats.wordsToReviewToday,
      icon: Target,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      action: () => onNavigate('flashcard') // Nhấn vào là đi ôn tập
    },
    {
      label: 'Tổng Số Từ',
      value: stats.wordsLearned,
      icon: Book,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      action: () => onNavigate('vocabulary','all') // Nhấn vào là xem kho từ
    },
    {
      label: 'Đang Học',
      value: stats.learningWords,
      icon: Brain,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      action: () => onNavigate('vocabulary','learning') 
    },
    {
      label: 'Đã Thuộc Lòng',
      value: stats.masteredWords,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      action: () => onNavigate('vocabulary','mastered')
    },
    {
      label: 'Tỷ Lệ Chính Xác',
      value: `${Math.round(stats.accuracyRate)}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      action: () => onNavigate('test') // Nhấn vào là đi thử thách để cải thiện accuracy
    },
    {
      label: 'Tổng Kinh Nghiệm',
      value: stats.totalXP,
      icon: Trophy,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      action: () => {} // XP thì chỉ để ngắm thôi meo~
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <button
          key={index}
          onClick={card.action}
          className={`group flex items-center justify-between p-6 bg-white border-2 ${card.borderColor} rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left`}
        >
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-4xl font-black text-gray-800">{card.value}</p>
          </div>
          <div className={`${card.bgColor} ${card.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
            <card.icon className="w-8 h-8" />
          </div>
        </button>
      ))}
    </div>
  );
}