import React from 'react';
import { AssistantState } from '../../types';

interface PriyaCoreVisualizerProps {
  assistantState: AssistantState;
  audioVolume?: number;
  frequencies?: number[];
  onClick: () => void;
}

export const PriyaCoreVisualizer: React.FC<PriyaCoreVisualizerProps> = ({
  assistantState,
  audioVolume = 0.15,
  frequencies = [],
  onClick,
}) => {
  // Compute dynamic scale and wave heights based on volume / state
  const isListening = assistantState === 'listening';
  const isSpeaking = assistantState === 'speaking';
  const isThinking = assistantState === 'thinking';

  // Base amplitude
  const activeAmp = isListening || isSpeaking ? Math.max(audioVolume * 2.5, 0.25) : 0.08;

  return (
    <div className="relative my-2 flex items-center justify-center select-none">
      {/* Background radial circuitry decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <svg className="w-80 h-80" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="145" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="160" cy="160" r="120" fill="none" stroke="#1e3a8a" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 160 5 L 160 30 M 160 290 L 160 315 M 5 160 L 30 160 M 290 160 L 315 160" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Main Core Container */}
      <div
        onClick={onClick}
        className="relative w-72 h-72 rounded-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 active:scale-95 group"
      >
        {/* Soft radial glow */}
        <div
          className={`absolute inset-4 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
            isListening
              ? 'bg-cyan-500/30 scale-110'
              : isSpeaking
              ? 'bg-blue-600/35 scale-110'
              : isThinking
              ? 'bg-indigo-500/30 animate-pulse'
              : 'bg-blue-900/20 group-hover:bg-blue-600/25'
          }`}
        />

        {/* Outer Rotating HUD Ring 1 */}
        <div
          className={`absolute w-64 h-64 rounded-full border border-blue-500/20 pointer-events-none ${
            isThinking
              ? 'animate-spin [animation-duration:4s]'
              : 'animate-spin [animation-duration:40s]'
          }`}
        >
          {/* Top Arc indicator */}
          <div className="absolute -top-[1.5px] left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-sm shadow-cyan-400" />
        </div>

        {/* Outer Rotating HUD Ring 2 (Dashed Reverse) */}
        <div
          className={`absolute w-56 h-56 rounded-full border border-dashed border-cyan-500/25 pointer-events-none ${
            isThinking
              ? 'animate-spin [animation-duration:3s] [animation-direction:reverse]'
              : 'animate-spin [animation-duration:30s] [animation-direction:reverse]'
          }`}
        />

        {/* Crosshair markers (+) matching screenshot */}
        <div className="absolute top-7 left-14 text-cyan-400/50 text-xs font-mono font-light pointer-events-none">+</div>
        <div className="absolute top-7 right-14 text-cyan-400/50 text-xs font-mono font-light pointer-events-none">+</div>
        <div className="absolute bottom-9 left-14 text-cyan-400/50 text-xs font-mono font-light pointer-events-none">+</div>
        <div className="absolute bottom-9 right-14 text-cyan-400/50 text-xs font-mono font-light pointer-events-none">+</div>

        {/* Inner Solid Tech Ring */}
        <div className="absolute w-48 h-48 rounded-full border border-blue-400/25 bg-[#080e1d]/90 backdrop-blur-xl flex flex-col items-center justify-center p-3 shadow-2xl shadow-blue-950/80">
          {/* Top Label */}
          <span className="text-[10px] tracking-[0.25em] text-cyan-400 font-semibold font-mono mb-1 text-center">
            AI ASSISTANT
          </span>

          {/* Central Stylized PRIYA */}
          <div className="relative my-0.5">
            <h1
              className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-300 font-sans drop-shadow-[0_2px_12px_rgba(56,189,248,0.4)]"
              style={{
                WebkitTextStroke: '1px rgba(255,255,255,0.8)',
                letterSpacing: '0.12em',
              }}
            >
              P.R.I.Y.A.
            </h1>
          </div>

          {/* Real-time Audio Waveform Dots / Bars */}
          <div className="flex items-center gap-[3px] h-6 my-1.5 px-2">
            {[...Array(18)].map((_, i) => {
              // Calculate bar height based on real frequency data or dynamic sine wave
              const freqVal = frequencies[i % frequencies.length] || 0.15;
              const heightMultiplier = isListening || isSpeaking ? Math.max(freqVal, activeAmp) : 0.2;
              const barHeight = Math.max(4, Math.min(22, Math.round(heightMultiplier * 24)));

              return (
                <div
                  key={i}
                  style={{ height: `${barHeight}px` }}
                  className={`w-[2.5px] rounded-full transition-all duration-75 ${
                    isListening
                      ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                      : isSpeaking
                      ? 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]'
                      : isThinking
                      ? 'bg-indigo-400 animate-pulse'
                      : 'bg-blue-500/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Bottom Subtitle */}
          <span className="text-[9px] tracking-[0.18em] text-gray-400 font-medium font-sans uppercase">
            {isListening
              ? 'LISTENING TO YOU...'
              : isSpeaking
              ? 'SPEAKING...'
              : isThinking
              ? 'THINKING...'
              : 'HOW CAN I HELP YOU?'}
          </span>
        </div>
      </div>
    </div>
  );
};
