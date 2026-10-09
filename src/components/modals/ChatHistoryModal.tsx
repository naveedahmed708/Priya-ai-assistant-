import React from 'react';
import { X, MessageSquare, Volume2, Bot, User, CheckCircle2, AlertCircle, Database, Trash2 } from 'lucide-react';
import { ChatMessage } from '../../types';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onPlaySpeech: (text: string) => void;
  onClearHistory?: () => void;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
  onPlaySpeech,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm rounded-[28px] bg-[#0c1322] border border-blue-500/25 p-5 shadow-2xl text-white flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live Voice History</h3>
              <p className="text-[11px] text-gray-400">Cached locally in localStorage</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {messages.length > 0 && onClearHistory && (
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-4 scrollbar-thin scrollbar-thumb-gray-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Bot className="w-10 h-10 text-cyan-400/50 mb-2" />
              <p className="text-xs">No conversations yet.</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Tap the center microphone on home screen or say &quot;Hey Priya&quot; to speak.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center flex-shrink-0 text-cyan-300 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-[#131f38] text-gray-200 border border-white/5 rounded-tl-sm'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Device action executed badge */}
                  {m.toolCall && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-[10px] flex items-center gap-1.5 text-cyan-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-mono">
                        Android Action: {m.toolCall.name}()
                      </span>
                    </div>
                  )}

                  {/* Offline Cache indicator badge */}
                  {m.isCached && (
                    <div className="mt-1.5 pt-1.5 border-t border-cyan-500/20 flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono">
                      <Database className="w-3 h-3 text-cyan-400" />
                      <span>Retrieved from localStorage cache</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 text-[9px] text-gray-400">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => onPlaySpeech(m.text)}
                        className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-700/40 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-200 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
