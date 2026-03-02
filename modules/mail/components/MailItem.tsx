
import React from 'react';
import { Star, Archive, Trash2, MailOpen, Mail } from 'lucide-react';
import { Email } from '../../../types';

interface MailItemProps {
  email: Email;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onArchive: (e: React.MouseEvent, id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onToggleRead: (e: React.MouseEvent, id: string) => void;
}

const MailItem: React.FC<MailItemProps> = ({ email, isSelected, onSelect, onArchive, onDelete, onToggleRead }) => {
  // Label colors map (Using semi-transparent backgrounds for dark mode compatibility)
  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Important': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100/50 dark:border-red-800/50';
      case 'Work': return 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-100/50 dark:border-orange-800/50';
      case 'System': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100/50 dark:border-blue-800/50';
      case 'Updates': return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100/50 dark:border-purple-800/50';
      default: return 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-400 border-gray-100/50 dark:border-zinc-700';
    }
  };

  return (
    <div
      onClick={() => onSelect(email.id)}
      className={`group relative py-3.5 px-5 border-b border-docka-50 dark:border-zinc-800 cursor-pointer transition-all duration-200 select-none ${
        isSelected 
          ? 'bg-docka-50/80 dark:bg-zinc-800 border-l-[3px] border-l-docka-900 dark:border-l-zinc-100 pl-[17px]' 
          : 'bg-white dark:bg-zinc-900 hover:bg-docka-50/50 dark:hover:bg-zinc-800/50 border-l-[3px] border-l-transparent pl-[17px]'
      }`}
    >
      {/* Top Row: Sender + Date/Actions */}
      <div className="flex justify-between items-baseline mb-1 h-5">
        <div className="flex items-center min-w-0 pr-2">
            {!email.read && !isSelected && (
                <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 mr-2 shrink-0" />
            )}
            <span className={`text-sm truncate ${!email.read ? 'font-bold text-docka-900 dark:text-zinc-100' : 'font-medium text-docka-700 dark:text-zinc-400'}`}>
            {email.from.name}
            </span>
        </div>
        
        {/* Date (Visible by default) */}
        <span className="text-[11px] text-docka-400 dark:text-zinc-500 font-medium shrink-0 group-hover:hidden transition-opacity tracking-tight">
          {email.timestamp}
        </span>

        {/* Hover Actions (Replaces Date on Hover) */}
        <div className="hidden group-hover:flex items-center absolute right-4 top-3 bg-white dark:bg-zinc-800 shadow-sm border border-docka-100 dark:border-zinc-700 rounded-md overflow-hidden animate-in fade-in slide-in-from-right-1 duration-200">
          <button 
            onClick={(e) => onArchive(e, email.id)} 
            className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors" 
            title="Archive"
          >
            <Archive size={14} />
          </button>
          <button 
            onClick={(e) => onDelete(e, email.id)} 
            className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" 
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={(e) => onToggleRead(e, email.id)} 
            className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" 
            title={email.read ? "Mark as Unread" : "Mark as Read"}
          >
            {email.read ? <Mail size={14} /> : <MailOpen size={14} />}
          </button>
        </div>
      </div>

      {/* Subject Line */}
      <div className="flex items-center justify-between mb-1">
        <div className={`text-[13px] truncate pr-4 ${!email.read ? 'text-docka-900 dark:text-zinc-100 font-semibold' : 'text-docka-600 dark:text-zinc-400'}`}>
          {email.subject}
        </div>
        {email.starred && <Star size={12} className="text-amber-400 fill-current shrink-0" />}
      </div>

      {/* Preview Text */}
      <div className="text-[12px] text-docka-400 dark:text-zinc-500 truncate leading-relaxed font-normal">
        {email.preview}
      </div>

      {/* Labels */}
      {email.labels && email.labels.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2.5">
          {email.labels.map(label => (
            <span 
              key={label} 
              className={`text-[10px] px-1.5 py-0.5 rounded border ${getLabelColor(label)} font-semibold tracking-wide`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MailItem;
