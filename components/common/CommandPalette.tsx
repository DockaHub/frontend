import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Command, Monitor, Moon, Sun, LogOut, Building2, LayoutDashboard } from 'lucide-react';
import { Organization } from '../../types';

interface Action {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut?: string;
  section: string;
  perform: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, actions }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter actions
  const filteredActions = actions.filter(action => 
    action.label.toLowerCase().includes(query.toLowerCase()) || 
    action.section.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
        setTimeout(() => inputRef.current?.focus(), 50);
    } else {
        setQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].perform();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group for rendering
  const groupedActions = filteredActions.reduce((acc, action) => {
      if (!acc[action.section]) acc[action.section] = [];
      acc[action.section].push(action);
      return acc;
  }, {} as Record<string, Action[]>);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-docka-200 dark:border-zinc-800 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-docka-100 dark:border-zinc-800">
            <Search className="w-5 h-5 text-docka-400 dark:text-zinc-500 mr-3" />
            <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você precisa?"
                className="flex-1 bg-transparent outline-none text-lg text-docka-900 dark:text-zinc-100 placeholder:text-docka-300 dark:placeholder:text-zinc-600"
            />
            <div className="hidden md:flex items-center gap-1">
                <span className="text-xs text-docka-400 dark:text-zinc-600 font-medium px-1.5 py-0.5 rounded border border-docka-100 dark:border-zinc-800 bg-docka-50 dark:bg-zinc-800">ESC</span>
            </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
            {filteredActions.length === 0 ? (
                <div className="px-4 py-8 text-center text-docka-400 dark:text-zinc-500 text-sm">
                    Nenhum resultado encontrado.
                </div>
            ) : (
                Object.entries(groupedActions).map(([section, items]: [string, Action[]]) => (
                    <div key={section} className="mb-2 last:mb-0">
                        <div className="px-4 py-1.5 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
                            {section}
                        </div>
                        {items.map((action) => {
                            // Calculate global index for highlighting
                            const globalIndex = filteredActions.indexOf(action);
                            const isActive = globalIndex === selectedIndex;

                            return (
                                <button
                                    key={action.id}
                                    onClick={() => { action.perform(); onClose(); }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                                        isActive 
                                            ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' 
                                            : 'text-docka-600 dark:text-zinc-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-md ${isActive ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'bg-docka-50 dark:bg-zinc-800/50'}`}>
                                            <action.icon size={16} />
                                        </div>
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </div>
                                    {action.shortcut && (
                                        <span className="text-xs text-docka-400 dark:text-zinc-600 font-medium">{action.shortcut}</span>
                                    )}
                                    {isActive && <ArrowRight size={14} className="text-docka-400 dark:text-zinc-500" />}
                                </button>
                            );
                        })}
                    </div>
                ))
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-docka-50 dark:bg-zinc-950 border-t border-docka-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-docka-400 dark:text-zinc-600">
            <div className="flex gap-3">
                <span className="flex items-center gap-1"><Command size={10} /> + K para abrir</span>
                <span className="flex items-center gap-1">↑↓ para navegar</span>
                <span className="flex items-center gap-1">↵ para selecionar</span>
            </div>
            <div>Docka OS v2.1</div>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;