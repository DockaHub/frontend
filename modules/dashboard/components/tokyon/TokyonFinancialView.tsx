
import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, Plus, Filter, Search, ArrowUpRight, ArrowDownLeft, User, Calendar } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

const MOCK_INVOICES = [
    { id: 'INV-2024-001', client: 'Taurus Armas', amount: 12500.00, status: 'paid', date: '20/02/2026', due: '25/02/2026' },
    { id: 'INV-2024-002', client: 'SulAmérica', amount: 45000.00, status: 'pending', date: '22/02/2026', due: '28/02/2026' },
    { id: 'INV-2024-003', client: 'Körber', amount: 8200.00, status: 'overdue', date: '10/02/2026', due: '15/02/2026' },
    { id: 'INV-2024-004', client: 'Grupo Soma', amount: 15000.00, status: 'paid', date: '05/02/2026', due: '10/02/2026' },
];

const TokyonFinancialView: React.FC = () => {
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Financeiro</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão de fluxo de caixa e faturamento da agência.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors shadow-sm flex items-center gap-2">
                        <Download size={16} /> Relatório
                    </button>
                    <button 
                        onClick={() => setIsNewInvoiceOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Nova Fatura
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><DollarSign size={20} /></div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">+12.5%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ 145k</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Receita Mensal (MRR)</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><FileText size={20} /></div>
                        <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">3 faturas</span>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ 53k</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Pendente / A Receber</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><TrendingDown size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ 32k</h3>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Despesas Operacionais</p>
                </div>

                <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-docka-300 dark:text-zinc-500">
                             <TrendingUp size={20} />
                             <span className="text-xs font-bold uppercase tracking-wider">Margem de Lucro</span>
                        </div>
                        <h3 className="text-3xl font-bold">78%</h3>
                        <p className="text-sm text-docka-400 dark:text-zinc-500 mt-1">Saudável</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                        <DollarSign size={120} />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Invoices List */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Faturas Recentes</h3>
                        <div className="flex gap-2">
                             <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={12} />
                                <input className="pl-7 pr-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md w-32 outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Buscar..." />
                             </div>
                             <button className="p-1 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-700 rounded"><Filter size={14} /></button>
                        </div>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white dark:bg-zinc-900 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Fatura</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {MOCK_INVOICES.map((inv) => (
                                <tr key={inv.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4 font-mono text-xs text-docka-600 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{inv.id}</td>
                                    <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100">{inv.client}</td>
                                    <td className="px-6 py-4 text-docka-900 dark:text-zinc-100 font-bold">R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">{inv.due}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            inv.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                            inv.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                            'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                        }`}>
                                            {inv.status === 'paid' ? 'Pago' : inv.status === 'pending' ? 'Pendente' : 'Atrasado'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cashflow Mini */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-4">Fluxo de Caixa (Fev)</h3>
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"><ArrowUpRight size={16} /></div>
                                     <div>
                                         <div className="text-xs text-docka-500 dark:text-zinc-500">Entradas</div>
                                         <div className="font-bold text-docka-900 dark:text-zinc-100">R$ 145.200</div>
                                     </div>
                                 </div>
                             </div>
                             <div className="w-full h-px bg-docka-100 dark:bg-zinc-800" />
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"><ArrowDownLeft size={16} /></div>
                                     <div>
                                         <div className="text-xs text-docka-500 dark:text-zinc-500">Saídas</div>
                                         <div className="font-bold text-docka-900 dark:text-zinc-100">R$ 32.450</div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-docka-100 dark:border-zinc-800">
                             <div className="flex justify-between items-center">
                                 <span className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase">Saldo Líquido</span>
                                 <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+ R$ 112.750</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-6">
                         <h3 className="font-bold text-orange-900 dark:text-orange-300 text-sm mb-2">Meta Q1 2026</h3>
                         <div className="flex items-end justify-between mb-2">
                             <span className="text-2xl font-bold text-orange-900 dark:text-orange-300">R$ 450k</span>
                             <span className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">68% atingido</span>
                         </div>
                         <div className="w-full h-2 bg-white dark:bg-zinc-800 rounded-full overflow-hidden border border-orange-100 dark:border-orange-900/30">
                             <div className="h-full bg-orange-500 w-[68%]" />
                         </div>
                         <p className="text-xs text-orange-700/80 dark:text-orange-400/80 mt-3">Faltam R$ 144k para bater a meta trimestral.</p>
                    </div>
                </div>
            </div>

            {/* MODAL: NOVA FATURA */}
            <Modal
                isOpen={isNewInvoiceOpen}
                onClose={() => setIsNewInvoiceOpen(false)}
                title="Emitir Nova Fatura"
                size="lg"
                footer={
                    <>
                        <button onClick={() => setIsNewInvoiceOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button onClick={() => setIsNewInvoiceOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm">Emitir e Enviar</button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <select className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100">
                                    <option>Selecione um cliente...</option>
                                    <option>Taurus Armas</option>
                                    <option>SulAmérica</option>
                                    <option>Körber</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Vencimento</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input type="date" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Itens da Fatura</label>
                        <div className="bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg p-3 space-y-3">
                            <div className="flex gap-2">
                                <input className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="Descrição do serviço" />
                                <input className="w-24 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100 text-right" placeholder="R$ 0,00" />
                            </div>
                            <div className="flex gap-2">
                                <input className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="Descrição do serviço" />
                                <input className="w-24 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100 text-right" placeholder="R$ 0,00" />
                            </div>
                            <button className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-800 dark:hover:text-zinc-200 flex items-center gap-1">
                                <Plus size={12} /> Adicionar Item
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Método de Pagamento</label>
                            <select className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-sm outline-none text-docka-900 dark:text-zinc-100">
                                <option>Boleto Bancário</option>
                                <option>PIX</option>
                                <option>Transferência</option>
                            </select>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Total a Pagar</div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">R$ 0,00</div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    </div>
  );
};

export default TokyonFinancialView;
