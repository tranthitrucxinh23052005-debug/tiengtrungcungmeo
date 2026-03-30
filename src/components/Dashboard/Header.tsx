import { Menu, LogOut, Flame } from 'lucide-react';
import type { UserProfile } from '../../types';

interface HeaderProps {
  profile: UserProfile | null;
  onSignOut: () => void;
  onMenuToggle: () => void;
}

export function Header({ profile, onSignOut, onMenuToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            中文 <span className="text-blue-600">Learn</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-700">{profile?.current_streak || 0}</span>
            <span className="text-sm text-orange-600">day streak</span>
          </div>

          <div className="bg-blue-50 px-4 py-2 rounded-full">
            <span className="font-bold text-blue-700">{profile?.total_xp || 0} XP</span>
          </div>

          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
