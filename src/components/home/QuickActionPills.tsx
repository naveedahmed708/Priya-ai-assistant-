import React from 'react';
import { Music, BookOpen, Edit3 } from 'lucide-react';

interface QuickActionPillsProps {
  onActionClick: (action: 'music' | 'study' | 'journal') => void;
  isMusicPlaying?: boolean;
}

export const QuickActionPills: React.FC<QuickActionPillsProps> = ({
  onActionClick,
  isMusicPlaying = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2 z-10">
      {/* Music Pill */}
      <button
        onClick={() => onActionClick('music')}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-medium active:scale-95 ${
          isMusicPlaying
            ? 'bg-blue-600/30 border-blue-400 text-cyan-300 shadow-md shadow-blue-500/20'
            : 'bg-[#0f172a]/60 border-white/10 text-gray-300 hover:text-white hover:border-blue-500/30 hover:bg-[#131e36]/80'
        }`}
      >
        <Music className="w-3.5 h-3.5 text-blue-400" />
        <span>Music</span>
        {isMusicPlaying && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
      </button>

      {/* Study Pill */}
      <button
        onClick={() => onActionClick('study')}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f172a]/60 border border-white/10 hover:border-blue-500/30 hover:bg-[#131e36]/80 transition-all text-xs font-medium text-gray-300 hover:text-white active:scale-95"
      >
        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
        <span>Study</span>
      </button>

      {/* Journal Pill */}
      <button
        onClick={() => onActionClick('journal')}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f172a]/60 border border-white/10 hover:border-blue-500/30 hover:bg-[#131e36]/80 transition-all text-xs font-medium text-gray-300 hover:text-white active:scale-95"
      >
        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
        <span>Journal</span>
      </button>
    </div>
  );
};
