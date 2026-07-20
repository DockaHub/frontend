import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';
import AsteryskoNewLeadModal from './AsteryskoNewLeadModal';
import AsteryskoDealDetailsModal from './AsteryskoDealDetailsModal';

interface DealCard {
    id: string;
    title: string;
    subtitle?: string;
    status: string;
    value: string | null;
    date: string;
    contactName?: string;
    tags?: any[];
    members?: any[];
    assignedUserId?: string;
}

interface Column {
    id: string;
    title: string;
    color: string;
    cards: DealCard[];
}

interface Props {
    organization?: Organization;
}

const AsteryskoCRMView: React.FC<Props> = ({ organization }) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<DealCard | null>(null);

    const fetchDeals = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/asterysko/crm/deals`);
            setColumns(response.data);
        } catch (error) {
            console.error('Failed to fetch deals', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, [organization?.id]);

    const handleDragStart = (e: React.DragEvent, cardId: string) => {
        setDraggedCardId(cardId);
        e.dataTransfer.effectAllowed = 'move';
        // Subtle opacity to the dragging element can be achieved by the browser
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        if (!draggedCardId) return;

        // Optimistic UI update
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
            let cardToMove: DealCard | null = null;
            let sourceColIdx = -1;

            // Find and remove card from source
            for (let i = 0; i < newColumns.length; i++) {
                const cardIdx = newColumns[i].cards.findIndex(c => c.id === draggedCardId);
                if (cardIdx !== -1) {
                    cardToMove = newColumns[i].cards[cardIdx];
                    newColumns[i].cards.splice(cardIdx, 1);
                    sourceColIdx = i;
                    break;
                }
            }

            // If card not found
            if (!cardToMove) return prevColumns;
            
            // If dropped in same column, restore and do nothing
            if (newColumns[sourceColIdx].id === targetColumnId) {
                newColumns[sourceColIdx].cards.push(cardToMove);
                return prevColumns; 
            }

            // Update card status and add to target column
            cardToMove.status = targetColumnId;
            const targetColIdx = newColumns.findIndex(c => c.id === targetColumnId);
            if (targetColIdx !== -1) {
                newColumns[targetColIdx].cards.push(cardToMove);
            }

            return newColumns;
        });

        const movedCardId = draggedCardId;
        setDraggedCardId(null);

        // Make API call to update status
        try {
            await api.patch(`/asterysko/crm/deals/${movedCardId}`, { status: targetColumnId });
        } catch (error) {
            console.error('Failed to update deal status', error);
            // Revert on error by refetching
            fetchDeals();
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">CRM</span>
                
                <button 
                    onClick={() => setIsLeadModalOpen(true)}
                    className="flex items-center justify-center bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-700 text-black dark:text-white font-sans text-xs font-semibold px-4 h-[32px] rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                    <div className="bg-[#0412dd] dark:bg-[#3b48ff] rounded-full p-0.5 mr-2">
                        <Plus size={10} className="text-white" strokeWidth={3} />
                    </div>
                    Novo lead
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 w-full overflow-x-auto flex custom-scrollbar relative items-stretch">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex justify-center pt-12 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-[#0412dd] dark:text-[#3b48ff]" size={24} />
                    </div>
                )}
                {columns.map((col, idx) => {
                    return (
                        <div 
                            key={col.id} 
                            className={`shrink-0 w-[300px] flex flex-col ${idx !== columns.length - 1 ? 'border-r border-[#e5e5e5] dark:border-zinc-800' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className="flex items-center gap-2 px-6 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/50 shrink-0 sticky top-0">
                                <div className={`w-2.5 h-2.5 rounded-full ${col.color.replace('bg-', 'bg-').replace('-400', '-500')} shrink-0`} />
                                <span className="text-sm font-semibold text-[#131f15] dark:text-zinc-200 truncate">{col.title}</span>
                            </div>
                            
                            {/* Column Content */}
                            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                                {col.cards.map((card) => {
                                    
                                    // Try to find the tag that indicates source (e.g. "site")
                                    const sourceTag = card.tags?.find((t: any) => typeof t === 'string' ? t.toLowerCase().includes('site') : t.label?.toLowerCase().includes('site')) ? 'Site' : 'Manual';
                                    
                                    return (
                                        <div 
                                            key={card.id} 
                                            draggable
                                            onClick={() => setSelectedCard(card)}
                                            onDragStart={(e) => handleDragStart(e, card.id)}
                                            className={`bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-700 rounded-[12px] p-5 shadow-sm flex flex-col hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-grab active:cursor-grabbing shrink-0 ${draggedCardId === card.id ? 'opacity-50' : ''}`}
                                        >
                                            
                                            {/* Top Pills */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="h-6 px-3 rounded-full bg-[#f0f0ff] dark:bg-blue-900/20 text-[#0412dd] dark:text-[#3b48ff] text-[10px] font-bold flex items-center justify-center max-w-[120px] truncate">
                                                    {card.assignedUserId ? 'Atribuído' : 'Sem dono'}
                                                </span>
                                                <span className="h-6 px-3 rounded-full bg-[#f5f5f5] dark:bg-zinc-800 text-[#9f9f9f] text-[10px] font-bold flex items-center justify-center truncate max-w-[100px]">
                                                    {sourceTag}
                                                </span>
                                            </div>
                                            
                                            {/* Main Info */}
                                            <h3 className="font-season text-[26px] font-[420] text-black dark:text-white leading-none mb-1 break-words">
                                                {card.title}
                                            </h3>
                                            <p className="text-[11px] font-semibold text-[#9f9f9f] mb-6 truncate">
                                                {card.contactName || card.subtitle || 'Sem nome'}
                                            </p>
                                            
                                            {/* Bottom Info */}
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-[12px] font-medium text-black dark:text-white opacity-80">
                                                    {card.date}
                                                </span>
                                                <span className="text-[12px] font-medium text-black dark:text-white">
                                                    {card.value || '-'}
                                                </span>
                                            </div>
                                            
                                        </div>
                                    )
                                })}
                                {col.cards.length === 0 && !isLoading && (
                                    <div className="text-center py-4 opacity-40">
                                        <span className="text-[10px] font-medium text-black dark:text-white">Solte aqui</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <AsteryskoNewLeadModal 
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                onSuccess={() => {
                    setIsLeadModalOpen(false);
                    fetchDeals();
                }}
                organizationId={organization?.id}
            />

            <AsteryskoDealDetailsModal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                card={selectedCard}
            />
        </div>
    );
};

export default AsteryskoCRMView;
