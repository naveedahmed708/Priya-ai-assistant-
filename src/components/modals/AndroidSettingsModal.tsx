import React, { useState } from 'react';
import {
  X,
  BatteryCharging,
  Layers,
  BellRing,
  Accessibility,
  Headphones,
  Check,
  ShieldAlert,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { AndroidSystemDialogConfig } from '../../types';
import { PriyaPermissionManager } from '../../services/permissionManager';

interface AndroidSettingsModalProps {
  config: AndroidSystemDialogConfig;
  onClose: () => void;
  onPermissionUpdated: () => void;
}

export const AndroidSettingsModal: React.FC<AndroidSettingsModalProps> = ({
  config,
  onClose,
  onPermissionUpdated,
}) => {
  const pm = PriyaPermissionManager.getInstance();
  const [toggleState, setToggleState] = useState(false);

  if (!config.isOpen) return null;

  const handleGrant = (id: string, isAdvanced = true) => {
    if (isAdvanced) {
      pm.updateAdvancedStatus(id, 'GRANTED');
    } else {
      pm.updateStatus(id, 'GRANTED');
    }
    onPermissionUpdated();
    onClose();
  };

  const handleDeny = (id: string, isAdvanced = true) => {
    if (isAdvanced) {
      pm.updateAdvancedStatus(id, 'DENIED');
    } else {
      pm.updateStatus(id, 'DENIED');
    }
    onPermissionUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-[28px] bg-[#1a1c22] border border-white/10 shadow-2xl text-white overflow-hidden font-sans">
        {/* Android 14/15 Styled Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
              Android System Settings
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on dialog type */}
        <div className="p-6">
          {/* Battery Optimization Dialog */}
          {config.type === 'battery' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Let app always run in background?
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Allowing Priya to always run in the background allows the voice assistant to stay responsive even when the phone screen is off or in standby.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => handleDeny('battery')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 active:scale-95"
                >
                  Don&apos;t allow
                </button>
                <button
                  onClick={() => handleGrant('battery')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 active:scale-95"
                >
                  Allow
                </button>
              </div>
            </div>
          )}

          {/* Overlay Permission Screen */}
          {config.type === 'overlay' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 text-cyan-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Display over other apps
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Priya AI Assistant (com.priya.aiassistant)
              </p>
              <div className="p-4 rounded-2xl bg-[#242730] border border-white/5 flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-white">
                  Allow display over other apps
                </span>
                <button
                  onClick={() => setToggleState(!toggleState)}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                    toggleState ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      toggleState ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGrant('overlay')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          )}

          {/* Notification Access Settings */}
          {config.type === 'notification_access' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Notification listener access
              </h3>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Priya will be able to read all notifications, including personal info like contact names and text of messages you receive.
              </p>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] mb-6 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Priya only reads notifications locally when you ask &quot;Read my notifications&quot;.</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => handleDeny('notification_access')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300"
                >
                  Disallow
                </button>
                <button
                  onClick={() => handleGrant('notification_access')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
                >
                  Allow
                </button>
              </div>
            </div>
          )}

          {/* Accessibility Service Settings */}
          {config.type === 'accessibility' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 text-indigo-300">
                <Accessibility className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Turn on Priya Assistant Service?
              </h3>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Priya needs to observe your actions and retrieve window content to tap buttons and navigate apps when you give voice instructions.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => handleDeny('accessibility')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGrant('accessibility')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
                >
                  Turn On
                </button>
              </div>
            </div>
          )}

          {/* Default Assistant (RoleManager) */}
          {config.type === 'default_assistant' && (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Default digital assistant app
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Choose the app to handle assistance requests when holding the power button.
              </p>
              <div className="space-y-2 mb-6">
                <div
                  onClick={() => handleGrant('default_assistant')}
                  className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-between cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      P
                    </div>
                    <span className="text-xs font-semibold text-white">Priya AI Assistant</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div
                  onClick={() => handleDeny('default_assistant')}
                  className="p-3 rounded-xl bg-[#242730] border border-white/5 flex items-center justify-between cursor-pointer opacity-70"
                >
                  <span className="text-xs text-gray-300">None / System Default</span>
                </div>
              </div>
            </div>
          )}

          {/* App Info Permissions modal for runtime permissions */}
          {config.type === 'app_info' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                App permissions
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Priya AI Assistant (com.priya.aiassistant)
              </p>
              <div className="p-4 rounded-xl bg-[#242730] border border-white/5 mb-6">
                <p className="text-xs text-gray-300">
                  Allow permission: <strong className="text-white">{config.targetPermissionId}</strong>?
                </p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => handleDeny(config.targetPermissionId || '', false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300"
                >
                  Don&apos;t allow
                </button>
                <button
                  onClick={() => handleGrant(config.targetPermissionId || '', false)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-600/30"
                >
                  Allow while using app
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
