
import React from 'react';
import { DollarSign, CreditCard, TrendingUp, Download, PieChart } from 'lucide-react';

const DockaBillingView: React.FC = () => {
  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Faturamento Global</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Consolidado financeiro de todas as empresas do grupo.</p>
            </div>

            {/* Global KPI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg">
                    <p className="text-docka-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Receita Recorrente Anual (ARR)</p>
                    <h3 className="text-3xl font-bold">R$ 4.562.400</h3>
                    <div className="mt-4 flex gap-2">
                        <span className="bg-emerald-500/20 text-emerald-300 dark:text-emerald-700 px-2 py-1 rounded text-xs font-bold">+18% YTD</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <p className="text-docka-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Custo Operacional Total</p>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ 820.000</h3>
                    <p className="text-xs text-docka-400 dark:text-zinc-500 mt-2">Inclui infraestrutura, pessoal e licenças.</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                    <p className="text-docka-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Lucro Líquido (Mês Atual)</p>
                    <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">R$ 312.000</h3>
                    <p className="text-xs text-docka-400 dark:text-zinc-500 mt-2">Margem de 65%</p>
                </div>
            </div>

            {/* Breakdown by Company */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-6 flex items-center gap-2">
                        <PieChart size={16} /> Receita por Unidade de Negócio
                    </h3>
                    <div className="space-y-5">
                        {[
                            { name: 'Tokyon (Agência High-Ticket)', val: 'R$ 145k', pct: 45, color: 'bg-red-500' },
                            { name: 'Fauves (Eventos)', val: 'R$ 110k', pct: 30, color: 'bg-amber-600' },
                            { name: 'Uma Chave (Imobiliária)', val: 'R$ 85k', pct: 20, color: 'bg-orange-500' },
                            { name: 'Outros (SaaS)', val: 'R$ 40k', pct: 5, color: 'bg-docka-400 dark:bg-zinc-600' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-docka-700 dark:text-zinc-300 font-medium">{item.name}</span>
                                    <span className="text-docka-900 dark:text-zinc-100 font-bold">{item.val}</span>
                                </div>
                                <div className="w-full bg-docka-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-6 flex items-center gap-2">
                        <CreditCard size={16} /> Próximos Recebimentos (Consolidado)
                    </h3>
                    <div className="space-y-4">
                        {[
                            { client: 'Taurus Armas', org: 'Tokyon', date: '25/02', amount: 'R$ 12.500' },
                            { client: 'Grupo Soma', org: 'Asterysko', date: '26/02', amount: 'R$ 1.800' },
                            { client: 'Venda de Ingressos (Repasse)', org: 'Fauves', date: '28/02', amount: 'R$ 45.200' },
                        ].map((rec, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border border-docka-100 dark:border-zinc-800 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                <div>
                                    <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{rec.client}</div>
                                    <div className="text-xs text-docka-500 dark:text-zinc-500 flex items-center gap-2">
                                        <span className="font-medium text-docka-700 dark:text-zinc-400">{rec.org}</span>
                                        <span>•</span>
                                        <span>{rec.date}</span>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{rec.amount}</div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 border border-dashed border-docka-300 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-xs font-bold rounded hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                        Ver Fluxo de Caixa Completo
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DockaBillingView;
