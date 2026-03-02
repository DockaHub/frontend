
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Settings, X, Check } from 'lucide-react';
import { CalendarViewType } from '../../../types';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onSearch: (query: string) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, view, onViewChange, onNavigate, onSearch }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const formattedDate = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Settings State (Mock)
  const [settings, setSettings] = useState({
      showWeekends: true,
      declinedEvents: false,
      workingHours: true
  });

  const handleSearchChange = (val: string) => {
      setSearchInput(val);
      onSearch(val);
  };

  const closeSearch = () => {
      setIsSearchOpen(false);
      setSearchInput('');
      onSearch('');
  };

  // Close menus on outside click
  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (!target.closest('.settings-menu') && !target.closest('.settings-btn')) {
              setIsSettingsOpen(false);
          }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const viewLabels: Record<string, string> = {
      day: 'Dia',
      week: 'Semana',
      month: 'Mês'
  };

  return (
    <div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950 z-20 transition-colors">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onNavigate('today')}
                className="px-3 py-1.5 text-sm font-medium text-docka-700 dark:text-zinc-300 border border-docka-200 dark:border-zinc-700 rounded-md hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors"
            >
                Hoje
            </button>
            <div className="flex items-center gap-0.5">
                <button onClick={() => onNavigate('prev')} className="p-1.5 text-docka-500 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-md transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <button onClick={() => onNavigate('next')} className="p-1.5 text-docka-500 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-md transition-colors">
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
        <h2 className="text-xl font-bold text-docka-900 dark:text-zinc-100 capitalize min-w-[200px]">{formattedDate}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* View Toggle */}
        <div className="bg-docka-100 dark:bg-zinc-800 p-0.5 rounded-lg flex text-xs font-medium">
            {(['day', 'week', 'month'] as CalendarViewType[]).map((v) => (
                <button
                    key={v}
                    onClick={() => onViewChange(v)}
                    className={`px-3 py-1 rounded-md capitalize transition-all ${view === v ? 'bg-white dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 shadow-sm' : 'text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                >
                    {viewLabels[v]}
                </button>
            ))}
        </div>
        
        <div className="w-px h-6 bg-docka-200 dark:bg-zinc-800 mx-1" />
        
        {/* Search */}
        <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-9'}`}>
            {isSearchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full flex items-center">
                    <input 
                        autoFocus
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-9 pr-8 py-1.5 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                        placeholder="Buscar eventos..."
                    />
                    <Search size={14} className="absolute left-3 text-docka-400 dark:text-zinc-500" />
                    <button onClick={closeSearch} className="absolute right-2 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-docka-500 dark:text-zinc-500 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md ml-auto"
                    title="Buscar"
                >
                    <Search size={18} />
                </button>
            )}
        </div>

        {/* Settings */}
        <div className="relative">
            <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 text-docka-500 dark:text-zinc-500 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md settings-btn ${isSettingsOpen ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : ''}`}
                title="Configurações"
            >
                <Settings size={18} />
            </button>

            {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-right p-1 settings-menu">
                    <div className="px-3 py-2 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Visualização</div>
                    <button 
                        onClick={() => setSettings(p => ({...p, showWeekends: !p.showWeekends}))}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 rounded-md"
                    >
                        <span>Mostrar fins de semana</span>
                        {settings.showWeekends && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </button>
                    <button 
                        onClick={() => setSettings(p => ({...p, declinedEvents: !p.declinedEvents}))}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 rounded-md"
                    >
                        <span>Eventos recusados</span>
                        {settings.declinedEvents && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                    </button>
                    <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                    <button className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 rounded-md">
                        Configurações da Conta
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
