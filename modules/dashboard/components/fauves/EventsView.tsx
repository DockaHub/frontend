import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Plus, TrendingUp, Calendar, MapPin, ChevronLeft, Eye, ShoppingCart, CheckCircle2, Loader2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { FauvesEvent } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';
import EventImporter from './EventImporter';

// Add props interface
interface EventsViewProps {
    initialEventId?: string;
}

const EventsView: React.FC<EventsViewProps> = ({ initialEventId }) => {
    const [events, setEvents] = useState<FauvesEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<FauvesEvent | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    
    const [itemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchEvents = async () => {
        setIsLoading(true);
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
            // setError(`Erro ao carregar eventos da plataforma remota${status ? ` (Status: ${status})` : ''}.`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentPage]);

    // Fetch categories and organizations for the forms
    useEffect(() => {
        const loadFormData = async () => {
            try {
                const [cats, orgs] = await Promise.all([
                    fauvesService.getManagementData('categories', 1, 500),
                    fauvesService.getOrganizations(1, 500)
                ]);
                setCategories(cats.items || []);
                setOrganizations(orgs.items || []);
            } catch (err) {
                console.error("Failed to load categories/orgs:", err);
            }
        };
        loadFormData();
    }, []);

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
    const [metrics, setMetrics] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Fetch details when selectedEvent changes
    useEffect(() => {
        const loadDetails = async () => {
            if (selectedEvent?.id) {
                setIsDetailLoading(true);
                try {
                    const [evt, sum, met] = await Promise.all([
                        fauvesService.getEvent(selectedEvent.id),
                        fauvesService.getEventSummary(selectedEvent.id),
                        fauvesService.getEventMetrics(selectedEvent.id)
                    ]);
                    setFullEvent(evt);
                    setSummary(sum);
                    setMetrics(met);
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

    // Main Content Rendering
    return (
        <div className="animate-in fade-in duration-300 pb-12">
            {selectedEvent ? (
                /* DETAIL VIEW */
                <div className="animate-in slide-in-from-left-4 duration-300">
                    {/* Header Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => { setSelectedEvent(null); setFullEvent(null); setSummary(null); }}
                            className="flex items-center text-sm font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors"
                        >
                            <ChevronLeft size={16} className="mr-1" /> Voltar
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-bold hover:bg-docka-800 dark:hover:bg-white transition-colors shadow-sm"
                            >
                                <Plus size={14} /> Editar Evento
                            </button>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${(fullEvent || selectedEvent)?.status === 'published' || (fullEvent || selectedEvent)?.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-docka-100 text-docka-600 border-docka-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
                                {(fullEvent || selectedEvent)?.status || 'Rascunho'}
                            </span>
                        </div>
                    </div>

                    {/* Main Header Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full md:w-48 h-48 bg-docka-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-docka-200 dark:border-zinc-700">
                            <img src={(fullEvent || selectedEvent).image} className="w-full h-full object-cover" alt="Cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                                    {(fullEvent || selectedEvent).title || (fullEvent || selectedEvent).name}
                                    {isDetailLoading && <Loader2 className="animate-spin text-docka-400" size={18} />}
                                </h1>
                                <p className="text-sm text-docka-500 dark:text-zinc-400 mb-4">{(fullEvent || selectedEvent).organization?.name || 'Fauves'}</p>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Descrição</label>
                                        <p className="text-sm text-docka-700 dark:text-zinc-300 line-clamp-2">{(fullEvent || selectedEvent).description || 'Sem descrição definida.'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Subtítulo</label>
                                        <p className="text-sm text-docka-700 dark:text-zinc-300">{(fullEvent || selectedEvent).subtitle || '-'}</p>
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
                                                {(fullEvent || selectedEvent).startDate ? new Date((fullEvent || selectedEvent).startDate).toLocaleString('pt-BR') : (fullEvent || selectedEvent).date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar size={14} className="mt-0.5 text-docka-400" />
                                        <div>
                                            <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Data de Término</p>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">
                                                {(fullEvent || selectedEvent).endDate ? new Date((fullEvent || selectedEvent).endDate).toLocaleString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={14} className="mt-0.5 text-docka-400" />
                                        <div>
                                            <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Local</p>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">{(fullEvent || selectedEvent).locationCity ? `${(fullEvent || selectedEvent).locationCity} - ${(fullEvent || selectedEvent).locationUf}` : ((fullEvent || selectedEvent).location || '-')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Eye size={20} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{metrics?.views || 0}</h3>
                            <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Visualizações</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{metrics?.interests || 0}</h3>
                            <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Cliques em Ingressos</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg">
                                    <ShoppingCart size={20} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{(summary || {}).revenue > 0 ? ((summary || {}).ticketsSold + ((summary || {}).pendingPayments || 0)) : 0}</h3>
                            <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Pedidos Criados</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{(summary || {}).ticketsSold || 0}</h3>
                            <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Vendas Concluídas</p>
                        </div>
                    </div>

                    {/* Funnel & Revenue ... (Simplified for brevity or keep structure) */}
                    <div className="grid grid-cols-1 gap-6 mb-6">
                         {/* Conversion Funnel Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <TrendingUp size={16} className="text-amber-500" /> Funil de Conversão
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: 'Visitaram a página do evento', val: metrics?.views || 0, drop: null },
                                    { label: "Clicaram em 'Selecionar Ingressos'", val: metrics?.interests || 0, drop: metrics?.views > 0 ? `${Math.round((1 - (metrics.interests / metrics.views)) * 100)}%` : '0%' },
                                    { label: 'Iniciaram checkout', val: (summary || {}).revenue > 0 ? ((summary || {}).ticketsSold + ((summary || {}).pendingPayments || 0)) : 0, drop: metrics?.interests > 0 ? `${Math.round((1 - (((summary || {}).ticketsSold + ((summary || {}).pendingPayments || 0)) / metrics.interests)) * 100)}%` : '0%' },
                                    { label: 'Chegaram à revisão', val: (summary || {}).revenue > 0 ? ((summary || {}).ticketsSold + Math.floor(((summary || {}).pendingPayments || 0) * 0.5)) : 0, drop: '10%' },
                                    { label: 'Completaram pagamento', val: (summary || {}).ticketsSold || 0, drop: '20%' }
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Revenue Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-4">Receita</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">Receita Bruta</span>
                                    <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">R$ {Number((summary || {}).revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">Taxa Plataforma (10%)</span>
                                    <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">R$ {Number(((summary || {}).revenue || 0) * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Receita Líquida</span>
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">R$ {Number(((summary || {}).revenue || 0) * 0.9).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tickets Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-4">Ingressos</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">Vendidos</span>
                                    <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{(summary || {}).ticketsSold || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-docka-100 dark:border-zinc-800">
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">Check-ins</span>
                                    <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{(summary || {}).checkins || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Pagamentos Pendentes</span>
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{(summary || {}).pendingPayments || 0}</span>
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
                                <span className="ml-2 font-mono text-docka-900 dark:text-zinc-100">{(fullEvent || selectedEvent).id}</span>
                            </div>
                            <div className="relative group">
                                <span className="text-docka-500 dark:text-zinc-500">Organização ID:</span>
                                <span className="ml-2 font-mono text-amber-600 dark:text-amber-400 cursor-help underline decoration-dotted">
                                    {(fullEvent || selectedEvent).organizationId || (fullEvent || selectedEvent).organization?.id}
                                </span>
                                <ExternalLink size={10} className="inline ml-1 text-amber-500" />
                            </div>
                            <div>
                                <span className="text-docka-500 dark:text-zinc-500">Slug:</span>
                                <span className="ml-2 font-mono text-docka-900 dark:text-zinc-100">{(fullEvent || selectedEvent).slug}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* LIST VIEW */
                <div className="animate-in fade-in duration-500">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Eventos & Vendas</h1>
                            <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie todos os eventos da plataforma.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="px-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 text-docka-900 dark:text-zinc-100 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-800 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <LinkIcon size={16} className="text-amber-500" /> Importar Externo
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> Criar Evento
                            </button>
                        </div>
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
                            <p className="text-sm">Carregando eventos...</p>
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
                                            <img src={event.image || 'https://placehold.co/600x400?text=Sem+Capa'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" alt={event.title} />
                                            <div className="absolute top-2 left-2">
                                                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${event.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-docka-600 text-white'}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 mb-1 line-clamp-2">{event.title}</h3>
                                            <div className="flex items-center text-xs text-docka-500 dark:text-zinc-400">
                                                <Calendar size={12} className="mr-1.5" /> {event.date}
                                            </div>
                                            <div className="mt-auto pt-4 flex justify-between items-center text-xs text-docka-400 dark:text-zinc-500">
                                                <span className="flex items-center gap-1"><Eye size={12} /> {event.stats?.views || 0}</span>
                                                <span className="text-indigo-500 font-bold">Gerenciar &rarr;</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-docka-200 dark:border-zinc-800 pt-4">
                                <div className="text-sm text-docka-500 dark:text-zinc-400">
                                    Página {currentPage} de {totalPages || 1}
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
                </div>
            )}

            {/* MODALS - Rendered in a common area so they are accessible from both views */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Criar Novo Evento" size="lg">
                <EventForm 
                    onCancel={() => setIsCreateModalOpen(false)} 
                    onSuccess={() => { setIsCreateModalOpen(false); fetchEvents(); }}
                    categories={categories}
                    organizations={organizations}
                />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Evento" size="lg">
                {selectedEvent && (
                    <EventForm 
                        initialData={fullEvent || selectedEvent}
                        onCancel={() => setIsEditModalOpen(false)} 
                        onSuccess={() => { setIsEditModalOpen(false); fetchEvents(); }}
                        categories={categories}
                        organizations={organizations}
                    />
                )}
            </Modal>

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Evento Externo" size="lg">
                <EventImporter 
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={() => {
                        setIsImportModalOpen(false);
                        fetchEvents();
                    }}
                />
            </Modal>
        </div>
    );
};

const EventForm: React.FC<{
    initialData?: any;
    onCancel: () => void;
    onSuccess: () => void;
    categories: any[];
    organizations: any[];
}> = ({ initialData, onCancel, onSuccess, categories, organizations }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || initialData?.title || '',
        subtitle: initialData?.subtitle || '',
        description: initialData?.description || '',
        startDate: initialData?.startDate ? initialData.startDate.substring(0, 16) : '',
        endDate: initialData?.endDate ? initialData.endDate.substring(0, 16) : '',
        location: initialData?.location || '',
        locationCity: initialData?.locationCity || '',
        locationUf: initialData?.locationUf || '',
        image: initialData?.image || '',
        status: initialData?.status || 'draft',
        categoryId: initialData?.categoryId || '',
        organizationId: initialData?.organizationId || initialData?.organization?.id || '',
        externalUrl: initialData?.externalUrl || ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Address Autocomplete Logic
    useEffect(() => {
        if (!formData.location || formData.location.length < 3 || isSearchingAddress) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingAddress(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&addressdetails=1&limit=5&countrycodes=br`);
                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Error fetching address suggestions:", error);
            } finally {
                setIsSearchingAddress(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [formData.location]);

    const handleSelectSuggestion = (sug: any) => {
        const address = sug.address;
        const city = address.city || address.town || address.village || address.municipality || '';
        const state = address['ISO3166-2-lvl4']?.split('-')[1] || address.state || '';
        
        setFormData({
            ...formData,
            location: sug.display_name,
            locationCity: city,
            locationUf: state
        });
        setShowSuggestions(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (initialData?.id) {
                await fauvesService.updateEvent(initialData.id, formData);
            } else {
                await fauvesService.createEvent(formData);
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving event:", error);
            alert("Erro ao salvar evento.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pr-2 relative">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome do Evento *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Início</label>
                    <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Término</label>
                    <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Categoria</label>
                    <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100">
                        <option value="">Selecione</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.col1}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Organização</label>
                    <select value={formData.organizationId} onChange={(e) => setFormData({...formData, organizationId: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100">
                        <option value="">Selecione</option>
                        {organizations.sort((a,b) => a.name.localeCompare(b.name)).map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                </div>

                <div className="col-span-2 relative">
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 flex items-center gap-2">
                        Local / Endereço Completo
                        {isSearchingAddress && <Loader2 size={12} className="animate-spin text-blue-500" />}
                    </label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" 
                            placeholder="Ex: Rua das Flores, 123..."
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {suggestions.map((sug, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSelectSuggestion(sug)}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-docka-50 dark:hover:bg-zinc-800 border-b border-docka-50 dark:border-zinc-800 last:border-0 text-docka-700 dark:text-zinc-300"
                                    >
                                        {sug.display_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cidade</label>
                    <input type="text" value={formData.locationCity} onChange={(e) => setFormData({...formData, locationCity: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">UF</label>
                    <input type="text" value={formData.locationUf} onChange={(e) => setFormData({...formData, locationUf: e.target.value})} maxLength={2} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100 uppercase" />
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Imagem URL</label>
                    <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-docka-100 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button onClick={onCancel} className="px-4 py-2 text-sm text-docka-600 dark:text-zinc-400">Cancelar</button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-bold flex items-center gap-2">
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    {initialData?.id ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
            </div>
        </div>
    );
};

export default EventsView;
