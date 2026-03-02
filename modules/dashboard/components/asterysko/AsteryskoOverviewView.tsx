

import React, { useEffect, useState } from 'react';
import { Scale, FileText, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../../../../services/api';

const AsteryskoOverviewView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/asterysko/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-docka-500">Carregando dados...</div>;

    const metrics = stats?.metrics || { activeProcesses: 0, urgentCount: 0, oppositions: 0, successRate: 0 };
    const recentDispatches = stats?.recentDispatches || [];
    const pendingTasks = stats?.pendingTasks || [];

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Visão Geral Asterysko</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Monitoramento de processos e performance do escritório.</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Scale size={20} /></div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{metrics.activeProcesses}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Processos Ativos</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={20} /></div>
                            {metrics.urgentCount > 0 && (
                                <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">{metrics.urgentCount} Urgentes</span>
                            )}
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{metrics.urgentCount}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Prazos Próximos</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><FileText size={20} /></div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{metrics.oppositions}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Oposições Recebidas</p>
                    </div>
                    <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-emerald-200">
                                <CheckCircle2 size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Taxa de Sucesso</span>
                            </div>
                            <h3 className="text-3xl font-bold">{metrics.successRate}%</h3>
                            <p className="text-sm text-emerald-100 mt-1">Registros Concedidos</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-20">
                            <TrendingUp size={100} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* RPI Updates */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-6 flex items-center gap-2">
                            <FileText size={16} className="text-docka-400 dark:text-zinc-500" />
                            Últimos Despachos (RPI)
                        </h3>
                        <div className="space-y-4">
                            {recentDispatches.length === 0 ? <p className="text-sm text-gray-500">Nenhum despacho recente.</p> : recentDispatches.map((item: any, i: number) => (
                                <div key={i} className="flex gap-4 items-start pb-4 border-b border-docka-50 dark:border-zinc-800 last:border-0 last:pb-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.type === 'success' ? 'bg-emerald-500' :
                                            item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-docka-900 dark:text-zinc-100 font-bold leading-none">{item.brand}</p>
                                        <p className="text-xs text-docka-500 dark:text-zinc-500 mt-1">{item.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pendências de Clientes */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-6 flex items-center gap-2">
                            <AlertCircle size={16} className="text-amber-500" />
                            Pendências de Clientes
                        </h3>
                        <div className="space-y-3">
                            {pendingTasks.length === 0 ? <p className="text-sm text-gray-500">Nenhuma pendência.</p> : pendingTasks.map((task: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-docka-50 dark:bg-zinc-800 rounded-lg border border-docka-100 dark:border-zinc-700">
                                    <div>
                                        <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{task.client}</div>
                                        <div className="text-xs text-docka-500 dark:text-zinc-500">{task.task}</div>
                                    </div>
                                    <span className="text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                        {task.days}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsteryskoOverviewView;
