
import React from 'react';
import { User, Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import {
    DollarSign, Calendar, Clock, Ticket, Users,
    MoreHorizontal, ChevronRight, CreditCard,
    LayoutTemplate
} from 'lucide-react';

// Sub-Views
import EventsView from './fauves/EventsView';
import FinanceView from './fauves/FinanceView';
import SupportView from './fauves/SupportView';
import ManagementView from './fauves/ManagementView';
import SettingsView from './fauves/SettingsView';
import OrganizationsView from './fauves/OrganizationsView';
import ReportsView from './fauves/ReportsView';

interface FauvesDashboardProps {
    user: User;
    activeView: string;
    onNavigate?: (view: string, data?: any) => void;
    viewData?: any;
    organization?: Organization;
}

const FauvesDashboard: React.FC<FauvesDashboardProps> = ({ activeView, onNavigate, viewData, organization }) => {

    // Helper for consistent layout
    const ViewWrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950 transition-colors custom-scrollbar">
            <div className="p-8 min-h-full">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );

    // Routing Logic
    switch (activeView) {
        case 'events':
            return <ViewWrapper><EventsView initialEventId={viewData?.eventId} /></ViewWrapper>;
        case 'finance':
            return <ViewWrapper><FinanceView /></ViewWrapper>;
        case 'helpdesk':
        case 'helpdesk-tickets':
        case 'helpdesk-chat':
        case 'helpdesk-center':
            return <ViewWrapper><SupportView activeSubView={activeView} /></ViewWrapper>;
        case 'users':
            return <ViewWrapper><ManagementView type="users" /></ViewWrapper>;
        case 'artists':
            return <ViewWrapper><ManagementView type="artists" /></ViewWrapper>;
        case 'categories':
            return <ViewWrapper><ManagementView type="categories" /></ViewWrapper>;
        case 'ads':
            return <ViewWrapper><ManagementView type="ads" /></ViewWrapper>;
        case 'slides':
            return <ViewWrapper><ManagementView type="slides" /></ViewWrapper>;
        case 'organizations':
            return <ViewWrapper><OrganizationsView onNavigate={onNavigate} /></ViewWrapper>;
        case 'settings':
            return <ViewWrapper><SettingsView organization={organization} /></ViewWrapper>;
        case 'reports':
            return <ViewWrapper><ReportsView /></ViewWrapper>;
        case 'overview':
            // Keep existing overview below
            break;
        default:
            return (
                <ViewWrapper>
                    <div className="animate-in fade-in duration-300">
                        <PlaceholderView
                            title={`Fauves ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                            icon={LayoutTemplate}
                            description="Este módulo está sendo migrado para o novo sistema operacional Docka."
                        />
                    </div>
                </ViewWrapper>
            );
    }

    // OVERVIEW DASHBOARD
    const [stats, setStats] = React.useState<any>(null);
    const [recentEvents, setRecentEvents] = React.useState<any[]>([]);
    const [ranking, setRanking] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Only fetch if active view is 'overview' or undefined (default)
        if (activeView === 'overview' || !activeView) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [statsData, eventsData, rankingData] = await Promise.all([
                        import('../../../services/fauvesService').then(m => m.fauvesService.getStats()),
                        import('../../../services/fauvesService').then(m => m.fauvesService.getEvents(1, 4)),
                        import('../../../services/fauvesService').then(m => m.fauvesService.getRanking())
                    ]);
                    setStats(statsData);
                    setRecentEvents(eventsData.items || eventsData); // Handle {items, total} or array
                    setRanking(rankingData);
                } catch (e) {
                    console.error("Failed to load overview data", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [activeView]);

    if (activeView && activeView !== 'overview') return null; // Should be handled by switch, but just in case.

    // Safe formatting helpers
    const formatCurrency = (val: number) => val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

    // Fallback data if loading
    const displayStats = stats || {
        salesToday: 0,
        checkins: 0,
        eventsActive: 0,
        openTickets: 0,
        totalRevenue: 0
    };

    return (
        <div className="flex h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300 transition-colors">
            <div className="flex-1 overflow-y-auto bg-docka-50/30 dark:bg-zinc-950/30 p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Visão Geral</h1>
                            <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Resumo das atividades da Fauves em tempo real.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 shadow-sm transition-colors">
                                Exportar Relatório
                            </button>
                            <button className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm transition-colors flex items-center gap-2">
                                <Ticket size={16} /> Novo Evento
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Vendas do Dia', value: formatCurrency(displayStats.salesToday), sub: 'Hoje', icon: DollarSign },
                            { label: 'Check-ins', value: displayStats.checkins, sub: 'Total validado', icon: Users },
                            { label: 'Eventos Ativos', value: displayStats.eventsActive, sub: 'Publicados', icon: Calendar },
                            { label: 'Tickets Emitidos', value: displayStats.openTickets, sub: 'Reservados', icon: Clock },
                        ].map((kpi, idx) => (
                            <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] group hover:border-docka-300 dark:hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-docka-50 dark:bg-zinc-800 rounded-lg text-docka-500 dark:text-zinc-400 group-hover:text-docka-900 dark:group-hover:text-zinc-200 group-hover:bg-docka-100 dark:group-hover:bg-zinc-700 transition-colors">
                                        <kpi.icon size={18} />
                                    </div>
                                    {idx === 0 && displayStats.salesToday > 0 && <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">Active</span>}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">
                                        {isLoading ? <span className="animate-pulse bg-gray-200 h-8 w-24 block rounded"></span> : kpi.value}
                                    </h3>
                                    <p className="text-sm font-medium text-docka-500 dark:text-zinc-500">{kpi.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Eventos em Destaque */}
                        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Eventos Recentes</h3>
                                <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800 flex-1">
                                {isLoading ? (
                                    <div className="p-8 text-center text-sm text-docka-400">Carregando eventos...</div>
                                ) : recentEvents.length === 0 ? (
                                    <div className="p-8 text-center text-sm text-docka-400">Nenhum evento recente encontrado.</div>
                                ) : (
                                    recentEvents.map((event, i) => (
                                        <div key={i} className="p-4 flex items-center group hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                                            <div className="w-12 h-12 bg-docka-100 dark:bg-zinc-800 rounded-lg mr-4 flex-shrink-0 overflow-hidden relative border border-docka-200 dark:border-zinc-700">
                                                <img src={event.image || `https://picsum.photos/id/${15 + i}/100/100`} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-docka-900 dark:text-zinc-100 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{event.title || event.name}</h4>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <span className="text-[11px] text-docka-500 dark:text-zinc-500">{event.date}</span>
                                                    <span className="w-0.5 h-0.5 bg-docka-300 dark:bg-zinc-600 rounded-full" />
                                                    <span className="text-[11px] text-docka-500 dark:text-zinc-500">{event.location}</span>
                                                </div>
                                            </div>
                                            <div className="text-right pl-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border ${event.status === 'published' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100/50' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    {event.status}
                                                </span>
                                                <div className="mt-1 text-[10px] text-docka-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center justify-end gap-1">
                                                    Detalhes <ChevronRight size={10} />
                                                </div>
                                            </div>
                                        </div>
                                    )))}
                            </div>
                            <div className="px-4 py-3 bg-docka-50 dark:bg-zinc-800/30 border-t border-docka-100 dark:border-zinc-800 text-center">
                                <button className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 transition-colors">Ver todos os eventos</button>
                            </div>
                        </div>

                        {/* Side Stats */}
                        <div className="space-y-6">
                            {/* Top Organizers */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm p-6">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-1">Top Organizadores</h3>
                                <p className="text-xs text-docka-400 dark:text-zinc-500 mb-6">Ranking por receita (Mês atual)</p>

                                <div className="space-y-5">
                                    {isLoading ? (
                                        <div className="text-xs text-center text-docka-400">Carregando ranking...</div>
                                    ) : ranking.length === 0 ? (
                                        <div className="text-xs text-center text-docka-400">Sem dados de venda este mês.</div>
                                    ) : (
                                        ranking.slice(0, 5).map((org, i) => (
                                            <div key={i}>
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-medium text-docka-900 dark:text-zinc-100">{org.name}</span>
                                                    <span className="text-docka-500 dark:text-zinc-400">{formatCurrency(Number(org.value))}</span>
                                                </div>
                                                <div className="w-full bg-docka-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-docka-900 dark:bg-zinc-100 h-1.5 rounded-full"
                                                        style={{ width: `${Math.min(100, Math.max(5, (Number(org.value) / (Number(ranking[0]?.value) || 1)) * 100))}%`, opacity: 1 - (i * 0.1) }}
                                                    />
                                                </div>
                                            </div>
                                        )))}
                                </div>
                            </div>

                            {/* Quick Financial */}
                            <div className="bg-docka-900 dark:bg-zinc-100 rounded-xl shadow-lg p-6 text-white dark:text-zinc-900 relative overflow-hidden group cursor-pointer">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4 text-docka-300 dark:text-zinc-500">
                                        <CreditCard size={16} />
                                        <span className="text-xs font-medium uppercase tracking-wider">Receita Total</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-1">
                                        {isLoading ? "..." : formatCurrency(displayStats.totalRevenue)}
                                    </div>
                                    <div className="text-sm text-docka-400 dark:text-zinc-500">Acumulado da plataforma</div>
                                </div>
                                <div className="absolute -right-6 -bottom-6 text-white dark:text-zinc-900 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                    <DollarSign size={120} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FauvesDashboard;
