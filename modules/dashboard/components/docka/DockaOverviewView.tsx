
import React, { useEffect, useState } from 'react';
import { Activity, Users, Globe, ShieldCheck, DollarSign, Building2, TrendingUp } from 'lucide-react';
import { ORGANIZATIONS } from '../../../../constants';
import { api } from '../../../../services/api';
import { fauvesService } from '../../../../services/fauvesService';

interface DashboardStats {
    revenue: number;
    users: number;
    organizations: number;
    health: string;
    growth: number;
}

interface SystemLog {
    action: string;
    user: string;
    target: string;
    time: string;
    level: string;
    message?: string;
}

interface PortfolioItem {
    slug: string;
    revenue: number;
    status: string;
}

const DockaOverviewView: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const portfolioOrgs = ORGANIZATIONS.filter(o => o.slug !== 'docka');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [dockaResponse, fauvesStats, fauvesUsers] = await Promise.allSettled([
                    api.get('/dashboard/stats'),
                    fauvesService.getStats(),
                    fauvesService.getManagementData('users', 1, 1)
                ]);

                let dockaStats = null;
                let dockaLogs = [];
                let dockaPortfolio = [];

                if (dockaResponse.status === 'fulfilled') {
                    dockaStats = dockaResponse.value.data.stats;
                    dockaLogs = dockaResponse.value.data.logs;
                    dockaPortfolio = dockaResponse.value.data.portfolio;
                } else {
                    console.error('Docka API failed', dockaResponse.reason);
                    setError('Erro ao carregar dados do Docka.');
                }

                let fauvesRevenue = 0;
                let fauvesUserCount = 0;

                if (fauvesStats.status === 'fulfilled') {
                    fauvesRevenue = Number(fauvesStats.value.totalRevenue || fauvesStats.value.revenue || 0);
                }

                if (fauvesUsers.status === 'fulfilled') {
                    fauvesUserCount = (fauvesUsers.value as any).total || (Array.isArray(fauvesUsers.value) ? fauvesUsers.value.length : 0);
                }

                if (dockaStats) {
                    // Update total revenue
                    // Update total revenue and users
                    dockaStats.revenue = (Number(dockaStats.revenue) || 0) + fauvesRevenue;
                    dockaStats.users = (Number(dockaStats.users) || 0) + fauvesUserCount;

                    // Update portfolio
                    const updatedPortfolio = dockaPortfolio.map((p: any) => {
                        if (p.slug === 'fauves') {
                            return { ...p, revenue: fauvesRevenue };
                        }
                        return p;
                    });

                    setStats(dockaStats);
                    setLogs(dockaLogs);
                    setPortfolio(updatedPortfolio);
                }

            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
                setError('Não foi possível carregar os dados atualizados.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Poll every 30 seconds for live-ish updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Agora mesmo';
        if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`;
        return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar transition-colors">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Visão Global</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Painel consolidado de todas as organizações e negócios.</p>
                </div>

                {loading && !stats ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-docka-900 dark:border-zinc-100"></div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}
                        {/* Consolidated Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                            {/* Main Hero Card */}
                            <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4 text-docka-300 dark:text-zinc-500">
                                        <DollarSign size={20} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Receita Total do Grupo</span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-1">{stats ? formatCurrency(stats.revenue) : 'R$ 0,00'}</h3>
                                    <p className="text-sm text-emerald-400 dark:text-emerald-600 font-medium flex items-center gap-1">
                                        <TrendingUp size={12} /> +{stats?.growth}% vs mês anterior
                                    </p>
                                </div>
                                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform dark:text-zinc-900 text-white">
                                    <Globe size={120} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Building2 size={20} /></div>
                                    <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{stats?.organizations || 0} Empresas</span>
                                </div>
                                <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stats?.organizations || 0}</h3>
                                <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Negócios Ativos</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Users size={20} /></div>
                                </div>
                                <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stats?.users || 0}</h3>
                                <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Usuários/Clientes Totais</p>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Activity size={20} /></div>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">100%</span>
                                </div>
                                <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stats?.health || 'Estável'}</h3>
                                <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Saúde do Ecossistema</p>
                            </div>
                        </div>

                        {/* Companies Grid */}
                        <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6">Performance por Empresa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            {portfolioOrgs.map(org => {
                                const orgData = portfolio?.find(p => p.slug === org.slug);
                                const revenue = orgData ? orgData.revenue : 0;
                                const status = orgData ? orgData.status : 'Desconhecido';

                                return (
                                    <div key={org.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 p-6 hover:shadow-md hover:border-docka-300 dark:hover:border-zinc-700 transition-all group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${org.logoColor} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                                                    {org.name.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{org.name}</h3>
                                                    <p className="text-xs text-docka-500 dark:text-zinc-400 capitalize">{org.type}</p>
                                                </div>
                                            </div>
                                            <button className="text-xs font-medium text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 bg-docka-50 dark:bg-zinc-800 px-2 py-1 rounded transition-colors">
                                                Gerenciar
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-docka-500 dark:text-zinc-400 font-medium uppercase">Receita</div>
                                                <div className="font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(revenue)}</div>
                                            </div>
                                            <div className="w-full bg-docka-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${org.slug === 'fauves' ? 'bg-amber-500' : org.slug === 'tokyon' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                    style={{ width: stats && stats.revenue > 0 ? `${Math.min((revenue / stats.revenue) * 100, 100)}%` : '0%' }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-docka-500 dark:text-zinc-400 pt-2 border-t border-docka-50 dark:border-zinc-800">
                                                <span>Status</span>
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {status === 'Operational' ? 'Operacional' : status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* System Logs / Audit */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-docka-400 dark:text-zinc-500" /> Log de Auditoria Global
                                </h3>
                                <button className="text-xs text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 font-medium">Ver tudo</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {logs.length > 0 ? logs.map((log, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${log.level === 'ERROR' ? 'bg-red-500' : log.level === 'WARN' ? 'bg-amber-500' : 'bg-docka-300 dark:bg-zinc-600'}`} />
                                            <span className="text-sm font-medium text-docka-800 dark:text-zinc-200">{log.action || log.message}</span>
                                            <span className="text-xs text-docka-400 dark:text-zinc-500 hidden md:inline">em {log.target}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-docka-700 dark:text-zinc-300">{log.user}</div>
                                            <div className="text-docka-400 dark:text-zinc-500 text-[10px]">{getRelativeTime(log.time)}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-docka-400 dark:text-zinc-500 text-sm">
                                        Nenhum log registrado recentemente.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DockaOverviewView;
