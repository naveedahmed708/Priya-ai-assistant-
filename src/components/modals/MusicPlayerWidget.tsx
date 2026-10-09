import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, X, Music } from 'lucide-react';
import { AndroidBridge } from '../../services/androidBridge';

interface MusicPlayerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
}) => {
  const bridge = AndroidBridge.getInstance();
  const track = bridge.getMusicState();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-6 duration-200">
      <div className="p-4 rounded-3xl bg-[#0d162b]/95 border border-blue-500/30 backdrop-blur-xl shadow-2xl text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[2px] flex-shrink-0">
            <div className="w-full h-full bg-[#090f1d] rounded-[14px] flex items-center justify-center">
              <Music className={`w-5 h-5 text-cyan-300 ${isPlaying ? 'animate-bounce' : ''}`} />
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
            <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => bridge.toggleMusic('play')}
            className="p-2 text-gray-400 hover:text-white"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/40 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white translate-x-[1px]" />
            )}
          </button>

          <button
            onClick={() => bridge.toggleMusic('next')}
            className="p-2 text-gray-400 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 ml-1 text-gray-500 hover:text-white rounded-full bg-white/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
