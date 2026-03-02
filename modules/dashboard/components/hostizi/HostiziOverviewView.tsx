
import React, { useEffect, useState } from 'react';
import { Server, Users, Activity, DollarSign, Cpu, Database, ArrowUpRight, TrendingDown } from 'lucide-react';
import { hostiziService } from '../../../../services/hostiziService';

const HostiziOverviewView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [statsData, nodesData] = await Promise.all([
                    hostiziService.getStats(),
                    hostiziService.getNodes()
                ]);
                setStats(statsData);
                setNodes(nodesData);
            } catch (error) {
                console.error('Falha ao carregar dados do Hostizi:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-docka-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-4 md:p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Command Center</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Monitoramento global da operação Hostizi.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm whitespace-nowrap">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Todos os Sistemas Operacionais
                        </span>
                    </div>
                </div>

                {/* Business KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-docka-300 dark:text-zinc-500">
                                <DollarSign size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">MRR (Recorrente)</span>
                            </div>
                            <h3 className="text-3xl font-bold">{formatCurrency(stats?.mrr || 0)}</h3>
                            <div className="flex items-center gap-2 mt-2 text-emerald-400 dark:text-emerald-600 text-xs font-bold">
                                <ArrowUpRight size={14} /> +8.4% este mês
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={20} /></div>
                            <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">+12 hoje</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stats?.activeClients || 0}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Clientes Ativos</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Server size={20} /></div>
                            <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{nodes.length} Clusters</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stats?.instances || 0}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Instâncias / VPS Rodando</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><TrendingDown size={20} /></div>
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Alerta</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stats?.churnRate || 0}%</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Churn Rate (Cancelamentos)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Infrastructure Monitor */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Activity size={16} className="text-docka-400 dark:text-zinc-500" />
                                Saúde dos Nodes (Infraestrutura)
                            </h3>
                            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Ver Grafana</button>
                        </div>

                        <div className="space-y-6">
                            {nodes.map((node, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 border border-docka-100 dark:border-zinc-800 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                    <div className={`p-2 rounded-lg ${node.cpuUsage > 80 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                                        <Server size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-sm text-docka-900 dark:text-zinc-100 truncate pr-2">{node.name}</span>
                                            <span className={`text-xs font-bold uppercase shrink-0 ${node.cpuUsage > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {node.status === 'ONLINE' ? 'Estável' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex justify-between text-[10px] text-docka-500 dark:text-zinc-500 mb-1">
                                                    <span className="flex items-center gap-1"><Cpu size={10} /> CPU</span>
                                                    <span>{node.cpuUsage}%</span>
                                                </div>
                                                <div className="w-full bg-docka-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${node.cpuUsage > 80 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${node.cpuUsage}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] text-docka-500 dark:text-zinc-500 mb-1">
                                                    <span className="flex items-center gap-1"><Database size={10} /> RAM</span>
                                                    <span>{node.ramUsage}%</span>
                                                </div>
                                                <div className="w-full bg-docka-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${node.ramUsage}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostiziOverviewView;
