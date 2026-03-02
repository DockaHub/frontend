
import React from 'react';
import { Search, LayoutGrid, List, ChevronRight, Home } from 'lucide-react';
import { DriveItem } from '../../../types';

interface DriveHeaderProps {
  breadcrumbs: DriveItem[];
  onNavigateBreadcrumb: (id: string | null) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const DriveHeader: React.FC<DriveHeaderProps> = ({ breadcrumbs, onNavigateBreadcrumb, viewMode, onViewModeChange }) => {
  return (
    <div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950 z-20 transition-colors">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1 text-sm text-docka-600 dark:text-zinc-400 overflow-hidden">
         <button 
           onClick={() => onNavigateBreadcrumb(null)} 
           className="flex items-center hover:bg-docka-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors hover:text-docka-900 dark:hover:text-zinc-100"
         >
            <Home size={16} className="mr-1" />
            <span className="font-medium">Meu Drive</span>
         </button>
         
         {breadcrumbs.map((item) => (
           <div key={item.id} className="flex items-center">
              <ChevronRight size={14} className="text-docka-400 dark:text-zinc-600 mx-0.5" />
              <button 
                onClick={() => onNavigateBreadcrumb(item.id)}
                className="hover:bg-docka-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors hover:text-docka-900 dark:hover:text-zinc-100 font-medium truncate max-w-[150px]"
              >
                 {item.name}
              </button>
           </div>
         ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group hidden md:block">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-800 dark:group-focus-within:text-zinc-300 transition-colors" size={15} />
           <input 
             type="text" 
             placeholder="Buscar no Drive..." 
             className="w-64 pl-9 pr-4 py-1.5 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-docka-300 dark:focus:border-zinc-600 focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 rounded-md text-sm outline-none transition-all placeholder:text-docka-400 dark:placeholder:text-zinc-600 font-medium text-docka-900 dark:text-zinc-100"
           />
        </div>

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

export default DriveHeader;
