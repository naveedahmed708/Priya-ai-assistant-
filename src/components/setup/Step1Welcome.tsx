import React from 'react';
import { ArrowRight, Sparkles, Shield, Mic, Radio } from 'lucide-react';

interface Step1WelcomeProps {
  onContinue: () => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-6 max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Stepper Header */}
      <div className="pt-2 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0d1527] rounded-[10px] flex items-center justify-center">
              <span className="font-bold text-xs tracking-wider text-cyan-300 font-mono">PRIYA</span>
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">Set up Priya</h2>
            <p className="text-xs text-gray-400 font-medium">Step 1 of 3</p>
          </div>
        </div>

        {/* Progress track */}
        <div className="grid grid-cols-3 gap-2">
          <div className="h-1 rounded-full bg-blue-500 shadow-sm shadow-blue-400/50" />
          <div className="h-1 rounded-full bg-gray-800" />
          <div className="h-1 rounded-full bg-gray-800" />
        </div>
      </div>

      {/* Hero Visual */}
      <div className="my-auto py-6 flex flex-col items-center text-center z-10">
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer glowing HUD ring */}
          <div className="w-44 h-44 rounded-full border border-blue-500/30 animate-spin [animation-duration:15s] flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border border-dashed border-cyan-400/40 animate-spin [animation-duration:25s] [animation-direction:reverse]" />
          </div>

          {/* Glowing Center Core */}
          <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 via-indigo-700 to-cyan-500 p-1 shadow-2xl shadow-blue-500/50">
            <div className="w-full h-full rounded-full bg-[#0a1122] flex flex-col items-center justify-center relative overflow-hidden border border-cyan-400/30">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.25)_0%,transparent_70%)]" />
              <Mic className="w-8 h-8 text-cyan-300 animate-pulse mb-1 relative z-10" />
              <span className="text-[10px] tracking-widest text-cyan-400 font-mono font-bold relative z-10">
                P.R.I.Y.A.
              </span>
            </div>
          </div>

          <div className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] font-semibold text-blue-300 flex items-center gap-1 shadow-md">
            <Radio className="w-3 h-3 text-cyan-400 animate-ping" />
            Live Assistant
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Welcome to Priya
        </h1>
        <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
          Your personal voice-first AI assistant. Talk naturally in English, Hindi, and Hinglish with zero lag.
        </p>

        {/* Feature Highlights */}
        <div className="w-full mt-6 space-y-2.5 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a]/60 border border-white/5 backdrop-blur-md">
            <div className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Gemini Live Voice</p>
              <p className="text-[11px] text-gray-400">Fluent, witty, human-like voice conversation</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a]/60 border border-white/5 backdrop-blur-md">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Real Device Integration</p>
              <p className="text-[11px] text-gray-400">Make calls, send texts, scan and control apps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 z-10">
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
