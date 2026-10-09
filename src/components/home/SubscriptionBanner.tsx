import React, { useState } from 'react';
import { Lock, Sparkles, Check, X } from 'lucide-react';

export const SubscriptionBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activated, setActivated] = useState(false);

  return (
    <>
      <div className="mx-4 my-2 p-3.5 rounded-2xl bg-[#0e172a]/80 border border-blue-500/20 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg shadow-blue-950/40">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
            {activated ? <Sparkles className="w-4 h-4 text-cyan-300" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
              {activated ? (
                <>
                  <span className="text-cyan-300">Priya Unlimited Active</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </>
              ) : (
                <>
                  <span>Free mode</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300 font-normal">10:00 min left today</span>
                </>
              )}
            </h2>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {activated
                ? 'Full system bridge, PC link & unlimited live talk enabled.'
                : 'Activate a license for tools, PC link and unlimited talk'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-[#1e293b] hover:bg-blue-600 border border-white/10 hover:border-blue-400 text-xs font-medium text-white transition-all active:scale-95 shadow-sm"
        >
          {activated ? 'Settings' : 'Activate'}
        </button>
      </div>

      {/* Activation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0c1322] border border-blue-500/30 p-6 shadow-2xl text-white relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[2px] mb-4">
              <div className="w-full h-full bg-[#0a101d] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-300" />
              </div>
            </div>

            <h3 className="text-lg font-bold">Priya Pro Assistant</h3>
            <p className="text-xs text-gray-300 mt-1 mb-4 leading-relaxed">
              Unlock unlimited continuous voice talk, PC bridge link, deep device automations, and custom voice models.
            </p>

            <div className="space-y-2 mb-6 text-xs text-gray-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Unlimited talk time & background listening</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Instant Android native tools & app opening</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Bilingual Hindi & Hinglish voice intelligence</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActivated(true);
                setShowModal(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-sm hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30"
            >
              Activate Pro Mode (Included)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
