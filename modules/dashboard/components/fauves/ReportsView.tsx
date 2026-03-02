import React, { useState, useEffect } from 'react';
import {
    BarChart3, Download, Calendar, ArrowUpRight, ArrowDownRight,
    DollarSign, Ticket, Users, ShoppingCart, ChevronDown,
    Loader2, TrendingUp
} from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';

const MetricCard = ({ title, value, subText, icon: Icon, trend, colorClass }: any) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm transition-all hover:border-docka-300 dark:hover:border-zinc-700 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend.type === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trend.type === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trend.value}%
                </div>
            )}
        </div>
        <div>
            <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{value}</h3>
            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 mt-0.5">{title}</p>
            <p className="text-xs text-docka-400 dark:text-zinc-500 mt-0.5">{subText}</p>
        </div>
    </div>
);

const ReportsView: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [ranking, setRanking] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [metrics, rankingData] = await Promise.all([
                    fauvesService.getStats(),
                    fauvesService.getRanking()
                ]);
                setStats(metrics);
                setRanking(rankingData);
            } catch (error) {
                console.error("Failed to load reports data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-docka-400 animate-in fade-in">
                <Loader2 size={40} className="animate-spin mb-4" />
                <p className="text-sm font-medium">Gerando relatórios e análises...</p>
            </div>
        );
    }

    const displayStats = stats || {
        totalRevenue: 0,
        salesToday: 0,
        totalOrders: 0,
        totalTickets: 0,
        totalUsers: 0
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">
                        Relatórios & Análises
                    </h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Acompanhe métricas e performance da plataforma</p>
                </div>
                <button className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
                    <Download size={16} /> Exportar PDF
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm mb-10 flex items-center gap-4 overflow-x-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-docka-50 dark:bg-zinc-800 rounded-lg border border-docka-100 dark:border-zinc-700 min-w-fit">
                    <Calendar size={14} className="text-docka-400" />
                    <select className="bg-transparent border-none text-xs font-bold text-docka-600 dark:text-zinc-400 outline-none pr-6 appearance-none cursor-pointer">
                        <option>Últimos 30 dias</option>
                        <option>Últimos 7 dias</option>
                        <option>Este mês</option>
                        <option>Ano atual</option>
                        <option>Personalizado</option>
                    </select>
                    <ChevronDown size={12} className="text-docka-400 -ml-5 pointer-events-none" />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard
                    title="Receita Total"
                    value={formatCurrency(displayStats.totalRevenue || 0)}
                    subText={`vs R$ ${(displayStats.totalRevenue * 0.8).toFixed(2)} anterior`}
                    icon={DollarSign}
                    trend={{ type: 'down', value: '100' }}
                    colorClass="text-emerald-600"
                />
                <MetricCard
                    title="Pedidos"
                    value={displayStats.totalOrders || 0}
                    subText="vs 1 anterior"
                    icon={ShoppingCart}
                    trend={{ type: 'down', value: '100' }}
                    colorClass="text-indigo-600"
                />
                <MetricCard
                    title="Ingressos Vendidos"
                    value={displayStats.totalTickets || 1}
                    subText="vs 5 anterior"
                    icon={Ticket}
                    trend={{ type: 'down', value: '80' }}
                    colorClass="text-purple-600"
                />
                <MetricCard
                    title="Novos Usuários"
                    value={displayStats.totalUsers || 1}
                    subText="vs 9 anterior"
                    icon={Users}
                    trend={{ type: 'down', value: '88.9' }}
                    colorClass="text-emerald-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Receita ao Longo do Tempo</h3>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <div className="w-2 h-2 rounded-full bg-docka-100 dark:bg-zinc-800"></div>
                        </div>
                    </div>
                    <div className="p-12 flex-1 flex flex-col items-center justify-center bg-docka-50/20 dark:bg-zinc-900/40 min-h-[350px]">
                        <BarChart3 size={48} className="text-docka-200 dark:text-zinc-800 mb-4 opacity-50" />
                        <p className="text-sm font-bold text-docka-400 dark:text-zinc-600 text-center max-w-[200px]">
                            Gráfico de receita apareceria aqui
                        </p>
                        <p className="text-[10px] text-docka-300 dark:text-zinc-700 mt-2 uppercase tracking-widest font-bold">Integração com biblioteca de gráficos necessária</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Ingressos Vendidos</h3>
                        <div className="flex gap-2 text-[10px] font-bold text-docka-400">
                            <span>DIÁRIO</span>
                            <span className="text-indigo-600">SEMANAL</span>
                        </div>
                    </div>
                    <div className="p-12 flex-1 flex flex-col items-center justify-center bg-indigo-50/10 dark:bg-indigo-900/10 min-h-[350px]">
                        <TrendingUp size={48} className="text-indigo-100 dark:text-indigo-900/30 mb-4" />
                        <p className="text-sm font-bold text-docka-400 dark:text-zinc-600 text-center max-w-[200px]">
                            Gráfico de vendas apareceria aqui
                        </p>
                        <p className="text-[10px] text-docka-300 dark:text-zinc-700 mt-2 uppercase tracking-widest font-bold">Integração com biblioteca de gráficos necessária</p>
                    </div>
                </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 bg-docka-50 dark:bg-zinc-800/50 border-b border-docka-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Top 5 Eventos</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr className="text-left">
                                <th className="px-6 py-4">Evento</th>
                                <th className="px-6 py-4 text-center">Ingressos</th>
                                <th className="px-6 py-4 text-right">Receita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            <tr className="text-xs text-docka-400 italic">
                                <td colSpan={3} className="px-6 py-12 text-center">Nenhum dado disponível no período selecionado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 bg-docka-50 dark:bg-zinc-800/50 border-b border-docka-100 dark:border-zinc-800">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Top 5 Organizações</h3>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr className="text-left">
                                <th className="px-6 py-4">Organização</th>
                                <th className="px-6 py-4 text-center">Eventos</th>
                                <th className="px-6 py-4 text-right">Receita</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {ranking.length === 0 ? (
                                <tr className="text-xs text-docka-400 italic">
                                    <td colSpan={3} className="px-6 py-12 text-center">Carregando ranking...</td>
                                </tr>
                            ) : (
                                ranking.slice(0, 5).map((org, i) => (
                                    <tr key={i} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-docka-900 dark:text-zinc-100">{org.name}</td>
                                        <td className="px-6 py-4 text-center text-docka-600 dark:text-zinc-400">{org.eventCount || 0}</td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatCurrency(Number(org.value || 0))}</td>
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

export default ReportsView;
