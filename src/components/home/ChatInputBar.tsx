import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  onAttachMedia: () => void;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  onAttachMedia,
  disabled = false,
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-4 my-2 p-1.5 rounded-full bg-[#0f172a]/80 border border-white/10 backdrop-blur-md flex items-center gap-2 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all shadow-lg"
    >
      {/* Attachment Button */}
      <button
        type="button"
        onClick={onAttachMedia}
        aria-label="Attach file or photo"
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all flex-shrink-0"
      >
        <Paperclip className="w-4 h-4 rotate-45" />
      </button>

      {/* Input Field */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Priya anything..."
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none min-w-0"
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        aria-label="Send message"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
          input.trim() && !disabled
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30 active:scale-95'
            : 'text-gray-500 hover:text-gray-400'
        }`}
      >
        <Send className="w-4 h-4 -rotate-12 translate-x-[1px]" />
      </button>
    </form>
  );
};
