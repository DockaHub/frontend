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
                        {/* Primary Card - Dark Pattern like Docka Global */}
                        <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group transition-all hover:shadow-xl">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4 text-docka-300 dark:text-zinc-500">
                                    <Scale size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Processos Ativos</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-1 tracking-tight">{metrics.activeProcesses}</h3>
                                <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 dark:border-zinc-200 mt-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase text-docka-300 dark:text-zinc-500 tracking-widest">Sincronizado com INPI</span>
                                </div>
                            </div>
                            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500 text-white dark:text-zinc-900">
                                <Scale size={120} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-docka-50 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg"><Clock size={20} /></div>
                                {metrics.urgentCount > 0 && (
                                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-100/50 dark:border-red-900/40">{metrics.urgentCount} Críticos</span>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{metrics.urgentCount}</h3>
                            <p className="text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Prazos Próximos</p>
                            <div className="mt-4 w-full h-1 bg-docka-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((metrics.urgentCount / Math.max(metrics.activeProcesses, 1)) * 100, 100)}%` }} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-docka-50 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg"><FileText size={20} /></div>
                                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">Proteção Digital</span>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{metrics.oppositions}</h3>
                            <p className="text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Oposições Ativas</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md overflow-hidden relative group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle2 size={20} /></div>
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{metrics.successRate}%</div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{metrics.successRate}%</h3>
                            <p className="text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Taxa de Sucesso</p>
                            
                            <div className="mt-4 space-y-1.5">
                                <div className="w-full h-1.5 bg-docka-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${metrics.successRate}%` }} />
                                </div>
                                <div className="flex justify-between text-[8px] font-bold text-docka-400 uppercase tracking-tighter">
                                    <span>Eficiência Operacional</span>
                                    <span>High Fidelity</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* RPI Updates List */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="px-6 py-4 border-b border-docka-50 dark:border-zinc-800 bg-docka-50/10 dark:bg-zinc-800/20 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14} className="text-docka-400 dark:text-zinc-500" /> Últimos Despachos (RPI)
                                </h3>
                                <button className="text-[10px] font-bold uppercase text-docka-400 hover:text-docka-900 transition-colors tracking-tight">Ver Tudo</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {recentDispatches.length === 0 ? (
                                    <div className="p-10 text-center text-[10px] font-bold uppercase text-docka-300 tracking-widest italic">Nenhum despacho recente.</div>
                                ) : recentDispatches.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-center p-5 hover:bg-docka-50 dark:hover:bg-zinc-800/30 transition-all group cursor-default">
                                        <div className="relative">
                                            <div className={`w-1.5 h-1.5 rounded-full z-10 relative ${item.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    item.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                                }`} />
                                            <div className={`absolute inset-[-4px] rounded-full animate-ping opacity-20 ${item.type === 'success' ? 'bg-emerald-400' :
                                                    item.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-docka-900 dark:text-zinc-100 font-bold leading-tight group-hover:text-docka-700 dark:group-hover:text-white transition-colors truncate">{item.brand}</p>
                                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1 uppercase font-bold tracking-tight opacity-70">{item.status}</p>
                                        </div>
                                        <div className="text-[9px] font-bold text-docka-300 dark:text-zinc-600 uppercase tracking-tighter">Hoje</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Pendencies List */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="px-6 py-4 border-b border-docka-50 dark:border-zinc-800 bg-docka-50/10 dark:bg-zinc-800/20 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle size={14} className="text-amber-500" /> Pendências Críticas
                                </h3>
                                <button className="text-[10px] font-bold uppercase text-amber-600 hover:text-amber-700 tracking-tight transition-colors">Alertar</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {pendingTasks.length === 0 ? (
                                    <div className="p-10 text-center text-[10px] font-bold uppercase text-docka-300 tracking-widest italic">Tudo em dia com os clientes.</div>
                                ) : pendingTasks.map((task: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-5 hover:bg-docka-50 dark:hover:bg-zinc-800/30 transition-all group">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 leading-tight truncate transition-colors">{task.client}</div>
                                            <div className="text-[10px] text-docka-500 dark:text-zinc-500 mt-1 uppercase font-bold tracking-tight truncate">{task.task}</div>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm uppercase tracking-tighter">
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
