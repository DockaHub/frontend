
import React from 'react';
import { Search, LayoutGrid, List, UserPlus } from 'lucide-react';

interface PeopleHeaderProps {
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddMember: () => void;
}

const PeopleHeader: React.FC<PeopleHeaderProps> = ({ viewMode, onViewModeChange, searchTerm, onSearchChange, onAddMember }) => {
  return (
    <div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950 z-20 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-xl font-bold text-docka-900 dark:text-zinc-100 mr-4">Pessoas</h2>
        {/* Search */}
        <div className="relative group max-w-md w-full">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-800 dark:group-focus-within:text-zinc-300 transition-colors" size={15} />
           <input 
             type="text" 
             value={searchTerm}
             onChange={(e) => onSearchChange(e.target.value)}
             placeholder="Buscar por nome, cargo ou e-mail..." 
             className="w-full pl-9 pr-4 py-1.5 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-docka-300 dark:focus:border-zinc-600 focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 rounded-md text-sm outline-none transition-all placeholder:text-docka-400 dark:placeholder:text-zinc-600 font-medium text-docka-900 dark:text-zinc-100"
           />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
            onClick={onAddMember}
            className="flex items-center px-3 py-1.5 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-md text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm"
        >
            <UserPlus size={16} className="mr-2" />
            Adicionar Membro
        </button>

        <div className="h-6 w-px bg-docka-200 dark:bg-zinc-800 mx-1" />

        <div className="flex bg-docka-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-docka-200/50 dark:border-zinc-700/50">
            <button 
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
            >
                <List size={16} />
            </button>
            <button 
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
            >
                <LayoutGrid size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PeopleHeader;
