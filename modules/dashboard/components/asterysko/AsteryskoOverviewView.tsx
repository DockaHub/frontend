import React, { useEffect, useState } from 'react';
import { Scale, FileText, AlertCircle, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../../../../services/api';
import DashboardPage from '../../../../components/DashboardPage';
import { getBackendUrl } from '../../../../services/api';

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

    const metrics = stats?.metrics || { activeProcesses: 0, urgentCount: 0, oppositions: 0, successRate: 0 };
    const recentDispatches = stats?.recentDispatches || [];
    const pendingTasks = stats?.pendingTasks || [];

    return (
        <DashboardPage title="Visão Geral Asterysko" icon={TrendingUp}>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 animate-in fade-in duration-500">
                    <div className="w-8 h-8 border-2 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase text-docka-400 tracking-widest">Sincronizando processos...</span>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mb-10 -mt-2">Monitoramento analítico de processos, prazos e performance jurídica.</p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                                <Scale size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500">Processos Ativos</span>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">{metrics.activeProcesses}</h3>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-l-4 border-l-amber-500 relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400">
                                <Clock size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500">Prazos Próximos</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">{metrics.urgentCount}</h3>
                                {metrics.urgentCount > 0 && (
                                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900 shadow-sm">Urgentes</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-l-4 border-l-purple-500">
                            <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
                                <FileText size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500">Oposições</span>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">{metrics.oppositions}</h3>
                        </div>

                        <div className="bg-emerald-600 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(16,185,129,0.3)] relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4 text-emerald-100 dark:text-zinc-500">
                                    <CheckCircle2 size={18} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Taxa de Sucesso</span>
                                </div>
                                <h3 className="text-3xl font-bold font-mono tracking-tight">{metrics.successRate}%</h3>
                                <p className="text-[10px] font-medium uppercase mt-2 opacity-80 tracking-widest">Registros Concedidos</p>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-125 transition-transform duration-500">
                                <TrendingUp size={120} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* RPI Updates List */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <div className="px-6 py-4 border-b border-docka-50 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/20 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} className="text-docka-400 dark:text-zinc-500" /> últimos Despachos (RPI)
                                </h3>
                                <button className="text-[9px] font-bold uppercase text-docka-400 hover:text-docka-600 tracking-widest transition-colors">Ver Completo</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {recentDispatches.length === 0 ? (
                                    <div className="p-10 text-center text-[10px] font-bold uppercase text-docka-300 tracking-widest italic">Nenhum despacho recente.</div>
                                ) : recentDispatches.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-center p-5 hover:bg-docka-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm shrink-0 ${item.type === 'success' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' :
                                                item.type === 'warning' ? 'bg-amber-500 ring-4 ring-amber-500/10' : 'bg-blue-500 ring-4 ring-blue-500/10'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-docka-900 dark:text-zinc-100 font-bold leading-tight group-hover:text-black dark:group-hover:text-white transition-colors truncate">{item.brand}</p>
                                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1 uppercase font-bold tracking-tight opacity-70">{item.status}</p>
                                        </div>
                                        <ArrowRight size={14} className="text-docka-100 dark:text-zinc-800 group-hover:text-docka-300 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Pendencies List */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                            <div className="px-6 py-4 border-b border-docka-50 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/20 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={14} className="text-amber-500" /> Pendências de Clientes
                                </h3>
                                <button className="text-[9px] font-bold uppercase text-amber-600 hover:text-amber-700 tracking-widest transition-colors">Alertar Todos</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {pendingTasks.length === 0 ? (
                                    <div className="p-10 text-center text-[10px] font-bold uppercase text-docka-300 tracking-widest italic">Tudo em dia com os clientes.</div>
                                ) : pendingTasks.map((task: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-5 hover:bg-docka-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 leading-tight truncate group-hover:text-black dark:group-hover:text-white transition-colors">{task.client}</div>
                                            <div className="text-[10px] text-docka-500 dark:text-zinc-500 mt-1 uppercase font-medium tracking-tight truncate">{task.task}</div>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm uppercase tracking-tighter">
                                            {task.days}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardPage>
    );
};

export default AsteryskoOverviewView;
