import React, { useState, useEffect, useMemo } from 'react';
import { Search, RotateCw, Plus, Pencil, TrendingUp, Calendar, MapPin, ChevronLeft, ChevronRight, Eye, ShoppingCart, CheckCircle2, Loader2, ExternalLink, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { FauvesEvent } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';
import EventImporter from './EventImporter';
import EventEditorForm from './EventEditorForm';
import { formatStatusLabel } from '../../../../utils/statusPresentation';

// Add props interface
interface EventsViewProps {
    initialEventId?: string;
}

const formatEventDateTime = (value: string | undefined, timezone?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('pt-BR', {
        timeZone: timezone || 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

const EventsView: React.FC<EventsViewProps> = ({ initialEventId }) => {
    const [events, setEvents] = useState<FauvesEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<FauvesEvent | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [query, setQuery] = useState('');

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
    const filteredEvents = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
        if (!normalizedQuery) return events;
        return events.filter((event) => [
            event.title,
            event.date,
            event.location,
            event.locationName,
            event.locationAddress,
            (event as any).organizationName,
        ].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR').includes(normalizedQuery));
    }, [events, query]);

    const handleEventSaved = async () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        await fetchEvents();
        if (!selectedEvent?.id) return;
        try {
            const updatedEvent = await fauvesService.getEvent(selectedEvent.id);
            setFullEvent(updatedEvent);
            setSelectedEvent((current) => current ? {
                ...current,
                ...updatedEvent,
                title: updatedEvent.name || updatedEvent.title || current.title,
                date: updatedEvent.startDate
                    ? new Date(updatedEvent.startDate).toLocaleDateString('pt-BR', { timeZone: updatedEvent.timezone || 'America/Sao_Paulo' })
                    : current.date,
            } : current);
        } catch (error) {
            console.error('Failed to refresh event after saving:', error);
        }
    };

    // Main Content Rendering
    return (
        <div className="pb-12">
            {selectedEvent ? (
                /* DETAIL VIEW */
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header Navigation */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] pb-4 dark:border-zinc-800">
                        <button
                            onClick={() => { setSelectedEvent(null); setFullEvent(null); setSummary(null); }}
                            className="flex min-h-10 items-center rounded-full border border-[#e5e5e5] px-3 text-xs font-semibold text-docka-600 transition-colors hover:bg-zinc-50 hover:text-black dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                        >
                            <ChevronLeft size={16} className="mr-1" /> Voltar
                        </button>
                        <div className="flex min-w-0 items-center gap-2">
                            <span className={`inline-flex max-w-[112px] truncate rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${(fullEvent || selectedEvent)?.isPublished || ['published', 'active', 'publicado'].includes(String((fullEvent || selectedEvent)?.status || '').toLowerCase()) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                {formatStatusLabel((fullEvent || selectedEvent)?.status, 'Rascunho')}
                            </span>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#2a2ad7] px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-800"
                            >
                                <Pencil size={14} /> <span>Editar<span className="hidden sm:inline"> evento</span></span>
                            </button>
                        </div>
                    </div>

                    {/* Main Header Card */}
                    <div className="mb-4 flex flex-col gap-4 border-b border-[#e5e5e5] bg-white pb-5 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:gap-5">
                        {/* Image */}
                        <div className="aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-docka-100 dark:bg-zinc-800 sm:h-40 sm:w-40 sm:aspect-square">
                            {(fullEvent || selectedEvent).image ? (
                                <img src={(fullEvent || selectedEvent).image} className="w-full h-full object-cover" alt="Capa do evento" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-docka-400 dark:text-zinc-500">
                                    <ImageIcon size={30} />
                                    <span className="text-xs font-medium">Sem capa</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                            <div>
                                <h1 className="mb-1 flex items-center gap-2 break-words font-season text-xl font-[420] text-black dark:text-white sm:text-2xl">
                                    <span className="min-w-0">{(fullEvent || selectedEvent).title || (fullEvent || selectedEvent).name}</span>
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

                            <div className="space-y-3 border-t border-[#e5e5e5] pt-4 dark:border-zinc-800 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                                <h3 className="text-xs font-bold text-docka-900 dark:text-zinc-100 mb-3 border-b border-docka-200 dark:border-zinc-700 pb-2">Informações</h3>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-start gap-3">
                                        <Calendar size={14} className="mt-0.5 text-docka-400" />
                                        <div>
                                            <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Data de Início</p>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">
                                                {(fullEvent || selectedEvent).startDate ? formatEventDateTime((fullEvent || selectedEvent).startDate, (fullEvent || selectedEvent).timezone) : (fullEvent || selectedEvent).date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar size={14} className="mt-0.5 text-docka-400" />
                                        <div>
                                            <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Data de Término</p>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">
                                                {formatEventDateTime((fullEvent || selectedEvent).endDate, (fullEvent || selectedEvent).timezone)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={14} className="mt-0.5 text-docka-400" />
                                        <div>
                                            <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">Local</p>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">
                                                {(fullEvent || selectedEvent).locationName || (fullEvent || selectedEvent).locationAddress || (fullEvent || selectedEvent).location || '-'}
                                                {(fullEvent || selectedEvent).locationCity && <span className="block">{(fullEvent || selectedEvent).locationCity} - {(fullEvent || selectedEvent).locationUf}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Metric Cards */}
                    <div className="mb-4 grid grid-cols-2 border border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:grid-cols-4 lg:divide-x lg:divide-[#e5e5e5] lg:dark:divide-zinc-800">
                        <div className="border-b border-r border-[#e5e5e5] p-4 dark:border-zinc-800 lg:border-b-0 lg:border-r-0 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Eye size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-docka-900 dark:text-zinc-100">{metrics?.views || 0}</h3>
                            <p className="mt-1 text-xs text-docka-500 dark:text-zinc-500">Visualizações</p>
                        </div>

                        <div className="border-b border-[#e5e5e5] p-4 dark:border-zinc-800 lg:border-b-0 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-docka-900 dark:text-zinc-100">{metrics?.interests || 0}</h3>
                            <p className="mt-1 text-xs text-docka-500 dark:text-zinc-500">Cliques em ingressos</p>
                        </div>

                        <div className="border-r border-[#e5e5e5] p-4 dark:border-zinc-800 lg:border-r-0 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="p-2 bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg">
                                    <ShoppingCart size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-docka-900 dark:text-zinc-100">{(summary || {}).revenue > 0 ? ((summary || {}).ticketsSold + ((summary || {}).pendingPayments || 0)) : 0}</h3>
                            <p className="mt-1 text-xs text-docka-500 dark:text-zinc-500">Pedidos criados</p>
                        </div>

                        <div className="p-4 sm:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-semibold text-docka-900 dark:text-zinc-100">{(summary || {}).ticketsSold || 0}</h3>
                            <p className="mt-1 text-xs text-docka-500 dark:text-zinc-500">Vendas concluídas</p>
                        </div>
                    </div>

                    {/* Funnel & Revenue ... (Simplified for brevity or keep structure) */}
                    <div className="mb-4 grid grid-cols-1 gap-4">
                         {/* Conversion Funnel Card */}
                        <div className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
                            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-docka-900 dark:text-zinc-100">
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
                                    <div key={i} className="flex items-center justify-between gap-3 border-b border-docka-100 py-3 last:border-0 dark:border-zinc-800">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${i === 4 ? 'bg-emerald-500' : 'bg-docka-300 dark:bg-zinc-700'}`}></div>
                                            <span className="text-xs leading-4 text-docka-600 dark:text-zinc-400 sm:text-sm">{step.label}</span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {step.drop && <span className="hidden rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-600 dark:bg-red-900/30 dark:text-red-400 sm:inline-flex">↓ {step.drop}</span>}
                                            <span className="min-w-[40px] text-right text-sm font-bold text-docka-900 dark:text-zinc-100">{step.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h2 className="mb-3 text-sm font-semibold text-black dark:text-white">Resultados do evento</h2>
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Revenue Card */}
                        <div className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
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
                        <div className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
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
                    <div className="border border-[#e5e5e5] bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-5">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-docka-500 dark:text-zinc-500">Identificação do evento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <span className="text-docka-500 dark:text-zinc-500">ID:</span>
                                <span className="mt-1 block break-all font-mono text-docka-900 dark:text-zinc-100">{(fullEvent || selectedEvent).id}</span>
                            </div>
                            <div className="relative group">
                                <span className="text-docka-500 dark:text-zinc-500">Organização ID:</span>
                                <span className="mt-1 block break-all font-mono text-amber-600 underline decoration-dotted dark:text-amber-400">
                                    {(fullEvent || selectedEvent).organizationId || (fullEvent || selectedEvent).organization?.id}
                                </span>
                                <ExternalLink size={10} className="inline ml-1 text-amber-500" />
                            </div>
                            <div>
                                <span className="text-docka-500 dark:text-zinc-500">Slug:</span>
                                <span className="mt-1 block break-all font-mono text-docka-900 dark:text-zinc-100">{(fullEvent || selectedEvent).slug}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* LIST VIEW */
                <div>
                    {/* Filters */}
                    <div className="flex flex-col gap-3 border-b border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:px-6">
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={16} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                className="min-h-11 w-full rounded-full border border-docka-200 bg-white py-2 pl-10 pr-4 text-sm text-docka-900 outline-none transition-colors placeholder:text-docka-400 focus:border-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                                placeholder="Buscar por evento, produtora ou local…"
                            />
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 sm:flex">
                            <button onClick={() => setIsImportModalOpen(true)} className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-docka-200 bg-white px-3 text-xs font-semibold text-docka-900 transition-colors hover:bg-docka-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"><LinkIcon size={15} className="shrink-0 text-amber-500" /> <span className="truncate">Importar</span></button>
                            <button onClick={() => setIsCreateModalOpen(true)} className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full bg-[#2a2ad7] px-3 text-xs font-semibold text-white transition-colors hover:bg-indigo-800"><Plus size={15} className="shrink-0" /> <span className="truncate">Novo<span className="hidden sm:inline"> evento</span></span></button>
                            <button onClick={fetchEvents} disabled={isLoading} aria-label="Atualizar eventos" title="Atualizar eventos" className="flex h-11 w-11 items-center justify-center rounded-full border border-docka-200 bg-white text-docka-700 hover:bg-docka-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"><RotateCw size={15} className={isLoading ? 'animate-spin' : ''} /></button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500">
                            <Loader2 size={32} className="animate-spin mb-4" />
                            <p className="text-sm">Carregando eventos...</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white dark:bg-zinc-950">
                                <div className="hidden min-h-10 grid-cols-[minmax(280px,1.4fr)_minmax(220px,1fr)_150px_130px_32px] items-center gap-5 border-b border-[#e5e5e5] bg-zinc-50/70 px-6 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 lg:grid">
                                    <span>Evento</span><span>Data e local</span><span>Interesse</span><span>Status</span><span />
                                </div>
                                {filteredEvents.length > 0 ? filteredEvents.map((event: FauvesEvent) => {
                                    const isPublished = event.isPublished || ['published', 'active', 'publicado'].includes(String(event.status).toLowerCase());
                                    return <button
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className="group grid min-h-[88px] w-full grid-cols-[56px_minmax(0,1fr)_20px] items-center gap-3 border-b border-[#e5e5e5] px-4 py-3 text-left transition-colors hover:bg-indigo-50/30 dark:border-zinc-800 dark:hover:bg-indigo-950/10 lg:grid-cols-[minmax(280px,1.4fr)_minmax(220px,1fr)_150px_130px_32px] lg:gap-5 lg:px-6"
                                    >
                                        <span className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-3">
                                            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-docka-100 dark:bg-zinc-800 lg:h-12 lg:w-12"><img src={event.image || 'https://placehold.co/160x160?text=Evento'} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="" /></span>
                                            <span className="min-w-0">
                                                <strong className="block truncate text-sm font-semibold text-black dark:text-white">{event.title}</strong>
                                                <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 lg:hidden"><Calendar size={11} className="shrink-0" /><span className="truncate">{event.date || 'Data não definida'}</span></span>
                                                <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 lg:hidden"><MapPin size={11} className="shrink-0" /><span className="truncate">{event.locationName || event.locationAddress || event.location || 'Local não definido'}</span></span>
                                                <span className={`mt-2 inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[9px] font-bold uppercase lg:hidden ${isPublished ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>{formatStatusLabel(event.status)}</span>
                                                <small className="mt-1 hidden truncate text-[10px] text-zinc-400 lg:block">{(event as any).organizationName || (event as any).organization?.name || 'Fauves'}</small>
                                            </span>
                                        </span>
                                        <span className="hidden min-w-0 lg:block"><span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"><Calendar size={13} className="shrink-0 text-zinc-400" />{event.date || 'Data não definida'}</span><span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400"><MapPin size={12} className="shrink-0" /><span className="truncate">{event.locationName || event.locationAddress || event.location || 'Local não definido'}</span></span></span>
                                        <span className="hidden items-center gap-4 text-xs lg:flex"><span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400"><TrendingUp size={13} />{event.stats?.interests || 0}</span><span className="flex items-center gap-1.5 text-zinc-500"><Eye size={13} />{event.stats?.views || 0}</span></span>
                                        <span className={`hidden w-fit max-w-full truncate rounded-full px-2.5 py-1 text-[9px] font-bold uppercase lg:inline-flex ${isPublished ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>{formatStatusLabel(event.status)}</span>
                                        <ChevronRight size={17} className="text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2a2ad7] dark:text-zinc-600" />
                                    </button>;
                                }) : <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center"><Search size={24} className="mb-3 text-zinc-300 dark:text-zinc-700" /><strong className="text-sm text-zinc-700 dark:text-zinc-200">Nenhum evento encontrado</strong><p className="mt-1 text-xs text-zinc-400">Tente buscar por outro nome, produtora ou local.</p></div>}
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-docka-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
                                <div className="text-xs text-docka-500 dark:text-zinc-400 sm:text-sm">
                                    <span className="hidden sm:inline">Página </span>{currentPage} de {totalPages || 1}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        aria-label="Página anterior"
                                        className="flex min-h-10 items-center justify-center gap-1 rounded-full border border-docka-200 bg-white px-3 text-xs font-semibold disabled:opacity-50 hover:bg-docka-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                    >
                                        <ChevronLeft size={14} /><span className="hidden sm:inline">Anterior</span>
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage >= totalPages}
                                        aria-label="Próxima página"
                                        className="flex min-h-10 items-center justify-center gap-1 rounded-full border border-docka-200 bg-white px-3 text-xs font-semibold disabled:opacity-50 hover:bg-docka-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                                    >
                                        <span className="hidden sm:inline">Próxima</span><ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* MODALS - Rendered in a common area so they are accessible from both views */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Criar Novo Evento" size="2xl">
                <EventEditorForm
                    onCancel={() => setIsCreateModalOpen(false)} 
                    onSuccess={handleEventSaved}
                    categories={categories}
                    organizations={organizations}
                />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Evento" size="2xl">
                {selectedEvent && (
                    <EventEditorForm
                        initialData={fullEvent || selectedEvent}
                        onCancel={() => setIsEditModalOpen(false)} 
                        onSuccess={handleEventSaved}
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

export const EventForm: React.FC<{
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
        externalUrl: initialData?.externalUrl || '',
        isExternal: Boolean(initialData?.isExternal || initialData?.externalUrl),
        lineup: initialData?.artists?.map((a: any) => a.artist) || initialData?.lineup || []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [artistSearch, setArtistSearch] = useState('');
    const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
    const [isSearchingArtists, setIsSearchingArtists] = useState(false);

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

    // Artist Search Logic
    useEffect(() => {
        if (!artistSearch || artistSearch.length < 2) {
            setArtistSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingArtists(true);
            try {
                const results = await fauvesService.searchArtists(artistSearch);
                setArtistSuggestions(results);
            } catch (error) {
                console.error("Error searching artists:", error);
            } finally {
                setIsSearchingArtists(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [artistSearch]);

    const handleAddArtist = (artist: any) => {
        if (formData.lineup.find((a: any) => a.id === artist.id)) return;
        setFormData({
            ...formData,
            lineup: [...formData.lineup, artist]
        });
        setArtistSearch('');
        setArtistSuggestions([]);
    };

    const handleRemoveArtist = (artistId: string) => {
        setFormData({
            ...formData,
            lineup: formData.lineup.filter((a: any) => a.id !== artistId)
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                isExternal: Boolean(formData.isExternal || formData.externalUrl),
                organizationId: formData.organizationId || undefined,
            };
            if (initialData?.id) {
                await fauvesService.updateEvent(initialData.id, payload);
            } else {
                await fauvesService.createEvent(payload);
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

                <div className="col-span-2">
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Subtítulo</label>
                    <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" placeholder="Ex: O maior festival de techno do ano" />
                </div>

                <div className="col-span-2">
                    <RichTextField 
                        label="Descrição" 
                        value={formData.description} 
                        onChange={(val: string) => setFormData({...formData, description: val})} 
                        placeholder="Descreva o evento..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Categoria Fauves</label>
                    <select value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100">
                        <option value="">Selecione uma Categoria</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name || cat.col1}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Organização / Produtora</label>
                    <select value={formData.organizationId} onChange={(e) => setFormData({...formData, organizationId: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100">
                        <option value="">Sem organização (Curadoria Fauves)</option>
                        {organizations.sort((a,b) => a.name.localeCompare(b.name)).map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                </div>

                <div className="col-span-2 p-3 bg-docka-50 dark:bg-zinc-800/60 rounded-xl border border-docka-200 dark:border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-xs font-bold text-docka-800 dark:text-zinc-200 block">Evento Externo / Curadoria Fauves</label>
                            <p className="text-[11px] text-docka-400 dark:text-zinc-500">Ao ativar, o evento abrirá diretamente a bilheteria externa (Sympla, Ingresse, Shotgun, etc).</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={formData.isExternal}
                            onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                    </div>

                    {(formData.isExternal || formData.externalUrl) && (
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Link da Bilheteria Externa *</label>
                            <input
                                type="text"
                                value={formData.externalUrl}
                                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value, isExternal: true })}
                                placeholder="https://www.sympla.com.br/evento/..."
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-100"
                            />
                        </div>
                    )}
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

                <div className="col-span-2">
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Lineup / Artistas (Spotify)</label>
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={14} />
                        <input 
                            type="text" 
                            value={artistSearch} 
                            onChange={(e) => setArtistSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" 
                            placeholder="Buscar artista no Spotify..."
                        />
                        {isSearchingArtists && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-docka-400" />}
                        
                        {artistSuggestions.length > 0 && (
                            <div className="absolute z-[60] left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {artistSuggestions.map((artist) => (
                                    <button 
                                        key={artist.id}
                                        onClick={() => handleAddArtist(artist)}
                                        className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-docka-50 dark:hover:bg-zinc-800 border-b border-docka-100 dark:border-zinc-800 last:border-0"
                                    >
                                        <img src={artist.imageUrl || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full object-cover" alt="" />
                                        <div>
                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{artist.name}</p>
                                            <p className="text-[10px] text-docka-500">{artist.genres?.slice(0, 2).join(', ')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.lineup.map((artist: any) => (
                            <div key={artist.id} className="flex items-center gap-2 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-full pl-1 pr-2 py-1">
                                <img src={artist.imageUrl || 'https://via.placeholder.com/40'} className="w-6 h-6 rounded-full object-cover" alt="" />
                                <span className="text-xs font-medium text-docka-700 dark:text-zinc-200">{artist.name}</span>
                                <button onClick={() => handleRemoveArtist(artist.id)} className="p-0.5 hover:bg-docka-200 dark:hover:bg-zinc-700 rounded-full text-docka-400 dark:text-zinc-500">
                                    <Plus className="rotate-45" size={14} />
                                </button>
                            </div>
                        ))}
                        {formData.lineup.length === 0 && (
                            <p className="text-xs text-docka-400 italic">Nenhum artista adicionado ao lineup.</p>
                        )}
                    </div>
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

const RichTextField = ({ value, onChange, label, placeholder }: any) => {
    const editorRef = React.useRef<HTMLDivElement>(null);

    // Initial value synchronization
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, []);

    // Sync if value changes externally (like when selecting another event)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value && value !== undefined) {
            // Only update if it's truly different to avoid cursor jumps
            // But contentEditable sync is tricky with state
        }
    }, [value]);

    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase tracking-wider">{label}</label>
            <div className="relative group">
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e: any) => onChange(e.currentTarget.innerHTML)}
                    onBlur={(e: any) => onChange(e.currentTarget.innerHTML)}
                    onPaste={() => {
                        // Basic paste cleaning could go here if needed
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm text-docka-900 dark:text-zinc-100 min-h-[180px] outline-none focus:ring-2 focus:ring-docka-500/20 focus:border-docka-500 transition-all overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
                />
                {!value && (
                    <div className="absolute top-3 left-4 text-docka-400 pointer-events-none text-sm italic">
                        {placeholder}
                    </div>
                )}
            </div>
            <div className="flex gap-2 text-[10px] text-docka-400 dark:text-zinc-500 font-medium">
                <span>Dica: Você pode colar textos formatados do Word ou sites.</span>
            </div>
        </div>
    );
};

export default EventsView;
