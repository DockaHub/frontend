
import React, { useEffect, useState } from 'react';
import { TrendingUp, Trophy, Target, DollarSign, CheckCircle2, Star, Zap, ChevronRight, Medal } from 'lucide-react';
import api from '../../../../services/api';

const AsteryskoPerformanceView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            const response = await api.get('/asterysko/performance');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch performance stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-docka-500">Carregando performance...</div>;

    if (!stats) return <div className="p-8 text-center text-red-500">Erro ao carregar metas.</div>;

    const commissionBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.accumulatedCommission);

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                        Minhas Metas e Performance <Zap size={24} className="text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Acompanhe seu progresso de vendas e comissionamento mensal.</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Accumulated Commission Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-emerald-100">
                                <DollarSign size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Comissão Acumulada</span>
                            </div>
                            <h3 className="text-4xl font-bold mb-1">{commissionBRL}</h3>
                            <p className="text-sm text-emerald-100 flex items-center gap-1">
                                {stats.salesCount} vendas fechadas este mês
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                    </div>

                    {/* Sales Target Card */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-docka-500 dark:text-zinc-400">
                                <Target size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Meta de Bônus (40 Vendas)</span>
                            </div>
                            <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{stats.salesCount}/40</span>
                        </div>
                        
                        <div className="h-3 bg-docka-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stats.bonusProgress}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <p className="text-xs text-docka-500 dark:text-zinc-500 font-medium">
                                {40 - stats.salesCount > 0 ? `Faltam ${40 - stats.salesCount} para o bônus` : 'Meta batida! Parabéns!'}
                            </p>
                            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                {stats.bonusProgress}%
                            </span>
                        </div>
                    </div>

                    {/* Tier Card */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-2 text-docka-500 dark:text-zinc-400 mb-4">
                            <Trophy size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Nível de Conversão</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${
                                stats.currentTier === 'Ouro' ? 'bg-amber-100 text-amber-600' :
                                stats.currentTier === 'Prata' ? 'bg-zinc-100 text-zinc-500' :
                                'bg-orange-100 text-orange-600'
                            }`}>
                                <Medal size={32} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-docka-900 dark:text-zinc-100">{stats.currentTier}</h4>
                                <p className="text-xs text-docka-500 dark:text-zinc-500 font-medium">
                                    {stats.essencialCount} vendas Essencial
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Progression Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-docka-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-6 border-b border-docka-100 dark:border-zinc-800">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Star size={18} className="text-amber-500" /> Regras de Planos e Comissões
                                </h3>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {[
                                    { name: 'Essencial', desc: 'Comissão progressiva (100, 125, 150)', color: 'blue' },
                                    { name: 'Premium', desc: 'R$ 220,00 por venda fixo', color: 'emerald' },
                                    { name: 'Blindado', desc: 'R$ 370,00 por venda fixo', color: 'purple' },
                                    { name: 'Super Bônus', desc: 'R$ 1.000,00 extra ao atingir 40 vendas totais', color: 'amber' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                                            <div>
                                                <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{item.name}</p>
                                                <p className="text-xs text-docka-500 dark:text-zinc-500">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-docka-300" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bonus Card */}
                    <div className="space-y-6">
                        <div className={`p-6 rounded-2xl border-2 transition-all ${
                            stats.hasBonus 
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-lg scale-105' 
                            : 'bg-white dark:bg-zinc-900 border-docka-100 dark:border-zinc-800 text-docka-400 opacity-75'
                        }`}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    stats.hasBonus ? 'bg-amber-500 text-white' : 'bg-docka-100 dark:bg-zinc-800 text-docka-400'
                                }`}>
                                    <Trophy size={32} />
                                </div>
                                <h4 className="text-lg font-bold mb-1">Super Bônus</h4>
                                <p className="text-3xl font-black mb-4">R$ 1.000,00</p>
                                
                                {stats.hasBonus ? (
                                    <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-xs font-bold animate-pulse">
                                        <CheckCircle2 size={14} /> BÔNUS CONQUISTADO!
                                    </div>
                                ) : (
                                    <div className="text-xs font-medium space-y-1">
                                        <p>Bata 40 vendas totais no mês</p>
                                        <p className="text-[10px] opacity-60">Válido para qualquer plano</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Feed */}
                <div className="mt-8">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" /> Fechamentos Recentes
                    </h3>
                    <div className="space-y-3">
                        {stats.recentDeals?.length === 0 ? (
                            <p className="text-sm text-docka-400">Nenhum fechamento registrado este mês.</p>
                        ) : stats.recentDeals?.map((deal: any) => (
                            <div key={deal.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{deal.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">{deal.plan}</span>
                                            <span className="text-[10px] text-docka-400 dark:text-zinc-500">{deal.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">
                                        + {deal.plan === 'ESSENCIAL' ? 'Progressivo' : deal.plan === 'PREMIUM' ? 'R$ 220,00' : 'R$ 370,00'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsteryskoPerformanceView;
