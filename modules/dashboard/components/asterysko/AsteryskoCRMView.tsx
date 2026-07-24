import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';
import AsteryskoNewLeadModal from './AsteryskoNewLeadModal';
import AsteryskoDealDetailsModal from './AsteryskoDealDetailsModal';
import { AsteryskoOpportunitiesTab } from './opportunities/AsteryskoOpportunitiesTab';
import { 
    CRM_PHASES, 
    CrmPhaseId, 
    getStagesForPhase, 
    getPhaseForStage,
    formatDisplayValue 
} from './config/crmConfig';

interface DealCard {
    id: string;
    title: string;
    subtitle?: string;
    status: string;
    value: string | null;
    date: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    tags?: any[];
    members?: any[];
    assignedUserId?: string;
    assignedUserName?: string;
    processId?: string;
    inpiProcessNumber?: string;
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
    const [allColumns, setAllColumns] = useState<Column[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<DealCard | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Initial active tab from URL query param (?view=... or ?tab=...)
    const [activeTab, setActiveTab] = useState<CrmPhaseId>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const viewParam = (params.get('view') || params.get('tab')) as CrmPhaseId;
            if (viewParam && CRM_PHASES.some(p => p.id === viewParam)) {
                return viewParam;
            }
        }
        return 'commercial';
    });

    // Sync active tab with URL query string without reloading page
    const handleTabChange = (phaseId: CrmPhaseId) => {
        setActiveTab(phaseId);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('view', phaseId);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const fetchDeals = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/asterysko/crm/deals`);
            setAllColumns(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch deals', error);
            setAllColumns([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, [organization?.id]);

    // Show temporary toast notification
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage(null);
        }, 3500);
    };

    // Calculate card counts per phase
    const phaseCounts = useMemo(() => {
        const counts: Record<CrmPhaseId, number> = {
            opportunities: 0,
            commercial: 0,
            onboarding: 0,
            processual: 0,
        };

        allColumns.forEach(col => {
            const phase = getPhaseForStage(col.id);
            if (counts[phase] !== undefined) {
                counts[phase] += col.cards.length;
            }
        });

        return counts;
    }, [allColumns]);

    // Filter columns for current active tab
    const currentBoardColumns = useMemo(() => {
        if (activeTab === 'opportunities') return [];

        const stageConfigs = getStagesForPhase(activeTab);
        return stageConfigs.map(stageConfig => {
            const matchedCol = allColumns.find(c => c.id === stageConfig.id);
            return {
                id: stageConfig.id,
                title: stageConfig.title,
                color: stageConfig.color,
                cards: matchedCol ? matchedCol.cards : []
            };
        });
    }, [allColumns, activeTab]);

    const handleDragStart = (e: React.DragEvent, cardId: string) => {
        setDraggedCardId(cardId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        if (!draggedCardId) return;

        let sourceStage = '';
        let cardTitle = '';

        // Optimistic UI update across all columns
        setAllColumns(prevColumns => {
            const newColumns = prevColumns.map(col => ({ ...col, cards: [...col.cards] }));
            let cardToMove: DealCard | null = null;
            let sourceColIdx = -1;

            for (let i = 0; i < newColumns.length; i++) {
                const cardIdx = newColumns[i].cards.findIndex(c => c.id === draggedCardId);
                if (cardIdx !== -1) {
                    cardToMove = newColumns[i].cards[cardIdx];
                    sourceStage = newColumns[i].id;
                    cardTitle = cardToMove.title;
                    newColumns[i].cards.splice(cardIdx, 1);
                    sourceColIdx = i;
                    break;
                }
            }

            if (!cardToMove) return prevColumns;

            if (newColumns[sourceColIdx].id === targetColumnId) {
                newColumns[sourceColIdx].cards.push(cardToMove);
                return prevColumns;
            }

            cardToMove.status = targetColumnId;
            const targetColIdx = newColumns.findIndex(c => c.id === targetColumnId);
            if (targetColIdx !== -1) {
                newColumns[targetColIdx].cards.push(cardToMove);
            } else {
                newColumns.push({
                    id: targetColumnId,
                    title: targetColumnId,
                    color: 'bg-blue-400',
                    cards: [cardToMove]
                });
            }

            return newColumns;
        });

        const movedCardId = draggedCardId;
        setDraggedCardId(null);

        const oldPhase = getPhaseForStage(sourceStage);
        const newPhase = getPhaseForStage(targetColumnId);

        try {
            await api.put(`/asterysko/crm/deals/${movedCardId}/status`, { status: targetColumnId });

            if (oldPhase !== newPhase) {
                const phaseLabels: Record<CrmPhaseId, string> = {
                    opportunities: 'Oportunidades',
                    commercial: 'Comercial',
                    onboarding: 'Onboarding',
                    processual: 'Processual'
                };
                showToast(`"${cardTitle}" foi movido para ${phaseLabels[newPhase]}.`);
            }
        } catch (error) {
            console.error('Failed to update deal status', error);
            fetchDeals();
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col relative">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-3 rounded-xl shadow-xl border border-zinc-700 dark:border-zinc-300 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium">{toastMessage}</span>
                </div>
            )}

            {/* Top Header & Tab Navigation */}
            <div className="flex flex-col border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                <div className="flex items-center justify-between pt-8 px-10 pb-4">
                    <div className="flex items-center gap-4">
                        <span className="font-season text-[22px] font-[420] text-black dark:text-white">CRM</span>
                    </div>

                    {/* Button Novo Lead ONLY in Commercial Tab */}
                    {activeTab === 'commercial' && (
                        <button 
                            onClick={() => setIsLeadModalOpen(true)}
                            className="flex items-center justify-center bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-700 text-black dark:text-white font-sans text-xs font-semibold px-4 h-[32px] rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            <div className="bg-[#0412dd] dark:bg-[#3b48ff] rounded-full p-0.5 mr-2">
                                <Plus size={10} className="text-white" strokeWidth={3} />
                            </div>
                            Novo lead
                        </button>
                    )}
                </div>

                {/* Internal Tabs Segment Control */}
                <div className="flex items-center gap-1 px-10 pb-3 overflow-x-auto custom-scrollbar">
                    {CRM_PHASES.map(phase => {
                        const isActive = activeTab === phase.id;
                        const count = phaseCounts[phase.id];

                        return (
                            <button
                                key={phase.id}
                                onClick={() => handleTabChange(phase.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 ${
                                    isActive
                                        ? 'bg-[#0412dd] dark:bg-[#3b48ff] text-white shadow-sm'
                                        : 'bg-[#f5f5f5] dark:bg-zinc-900 text-[#666666] dark:text-zinc-400 hover:bg-[#eaeaea] dark:hover:bg-zinc-800'
                                }`}
                            >
                                <span>{phase.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-[#e5e5e5] dark:bg-zinc-800 text-[#666666] dark:text-zinc-400'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Board View / Tab Content */}
            <div className="flex-1 w-full overflow-x-auto flex custom-scrollbar relative items-stretch">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex justify-center pt-12 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-[#0412dd] dark:text-[#3b48ff]" size={24} />
                    </div>
                )}

                {/* Operational View for Opportunities Tab */}
                {activeTab === 'opportunities' && (
                    <div className="w-full p-6 md:p-8">
                        <AsteryskoOpportunitiesTab />
                    </div>
                )}

                {/* Kanban Columns for Active Phase */}
                {activeTab !== 'opportunities' && currentBoardColumns.map((col, idx) => {
                    return (
                        <div 
                            key={col.id} 
                            className={`shrink-0 w-[300px] flex flex-col ${idx !== currentBoardColumns.length - 1 ? 'border-r border-[#e5e5e5] dark:border-zinc-800' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/50 shrink-0 sticky top-0">
                                <div className="flex items-center gap-2 truncate">
                                    <div className={`w-2.5 h-2.5 rounded-full ${col.color.replace('bg-', 'bg-').replace('-400', '-500')} shrink-0`} />
                                    <span className="text-sm font-semibold text-[#131f15] dark:text-zinc-200 truncate">{col.title}</span>
                                </div>
                                <span className="text-xs font-bold opacity-40 text-black dark:text-white shrink-0 ml-2">
                                    {col.cards.length}
                                </span>
                            </div>
                            
                            {/* Column Content */}
                            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                                {col.cards.map((card) => {
                                    const sourceTag = card.tags?.find((t: any) => typeof t === 'string' ? t.toLowerCase().includes('site') : t.label?.toLowerCase().includes('site')) ? 'Site' : 'Manual';
                                    const formattedValue = formatDisplayValue(card.value);

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
                                                    {card.assignedUserId ? (card.assignedUserName || 'Atribuído') : 'Sem dono'}
                                                </span>
                                                <span className="h-6 px-3 rounded-full bg-[#f5f5f5] dark:bg-zinc-800 text-[#9f9f9f] text-[10px] font-bold flex items-center justify-center truncate max-w-[100px]">
                                                    {sourceTag}
                                                </span>
                                            </div>
                                            
                                            {/* Main Info */}
                                            <h3 className="font-season text-[26px] font-[420] text-black dark:text-white leading-none mb-1 break-words">
                                                {card.title}
                                            </h3>

                                            {/* Contextual Subtitle depending on Phase */}
                                            {activeTab === 'processual' ? (
                                                <div className="mb-6 flex flex-col gap-0.5">
                                                    <p className="text-[11px] font-semibold text-[#9f9f9f] truncate">
                                                        Titular: {card.contactName || card.subtitle || 'N/A'}
                                                    </p>
                                                    {card.inpiProcessNumber && (
                                                        <p className="text-[10px] font-mono text-zinc-500 truncate">
                                                            INPI: {card.inpiProcessNumber}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : activeTab === 'onboarding' ? (
                                                <div className="mb-6 flex flex-col gap-0.5">
                                                    <p className="text-[11px] font-semibold text-[#9f9f9f] truncate">
                                                        Cliente: {card.contactName || card.subtitle || 'Sem nome'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[11px] font-semibold text-[#9f9f9f] mb-6 truncate">
                                                    {card.contactName || card.subtitle || 'Sem nome'}
                                                </p>
                                            )}
                                            
                                            {/* Bottom Info */}
                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                                                <span className="text-[12px] font-medium text-black dark:text-white opacity-80">
                                                    {card.date}
                                                </span>
                                                
                                                {/* ONLY display commercial value in Commercial/Onboarding tabs if defined and non-zero */}
                                                {activeTab !== 'processual' && formattedValue && (
                                                    <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {formattedValue}
                                                    </span>
                                                )}
                                            </div>
                                            
                                        </div>
                                    )
                                })}
                                {col.cards.length === 0 && !isLoading && (
                                    <div className="text-center py-8 opacity-40 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
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
                onClose={() => {
                    setSelectedCard(null);
                    fetchDeals();
                }}
                card={selectedCard}
                onUpdate={fetchDeals}
            />
        </div>
    );
};

export default AsteryskoCRMView;
