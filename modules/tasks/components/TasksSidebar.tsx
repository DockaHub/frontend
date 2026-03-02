
import React, { useState } from 'react';
import { Calendar, CheckCircle2, List, Inbox, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface TasksSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const TasksSidebar: React.FC<TasksSidebarProps> = ({ activeFilter, onFilterChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filters = [
    { id: 'all', icon: List, label: 'Todas as Tarefas' },
    { id: 'today', icon: Calendar, label: 'Para Hoje' },
    { id: 'upcoming', icon: Inbox, label: 'Próximas' },
    { id: 'done', icon: CheckCircle2, label: 'Concluídas' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-[60px]' : 'w-[220px]'} flex flex-col bg-docka-50 dark:bg-zinc-900 pt-4 h-full border-r border-docka-200/50 dark:border-zinc-800 hidden lg:flex transition-all duration-300`}>
      
      {/* Toggle */}
      <div className="flex justify-end px-2 mb-4">
         <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
         >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
         </button>
      </div>

      <div className="space-y-1 px-2">
        {!isCollapsed && <h3 className="px-3 text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Minhas Tarefas</h3>}
        {filters.map(item => (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center px-3 py-1.5 text-sm rounded-md transition-all duration-200 group ${
              activeFilter === item.id 
                ? 'bg-docka-200 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-medium' 
                : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <item.icon 
              size={16} 
              className={`shrink-0 transition-colors ${activeFilter === item.id ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 group-hover:text-docka-800 dark:group-hover:text-zinc-300'} ${!isCollapsed ? 'mr-3' : ''}`} 
            />
            {!isCollapsed && item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TasksSidebar;
