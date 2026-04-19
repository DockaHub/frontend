
import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, PieChart, Activity } from 'lucide-react';
import { api } from '../../../../services/api';

interface Stats {
    revenue: number;
    opex: number;
    arr: number;
    netProfit: number;
    growth: number;
    organizations: number;
}

interface PortfolioItem {
    id: string;
    name: string;
    slug: string;
    revenue: number;
    iconSettings: {
        logo?: string;
        svgIcon?: string;
        iconBg?: string;
        iconColor?: string;
        iconScale?: number;
        logoColor?: string;
    };
}

interface PendingReceivable {
    id: string;
    client: string;
    org: string;
    amount: number;
    dueDate: string;
}

const DockaBillingView: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [receivables, setReceivables] = useState<PendingReceivable[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await api.get('/dashboard/stats');
            setStats(res.data.stats);
            setPortfolio(res.data.portfolio);
            setReceivables(res.data.pendingReceivables || []);
        } catch (error) {
            console.error('Failed to fetch billing data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-docka-50 dark:bg-zinc-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-docka-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-docka-500 font-bold text-sm">Carregando Command Center...</p>
            </div>
        </div>
    );

import DashboardPage from '../../../../components/DashboardPage';

const DockaBillingView: React.FC = () => {
    // ... (mantenha estados e lógicas iguais)

    if (loading) return (
        <DashboardPage title="Faturamento Global" icon={DollarSign}>
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-10 h-10 border-4 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-docka-500 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Sincronizando finanças...</p>
            </div>
        </DashboardPage>
    );

    return (
        <DashboardPage 
            title="Faturamento Global" 
            icon={DollarSign}
            subtitle="Consolidado financeiro de todas as empresas do grupo."
        >
            <div className="animate-in fade-in duration-500">
                {/* Global KPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                        <p className="text-docka-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3 relative z-10">Receita Recorrente Anual (ARR)</p>
                        <h3 className="text-3xl font-bold relative z-10">{formatCurrency(stats?.arr || 0)}</h3>
                        <div className="mt-4 flex gap-2 relative z-10">
                            <span className="bg-emerald-500/20 text-emerald-300 dark:text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                {stats?.growth && stats.growth >= 0 ? '+' : ''}{stats?.growth || 0}% MoM
                            </span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                            <TrendingUp size={100} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
                        <p className="text-docka-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3">Custo Operacional Total</p>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(stats?.opex || 0)}</h3>
                        <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 mt-2 uppercase tracking-tight">Baseado em lançamentos de holding.</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
                        <p className="text-docka-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3">Lucro Líquido (Mês)</p>
                        <h3 className={`text-3xl font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {formatCurrency(stats?.netProfit || 0)}
                        </h3>
                        <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 mt-2 uppercase tracking-tight">Resultado real consolidado.</p>
                    </div>
                </div>

                {/* Breakdown by Company */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-8">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                            <PieChart size={16} className="text-docka-400" /> Receita por Unidade
                        </h3>
                        <div className="space-y-6">
                            {portfolio.map((org) => (
                                <div key={org.id} className="group">
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <div className="flex items-center gap-3">
                                            {org.iconSettings?.logo ? (
                                                <img src={org.iconSettings.logo} alt={org.name} className="w-8 h-8 rounded p-1 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-800 shadow-sm object-contain" />
                                            ) : org.iconSettings?.svgIcon ? (
                                                <div 
                                                    className="w-8 h-8 rounded flex items-center justify-center shadow-sm overflow-hidden border border-docka-100 dark:border-zinc-800"
                                                    style={{ 
                                                        backgroundColor: org.iconSettings.iconBg || '#f4f4f5',
                                                        color: org.iconSettings.iconColor || '#18181b'
                                                    }}
                                                >
                                                    <div 
                                                        className="w-full h-full p-1.5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:block"
                                                        style={{ transform: `scale(${org.iconSettings.iconScale || 1})` }}
                                                        dangerouslySetInnerHTML={{ __html: org.iconSettings.svgIcon }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 bg-docka-100 dark:bg-zinc-800 rounded flex items-center justify-center font-bold text-[10px] text-docka-900 dark:text-zinc-100 uppercase">
                                                    {org.name.substring(0, 1)}
                                                </div>
                                            )}
                                            <span className="text-docka-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-tight">{org.name}</span>
                                        </div>
                                        <span className="text-docka-900 dark:text-zinc-100 font-bold font-mono">{formatCurrency(org.revenue)}</span>
                                    </div>
                                    <div className="w-full bg-docka-50 dark:bg-zinc-800 h-2 rounded-full overflow-hidden border border-docka-100/50 dark:border-transparent">
                                        <div 
                                            className="h-full bg-docka-900 dark:bg-zinc-100 transition-all duration-700 ease-out" 
                                            style={{ width: stats && stats.revenue > 0 ? `${Math.min((org.revenue / stats.revenue) * 100, 100)}%` : '0%' }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-8">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-xs uppercase tracking-widest mb-8 flex items-center gap-2">
                            <CreditCard size={16} className="text-docka-400" /> Próximos Recebimentos
                        </h3>
                        <div className="space-y-4">
                            {receivables.map((rec) => (
                                <div key={rec.id} className="flex justify-between items-center p-4 border border-docka-100 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 hover:border-docka-200 transition-all group">
                                    <div>
                                        <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm truncate max-w-[180px]">{rec.client}</div>
                                        <div className="text-[10px] text-docka-500 dark:text-zinc-500 flex items-center gap-2 font-bold uppercase mt-1">
                                            <span className="text-docka-700 dark:text-zinc-400">{rec.org}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{new Date(rec.dueDate).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatCurrency(rec.amount)}</div>
                                </div>
                            ))}
                            {receivables.length === 0 && (
                                <div className="text-center py-12">
                                    <Activity className="mx-auto text-docka-200 dark:text-zinc-800 mb-4" size={32} />
                                    <p className="text-docka-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest">Sem faturamentos pendentes.</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-8 py-3 border-2 border-dashed border-docka-200 dark:border-zinc-800 text-docka-500 dark:text-zinc-500 text-[10px] font-bold rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800 hover:border-docka-300 transition-all uppercase tracking-widest">
                            Ver Fluxo de Caixa Completo
                        </button>
                    </div>
                </div>
            </div>
export default DockaBillingView;
