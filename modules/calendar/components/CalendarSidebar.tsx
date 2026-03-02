
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, PanelLeftClose, PanelLeftOpen, CalendarDays } from 'lucide-react';

const CalendarSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Simple Mock Mini Calendar Grid
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1 > 31 ? i + 1 - 31 : i + 1); // Simplistic wrap

  const CalendarGroup = ({ title, items, colors }: { title: string, items: string[], colors: string[] }) => (
    <div className="mb-6">
        <div className="flex items-center justify-between mb-2 group cursor-pointer">
            <h3 className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">{title}</h3>
            <Plus size={14} className="text-docka-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100" />
        </div>
        <div className="space-y-1">
            {items.map((item, idx) => (
                <div key={item} className="flex items-center px-2 py-1.5 rounded-md hover:bg-docka-100 dark:hover:bg-zinc-800 cursor-pointer">
                    <div className={`w-3 h-3 rounded border ${colors[idx]} mr-3 flex items-center justify-center`}>
                        <div className="w-1.5 h-1.5 rounded-sm bg-current opacity-0 hover:opacity-100" />
                    </div>
                    <span className="text-sm text-docka-700 dark:text-zinc-300 truncate">{item}</span>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className={`${isCollapsed ? 'w-[50px] px-2' : 'w-[240px] px-4'} flex flex-col bg-white dark:bg-zinc-900 border-r border-docka-200 dark:border-zinc-800 h-full hidden lg:flex pt-6 transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-2 right-2 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors ${isCollapsed ? 'left-1/2 -translate-x-1/2 top-4' : ''}`}
      >
        {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>

      {isCollapsed ? (
          <div className="mt-12 flex flex-col items-center gap-4">
              <CalendarDays className="text-docka-400 dark:text-zinc-500" size={20} />
              {/* Could add more compact indicators here */}
          </div>
      ) : (
        <div className="animate-in fade-in">
            {/* Mini Calendar */}
            <div className="mb-8 mt-6">
                <div className="flex items-center justify-between mb-4 px-1">
                    <span className="font-bold text-docka-800 dark:text-zinc-200 text-sm capitalize">Fevereiro 2026</span>
                    <div className="flex gap-1">
                        <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"><ChevronLeft size={14} /></button>
                        <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"><ChevronRight size={14} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center mb-2">
                    {days.map((d, i) => <div key={i} className="text-[10px] text-docka-400 dark:text-zinc-500 font-medium">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 text-center gap-y-1">
                    {dates.map((d, i) => (
                        <div 
                            key={i} 
                            className={`text-xs w-6 h-6 mx-auto flex items-center justify-center rounded-full cursor-pointer hover:bg-docka-100 dark:hover:bg-zinc-800 
                            ${d === 24 ? 'bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white font-bold' : 'text-docka-700 dark:text-zinc-400'}`}
                        >
                            {d}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <CalendarGroup 
                    title="Meus Calendários" 
                    items={['Alex Arquiteto', 'Pessoal', 'Lembretes']} 
                    colors={['bg-indigo-500 border-indigo-600', 'bg-purple-500 border-purple-600', 'bg-blue-500 border-blue-600']} 
                />
                <CalendarGroup 
                    title="Docka HQ" 
                    items={['Time de Design', 'Engenharia', 'Feriados']} 
                    colors={['bg-orange-500 border-orange-600', 'bg-slate-500 border-slate-600', 'bg-green-500 border-green-600']} 
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSidebar;
