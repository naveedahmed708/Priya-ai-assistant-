import React, { useState, useRef } from 'react';
import { Mic, Radio, Volume2 } from 'lucide-react';
import { AssistantState } from '../../types';

interface FloatingOrbProps {
  enabled: boolean;
  assistantState: AssistantState;
  onActivate: () => void;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  enabled,
  assistantState,
  onActivate,
}) => {
  const [pos, setPos] = useState({ x: 20, y: 180 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });

  if (!enabled) return null;

  const isListening = assistantState === 'listening';
  const isSpeaking = assistantState === 'speaking';

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 65, dragStart.current.initialX + dx)),
      y: Math.max(10, Math.min(window.innerHeight - 65, dragStart.current.initialY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const moved =
      Math.abs(e.clientX - dragStart.current.x) + Math.abs(e.clientY - dragStart.current.y);
    if (moved < 8) {
      // Tap detected!
      onActivate();
    }
  };

  return (
    <div
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="fixed z-40 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="relative group">
        {/* Outer Glow Halo */}
        <div
          className={`absolute -inset-2 rounded-full blur-md transition-all duration-300 ${
            isListening
              ? 'bg-cyan-400/60 scale-125 animate-pulse'
              : isSpeaking
              ? 'bg-blue-500/60 scale-125'
              : 'bg-blue-600/30 group-hover:bg-blue-500/50'
          }`}
        />

        {/* Floating AI Orb */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-700 to-cyan-400 p-[2px] shadow-2xl shadow-blue-900/60">
          <div className="w-full h-full rounded-full bg-[#0a101d] flex flex-col items-center justify-center relative overflow-hidden border border-cyan-400/40">
            {isListening ? (
              <Radio className="w-6 h-6 text-cyan-300 animate-ping" />
            ) : isSpeaking ? (
              <Volume2 className="w-6 h-6 text-blue-300 animate-bounce" />
            ) : (
              <Mic className="w-5 h-5 text-cyan-300" />
            )}
            <span className="text-[7px] font-mono font-bold tracking-widest text-cyan-400 mt-0.5">
              PRIYA
            </span>
          </div>
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#070b14] shadow" />
      </div>
    </div>
  );
};
