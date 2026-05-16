import React, { useEffect, useState } from 'react';
import { Scale, FileText, AlertCircle, Clock, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../../../../services/api';
import DashboardPage from '../../../../components/DashboardPage';

const AsteryskoOverviewView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, perfRes] = await Promise.all([
                    api.get('/asterysko/stats'),
                    api.get('/asterysko/performance')
                ]);
                setStats(statsRes.data);
                setPerformance(perfRes.data);
            } catch (error) {
                console.error('Failed to fetch overview data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const metrics = stats?.metrics || { activeProcesses: 0, urgentCount: 0, oppositions: 0, successRate: 0 };
    const recentDispatches = stats?.recentDispatches || [];
    const pendingTasks = stats?.pendingTasks || [];

    return (
        <DashboardPage title="Visão Geral Asterysko" icon={TrendingUp}>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 animate-in fade-in duration-500">
                    <div className="w-8 h-8 border-2 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold uppercase text-docka-400 tracking-wider">Sincronizando processos...</span>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mb-10 -mt-2">Monitoramento analítico de processos, prazos e performance jurídica.</p>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group transition-all hover:shadow-xl">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-docka-300 dark:text-zinc-500">
                                        <Scale size={20} />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Processos Ativos</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        <TrendingUp size={10} /> +2.4%
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold mb-1 tracking-tight">{metrics.activeProcesses}</h3>
                                <div className="flex items-center gap-1.5 pt-2 border-t border-white/10 dark:border-zinc-200 mt-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
                                    <span className="text-xs font-semibold uppercase text-docka-300 dark:text-zinc-500 tracking-wider">Sincronizado com INPI</span>
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
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full border border-red-100/50 dark:border-red-900/40">Crítico</span>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{metrics.urgentCount}</h3>
                            <p className="text-xs font-semibold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Prazos Próximos</p>
                            <div className="mt-4 w-full h-1 bg-docka-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((metrics.urgentCount / Math.max(metrics.activeProcesses, 1)) * 100, 100)}%` }} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-docka-50 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg"><FileText size={20} /></div>
                                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full">Proteção</span>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{metrics.oppositions}</h3>
                            <p className="text-xs font-semibold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Oposições Ativas</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md overflow-hidden relative group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle2 size={20} /></div>
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">+1.2%</div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{metrics.successRate}%</h3>
                            <p className="text-xs font-semibold text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Taxa de Sucesso</p>
                            
                            <div className="mt-4 space-y-1.5">
                                <div className="w-full h-1.5 bg-docka-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${metrics.successRate}%` }} />
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-docka-400 uppercase tracking-wider">
                                    <span>Eficiência Operacional</span>
                                    <span>High Fidelity</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        {/* Process Status Distribution (New Analytics Widget) */}
                        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-docka-100 dark:border-zinc-800 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-wider">Distribuição de Status</h3>
                                    <p className="text-[10px] text-docka-400 font-bold uppercase tracking-widest mt-1">Volume por estágio processual</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-docka-500 uppercase">Concedidos</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-bold text-docka-500 uppercase">Em Exame</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-[10px] font-bold text-docka-500 uppercase">Sobrestando</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between h-48 gap-4 px-2">
                                {/* Simple CSS Bars Chart */}
                                {[
                                    { label: 'Dez', concedidos: 65, exame: 45, sobrest: 10 },
                                    { label: 'Jan', concedidos: 72, exame: 38, sobrest: 15 },
                                    { label: 'Fev', concedidos: 58, exame: 52, sobrest: 12 },
                                    { label: 'Mar', concedidos: 85, exame: 40, sobrest: 8 },
                                    { label: 'Abr', concedidos: 92, exame: 35, sobrest: 14 },
                                    { label: 'Mai', concedidos: 78, exame: 48, sobrest: 20 },
                                ].map((bar, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="w-full flex items-end gap-1 h-full max-w-[40px]">
                                            <div className="flex-1 bg-emerald-500/80 rounded-t-sm group-hover:bg-emerald-500 transition-all duration-500 shadow-sm" style={{ height: `${bar.concedidos}%` }} />
                                            <div className="flex-1 bg-blue-500/80 rounded-t-sm group-hover:bg-blue-500 transition-all duration-500 shadow-sm" style={{ height: `${bar.exame}%` }} />
                                            <div className="flex-1 bg-amber-500/80 rounded-t-sm group-hover:bg-amber-500 transition-all duration-500 shadow-sm" style={{ height: `${bar.sobrest}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-widest">{bar.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Performance Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-blue-100/80 mb-6">
                                    <TrendingUp size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Performance Mensal</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-4xl font-black tracking-tight">{performance?.bonusProgress || 0}%</div>
                                    <div className="text-xs font-bold text-blue-100/60 uppercase tracking-wider">Atingimento de Meta</div>
                                </div>
                            </div>
                            
                            <div className="relative z-10 space-y-4">
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-white transition-all duration-1000" style={{ width: `${performance?.bonusProgress || 0}%` }} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-[10px] font-bold text-blue-100/80 uppercase">Tier Atual: {performance?.currentTier}</div>
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-white text-blue-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">Detalhes</button>
                                </div>
                            </div>

                            {/* Abstract Pattern Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/10 rounded-full -ml-10 -mb-10 blur-xl" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* RPI Updates List */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="px-6 py-4 border-b border-docka-50 dark:border-zinc-800 bg-docka-50/10 dark:bg-zinc-800/20 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                                    <FileText size={14} className="text-docka-400 dark:text-zinc-500" /> Últimos Despachos (RPI)
                                </h3>
                                <button className="text-[10px] font-bold uppercase text-docka-400 hover:text-docka-900 transition-colors tracking-widest border border-docka-200 dark:border-zinc-700 px-2 py-1 rounded">Ver Tudo</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {recentDispatches.length === 0 ? (
                                    <div className="p-10 text-center text-xs font-semibold uppercase text-docka-300 tracking-wider italic">Nenhum despacho recente.</div>
                                ) : recentDispatches.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-center p-5 hover:bg-docka-50/80 dark:hover:bg-zinc-800/40 transition-all group cursor-default">
                                        <div className="relative">
                                            <div className={`w-2 h-2 rounded-full z-10 relative ${item.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    item.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                                }`} />
                                            <div className={`absolute inset-[-6px] rounded-full animate-ping opacity-10 ${item.type === 'success' ? 'bg-emerald-400' :
                                                    item.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-docka-900 dark:text-zinc-100 font-bold leading-tight group-hover:text-black dark:group-hover:text-white transition-colors truncate">{item.brand}</p>
                                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1 uppercase font-bold tracking-widest opacity-80">{item.status}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-docka-300 dark:text-zinc-600 uppercase tracking-widest">Agora</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Pendencies List */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
                            <div className="px-6 py-4 border-b border-docka-50 dark:border-zinc-800 bg-docka-50/10 dark:bg-zinc-800/20 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                                    <AlertCircle size={14} className="text-amber-500" /> Pendências Críticas
                                </h3>
                                <button className="text-[10px] font-bold uppercase text-amber-600 hover:text-amber-700 tracking-widest transition-colors border border-amber-100 dark:border-amber-900/30 px-2 py-1 rounded">Alertar</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {pendingTasks.length === 0 ? (
                                    <div className="p-10 text-center text-xs font-semibold uppercase text-docka-300 tracking-wider italic">Tudo em dia com os clientes.</div>
                                ) : pendingTasks.map((task: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center p-5 hover:bg-docka-50/80 dark:hover:bg-zinc-800/40 transition-all group">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 leading-tight truncate transition-colors group-hover:text-black dark:group-hover:text-white">{task.client}</div>
                                            <div className="text-[10px] text-docka-500 dark:text-zinc-500 mt-1 uppercase font-bold tracking-widest truncate opacity-70">{task.task}</div>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm uppercase tracking-widest">
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
