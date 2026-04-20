
import React, { useEffect, useState } from 'react';
import { TrendingUp, Trophy, Target, DollarSign, CheckCircle2, Star, Zap, ChevronRight, Medal, X, Info, Gauge } from 'lucide-react';
import api from '../../../../services/api';
import DashboardPage from '../../../../components/DashboardPage';

const AsteryskoPerformanceView: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRule, setSelectedRule] = useState<any>(null);

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

    const rules = [
        { 
            id: 'essencial',
            name: 'Essencial', 
            desc: 'Comissão progressiva (100, 125, 150)', 
            color: 'blue',
            details: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">O plano Essencial recompensa o volume de vendas com bônus progressivos por faixa atingida no mês.</p>
                    <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="px-4 py-2">Faixa de Vendas</th>
                                    <th className="px-4 py-2">Comissão Un.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                <tr className={stats.essencialCount <= 10 ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}>
                                    <td className="px-4 py-3">1ª a 10ª venda</td>
                                    <td className="px-4 py-3 text-right">R$ 100,00</td>
                                </tr>
                                <tr className={stats.essencialCount > 10 && stats.essencialCount <= 25 ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}>
                                    <td className="px-4 py-3">11ª a 25ª venda</td>
                                    <td className="px-4 py-3 text-right">R$ 125,00</td>
                                </tr>
                                <tr className={stats.essencialCount > 25 ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600' : 'text-zinc-600 dark:text-zinc-400'}>
                                    <td className="px-4 py-3">A partir da 26ª</td>
                                    <td className="px-4 py-3 text-right">R$ 150,00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg flex items-center gap-3">
                        <Gauge className="text-blue-500" size={20} />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Seu progresso atual: {stats.essencialCount} vendas Essencial</span>
                    </div>
                </div>
            )
        },
        { 
            id: 'premium',
            name: 'Premium', 
            desc: 'R$ 220,00 por venda fixo', 
            color: 'emerald',
            details: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">O plano Premium oferece uma comissão fixa agressiva por cada fechamento, ideal para acelerar seus ganhos.</p>
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                        <DollarSign size={40} className="mb-2" />
                        <span className="text-3xl font-bold">R$ 220,00</span>
                        <span className="text-xs uppercase font-bold tracking-widest mt-1 opacity-60">Por Venda</span>
                    </div>
                    <ul className="text-xs space-y-2 text-zinc-500 dark:text-zinc-400">
                        <li className="flex items-center gap-2">• Sem limite de teto mensal</li>
                        <li className="flex items-center gap-2">• Independente da meta de volume</li>
                    </ul>
                </div>
            )
        },
        { 
            id: 'blindado',
            name: 'Blindado', 
            desc: 'R$ 370,00 por venda fixo', 
            color: 'purple',
            details: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">O plano Blindado é o nosso produto de maior valor e maior recompensa direta para o consultor.</p>
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex flex-col items-center text-purple-600 dark:text-purple-400">
                        <Trophy size={40} className="mb-2" />
                        <span className="text-3xl font-bold">R$ 370,00</span>
                        <span className="text-xs uppercase font-bold tracking-widest mt-1 opacity-60">Por Venda</span>
                    </div>
                    <div className="text-center p-3 border border-dashed border-purple-200 dark:border-purple-800 rounded-xl">
                        <p className="text-[10px] text-purple-500 font-bold uppercase">Indicado para grandes contas</p>
                    </div>
                </div>
            )
        },
        { 
            id: 'bonus',
            name: 'Super Bônus', 
            desc: 'R$ 1.000,00 extra ao atingir 40 vendas totais', 
            color: 'amber',
            details: (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Atingir o Super Bônus é o reconhecimento máximo do escritório para quem mantém constância e volume.</p>
                    <div className="relative h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                            className="absolute inset-y-0 left-0 bg-amber-500 rounded-full transition-all duration-1000"
                            style={{ width: `${stats.bonusProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                        <span>{stats.salesCount} Vendas</span>
                        <span className="text-amber-500">Meta: 40 Vendas</span>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                        <p className="text-2xl font-bold text-amber-600">+ R$ 1.000,00</p>
                        <p className="text-xs text-amber-500 mt-1">Ganha instantaneamente ao bater o volume!</p>
                    </div>
                </div>
            )
        },
    ];

    return (
        <DashboardPage title="Minhas Metas & Performance" icon={TrendingUp}>
            <div className="animate-in fade-in duration-500">
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-10 -mt-2">Acompanhe seu progresso de vendas e comissionamento mensal.</p>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Accumulated Commission Card */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-900/40 dark:to-emerald-800/20 text-white p-6 rounded-xl shadow-[0_4px_20px_-4px_rgba(16,185,129,0.3)] relative overflow-hidden border border-emerald-500/20">
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
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-docka-300 cursor-pointer" onClick={() => setSelectedRule(rules.find(r => r.id === 'bonus'))}>
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
                            <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg">
                                {stats.bonusProgress}%
                            </span>
                        </div>
                    </div>

                    {/* Tier Card */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-docka-300 cursor-pointer" onClick={() => setSelectedRule(rules.find(r => r.id === 'essencial'))}>
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
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Star size={18} className="text-amber-500" /> Regras de Planos e Comissões
                                </h3>
                                <div className="text-[10px] text-docka-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Info size={12} /> Clique para detalhes
                                </div>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {rules.map((item, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setSelectedRule(item)}
                                        className="p-4 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group active:scale-[0.99]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full bg-${item.color}-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]`} />
                                            <div>
                                                <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:translate-x-1 transition-transform">{item.name}</p>
                                                <p className="text-xs text-docka-500 dark:text-zinc-400">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-docka-300 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bonus Card Summary */}
                    <div className="space-y-6">
                        <div className={`p-6 rounded-xl border-2 transition-all ${
                            stats.hasBonus 
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm scale-105' 
                            : 'bg-white dark:bg-zinc-900 border-docka-100 dark:border-zinc-800 text-docka-400 opacity-75'
                        }`}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                    stats.hasBonus ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-docka-100 dark:bg-zinc-800 text-docka-400'
                                }`}>
                                    <Trophy size={32} />
                                </div>
                                <h4 className="text-lg font-bold mb-1">Super Bônus</h4>
                                <p className="text-3xl font-bold mb-4">R$ 1.000,00</p>
                                
                                {stats.hasBonus ? (
                                    <div className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold animate-bounce shadow-sm">
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
                            <p className="text-sm text-docka-400 italic">Nenhum fechamento registrado este mês.</p>
                        ) : stats.recentDeals?.map((deal: any) => (
                            <div key={deal.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm transition-all hover:border-emerald-200 dark:hover:border-emerald-800">
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

            {/* Premium Detail Modal Overlay */}
            {selectedRule && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedRule(null)}
                >
                    <div 
                        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl shadow-sm border border-docka-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`p-6 bg-gradient-to-r ${
                            selectedRule.color === 'blue' ? 'from-blue-600 to-indigo-600' :
                            selectedRule.color === 'emerald' ? 'from-emerald-600 to-teal-600' :
                            selectedRule.color === 'purple' ? 'from-purple-600 to-fuchsia-600' :
                            'from-amber-500 to-orange-500'
                        } text-white flex justify-between items-center relative overflow-hidden`}>
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Detalhes da Regra</p>
                                <h3 className="text-2xl font-bold">{selectedRule.name}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedRule(null)}
                                className="relative z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                            {/* Decorative background shape */}
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {selectedRule.details}
                        </div>

                        {/* Footer */}
                        <div className="px-8 pb-8">
                            <button 
                                onClick={() => setSelectedRule(null)}
                                className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardPage>
    );
};

export default AsteryskoPerformanceView;
