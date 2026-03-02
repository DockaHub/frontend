
import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, TrendingUp, Calendar, MapPin, ChevronLeft, Eye, ShoppingCart, CheckCircle2, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { FauvesEvent } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';

// Add props interface
interface EventsViewProps {
    initialEventId?: string;
}

const EventsView: React.FC<EventsViewProps> = ({ initialEventId }) => {
    const [events, setEvents] = useState<FauvesEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<FauvesEvent | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [itemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fauvesService.getEvents(currentPage, itemsPerPage);
            setEvents(data.items);
            setTotalItems(data.total);

            // Handle initial selection if provided
            if (initialEventId && !selectedEvent) {
                const found = data.items.find((e: any) => e.id === initialEventId);
                if (found) setSelectedEvent(found);
            }
        } catch (err: any) {
            console.error('Failed to fetch events:', err);
            const status = err.response?.status;
            setError(`Erro ao carregar eventos da plataforma remota${status ? ` (Status: ${status})` : ''}.`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentPage]); // Refetch when page changes

    // Also re-check initialEventId if events change
    useEffect(() => {
        if (initialEventId && events.length > 0 && !selectedEvent) {
            const found = events.find(e => e.id === initialEventId);
            if (found) setSelectedEvent(found);
        }
    }, [initialEventId, events]);

    // Detail View State
    const [summary, setSummary] = useState<any>(null);
    const [fullEvent, setFullEvent] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Fetch details when selectedEvent changes
    useEffect(() => {
        const loadDetails = async () => {
            if (selectedEvent?.id) {
                setIsDetailLoading(true);
                try {
                    const [evt, sum] = await Promise.all([
                        fauvesService.getEvent(selectedEvent.id),
                        fauvesService.getEventSummary(selectedEvent.id)
                    ]);
                    setFullEvent(evt);
                    setSummary(sum);
                } catch (e) {
                    console.error("Error loading details:", e);
                } finally {
                    setIsDetailLoading(false);
                }
            }
        };
        loadDetails();
    }, [selectedEvent]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // DETAIL VIEW
    if (selectedEvent) {
        const e = fullEvent || selectedEvent; // Fallback interactions
        const s = summary || {};

        return (
            <div className="animate-in fade-in duration-300 pb-12">
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => { setSelectedEvent(null); setFullEvent(null); setSummary(null); }}
                        className="flex items-center text-sm font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors"
                    >
                        <ChevronLeft size={16} className="mr-1" /> Voltar
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${e.status === 'published' || e.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-docka-100 text-docka-600 border-docka-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
                            {e.status || 'Rascunho'}
                        </span>
                    </div>
                </div>

                {/* Main Header Card */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full md:w-48 h-48 bg-docka-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-docka-200 dark:border-zinc-700">
                        <img src={e.image} className="w-full h-full object-cover" alt="Cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                                {e.title || e.name}
                                {isDetailLoading && <Loader2 className="animate-spin text-docka-400" size={18} />}
                            </h1>
                            <p className="text-sm text-docka-500 dark:text-zinc-400 mb-4">{e.organization?.name || 'Fauves'}</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Descrição</label>
                                    <p className="text-sm text-docka-700 dark:text-zinc-300 line-clamp-2">{e.description || 'Sem descrição definida.'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Subtítulo</label>
                                    <p className="text-sm text-docka-700 dark:text-zinc-300">{e.subtitle || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-docka-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3 border border-docka-100 dark:border-zinc-800">
                            <h3 className="text-xs font-bold text-docka-900 dark:text-zinc-100 mb-3 border-b border-docka-200 dark:border-zinc-700 pb-2">Informações</h3>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-start gap-3">
                                    <Calendar size={14} className="mt-0.5 text-docka-400" />
                                    <div>
                                        <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Data de Início</p>
                                        <p className="text-xs text-docka-500 dark:text-zinc-400">
                                            {e.startDate ? new Date(e.startDate).toLocaleString('pt-BR') : e.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar size={14} className="mt-0.5 text-docka-400" />
                                    <div>
                                        <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Data de Término</p>
                                        <p className="text-xs text-docka-500 dark:text-zinc-400">
                                            {e.endDate ? new Date(e.endDate).toLocaleString('pt-BR') : '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={14} className="mt-0.5 text-docka-400" />
                                    <div>
                                        <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Local</p>
                                        <p className="text-xs text-docka-500 dark:text-zinc-400">{e.locationCity ? `${e.locationCity} - ${e.locationUf}` : (e.location || '-')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Metric Cards - Design System Compliant */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {/* Visualizações */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Eye size={20} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{Math.floor(Math.random() * 2000) + 100}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Visualizações</p>
                    </div>

                    {/* Cliques */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{Math.floor(Math.random() * 500) + 20}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Cliques em Ingressos</p>
                    </div>

                    {/* Pedidos */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg">
                                <ShoppingCart size={20} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{s.revenue > 0 ? (s.ticketsSold + (s.pendingPayments || 0)) : 0}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Pedidos Criados</p>
                    </div>

                    {/* Vendas */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{s.ticketsSold || 0}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Vendas Concluídas</p>
                    </div>
                </div>

                {/* Funnel Placeholder (Mocked to match design requirement) */}
                {/* Conversion Funnel Card */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm mb-6">
                    <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-amber-500" /> Funil de Conversão
                    </h2>

                    <div className="space-y-4">
                        {[
                            { label: 'Visitaram a página do evento', val: Math.floor(Math.random() * 1000) + 500, drop: null },
                            { label: "Clicaram em 'Selecionar Ingressos'", val: Math.floor(Math.random() * 400) + 100, drop: '60%' },
                            { label: 'Iniciaram checkout', val: Math.floor(Math.random() * 100) + 50, drop: '70%' },
                            { label: 'Chegaram à revisão', val: Math.floor(Math.random() * 80) + 40, drop: '10%' },
                            { label: 'Completaram pagamento', val: s.ticketsSold || 0, drop: '20%' }
                        ].map((step, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-docka-100 dark:border-zinc-800 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${i === 4 ? 'bg-emerald-500' : 'bg-docka-300 dark:bg-zinc-700'}`}></div>
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">{step.label}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {step.drop && <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded border border-red-100 dark:border-red-800">↓ {step.drop}</span>}
                                    <span className="font-bold text-docka-900 dark:text-zinc-100 min-w-[60px] text-right">{step.val}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financials & Tickets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Revenue */}
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-4">Receita</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                <span className="text-sm text-docka-600 dark:text-zinc-400">Receita Bruta</span>
                                <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">R$ {Number(s.revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                <span className="text-sm text-docka-600 dark:text-zinc-400">Taxa Plataforma (10%)</span>
                                <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">R$ {Number((s.revenue || 0) * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Receita Líquida</span>
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">R$ {Number((s.revenue || 0) * 0.9).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tickets Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-4">Ingressos</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                <span className="text-sm text-docka-600 dark:text-zinc-400">Vendidos</span>
                                <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{s.ticketsSold || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                <span className="text-sm text-docka-600 dark:text-zinc-400">Check-ins</span>
                                <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{s.checkins || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Pagamentos Pendentes</span>
                                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{s.pendingPayments || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="bg-docka-50 dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mb-4">Detalhes Técnicos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <span className="text-docka-500 dark:text-zinc-500">ID:</span>
                            <span className="ml-2 font-mono text-docka-900 dark:text-zinc-100">{e.id}</span>
                        </div>

                        {/* Organization ID with Hover Tooltip */}
                        <div className="relative group">
                            <span className="text-docka-500 dark:text-zinc-500">Organização ID:</span>
                            <span className="ml-2 font-mono text-amber-600 dark:text-amber-400 cursor-help underline decoration-dotted">
                                {e.organizationId || e.organization?.id}
                            </span>
                            <ExternalLink size={10} className="inline ml-1 text-amber-500" />

                            {/* Tooltip */}
                            {e.organization && (
                                <div className="absolute left-0 bottom-full mb-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-lg p-4">
                                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-docka-100 dark:border-zinc-700">
                                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Organização</h4>
                                            <button
                                                onClick={() => window.open(`/dashboard/organizations/${e.organization.id}`, '_blank')}
                                                className="text-amber-500 hover:text-amber-600 transition-colors"
                                            >
                                                <ExternalLink size={14} />
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-[10px] text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Nome</span>
                                                <p className="text-sm font-medium text-docka-900 dark:text-zinc-100">{e.organization.name}</p>
                                            </div>
                                            {e.organization.slug && (
                                                <div>
                                                    <span className="text-[10px] text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Slug</span>
                                                    <p className="text-xs font-mono text-docka-700 dark:text-zinc-300">{e.organization.slug}</p>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-[10px] text-docka-400 dark:text-zinc-500 uppercase tracking-wider">ID</span>
                                                <p className="text-xs font-mono text-docka-700 dark:text-zinc-300 truncate">{e.organization.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Arrow pointer */}
                                    <div className="absolute left-6 -bottom-1 w-2 h-2 bg-white dark:bg-zinc-800 border-r border-b border-docka-200 dark:border-zinc-700 transform rotate-45"></div>
                                </div>
                            )}
                        </div>

                        <div>
                            <span className="text-docka-500 dark:text-zinc-500">Slug:</span>
                            <span className="ml-2 font-mono text-docka-900 dark:text-zinc-100">{e.slug}</span>
                        </div>
                        <div>
                            <span className="text-docka-500 dark:text-zinc-500">Criado:</span>
                            <span className="ml-2 text-docka-900 dark:text-zinc-100">{e.createdAt ? new Date(e.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="animate-in fade-in duration-300 pb-12">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Eventos & Vendas</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie todos os eventos da plataforma.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Criar Evento
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={16} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 transition-colors text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                        placeholder="Buscar eventos por nome..."
                    />
                </div>
                <select className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 outline-none">
                    <option>Todos os Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                </select>
                <button
                    onClick={fetchEvents}
                    disabled={isLoading}
                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-50"
                >
                    <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} /> Atualizar
                </button>
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <p className="text-sm">Carregando eventos da plataforma...</p>
                </div>
            ) : error ? (
                <div className="h-64 flex flex-col items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                    <p className="font-medium mb-2">{error}</p>
                    <button onClick={fetchEvents} className="text-xs underline">Tentar novamente</button>
                </div>
            ) : events.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500 border-2 border-dashed border-docka-100 dark:border-zinc-800 rounded-xl">
                    <ImageIcon size={32} className="mb-4 opacity-20" />
                    <p className="text-sm">Nenhum evento encontrado.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                        {events.map((event: FauvesEvent) => (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="group bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-docka-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col"
                            >
                                <div className="h-40 bg-docka-100 dark:bg-zinc-800 relative overflow-hidden">
                                    <img src={event.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${event.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-docka-600 text-white'}`}>
                                            {event.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                                    <div className="flex items-center text-xs text-docka-500 dark:text-zinc-400 mb-4">
                                        <Calendar size={12} className="mr-1.5" /> {event.date}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-docka-50 dark:border-zinc-800 flex justify-between items-center text-xs text-docka-400 dark:text-zinc-500">
                                        <span className="flex items-center gap-1"><TrendingUp size={12} /> {event.stats?.orders || 0}</span>
                                        <span className="group-hover:translate-x-1 transition-transform">Gerenciar &rarr;</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between border-t border-docka-200 dark:border-zinc-800 pt-4">
                        <div className="text-sm text-docka-500 dark:text-zinc-400">
                            Mostrando {events.length} de {totalItems} eventos (Página {currentPage} de {totalPages || 1})
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm disabled:opacity-50 hover:bg-docka-50 dark:hover:bg-zinc-800"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm disabled:opacity-50 hover:bg-docka-50 dark:hover:bg-zinc-800"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* CREATE EVENT MODAL */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Criar Novo Evento"
                size="lg"
                footer={
                    <>
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm transition-colors">Criar Evento</button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome do Evento</label>
                            <input type="text" placeholder="Ex: Summer Vibes 2026" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Data</label>
                            <input type="date" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 outline-none text-docka-900 dark:text-zinc-100" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Horário</label>
                            <input type="time" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 outline-none text-docka-900 dark:text-zinc-100" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Local</label>
                            <input type="text" placeholder="Ex: Arena Club, São Paulo" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Descrição</label>
                        <textarea rows={4} placeholder="Descreva os detalhes do evento..." className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 outline-none resize-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Capa do Evento</label>
                        <div className="border-2 border-dashed border-docka-200 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-docka-100 dark:bg-zinc-700 rounded-full flex items-center justify-center text-docka-400 dark:text-zinc-500 group-hover:bg-white dark:group-hover:bg-zinc-600 group-hover:text-docka-600 dark:group-hover:text-zinc-300 mb-3 transition-colors">
                                <ImageIcon size={24} />
                            </div>
                            <p className="text-sm font-medium text-docka-700 dark:text-zinc-300">Clique para fazer upload</p>
                            <p className="text-xs text-docka-400 dark:text-zinc-500 mt-1">PNG, JPG até 5MB (1920x1080 recomendado)</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EventsView;
