import React from 'react';
import { Home, Scan, Mic, BrainCircuit, MessageSquare } from 'lucide-react';
import { AssistantState } from '../../types';

interface BottomNavigationProps {
  currentTab: 'home' | 'scan' | 'memories' | 'chat';
  onTabChange: (tab: 'home' | 'scan' | 'memories' | 'chat') => void;
  assistantState: AssistantState;
  onToggleVoice: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  assistantState,
  onToggleVoice,
}) => {
  const isVoiceActive = assistantState === 'listening' || assistantState === 'speaking';

  return (
    <nav className="relative px-6 pt-3 pb-5 bg-[#060a14]/95 border-t border-white/5 backdrop-blur-xl flex items-center justify-between z-30">
      {/* Home Tab */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentTab === 'home' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Home className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-medium tracking-tight">Home</span>
      </button>

      {/* Scan Tab */}
      <button
        onClick={() => onTabChange('scan')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentTab === 'scan' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Scan className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-medium tracking-tight">Scan</span>
      </button>

      {/* Center Elevated Mic Button */}
      <div className="relative -top-5">
        <button
          onClick={onToggleVoice}
          aria-label="Activate Priya Voice"
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90 ${
            isVoiceActive
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-cyan-500/50 scale-105'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/40'
          }`}
        >
          {/* Animated pulsing wave rings when voice is active */}
          {isVoiceActive && (
            <>
              <span className="absolute inset-0 rounded-full bg-cyan-400/40 animate-ping [animation-duration:2s]" />
              <span className="absolute -inset-2 rounded-full border border-cyan-400/50 animate-pulse" />
            </>
          )}

          <Mic className="w-7 h-7 text-white relative z-10 stroke-[2.5]" />
        </button>
      </div>

      {/* Memories Tab */}
      <button
        onClick={() => onTabChange('memories')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentTab === 'memories' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <BrainCircuit className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-medium tracking-tight">Memories</span>
      </button>

      {/* Chat Tab */}
      <button
        onClick={() => onTabChange('chat')}
        className={`flex flex-col items-center gap-1 transition-colors ${
          currentTab === 'chat' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <MessageSquare className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] font-medium tracking-tight">Chat</span>
      </button>
    </nav>
  );
};
