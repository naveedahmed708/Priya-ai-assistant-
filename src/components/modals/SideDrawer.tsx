import React from 'react';
import {
  X,
  Shield,
  Layers,
  Radio,
  Sliders,
  Volume2,
  Smartphone,
  Info,
  CheckCircle2,
  RefreshCw,
  Zap,
  Database
} from 'lucide-react';
import { PriyaPermissionManager } from '../../services/permissionManager';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  floatingOrbEnabled: boolean;
  onToggleFloatingOrb: () => void;
  wakeWordEnabled: boolean;
  onToggleWakeWord: () => void;
  onReviewPermissions: () => void;
  onOpenEnergyDashboard: () => void;
  onOpenWeatherModal: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  floatingOrbEnabled,
  onToggleFloatingOrb,
  wakeWordEnabled,
  onToggleWakeWord,
  onReviewPermissions,
  onOpenEnergyDashboard,
  onOpenWeatherModal,
}) => {
  const pm = PriyaPermissionManager.getInstance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex font-sans animate-in fade-in duration-200">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Drawer Panel */}
      <div className="relative w-80 max-w-[85vw] h-full bg-[#0a101f] border-r border-white/10 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto text-white z-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 p-[2px]">
                <div className="w-full h-full bg-[#090f1d] rounded-[10px] flex items-center justify-center font-bold text-xs font-mono text-cyan-300">
                  PRIYA
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Priya Assistant</h3>
                <p className="text-[10px] text-gray-400 font-mono">com.priya.aiassistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section: Assistant Controls */}
          <div className="py-4 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Live Voice Engine
            </span>

            {/* Wake Word Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Wake Word &quot;Hey Priya&quot;</h4>
                  <p className="text-[10px] text-gray-400">Continuous local listening</p>
                </div>
              </div>
              <button
                onClick={onToggleWakeWord}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  wakeWordEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    wakeWordEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Floating Orb Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#11192e] border border-white/5">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Floating Assistant Orb</h4>
                  <p className="text-[10px] text-gray-400">Display over all apps</p>
                </div>
              </div>
              <button
                onClick={onToggleFloatingOrb}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  floatingOrbEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    floatingOrbEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: System & Permissions */}
          <div className="py-2 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Android System Status
            </span>

            <button
              onClick={() => {
                onClose();
                onReviewPermissions();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#11192e] hover:bg-[#16213c] border border-white/5 transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Permissions Manager</h4>
                  <p className="text-[10px] text-gray-400">Review microphone, calls, storage</p>
                </div>
              </div>
              <span className="text-xs text-blue-400 font-medium">Manage →</span>
            </button>

            {/* Energy Efficiency Dashboard Button */}
            <button
              onClick={() => {
                onClose();
                onOpenEnergyDashboard();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#11192e] hover:bg-[#16213c] border border-amber-500/20 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
                  <Zap className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Energy Efficiency Dashboard</h4>
                  <p className="text-[10px] text-amber-300/80">Battery stats & performance tips</p>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">Stats →</span>
            </button>

            {/* Offline Cache & Weather Button */}
            <button
              onClick={() => {
                onClose();
                onOpenWeatherModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#11192e] hover:bg-[#16213c] border border-cyan-500/20 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Offline Cache & Weather</h4>
                  <p className="text-[10px] text-cyan-300/80">localStorage sync & responses</p>
                </div>
              </div>
              <span className="text-xs text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">View →</span>
            </button>

            {/* Background Service Status */}
            <div className="p-3 rounded-xl bg-[#11192e] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Foreground Service</h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active in notification shade</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Audio Tech Specs */}
          <div className="py-3">
            <div className="p-3 rounded-xl bg-[#0e1628] border border-blue-500/20 text-[11px] space-y-1.5 text-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Audio Input:</span>
                <span className="font-mono text-cyan-300">PCM16 @ 16kHz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Audio Output:</span>
                <span className="font-mono text-cyan-300">PCM16 / WAV @ 24kHz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AI Model:</span>
                <span className="font-mono text-cyan-300">gemini-3.8-flash</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Languages:</span>
                <span className="text-white">Hindi, Urdu, English</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-gray-400">Priya AI Voice Assistant v2.4.0</p>
          <p className="text-[10px] text-gray-600 mt-0.5">Native Android Simulation Engine</p>
        </div>
      </div>
    </div>
  );
};
