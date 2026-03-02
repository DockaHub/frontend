import React, { useState, useEffect } from 'react';
import {
    MessageSquare, CheckCircle, Book, Filter,
    Loader2, ChevronRight, Users, FolderOpen, LayoutDashboard,
    Plus, Search, ArrowLeft, Edit2, Trash2, HelpCircle, X
} from 'lucide-react';
import { TicketSupport } from '../../../../types';
import { fauvesService } from '../../../../services/fauvesService';

interface SupportViewProps {
    activeSubView?: string;
}

const SupportView: React.FC<SupportViewProps> = ({ activeSubView = 'helpdesk' }) => {
    const [tickets, setTickets] = useState<TicketSupport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [itemsPerPage] = useState(20);
    const [currentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchTickets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fauvesService.getSupportTickets(currentPage, itemsPerPage);
            setTickets(data.items || []);
            setTotalItems(data.total || 0);
        } catch (err: any) {
            console.error('Failed to fetch tickets:', err);
            const status = err.response?.status;
            let msg = 'Erro ao carregar tickets de suporte.';
            if (status === 401) msg = '(401: Não autorizado - Token inválido)';
            else if (status === 404) msg = '(404: Não encontrado)';
            else if (status) msg = `(Erro ${status})`;

            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [currentPage]);

    // Sub-renders
    const renderContent = () => {
        switch (activeSubView) {
            case 'helpdesk-tickets':
                return <TicketsView tickets={tickets} isLoading={isLoading} error={error} />;
            case 'helpdesk-chat':
                return <LiveChatView />;
            case 'helpdesk-center':
                return <HelpCenterView />;
            default:
                return (
                    <SupportDashboard
                        totalTickets={totalItems}
                    />
                );
        }
    };

    return (
        <div className="animate-in fade-in duration-300 pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Helpdesk</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Central de gerenciamento de suporte.</p>
            </div>

            {renderContent()}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const SupportDashboard = ({ totalTickets }: any) => (
    <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { label: 'Total de Tickets', val: totalTickets.toString(), icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                { label: 'Resolvidos', val: '0', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                { label: 'Chats Ativos', val: '0', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
                { label: 'Artigos', val: '0', icon: Book, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
            ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm transition-all hover:border-docka-300 dark:hover:border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stat.val}</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">{stat.label}</p>
                </div>
            ))}
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { title: 'Gerenciar Tickets', desc: 'Visualize e responda todos os tickets de suporte', items: '0 pendentes', icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
                { title: 'Live Chat', desc: 'Atenda conversas em tempo real', items: '0 ativos', icon: Users, color: 'bg-purple-50 text-purple-600' },
                { title: 'Central de Ajuda', desc: 'Gerencie categorias e artigos', items: '0 artigos', icon: Book, color: 'bg-indigo-50 text-indigo-600' }
            ].map((card, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 hover:border-docka-300 transition-all group">
                    <div className="flex gap-4 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${card.color} dark:bg-zinc-800`}>
                            <card.icon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{card.title}</h3>
                            <p className="text-xs text-docka-500 dark:text-zinc-500 mt-0.5 line-clamp-1">{card.desc}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <span className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-docka-300 dark:bg-zinc-700"></span>
                            {card.items}
                        </span>
                        <ChevronRight size={14} className="text-docka-300 group-hover:text-docka-600 transition-colors" />
                    </div>
                </div>
            ))}
        </div>

        {/* Recent Activity Mini-List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Desempenho de Tickets</h3>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: 'Taxa de Resolução', val: '0%' },
                        { label: 'Tickets em Andamento', val: '0%' },
                        { label: 'Tickets Abertos', val: '0%' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-docka-500">{stat.label}</span>
                                <span className="font-bold text-docka-900 dark:text-zinc-100">{stat.val}</span>
                            </div>
                            <div className="w-full bg-docka-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '0%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Atividade Recente</h3>
                </div>
                <div className="p-4 space-y-3">
                    {[
                        { icon: MessageSquare, color: 'text-blue-600 bg-blue-50', text: '0 tickets aguardando resposta', sub: 'Verifique os tickets pendentes' },
                        { icon: Users, color: 'text-purple-600 bg-purple-50', text: '0 chats ativos agora', sub: 'Usuários aguardando atendimento' },
                        { icon: Book, color: 'text-indigo-600 bg-indigo-50', text: '0 visualizações hoje', sub: 'Artigos da central de ajuda' }
                    ].map((act, i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${act.color} dark:bg-zinc-800`}>
                                <act.icon size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-docka-900 dark:text-zinc-100 text-sm capitalize">{act.text}</h4>
                                <p className="text-xs text-docka-500 dark:text-zinc-500">{act.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const TicketsView = ({ tickets, isLoading, error }: any) => (
    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-docka-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-docka-900 dark:text-zinc-100">Tickets de Suporte</h2>
            <p className="text-xs text-docka-500 mt-1">Gerencie todos os tickets de suporte.</p>
        </div>

        {/* Filters & Search Header */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-docka-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" />
                <input
                    type="text"
                    placeholder="Buscar tickets..."
                    className="w-full pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                {['Todos', 'Abertos', 'Em Andamento', 'Fechados'].map((tab, i) => (
                    <button key={tab} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white shadow-sm' : 'bg-white dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 border border-docka-200 dark:border-zinc-700 hover:bg-docka-50 dark:hover:bg-zinc-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
            <div className="p-20 text-center">
                <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-sm text-docka-500">Buscando tickets de suporte...</p>
            </div>
        ) : error ? (
            <div className="p-12 text-center text-red-500 text-xs">
                {error}
            </div>
        ) : tickets.length === 0 ? (
            <div className="p-24 text-center">
                <div className="w-16 h-16 bg-docka-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-docka-400">
                    <MessageSquare size={32} />
                </div>
                <h3 className="font-bold text-docka-900 dark:text-zinc-100">Nenhum ticket encontrado</h3>
                <p className="text-xs text-docka-500 mt-1">Parece que não há solicitações de suporte no momento.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50/50 dark:bg-zinc-800/50 border-b border-docka-50 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">ID</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">Assunto</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">Usuário</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">Prioridade</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest text-right">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                        {tickets.map((t: any) => (
                            <tr key={t.id} className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group">
                                <td className="px-6 py-4 font-mono text-xs text-docka-400 group-hover:text-indigo-600 transition-colors">{t.id.substring(0, 8)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-docka-900 dark:text-zinc-100">{t.subject}</div>
                                </td>
                                <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{t.user}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase ${t.priority === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                                        {t.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-docka-100 dark:bg-zinc-800 ${t.status === 'open' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600'}`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-docka-400">{t.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const LiveChatView = () => (
    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex h-[600px] animate-in slide-in-from-bottom-4">
        {/* Chat Sidebar */}
        <div className="w-80 border-r border-docka-100 dark:border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-docka-50 dark:border-zinc-800">
                <h2 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                    <Users size={18} /> Live Chat
                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </h2>
                <div className="mt-4 relative">
                    <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" />
                    <input className="w-full pl-8 pr-3 py-1.5 bg-docka-50 dark:bg-zinc-800 rounded-lg text-xs border-none" placeholder="Buscar conversas..." />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
                <MessageSquare size={32} className="text-docka-200 mb-2" />
                <p className="text-[11px] text-docka-400">Nenhuma conversa encontrada</p>
            </div>
        </div>

        {/* Chat Area Placeholder */}
        <div className="flex-1 bg-docka-50/20 dark:bg-zinc-950 flex flex-col items-center justify-center">
            <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-docka-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-6 text-docka-300">
                    <Users size={32} />
                </div>
                <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100">Selecione uma conversa</h3>
                <p className="text-sm text-docka-500 mt-2">Escolha um chat da lista para começar a atender seus clientes em tempo real.</p>
            </div>
        </div>
    </div>
);

const HelpCenterView = () => {
    const [view, setView] = useState<'home' | 'categories' | 'articles'>('home');
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    if (view === 'categories') {
        return (
            <div className="animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => setView('home')}
                            className="flex items-center gap-2 text-docka-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors text-xs font-bold uppercase mb-2"
                        >
                            <ArrowLeft size={14} /> Voltar para Central
                        </button>
                        <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Categorias</h2>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie as categorias de artigos de ajuda.</p>
                    </div>
                    {!showCategoryForm && (
                        <button
                            onClick={() => setShowCategoryForm(true)}
                            className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white shadow-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> Nova Categoria
                        </button>
                    )}
                </div>

                {showCategoryForm && (
                    <div className="mb-8 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-top-4">
                        <div className="p-6 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100">Nova Categoria</h3>
                            <button onClick={() => setShowCategoryForm(false)} className="text-docka-400 hover:text-docka-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-docka-500 uppercase ml-1">Nome *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Primeiros Passos"
                                        className="w-full px-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-docka-500 uppercase ml-1">Slug *</label>
                                    <input
                                        type="text"
                                        placeholder="ex: primeiros-passos"
                                        className="w-full px-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-docka-500 uppercase ml-1">Descrição</label>
                                <textarea
                                    rows={3}
                                    placeholder="Breve descrição dos artigos desta categoria..."
                                    className="w-full px-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-docka-500 uppercase ml-1">Público-alvo *</label>
                                    <select className="w-full px-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100">
                                        <option>Clientes (Compradores)</option>
                                        <option>Organizadores</option>
                                        <option>Produtores</option>
                                        <option>Todos</option>
                                    </select>
                                    <p className="text-[10px] text-docka-400 mt-1">Define quem verá esta categoria na central de ajuda</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-docka-500 uppercase ml-1">Ícone (Lucide)</label>
                                    <div className="relative">
                                        <HelpCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" />
                                        <input
                                            type="text"
                                            placeholder="HelpCircle"
                                            defaultValue="HelpCircle"
                                            className="w-full pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 space-y-2">
                                <label className="text-xs font-bold text-docka-500 uppercase ml-1">Ordem</label>
                                <input
                                    type="number"
                                    defaultValue={0}
                                    className="w-full px-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-docka-50 dark:border-zinc-800">
                                <button className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
                                    <Plus size={16} /> Criar
                                </button>
                                <button
                                    onClick={() => setShowCategoryForm(false)}
                                    className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50/50 dark:bg-zinc-800/50 border-b border-docka-50 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Ordem</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Nome</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Slug</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Público</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Artigos</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-[0.2em] text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-docka-50 dark:border-zinc-800 hover:bg-docka-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-docka-900 dark:text-zinc-100 text-xs">0</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center text-indigo-600">
                                                <HelpCircle size={16} />
                                            </div>
                                            <span className="font-bold text-docka-900 dark:text-zinc-100">Exemplo de Categoria</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-docka-500">exemplo-categoria</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">Clientes</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-docka-500 font-medium">0 artigos</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-1.5 text-docka-400 hover:text-indigo-600 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="p-1.5 text-docka-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Empty State if needed */}
                                {/* <tr className="border-b border-docka-50 dark:border-zinc-800">
                                    <td colSpan={6} className="px-6 py-20 text-center text-docka-400 text-sm">
                                        Nenhuma categoria cadastrada
                                    </td>
                                </tr> */}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'articles') {
        return (
            <div className="animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => setView('home')}
                            className="flex items-center gap-2 text-docka-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors text-xs font-bold uppercase mb-2"
                        >
                            <ArrowLeft size={14} /> Voltar para Central
                        </button>
                        <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Artigos</h2>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie os artigos de ajuda.</p>
                    </div>
                    <button className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Novo Artigo
                    </button>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-4 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-docka-300" />
                        <input
                            type="text"
                            placeholder="Buscar artigos..."
                            className="w-full pl-11 pr-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                        />
                    </div>
                    <select className="px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500/20 outline-none">
                        <option>Todas as categorias</option>
                    </select>
                    <select className="px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-300 focus:ring-2 focus:ring-indigo-500/20 outline-none">
                        <option>Todos</option>
                        <option>Publicados</option>
                        <option>Rascunhos</option>
                    </select>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-24 text-center">
                    <Book size={48} className="text-docka-200 mx-auto mb-4" />
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100">Nenhum artigo encontrado</h3>
                    <p className="text-sm text-docka-400 mt-1">Publique o seu primeiro artigo para ajudar seus usuários.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Central de Ajuda</h2>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie a base de conhecimento do Fauves.</p>
                </div>
                <button
                    onClick={() => setView('articles')}
                    className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white shadow-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Novo Artigo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Artigos Publicados', val: '0', icon: Book, color: 'text-indigo-600 bg-indigo-50' },
                    { label: 'Categorias', val: '0', icon: FolderOpen, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Visualizações Totais', val: '0', icon: LayoutDashboard, color: 'text-emerald-600 bg-emerald-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm hover:border-docka-300 dark:hover:border-zinc-700 transition-all">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} dark:bg-zinc-800 mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <div className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stat.val}</div>
                        <div className="text-xs text-docka-500 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => setView('categories')}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-6 hover:border-docka-300 dark:hover:border-zinc-700 hover:shadow-md transition-all group text-left"
                >
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                        <FolderOpen size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg">Gerenciar Categorias</h3>
                        <p className="text-sm text-docka-500 mt-1">Organize seu conteúdo em grupos lógicos para facilitar a busca.</p>
                        <div className="flex items-center gap-2 text-docka-900 dark:text-zinc-100 text-xs font-bold mt-4 uppercase">
                            Acessar <ChevronRight size={14} />
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => setView('articles')}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-docka-200 dark:border-zinc-800 flex items-center gap-6 hover:border-docka-300 dark:hover:border-zinc-700 hover:shadow-md transition-all group text-left"
                >
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shrink-0">
                        <Book size={32} />
                    </div>
                    <div>
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg">Gerenciar Artigos</h3>
                        <p className="text-sm text-docka-500 mt-1">Crie, edite e publique artigos detalhados para sua base de conhecimento.</p>
                        <div className="flex items-center gap-2 text-docka-900 dark:text-zinc-100 text-xs font-bold mt-4 uppercase">
                            Acessar <ChevronRight size={14} />
                        </div>
                    </div>
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-10">
                <div className="px-8 py-5 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100">Artigos Mais Visualizados</h3>
                    <div className="text-[10px] font-bold text-docka-400 uppercase tracking-widest bg-docka-50 dark:bg-zinc-800 px-3 py-1 rounded-full">Automático</div>
                </div>
                <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-docka-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-docka-200">
                        <Book size={40} />
                    </div>
                    <p className="text-sm text-docka-400 font-medium">Os dados aparecerão aqui quando você tiver artigos publicados.</p>
                </div>
            </div>
        </div>
    );
};

export default SupportView;
