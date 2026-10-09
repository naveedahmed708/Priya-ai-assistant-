import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface TopBarProps {
  onOpenMenu: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  userName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMenu,
  onOpenNotifications,
  unreadCount = 2,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 z-20">
      {/* Left Menu Button */}
      <button
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-200 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
      >
        <Menu className="w-6 h-6 stroke-[2]" />
      </button>

      {/* Center Brand Title */}
      <div className="flex items-center">
        <h1 className="text-xl font-bold tracking-tight text-white font-sans">
          Priya
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-200 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-[#070b14]" />
          )}
        </button>

        {/* Priya Avatar Badge */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 p-[1.5px] shadow-md shadow-blue-500/20">
          <div className="w-full h-full bg-[#0c1425] rounded-[10px] flex items-center justify-center overflow-hidden">
            <span className="text-[10px] font-black tracking-tighter text-cyan-300 font-mono">
              PRIYA
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
