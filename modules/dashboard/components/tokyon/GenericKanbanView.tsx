import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Plus, 
    CheckCircle2, FileText, DollarSign, Calendar, 
    Download, Info, ListTodo, AlertCircle, 
    Zap, ExternalLink, Eye, Clock, Target, BarChart
} from 'lucide-react';
import KanbanBoard from '../kanban/KanbanBoard';
import Modal from '../../../../components/common/Modal';
import { TOKYON_BOARDS, BoardData, EnrichedKanbanCardData } from './mockData';

interface GenericKanbanViewProps {
    initialBoardId?: string;
    onViewChange?: (view: string) => void;
    onStrategicJump?: (client: any) => void;
}

const GenericKanbanView: React.FC<GenericKanbanViewProps> = ({ initialBoardId = 'clients', onViewChange, onStrategicJump }) => {
    const [boards, setBoards] = useState<BoardData[]>(TOKYON_BOARDS);
    const [activeBoardId, setActiveBoardId] = useState(initialBoardId);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [selectedCard, setSelectedCard] = useState<EnrichedKanbanCardData | null>(null);
    const [activeModalTab, setActiveModalTab] = useState<'overview' | 'tasks' | 'finance' | 'contract'>('overview');

    const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

    useEffect(() => {
        setActiveBoardId(initialBoardId);
    }, [initialBoardId]);

    const updateCard = (updatedCard: EnrichedKanbanCardData) => {
        setBoards(prev => prev.map(board => ({
            ...board,
            columns: board.columns.map(col => ({
                ...col,
                cards: col.cards.map(card => 
                    card.id === updatedCard.id ? { ...card, ...updatedCard } : card
                )
            }))
        })));
        setSelectedCard(prev => prev?.id === updatedCard.id ? { ...prev, ...updatedCard } : prev);
    };

    const handleDragEnd = (result: any) => {
        const { destination, source } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;

            const newColumns = [...board.columns];
            const sourceCol = newColumns.find(c => c.id === source.droppableId);
            const destCol = newColumns.find(c => c.id === destination.droppableId);

            if (!sourceCol || !destCol) return board;

            const [movedCard] = sourceCol.cards.splice(source.index, 1);
            destCol.cards.splice(destination.index, 0, movedCard);

            return { ...board, columns: newColumns };
        }));
    };

    const toggleTask = (taskId: string) => {
        if (!selectedCard) return;
        const updatedTasks = selectedCard.tasks?.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        ) || [];
        updateCard({ ...selectedCard, tasks: updatedTasks });
    };

    const addTask = (label: string) => {
        if (!selectedCard || !label) return;
        const newTask = { id: `task-${Date.now()}`, label, completed: false };
        updateCard({ ...selectedCard, tasks: [...(selectedCard.tasks || []), newTask] });
    };

    const moveCardToColumn = (destColumnId: string) => {
        if (!selectedCard) return;
        
        setBoards(prev => prev.map(board => {
            if (board.id !== activeBoardId) return board;
            
            const newColumns = board.columns.map(col => {
                // Remove from current col
                const filteredCards = col.cards.filter(c => c.id !== selectedCard.id);
                // Add to dest col if it matches
                if (col.id === destColumnId) {
                    return { ...col, cards: [...filteredCards, selectedCard] };
                }
                return { ...col, cards: filteredCards };
            });

            return { ...board, columns: newColumns };
        }));
    };

    const handleCardClick = (card: any) => {
        setSelectedCard(card as EnrichedKanbanCardData);
        setActiveModalTab('overview');
    };

    const handleJumpToStrategicView = () => {
        if (onStrategicJump) {
            onStrategicJump(selectedCard);
            setSelectedCard(null);
        } else if (onViewChange) {
            setSelectedCard(null);
            onViewChange('orange-program');
        }
    };

    return (
        <div className="h-full flex flex-col bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-docka-200 dark:border-zinc-800 px-8 py-5 shrink-0 transition-colors">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{activeBoard.title}</h1>
                                <span className="text-xs font-medium bg-docka-100 dark:bg-zinc-800 text-docka-500 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-docka-200 dark:border-zinc-700">Beta</span>
                            </div>
                            <p className="text-docka-500 dark:text-zinc-400 text-sm">{activeBoard.description}</p>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setIsAddingCard(true)}
                                className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Plus size={16} /> Novo Item
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex gap-4 border-b border-docka-100 dark:border-zinc-800 w-full mb-[-1px]">
                             <button className="pb-3 text-sm font-medium border-b-2 border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100 px-1">
                                Kanban
                             </button>
                             <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-docka-400 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300 px-1">
                                Lista
                             </button>
                             <button className="pb-3 text-sm font-medium border-b-2 border-transparent text-docka-400 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300 px-1 text-zinc-300 dark:text-zinc-700 cursor-not-allowed">
                                Calendário
                             </button>
                        </div>

                        <div className="flex gap-3 mb-2 ml-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                                <input className="pl-8 pr-3 py-1.5 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400 dark:focus:border-zinc-500 transition-colors w-40 text-docka-900 dark:text-zinc-100" placeholder="Buscar..." />
                            </div>
                            <button className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-docka-500 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700"><Filter size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
                <div className="max-w-6xl mx-auto w-full h-full overflow-hidden">
                    <KanbanBoard
                        columns={activeBoard.columns}
                        onCardClick={handleCardClick}
                        onDragEnd={handleDragEnd}
                    />
                </div>
            </div>

            {/* CARD DETAILS MODAL */}
            {selectedCard && (
                <Modal
                    isOpen={!!selectedCard}
                    onClose={() => setSelectedCard(null)}
                    title={selectedCard.title}
                    size="xl"
                    footer={
                        <div className="flex justify-between w-full items-center">
                            <div className="flex gap-3 items-center">
                                <div className="relative group/move">
                                    <button className="px-4 py-2 text-xs font-bold bg-docka-100 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 rounded-lg hover:bg-docka-200 transition-colors flex items-center gap-2">
                                        Mover Estágio <ListTodo size={12} />
                                    </button>
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-xl p-1 opacity-0 pointer-events-none group-hover/move:opacity-100 group-hover/move:pointer-events-auto transition-all z-[100]">
                                        {activeBoard.columns.map(col => (
                                            <button 
                                                key={col.id}
                                                onClick={() => moveCardToColumn(col.id)}
                                                className="w-full text-left px-3 py-2 text-xs font-bold text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <div className={`w-2 h-2 rounded-full ${col.color || 'bg-zinc-400'}`} />
                                                {col.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Excluir</button>
                            </div>
                            <button onClick={() => setSelectedCard(null)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm">Salvar e Fechar</button>
                        </div>
                    }
                >
                    <div className="flex flex-col gap-6">
                        {/* Modal Header/Tabs */}
                        <div className="flex gap-4 border-b border-docka-100 dark:border-zinc-800">
                            {[
                                { id: 'overview', label: 'Visão Geral', icon: Info },
                                { id: 'tasks', label: 'Tarefas', icon: ListTodo },
                                { id: 'finance', label: 'Financeiro', icon: DollarSign },
                                { id: 'contract', label: 'Contrato', icon: FileText }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveModalTab(tab.id as any)}
                                    className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                                        activeModalTab === tab.id 
                                        ? 'border-orange-500 text-orange-600' 
                                        : 'border-transparent text-docka-400 dark:text-zinc-500 hover:text-docka-700'
                                    }`}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Banner de Integração Estratégica (Orange Program) */}
                        {selectedCard.isOrangeProgram && (
                            <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-0.5 rounded-2xl shadow-lg animate-in slide-in-from-top-2">
                                <div className="bg-zinc-900 rounded-[14px] p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                                            <Zap className="text-orange-500" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Este é um cliente do Orange Program™</h4>
                                            <p className="text-zinc-400 text-xs mt-0.5">Gestão estratégica de alto nível habilitada para este serviço.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleJumpToStrategicView}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-900/40"
                                    >
                                        <ExternalLink size={14} /> Acessar Visão Estratégica
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Modal Body */}
                        <div className="min-h-[300px] animate-in fade-in duration-300">
                            
                            {/* OVERVIEW TAB */}
                            {activeModalTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start gap-8">
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-2">Título do Cliente / Projeto</h4>
                                            <input 
                                                value={selectedCard.title} 
                                                onChange={(e) => updateCard({ ...selectedCard, title: e.target.value })}
                                                className="text-lg font-bold text-docka-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-docka-200 focus:border-orange-500 outline-none w-full transition-all"
                                            />
                                            <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-2 mt-4">Descrição do Serviço</h4>
                                            <textarea 
                                                value={selectedCard.subtitle || ''} 
                                                onChange={(e) => updateCard({ ...selectedCard, subtitle: e.target.value })}
                                                className="text-sm text-docka-800 dark:text-zinc-200 leading-relaxed font-medium bg-transparent border border-transparent hover:border-docka-200 focus:border-orange-500 rounded-lg p-2 outline-none w-full min-h-[80px] transition-all resize-none"
                                            />
                                        </div>
                                        <div className="text-right shrink-0">
                                            <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-3">Membro Responsável</h4>
                                            <div className="flex items-center gap-2 justify-end bg-docka-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-docka-100 dark:border-zinc-800">
                                                <img src={selectedCard.members?.[0]?.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-docka-900 dark:text-zinc-100 leading-none">{selectedCard.members?.[0]?.name || 'Sem responsável'}</p>
                                                    <p className="text-[10px] text-docka-400 font-medium">Design Lead</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced Metrics (Orchestra) */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Probability for Sales */}
                                        {selectedCard.probability !== undefined && (
                                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-xl group relative">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2 text-orange-600">
                                                        <Target size={14} />
                                                        <span className="text-[10px] font-bold uppercase">Probabilidade de Fechamento</span>
                                                    </div>
                                                    <span className="text-xs font-black text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded">{selectedCard.probability}%</span>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0" max="100" step="5"
                                                    value={selectedCard.probability}
                                                    onChange={(e) => updateCard({ ...selectedCard, probability: parseInt(e.target.value) })}
                                                    className="w-full h-1.5 bg-orange-200 dark:bg-orange-900/40 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                                />
                                            </div>
                                        )}

                                        {/* Health Status for Projects */}
                                        {selectedCard.health && (
                                            <div className={`p-4 rounded-xl border transition-all ${
                                                selectedCard.health === 'on-track' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20' : 
                                                selectedCard.health === 'at-risk' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20' : 
                                                'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                                            }`}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className={`flex items-center gap-2 ${
                                                        selectedCard.health === 'on-track' ? 'text-emerald-600' : 
                                                        selectedCard.health === 'at-risk' ? 'text-orange-600' : 
                                                        'text-red-600'
                                                    }`}>
                                                        <Zap size={14} />
                                                        <span className="text-[10px] font-bold uppercase">Saúde do Projeto</span>
                                                    </div>
                                                    <select 
                                                        value={selectedCard.health}
                                                        onChange={(e) => updateCard({ ...selectedCard, health: e.target.value as any })}
                                                        className="text-[10px] font-bold bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                                                    >
                                                        <option value="on-track">No Prazo</option>
                                                        <option value="at-risk">Em Atenção</option>
                                                        <option value="delayed">Atrasado</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                                                        selectedCard.health === 'on-track' ? 'bg-emerald-500' : 
                                                        selectedCard.health === 'at-risk' ? 'bg-orange-500' : 
                                                        'bg-red-500'
                                                    }`} />
                                                    <span className={`text-lg font-bold ${
                                                        selectedCard.health === 'on-track' ? 'text-emerald-700 dark:text-emerald-400' : 
                                                        selectedCard.health === 'at-risk' ? 'text-orange-700 dark:text-orange-400' : 
                                                        'text-red-700 dark:text-red-400'
                                                    }`}>
                                                        {selectedCard.health === 'on-track' ? 'Tudo em Ordem' : selectedCard.health === 'at-risk' ? 'Requer Atenção' : 'Ações Urgentes'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hours Tracking for Projects */}
                                        {selectedCard.estimatedHours && (
                                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-xl">
                                                <div className="flex items-center justify-between text-indigo-600 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        <span className="text-[10px] font-bold uppercase">Esforço Operacional</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => updateCard({ ...selectedCard, loggedHours: (selectedCard.loggedHours || 0) + 1 })}
                                                        className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full hover:scale-105 transition-transform"
                                                    >
                                                        +1h
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <input 
                                                            type="number"
                                                            value={selectedCard.loggedHours || 0}
                                                            onChange={(e) => updateCard({ ...selectedCard, loggedHours: parseInt(e.target.value) || 0 })}
                                                            className="text-xl font-bold text-indigo-700 dark:text-indigo-400 bg-transparent border-b border-transparent hover:border-indigo-300 w-12 outline-none"
                                                        />
                                                        <span className="text-[10px] text-indigo-400 dark:text-indigo-600 ml-1">/ {selectedCard.estimatedHours}h total</span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-indigo-400 mb-1">
                                                        {Math.round(((selectedCard.loggedHours || 0) / selectedCard.estimatedHours) * 100)}% Consumido
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ROI Estimation */}
                                        {selectedCard.estimatedROI && (
                                            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 rounded-xl">
                                                <div className="flex items-center gap-2 text-purple-600 mb-2">
                                                    <BarChart size={14} />
                                                    <span className="text-[10px] font-bold uppercase">Exp. ROI</span>
                                                </div>
                                                <input 
                                                    value={selectedCard.estimatedROI}
                                                    onChange={(e) => updateCard({ ...selectedCard, estimatedROI: e.target.value })}
                                                    className="text-xl font-bold text-purple-700 dark:text-purple-400 bg-transparent border-b border-transparent hover:border-purple-300 w-full outline-none"
                                                    placeholder="Ex: 4.5x"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 border-t border-docka-100 dark:border-zinc-800 pt-6">
                                        <div className="bg-docka-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-docka-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2 text-docka-400 dark:text-zinc-500 mb-2">
                                                <Calendar size={14} />
                                                <span className="text-[10px] font-bold uppercase">Data de Entrada</span>
                                            </div>
                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{selectedCard.date}</p>
                                        </div>
                                        <div className="bg-docka-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-docka-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2 text-docka-400 dark:text-zinc-500 mb-2">
                                                <CheckCircle2 size={14} />
                                                <span className="text-[10px] font-bold uppercase">Entregas</span>
                                            </div>
                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">
                                                {selectedCard.tasks ? `${selectedCard.tasks.filter(t => t.completed).length}/${selectedCard.tasks.length}` : '0/0'}
                                            </p>
                                        </div>
                                        <div className="bg-docka-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-docka-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2 text-docka-400 dark:text-zinc-500 mb-2">
                                                <DollarSign size={14} />
                                                <span className="text-[10px] font-bold uppercase">Status Pagamento</span>
                                            </div>
                                            <select 
                                                value={selectedCard.finance?.status}
                                                onChange={(e) => updateCard({ ...selectedCard, finance: { ...selectedCard.finance!, status: e.target.value as any } })}
                                                className={`text-sm font-bold bg-transparent border-none outline-none cursor-pointer ${selectedCard.finance?.status === 'paid' ? 'text-emerald-600' : 'text-orange-600'}`}
                                            >
                                                <option value="paid" className="text-emerald-600">Em dia</option>
                                                <option value="pending" className="text-orange-600">Aguardando</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TASKS TAB */}
                            {activeModalTab === 'tasks' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase">Checklist de Entregas</h4>
                                        <button className="text-[10px] font-bold text-orange-600 hover:underline flex items-center gap-1"><Plus size={12} /> Adicionar Tarefa</button>
                                    </div>
                                    {selectedCard.tasks && selectedCard.tasks.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedCard.tasks.map(task => (
                                                <div key={task.id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-lg group hover:border-orange-200 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={task.completed} 
                                                        onChange={() => toggleTask(task.id)} 
                                                        className="w-4 h-4 rounded border-docka-300 text-orange-600 focus:ring-orange-500 cursor-pointer" 
                                                    />
                                                    <span className={`text-sm flex-1 ${task.completed ? 'line-through text-docka-400' : 'text-docka-800 dark:text-zinc-200'}`}>{task.label}</span>
                                                    {task.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                </div>
                                            ))}
                                            <div className="pt-2">
                                                <button 
                                                    onClick={() => addTask(prompt('Nova tarefa:') || '')}
                                                    className="w-full py-3 border border-dashed border-docka-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-docka-400 hover:text-orange-600 hover:border-orange-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={14} /> Adicionar Nova Tarefa
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-docka-50 dark:bg-zinc-800/20 border border-dashed border-docka-200 dark:border-zinc-800 rounded-xl">
                                            <ListTodo className="mx-auto text-docka-200 dark:text-zinc-700 mb-2" size={32} />
                                            <p className="text-xs text-docka-400">Nenhuma tarefa cadastrada para este serviço.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FINANCE TAB */}
                            {activeModalTab === 'finance' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                            <p className="text-xs font-bold text-zinc-400 uppercase mb-1 tracking-wider text-[10px]">Valor Total</p>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{selectedCard.finance?.totalValue || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                            <p className="text-xs font-bold text-zinc-400 uppercase mb-1 tracking-wider text-[10px]">Próximo Vencimento</p>
                                            <p className="text-2xl font-bold text-orange-600">{selectedCard.finance?.nextDue || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-4">Histórico de Pagamentos</h4>
                                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-docka-50 dark:bg-zinc-800/50">
                                                    <tr>
                                                        <th className="px-4 py-3 font-bold text-docka-500">Data</th>
                                                        <th className="px-4 py-3 font-bold text-docka-500">Valor</th>
                                                        <th className="px-4 py-3 font-bold text-docka-500">Status</th>
                                                        <th className="px-4 py-3 text-right font-bold text-docka-500">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                                    {selectedCard.finance?.history.map(item => (
                                                        <tr key={item.id}>
                                                            <td className="px-4 py-3 font-medium">{item.date}</td>
                                                            <td className="px-4 py-3 font-bold">{item.amount}</td>
                                                            <td className="px-4 py-3">
                                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">Pago</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button className="text-orange-600 hover:scale-110 transition-transform"><Download size={14} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {!selectedCard.finance?.history.length && (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-8 text-center text-docka-400">Nenhum pagamento registrado.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CONTRACT TAB */}
                            {activeModalTab === 'contract' && (
                                <div className="space-y-6">
                                    {selectedCard.contract ? (
                                        <div className="flex flex-col gap-6">
                                            <div className="bg-docka-950 text-white p-6 rounded-2xl flex items-center justify-between shadow-xl relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Contrato Ativo</h4>
                                                    <h3 className="text-xl font-bold mb-4">{selectedCard.contract.fileName}</h3>
                                                    <div className="flex gap-4">
                                                        <button className="bg-white text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-100 flex items-center gap-2">
                                                            <Eye size={14} /> Visualizar
                                                        </button>
                                                        <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 flex items-center gap-2">
                                                            <Download size={14} /> Baixar PDF
                                                        </button>
                                                    </div>
                                                </div>
                                                <FileText size={80} className="opacity-10 -rotate-12" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 border border-docka-100 dark:border-zinc-800 rounded-xl">
                                                    <span className="text-[10px] font-bold text-docka-400 uppercase block mb-1">Início da Vigência</span>
                                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{selectedCard.contract.startDate}</p>
                                                </div>
                                                <div className="p-4 border border-docka-100 dark:border-zinc-800 rounded-xl">
                                                    <span className="text-[10px] font-bold text-docka-400 uppercase block mb-1">Término/Renovação</span>
                                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{selectedCard.contract.endDate}</p>
                                                </div>
                                            </div>

                                            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-4 rounded-xl flex gap-3 items-center">
                                                <AlertCircle className="text-orange-600" size={20} />
                                                <p className="text-xs text-orange-900 dark:text-orange-200 font-medium">Este contrato possui renovação automática em {selectedCard.contract.endDate}.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-docka-50 dark:bg-zinc-800/20 border border-dashed border-docka-200 dark:border-zinc-800 rounded-xl">
                                            <FileText className="mx-auto text-docka-200 dark:text-zinc-700 mb-3" size={48} />
                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-1">Nenhum contrato anexado</p>
                                            <p className="text-xs text-docka-400 mb-6">Importe o arquivo assinado para centralizar a gestão.</p>
                                            <button className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-xs font-bold hover:bg-docka-800 transition-all">Anexar Contrato</button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </Modal>
            )}

            {/* ADD CARD MODAL (Basic) */}
            <Modal
                isOpen={isAddingCard}
                onClose={() => setIsAddingCard(false)}
                title={`Adicionar ao ${activeBoard.title}`}
                footer={
                    <>
                        <button onClick={() => setIsAddingCard(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button onClick={() => setIsAddingCard(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm">Criar</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Título</label>
                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="Digite o título..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Descrição / Subtítulo</label>
                        <textarea className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100 min-h-[100px]" placeholder="Mais detalhes..." />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GenericKanbanView;
