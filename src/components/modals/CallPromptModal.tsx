import React from 'react';
import { Phone, PhoneCall, X } from 'lucide-react';

interface CallPromptModalProps {
  isOpen: boolean;
  contactName: string;
  phone: string;
  onClose: () => void;
}

export const CallPromptModal: React.FC<CallPromptModalProps> = ({
  isOpen,
  contactName,
  phone,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDial = () => {
    window.location.href = `tel:${phone}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xs rounded-3xl bg-[#0f172a] border border-blue-500/30 p-6 text-white text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <PhoneCall className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold">{contactName}</h3>
        <p className="text-xs text-gray-400 font-mono mt-1 mb-6">{phone}</p>

        <div className="space-y-2.5">
          <button
            onClick={handleDial}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>Call with Phone App</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
