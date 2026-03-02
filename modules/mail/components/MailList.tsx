
import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { Email } from '../../../types';
import MailItem from './MailItem';

interface MailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  onArchive: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onToggleRead: (e: React.MouseEvent, id: string) => void;
}

const MailList: React.FC<MailListProps> = ({ 
  emails, 
  selectedEmailId, 
  onSelectEmail, 
  onArchive, 
  onDelete, 
  onToggleRead 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'starred'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Logic
  const filteredEmails = emails.filter(email => {
      const matchesSearch = 
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
        email.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.body.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filterMode === 'unread') return !email.read;
      if (filterMode === 'starred') return email.starred;
      return true;
  });

  return (
    <div className={`${selectedEmailId ? 'hidden lg:flex' : 'flex'} w-full lg:w-[400px] border-r border-docka-200 dark:border-zinc-800 flex-col bg-white dark:bg-zinc-900 h-full z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]`}>
      {/* Sticky Header */}
      <div className="h-16 border-b border-docka-100 dark:border-zinc-800 flex items-center px-4 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-20 shrink-0">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-800 dark:group-focus-within:text-zinc-300 transition-colors" size={15} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-docka-50/50 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-docka-200 dark:focus:border-zinc-700 focus:ring-4 focus:ring-docka-50/50 dark:focus:ring-zinc-800/50 rounded-lg text-sm outline-none transition-all placeholder:text-docka-400 dark:placeholder:text-zinc-600 font-medium text-docka-900 dark:text-zinc-100"
          />
          
          {/* Filter Toggle */}
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${filterMode !== 'all' || isFilterOpen ? 'bg-docka-200 dark:bg-zinc-700 text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300 hover:bg-docka-100 dark:hover:bg-zinc-800'}`}
            title="Filtrar E-mails"
          >
             <SlidersHorizontal size={14} />
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 p-1">
                  <div className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase px-3 py-2">Filtrar por</div>
                  <button 
                    onClick={() => { setFilterMode('all'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex justify-between items-center ${filterMode === 'all' ? 'bg-docka-50 dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 font-medium' : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50'}`}
                  >
                      Todas
                      {filterMode === 'all' && <CheckCircle2 size={12} className="text-docka-900 dark:text-zinc-100" />}
                  </button>
                  <button 
                    onClick={() => { setFilterMode('unread'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex justify-between items-center ${filterMode === 'unread' ? 'bg-docka-50 dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 font-medium' : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50'}`}
                  >
                      Não Lidas
                      {filterMode === 'unread' && <CheckCircle2 size={12} className="text-docka-900 dark:text-zinc-100" />}
                  </button>
                  <button 
                    onClick={() => { setFilterMode('starred'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md flex justify-between items-center ${filterMode === 'starred' ? 'bg-docka-50 dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 font-medium' : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50'}`}
                  >
                      Com Estrela
                      {filterMode === 'starred' && <CheckCircle2 size={12} className="text-docka-900 dark:text-zinc-100" />}
                  </button>
              </div>
          )}
        </div>
      </div>

      {/* Filter Status Bar (if active) */}
      {filterMode !== 'all' && (
          <div className="px-4 py-2 bg-docka-50 dark:bg-zinc-800 border-b border-docka-100 dark:border-zinc-700 flex justify-between items-center">
              <span className="text-xs font-medium text-docka-600 dark:text-zinc-400">
                  Filtro: {filterMode === 'unread' ? 'Não Lidas' : 'Com Estrela'}
              </span>
              <button onClick={() => setFilterMode('all')} className="text-docka-400 hover:text-docka-900 dark:text-zinc-500 dark:hover:text-zinc-300">
                  <X size={12} />
              </button>
          </div>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredEmails.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-docka-400 dark:text-zinc-600 p-8 text-center animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 bg-docka-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-docka-300 dark:text-zinc-700" strokeWidth={1.5} />
             </div>
             <p className="font-semibold text-docka-700 dark:text-zinc-400">Nada encontrado</p>
             <p className="text-sm mt-1 text-docka-500 dark:text-zinc-600">Tente ajustar seus filtros.</p>
           </div>
        ) : (
          <div className="pb-4">
            {filteredEmails.map(email => (
              <MailItem 
                key={email.id} 
                email={email} 
                isSelected={selectedEmailId === email.id}
                onSelect={onSelectEmail}
                onArchive={onArchive}
                onDelete={onDelete}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MailList;
