
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Wallet } from 'lucide-react';

const UmaChaveFinanceView: React.FC = () => {
  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Gestão de Contas</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Fluxo de arrecadação de inquilinos e quitação de despesas de imóveis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* INFLOW */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"><ArrowDownLeft size={24} /></div>
                        <div>
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg">Arrecadação Total</h3>
                            <p className="text-xs text-docka-500 dark:text-zinc-500">Boletos pagos por inquilinos este mês</p>
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-docka-900 dark:text-zinc-100 mb-2">R$ 185.420,00</div>
                    <div className="w-full bg-docka-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden mb-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '82%' }} />
                    </div>
                    <p className="text-xs text-docka-500 dark:text-zinc-500 text-right">82% dos boletos emitidos foram pagos</p>
                </div>

                {/* OUTFLOW */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full"><ArrowUpRight size={24} /></div>
                        <div>
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg">Destinação de Recursos</h3>
                            <p className="text-xs text-docka-500 dark:text-zinc-500">Repasses e quitação de contas</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">Pagamento de Condomínios</span>
                            <span className="font-bold text-docka-900 dark:text-zinc-100">R$ 42.000,00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">Pagamento de IPTU</span>
                            <span className="font-bold text-docka-900 dark:text-zinc-100">R$ 12.500,00</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-docka-100 dark:border-zinc-800">
                            <span className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase">Repasse a Proprietários</span>
                            <span className="font-bold text-orange-600 dark:text-orange-500 text-lg">R$ 130.920,00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Transações Recentes</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-white dark:bg-zinc-900 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                        {[
                            { desc: 'Boleto 99283 - J. Silva', cat: 'Entrada (Aluguel)', date: 'Hoje, 10:30', val: '+ 4.500,00', type: 'in' },
                            { desc: 'Condomínio Ed. Solar - Apt 42', cat: 'Saída (Conta)', date: 'Hoje, 08:00', val: '- 1.200,00', type: 'out' },
                            { desc: 'Repasse Automático - Maria O.', cat: 'Saída (Repasse)', date: 'Ontem', val: '- 3.000,00', type: 'out' },
                        ].map((t, i) => (
                            <tr key={i} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100">{t.desc}</td>
                                <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'in' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400'}`}>
                                        {t.cat}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">{t.date}</td>
                                <td className={`px-6 py-4 text-right font-mono font-bold ${t.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-docka-900 dark:text-zinc-100'}`}>
                                    {t.val}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default UmaChaveFinanceView;
