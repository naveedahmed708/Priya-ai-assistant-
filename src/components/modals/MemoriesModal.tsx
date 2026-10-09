import React, { useState } from 'react';
import { X, BrainCircuit, Plus, Trash2, Calendar, Bookmark, Heart, Clock } from 'lucide-react';
import { MemoryItem } from '../../types';
import { AndroidBridge } from '../../services/androidBridge';

interface MemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoriesModal: React.FC<MemoriesModalProps> = ({ isOpen, onClose }) => {
  const bridge = AndroidBridge.getInstance();
  const [memories, setMemories] = useState<MemoryItem[]>(bridge.getMemories());
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'reminder' | 'note' | 'preference'>('reminder');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    bridge.addMemory({
      title: newTitle.trim(),
      content: newContent.trim() || 'Saved by user',
      category: newCategory,
    });
    setMemories([...bridge.getMemories()]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'reminder':
        return <Calendar className="w-4 h-4 text-cyan-400" />;
      case 'preference':
        return <Heart className="w-4 h-4 text-rose-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm rounded-[28px] bg-[#0c1322] border border-blue-500/25 p-5 shadow-2xl text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-300">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Priya&apos;s Memories</h3>
              <p className="text-[11px] text-gray-400">Context, reminders & preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action button */}
        <div className="py-3">
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory / Reminder</span>
            </button>
          ) : (
            <form onSubmit={handleAddMemory} className="p-3 rounded-2xl bg-[#141e34] border border-blue-500/30 space-y-2.5">
              <input
                type="text"
                placeholder="Title (e.g. Kal 8 baje meeting)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a101d] text-xs text-white placeholder-gray-500 border border-white/5 focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <input
                type="text"
                placeholder="Details / time / notes"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0a101d] text-xs text-white placeholder-gray-500 border border-white/5 focus:outline-none focus:border-cyan-400"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0a101d] text-[11px] text-gray-300 border border-white/5 focus:outline-none"
                >
                  <option value="reminder">Reminder</option>
                  <option value="note">Note</option>
                  <option value="preference">Preference</option>
                </select>
                <div className="flex-1 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Memory list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-gray-800">
          {memories.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl bg-[#111a2e] border border-white/5 hover:border-blue-500/20 transition-all flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0 mt-0.5">
                {getCategoryIcon(m.category)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">{m.title}</h4>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{m.content}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(m.timestamp).toLocaleDateString()}</span>
                  <span className="capitalize text-cyan-400/80">• {m.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
