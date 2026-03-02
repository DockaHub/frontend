
import React, { useState, useEffect } from 'react';
import {
    Building2, Users, DollarSign, Clock, Search,
    Globe, ArrowLeft, Pencil, Plus,
    LayoutGrid, CheckCircle2,
    ExternalLink, Ticket
} from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';

interface OrganizationsViewProps {
    onNavigate?: (view: string, data?: any) => void;
}

const OrganizationsView: React.FC<OrganizationsViewProps> = () => {
    const [view, setView] = useState<'list' | 'details'>('list');
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [orgStats, setOrgStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        events: 0
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fauvesService.getOrganizations();
            console.log("[OrganizationsView] Fetched data:", data);

            if (data && data.items) {
                setOrganizations(data.items);

                // Basic global stats for the header
                const activeCount = data.items.filter((o: any) => o.status === 'active').length;
                const totalEvents = data.items.reduce((acc: number, o: any) => acc + (o.eventCount || 0), 0);

                setStats({
                    total: data.total || data.items.length,
                    active: activeCount,
                    events: totalEvents
                });
            } else {
                setOrganizations([]);
            }
        } catch (err: any) {
            console.error("Failed to fetch organizations", err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message;
            setError(`Erro ${status || ''} ao carregar organizações: ${message}. Verifique o console para mais detalhes ou se o token é de administrador.`);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (org: any) => {
        setLoading(true);
        try {
            const details = await fauvesService.getOrganization(org.id);
            const metrics = await fauvesService.getOrganizationStats(org.id);
            setSelectedOrg(details || org);
            setOrgStats(metrics);
            setView('details');
        } catch (error) {
            console.error("Failed to fetch org details", error);
            // Fallback for demo
            setSelectedOrg(org);
            setView('details');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val: number) => val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

    if (view === 'details' && selectedOrg) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView('list')}
                            className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-100"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 overflow-hidden">
                                {selectedOrg.logo ? (
                                    <img src={selectedOrg.logo} alt={selectedOrg.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedOrg.name?.substring(0, 1) || 'F'
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedOrg.name}</h1>
                                <p className="text-sm text-docka-500 dark:text-zinc-400">/{selectedOrg.slug}</p>
                            </div>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all">
                        <Pencil size={16} /> Editar
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Info Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <Building2 size={20} className="text-indigo-600" /> Informações da Organização
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Nome</label>
                                    <p className="text-base font-medium text-docka-900 dark:text-zinc-100">{selectedOrg.name}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Slug</label>
                                    <p className="text-base font-medium text-docka-900 dark:text-zinc-100">{selectedOrg.slug}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Logo</label>
                                    <div className="w-32 h-32 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-600/10 overflow-hidden">
                                        {selectedOrg.logo ? (
                                            <img
                                                src={selectedOrg.logo}
                                                alt={selectedOrg.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            selectedOrg.name?.substring(0, 1) || 'F'
                                        )}
                                    </div>
                                    {selectedOrg.logo && <p className="text-[10px] text-zinc-500 mt-2 break-all opacity-50">URL: {selectedOrg.logo}</p>}
                                </div>
                                <div className="pt-4 border-t border-docka-100 dark:border-zinc-800">
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Taxa da Plataforma</label>
                                    <p className="text-lg font-bold text-docka-900 dark:text-zinc-100">15%</p>
                                    <p className="text-xs text-docka-400 dark:text-zinc-500 mt-0.5">Aplicada em todos os eventos dessa organização</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Summary Grid */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100">Estatísticas</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Eventos', value: orgStats?.eventsActive || 0, icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                                    { label: 'Receita', value: formatCurrency(orgStats?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                                    { label: 'Ingressos', value: orgStats?.totalTickets || 0, icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                                    { label: 'Pedidos', value: orgStats?.totalOrders || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                                            <stat.icon size={18} />
                                        </div>
                                        <p className="text-xs font-medium text-docka-500 dark:text-zinc-500">{stat.label}</p>
                                        <h4 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mt-0.5">{stat.value}</h4>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed Revenue Table */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800">
                                    <h4 className="font-bold text-sm text-docka-900 dark:text-zinc-100">Receita Detalhada</h4>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-docka-600 dark:text-zinc-400">Receita Bruta</span>
                                        <span className="font-bold text-docka-900 dark:text-zinc-100 whitespace-nowrap">{formatCurrency(orgStats?.totalRevenue || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-docka-600 dark:text-zinc-400">Taxa Plataforma (15%)</span>
                                        <span className="font-bold text-red-500 whitespace-nowrap">- {formatCurrency((orgStats?.totalRevenue || 0) * 0.15)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                                        <span className="font-bold text-docka-900 dark:text-zinc-100">Receita Líquida</span>
                                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency((orgStats?.totalRevenue || 0) * 0.85)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Cards */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6">Detalhes Técnicos</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ID</label>
                                    <p className="text-xs font-mono text-docka-600 dark:text-zinc-400 break-all bg-docka-50 dark:bg-zinc-800/50 p-2 rounded border border-docka-100 dark:border-zinc-800">{selectedOrg.id}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Criado em</label>
                                    <p className="text-xs text-docka-700 dark:text-zinc-300 flex items-center gap-2">
                                        <Clock size={12} className="text-docka-400" /> {selectedOrg.createdAt ? new Date(selectedOrg.createdAt).toLocaleString('pt-BR') : '03/01/2026 • 21:10'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Atualizado em</label>
                                    <p className="text-xs text-docka-700 dark:text-zinc-300 flex items-center gap-2">
                                        <Clock size={12} className="text-docka-400" /> {selectedOrg.updatedAt ? new Date(selectedOrg.updatedAt).toLocaleString('pt-BR') : '05/01/2026 • 14:15'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6 font-bold">Links Rápidos</h3>
                            <div className="space-y-4">
                                <button className="w-full flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    <ExternalLink size={14} /> Ver página pública
                                </button>
                                <button className="w-full flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    <Globe size={14} /> Ver todos os eventos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Organizações</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie todas as organizações da plataforma</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 transition-all">
                    <Plus size={18} /> Nova Organização
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total de Organizações', value: stats.total, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Ativas', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Total de Eventos', value: stats.events, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' }
                ].map((metric, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className={`w-14 h-14 ${metric.bg} ${metric.color} rounded-xl flex items-center justify-center`}>
                            <metric.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{metric.value}</h3>
                            <p className="text-xs font-medium text-docka-400 dark:text-zinc-500 mt-0.5">{metric.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 relative min-w-[300px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-docka-400" />
                        <input
                            placeholder="Buscar por nome ou slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all text-docka-900 dark:text-zinc-100"
                        />
                    </div>
                    <select className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-docka-700 dark:text-zinc-300">
                        <option>20 por página</option>
                        <option>50 por página</option>
                        <option>100 por página</option>
                    </select>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-docka-50/50 dark:bg-zinc-800/50 border-b border-docka-100 dark:border-zinc-800 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Organização</th>
                                <th className="px-8 py-5">Slug</th>
                                <th className="px-8 py-5 text-center">Eventos</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-docka-400 animate-pulse">
                                        Carregando organizações...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/10">
                                        {error}
                                    </td>
                                </tr>
                            ) : organizations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-docka-400">
                                        Nenhuma organização encontrada.
                                    </td>
                                </tr>
                            ) : (
                                organizations
                                    .filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((org) => (
                                        <tr key={org.id} className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/10 overflow-hidden">
                                                        {org.logo ? (
                                                            <img
                                                                src={org.logo}
                                                                alt={org.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    console.error(`[OrganizationsView] List image load failed for: ${org.logo}`);
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            org.name.substring(0, 1)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{org.name}</div>
                                                        <div className="text-[10px] font-mono text-docka-400 mt-1 uppercase">ID: {org.id.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-xs font-medium text-docka-600 dark:text-zinc-400 bg-docka-50/50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg w-fit">
                                                    <Globe size={14} className="text-docka-400" /> {org.slug}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                                                    {org.eventCount || 0} eventos
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(org)}
                                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                                >
                                                    Ver Página
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrganizationsView;
