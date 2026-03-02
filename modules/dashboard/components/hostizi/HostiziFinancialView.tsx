
import React, { useState } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Users, FileText, Search, Filter, Download, Send, CheckCircle2, X, Plus, Calendar, Clock, Trash2, Mail } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

// Mock Data
const RECENT_PAYMENTS = [
    { id: 'TRX-9981', client: 'Tokyon Systems', desc: 'Renovação Servidor Dedicado', amount: 'R$ 1.250,00', date: 'Hoje, 10:42', status: 'confirmed', items: [{ desc: 'Servidor Dedicado XL - Fev/2026', price: 'R$ 1.250,00' }] },
    { id: 'TRX-9980', client: 'Padaria do João', desc: 'Hospedagem Compartilhada (Mensal)', amount: 'R$ 29,90', date: 'Hoje, 09:15', status: 'confirmed', items: [{ desc: 'Plano Shared Starter', price: 'R$ 29,90' }] },
    { id: 'TRX-9979', client: 'Fauves Events', desc: 'Registro de Domínio (fauves.event)', amount: 'R$ 89,00', date: 'Ontem', status: 'confirmed', items: [{ desc: 'Registro Domínio .event (1 ano)', price: 'R$ 89,00' }] },
];

const OVERDUE_INVOICES = [
    { id: 'INV-4021', client: 'Blog Pessoal Ana', amount: 'R$ 29,90', due: 'Há 5 dias', days: 5, status: 'overdue', items: [{ desc: 'Hospedagem Shared - Jan/2026', price: 'R$ 29,90' }] },
    { id: 'INV-4005', client: 'E-commerce Shoes', amount: 'R$ 149,90', due: 'Há 12 dias', days: 12, status: 'overdue', items: [{ desc: 'VPS Cloud Start', price: 'R$ 149,90' }] },
];

const HostiziFinancialView: React.FC = () => {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Helper to normalize data for the modal
    const handleOpenInvoice = (item: any, type: 'payment' | 'invoice') => {
        setSelectedInvoice({
            ...item,
            type,
            dueDate: type === 'invoice' ? item.due : item.date, // Simplification
            issueDate: '01/02/2026', // Mock
            status: type === 'payment' ? 'paid' : 'overdue'
        });
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Faturamento & Receita</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão financeira da empresa Hostizi (Recebíveis de Clientes).</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Nova Fatura
                    </button>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider">Receita Mensal (MRR)</p>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 mt-1">R$ 142k</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider">Ticket Médio (ARPU)</p>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 mt-1">R$ 114</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider">Inadimplência</p>
                            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">R$ 4.2k</h3>
                            <p className="text-xs text-red-400 mt-1">3.2% da receita</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Últimos Pagamentos Recebidos</h3>
                            <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Ver Extrato</button>
                        </div>
                        <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {RECENT_PAYMENTS.map((trx, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleOpenInvoice(trx, 'payment')}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            <DollarSign size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{trx.client}</p>
                                            <p className="text-xs text-docka-500 dark:text-zinc-500">{trx.desc}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{trx.amount}</p>
                                        <p className="text-[10px] text-docka-400 dark:text-zinc-600">{trx.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Overdue List */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-red-50/50 dark:bg-red-900/10 flex justify-between items-center">
                            <h3 className="font-bold text-red-900 dark:text-red-300 text-sm flex items-center gap-2">
                                <AlertTriangle size={16} /> Em Atraso
                            </h3>
                        </div>
                        <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {OVERDUE_INVOICES.map((inv, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleOpenInvoice(inv, 'invoice')}
                                    className="px-6 py-4 hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-docka-900 dark:text-zinc-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">{inv.client}</span>
                                        <span className="text-sm font-bold text-docka-700 dark:text-zinc-300">{inv.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-docka-500 dark:text-zinc-500 font-mono">{inv.id}</span>
                                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                                            {inv.due}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL: INVOICE DETAILS */}
                {selectedInvoice && (
                    <Modal
                        isOpen={!!selectedInvoice}
                        onClose={() => setSelectedInvoice(null)}
                        title=""
                        size="lg"
                    >
                        <div className="flex flex-col h-full -mt-2">
                            {/* Header Invoice */}
                            <div className="flex justify-between items-start border-b border-docka-100 dark:border-zinc-800 pb-6 mb-6">
                                <div className="flex gap-4">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${selectedInvoice.status === 'paid' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedInvoice.id}</h2>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${selectedInvoice.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                                }`}>
                                                {selectedInvoice.status === 'paid' ? 'Pago' : 'Atrasado'}
                                            </span>
                                        </div>
                                        <p className="text-docka-500 dark:text-zinc-400 text-sm">Fatura de Serviço</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-docka-400 dark:text-zinc-500 uppercase font-bold mb-1">Valor Total</div>
                                    <div className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{selectedInvoice.amount}</div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Cliente</h4>
                                    <div className="space-y-1">
                                        <p className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{selectedInvoice.client}</p>
                                        <p className="text-xs text-docka-500 dark:text-zinc-400">CNPJ: 00.000.000/0001-00</p>
                                        <p className="text-xs text-docka-500 dark:text-zinc-400">cliente@email.com</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Emissão</h4>
                                        <p className="text-sm font-medium text-docka-700 dark:text-zinc-300">{selectedInvoice.issueDate}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Vencimento</h4>
                                        <p className={`text-sm font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-docka-700 dark:text-zinc-300'}`}>
                                            {selectedInvoice.dueDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Itens da Fatura</h4>
                                <div className="border border-docka-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-docka-50 dark:bg-zinc-800 text-docka-500 dark:text-zinc-500 font-medium text-xs">
                                            <tr>
                                                <th className="px-4 py-2">Descrição</th>
                                                <th className="px-4 py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-docka-100 dark:divide-zinc-800">
                                            {selectedInvoice.items?.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-docka-700 dark:text-zinc-300">{item.desc}</td>
                                                    <td className="px-4 py-3 text-right font-medium text-docka-900 dark:text-zinc-100">{item.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-docka-50 dark:bg-zinc-800 rounded-xl p-4 border border-docka-100 dark:border-zinc-700 mb-6">
                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Histórico</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-center">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="text-xs text-docka-600 dark:text-zinc-400">Fatura Criada <span className="text-docka-400 dark:text-zinc-600">- 01/02/2026 08:00</span></span>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                        <span className="text-xs text-docka-600 dark:text-zinc-400">Enviada por E-mail <span className="text-docka-400 dark:text-zinc-600">- 01/02/2026 08:05</span></span>
                                    </div>
                                    {selectedInvoice.status === 'paid' && (
                                        <div className="flex gap-3 items-center">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span className="text-xs text-docka-600 dark:text-zinc-400">Pagamento Confirmado (PIX) <span className="text-docka-400 dark:text-zinc-600">- {selectedInvoice.date}</span></span>
                                        </div>
                                    )}
                                    {selectedInvoice.status === 'overdue' && (
                                        <div className="flex gap-3 items-center">
                                            <Clock size={14} className="text-red-500" />
                                            <span className="text-xs text-red-600 dark:text-red-400 font-bold">Vencida há {selectedInvoice.days} dias</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-auto pt-6 border-t border-docka-100 dark:border-zinc-800 flex gap-3 justify-end">
                                {selectedInvoice.status === 'overdue' && (
                                    <button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                        <Mail size={16} /> Reenviar Cobrança
                                    </button>
                                )}
                                <button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                    <Download size={16} /> Baixar PDF
                                </button>
                                {selectedInvoice.status === 'overdue' && (
                                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm">
                                        Cancelar Serviço
                                    </button>
                                )}
                            </div>
                        </div>
                    </Modal>
                )}

                {/* MODAL: CREATE INVOICE */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Emitir Nova Fatura Avulsa"
                    size="lg"
                    footer={
                        <>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm">Emitir Fatura</button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente</label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600">
                                    <option>Selecione...</option>
                                    <option>Tokyon Systems</option>
                                    <option>Padaria do João</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Vencimento</label>
                                <input type="date" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Item da Fatura</label>
                            <div className="flex gap-3">
                                <input className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Descrição (ex: Setup Inicial)" />
                                <input className="w-32 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-right" placeholder="R$ 0,00" />
                            </div>
                            <button className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                <Plus size={12} /> Adicionar outro item
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Método de Pagamento</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600">
                                <option>PIX (QR Code)</option>
                                <option>Boleto Bancário</option>
                                <option>Cartão de Crédito</option>
                            </select>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default HostiziFinancialView;
