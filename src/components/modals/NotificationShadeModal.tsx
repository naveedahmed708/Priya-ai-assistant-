import React from 'react';
import { X, Bell, MessageCircle, Phone, MessageSquare, Volume2, ShieldCheck, Radio } from 'lucide-react';
import { AndroidBridge } from '../../services/androidBridge';
import { SystemNotification } from '../../types';

interface NotificationShadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadAloud: (text: string) => void;
}

export const NotificationShadeModal: React.FC<NotificationShadeModalProps> = ({
  isOpen,
  onClose,
  onReadAloud,
}) => {
  const bridge = AndroidBridge.getInstance();
  const notifications = bridge.getNotifications();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'call':
        return <Phone className="w-4 h-4 text-rose-400" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 bg-black/80 backdrop-blur-md animate-in slide-in-from-top-6 duration-200">
      <div className="w-full max-w-sm rounded-[28px] bg-[#0c1322] border border-blue-500/25 p-4 shadow-2xl text-white font-sans max-h-[85vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Android Notification Shade</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 scrollbar-thin scrollbar-thumb-gray-800">
          {/* Priya Persistent Foreground Service Notification */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                  P
                </div>
                <span className="text-xs font-semibold text-white">Priya is active</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">Foreground Service</span>
            </div>
            <p className="text-xs text-gray-300">
              Voice assistant is ready. Say &quot;Hey Priya&quot; anytime.
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Background microphone & wakeword standby active</span>
            </div>
          </div>

          {/* App Notifications */}
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-2xl bg-[#121b2f] border border-white/5 hover:border-blue-500/20 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/5">{getIcon(n.iconType)}</div>
                  <span className="text-xs font-semibold text-white">{n.appName}</span>
                </div>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>

              <h4 className="text-xs font-medium text-gray-200 mt-1">{n.title}</h4>
              <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{n.text}</p>

              <button
                onClick={() => {
                  onReadAloud(`Notification from ${n.appName}: ${n.title} says ${n.text}`);
                }}
                className="mt-2.5 px-3 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-cyan-300 text-[11px] font-medium flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Volume2 className="w-3 h-3" />
                <span>Ask Priya to read</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
