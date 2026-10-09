import React from 'react';
import { Zap, Moon, Radio, Volume2 } from 'lucide-react';
import { AssistantState } from '../../types';

interface GreetingHeaderProps {
  userName?: string;
  assistantState: AssistantState;
  onWakeAssistant?: () => void;
  onOpenEnergyDashboard?: () => void;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName = 'Naveed Ahmed',
  assistantState,
  onWakeAssistant,
  onOpenEnergyDashboard,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  const getStatusDisplay = () => {
    switch (assistantState) {
      case 'listening':
        return (
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Priya is listening — speak now</span>
          </div>
        );
      case 'thinking':
        return (
          <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Priya is thinking...</span>
          </div>
        );
      case 'speaking':
        return (
          <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span>Priya is speaking</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-1.5 text-yellow-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>Connecting to Gemini Live...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span>Offline — tap mic to retry</span>
          </div>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={onWakeAssistant}
            className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-300 transition-colors text-left"
          >
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span>Priya is asleep — say &quot;Hey Priya&quot;</span>
          </button>
        );
    }
  };

  return (
    <div className="px-5 pt-3 pb-2 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-300 tracking-wide">{getGreeting()}</p>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
          {userName}
        </h2>
        <div className="text-xs mt-1">
          {getStatusDisplay()}
        </div>
      </div>

      {/* Energy Efficiency Card - Interactive Trigger */}
      <button
        onClick={onOpenEnergyDashboard}
        aria-label="Open Energy Efficiency Dashboard"
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0f192d] hover:bg-[#15233d] border border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-amber-950/20 active:scale-95 transition-all group text-left cursor-pointer"
      >
        <Zap className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white leading-none">1 </span>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Energy</span>
          </div>
          <span className="text-[9px] text-gray-400 block -mt-0.5 group-hover:text-cyan-300 transition-colors">
            Tap to optimize
          </span>
        </div>
      </button>
    </div>
  );
};
