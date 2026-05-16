
import React from 'react';
import { MoreHorizontal, Plus, Calendar } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { KanbanColumnData, KanbanCardData } from '../../../../types';
import UserAvatar from '../../../../components/common/UserAvatar';

interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onCardClick?: (card: KanbanCardData) => void;
  onAddCard?: (columnId: string) => void;
  onDragEnd?: (result: DropResult) => void;
  members?: any[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, onCardClick, onAddCard, onDragEnd, members = [] }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd || (() => { })}>
      <div className="h-full overflow-x-auto custom-scrollbar">
        <div className="flex px-8 pt-6 pb-4 gap-4 items-start min-h-full">
            {columns.map((col) => (
          <div key={col.id} className="min-w-[320px] w-[320px] shrink-0 flex flex-col h-full max-h-full bg-docka-100/50 dark:bg-zinc-900/50 rounded-xl p-2 border border-docka-200/50 dark:border-zinc-800">
            {/* Column Header */}
            <div className="flex justify-between items-center mb-3 px-2 pt-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color || 'bg-docka-300 dark:bg-zinc-600'}`} />
                <h3 className="text-sm font-bold text-docka-700 dark:text-zinc-300 uppercase tracking-wide">{col.title}</h3>
                <span className="text-xs text-docka-400 dark:text-zinc-500 font-medium ml-1">({col.cards.length})</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAddCard?.(col.id)}
                  className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-md text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                </button>
                <button className="p-1 hover:bg-white dark:hover:bg-zinc-800 rounded-md text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors shadow-sm">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Cards Container */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 overflow-y-auto custom-scrollbar space-y-3 px-1 pb-1 ${snapshot.isDraggingOver ? 'bg-docka-200/50 dark:bg-zinc-800/50 rounded-lg' : ''}`}
                >
                  {col.cards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onCardClick?.(card)}
                          style={{ ...provided.draggableProps.style }}
                          className={`bg-white dark:bg-zinc-900 p-4 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-docka-300 dark:hover:border-zinc-700 transition-all cursor-pointer group relative active:scale-[0.98] ${snapshot.isDragging ? 'shadow-lg rotate-2 z-50' : ''}`}
                        >
                          {/* Top Meta: Priority & Health */}
                          <div className="absolute top-4 right-4 flex items-center gap-1.5">
                            {(card as any).health && (
                                <div 
                                    className={`w-2 h-2 rounded-full ${(card as any).health === 'on-track' ? 'bg-emerald-500' : (card as any).health === 'at-risk' ? 'bg-orange-500' : 'bg-red-500'}`} 
                                    title={`Status: ${(card as any).health}`}
                                />
                            )}
                            {card.priority === 'high' && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Alta Prioridade" />
                            )}
                          </div>

                          {/* Responsible & Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {/* Responsible Tag */}
                            {(() => {
                              const assignedId = (card as any).assignedUserId;
                              const assignedUser = (card as any).assignedUser;
                              const respName = assignedUser?.name || 
                                              members.find(m => m.id === assignedId || m.userId === assignedId)?.user?.name || 
                                              members.find(m => m.id === assignedId || m.userId === assignedId)?.name;
                              
                              if (!respName) return null;

                              const colors = [
                                'bg-blue-100 text-blue-700',
                                'bg-emerald-100 text-emerald-700',
                                'bg-amber-100 text-amber-700',
                                'bg-rose-100 text-rose-700',
                                'bg-indigo-100 text-indigo-700',
                                'bg-purple-100 text-purple-700',
                                'bg-cyan-100 text-cyan-700',
                                'bg-teal-100 text-teal-700'
                              ];
                              
                              let hash = 0;
                              for (let i = 0; i < respName.length; i++) {
                                hash = respName.charCodeAt(i) + ((hash << 5) - hash);
                              }
                              const colorClass = colors[Math.abs(hash) % colors.length];

                              return (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-sm border border-black/5 ${colorClass}`}>
                                  👤 {respName.split(' ')[0]}
                                </span>
                              );
                            })()}

                            {card.tags && card.tags.length > 0 && (
                              <>
                                {card.tags
                                  .filter(tag => 
                                    !tag.label.toUpperCase().startsWith('CNPJ:') && 
                                    !tag.label.toUpperCase().startsWith('RAZÃO SOCIAL:') && 
                                    !tag.label.toUpperCase().startsWith('ENDEREÇO:') &&
                                    !tag.label.toUpperCase().includes('REGISTRO DE MARCA')
                                  )
                                  .map((tag, idx) => (
                                    <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tag.color} dark:bg-opacity-20`}>
                                      {tag.label}
                                    </span>
                                  ))}
                              </>
                            )}
                          </div>

                          {/* Main Content */}
                          <h4 className="font-bold text-docka-900 dark:text-zinc-100 mb-1 leading-snug">{card.title}</h4>
                          {card.subtitle && <p className="text-xs text-docka-500 dark:text-zinc-400 mb-3 line-clamp-2">{card.subtitle}</p>}

                          {/* Probability Indicator (CRM) */}
                          {(card as any).probability !== undefined && (card as any).probability < 100 && (
                             <div className="mb-3">
                                <div className="flex justify-between items-center text-[10px] font-bold text-docka-400 mb-1 uppercase">
                                    <span>Probabilidade</span>
                                    <span>{(card as any).probability}%</span>
                                </div>
                                <div className="w-full h-1 bg-docka-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(card as any).probability}%` }} />
                                </div>
                             </div>
                          )}

                          {/* Footer Meta */}
                          <div className="flex justify-between items-center pt-3 border-t border-docka-50 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                              {card.members && card.members.length > 0 && (
                                <div className="flex -space-x-1.5">
                                  {card.members.map((m: any, i: number) => {
                                    const mSrc = typeof m === 'string' ? m : m.avatar;
                                    const mName = typeof m === 'string' ? 'Member' : m.name;
                                    return (
                                      <UserAvatar 
                                        key={i} 
                                        src={mSrc} 
                                        name={mName} 
                                        size="xs" 
                                        className="border border-white dark:border-zinc-900" 
                                      />
                                    );
                                  })}
                                </div>
                              )}
                              {card.date && (
                                <div className={`flex items-center text-[10px] font-medium ${card.priority === 'high' ? 'text-red-500' : 'text-docka-400 dark:text-zinc-500'}`}>
                                  <Calendar size={12} className="mr-1" /> {card.date}
                                </div>
                              )}
                            </div>

                            {card.value && (
                              <div className="flex items-center text-xs font-bold text-docka-800 dark:text-zinc-200 bg-docka-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-docka-100 dark:border-zinc-700">
                                {card.value}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Add Card Placeholder */}
                  <button
                    onClick={() => onAddCard?.(col.id)}
                    className="w-full py-2 border border-dashed border-docka-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-docka-400 dark:text-zinc-500 hover:border-docka-400 dark:hover:border-zinc-500 hover:text-docka-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 bg-transparent"
                  >
                    <Plus size={14} /> Novo Lead
                  </button>
                </div>
              )}
            </Droppable>
          </div>
        ))}

        {/* Add Column Button */}
        <button className="min-w-[50px] h-full bg-docka-50/50 dark:bg-zinc-900/30 hover:bg-docka-100 dark:hover:bg-zinc-800/50 border border-dashed border-docka-300 dark:border-zinc-700 rounded-xl flex items-center justify-center text-docka-400 dark:text-zinc-600 hover:text-docka-600 dark:hover:text-zinc-400 transition-colors">
          <Plus size={20} />
        </button>
          </div>
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
