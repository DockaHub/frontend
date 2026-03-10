import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, Plus, Filter, Search, ArrowUpRight, ArrowDownLeft, User, Calendar, Tag, Trash2, Upload, Link, AlertCircle, ChevronDown } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';

interface InvoiceItem {
    description: string;
    amount: number;
}

interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
}

const AsteryskoFinancialView: React.FC = () => {
    const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    // Client Selector State
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    // Form State
    const [newInvoice, setNewInvoice] = useState({
        clientId: '',
        dueDate: '',
        type: 'SERVICE',
        paymentMethod: 'PIX',
        description: '',
        officialBoletoCode: '',
    });
    const [items, setItems] = useState<InvoiceItem[]>([{ description: '', amount: 0 }]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        console.log("AsteryskoFinancialView mounted");
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, invoicesRes, clientsRes] = await Promise.all([
                api.get('/asterysko/stats'),
                api.get('/asterysko/financial/invoices'),
                api.get('/asterysko/clients')
            ]);

            setStats(statsRes.data);
            setInvoices(invoicesRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            console.error('Failed to fetch financial data', error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar dados financeiros.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', amount: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: field === 'amount' ? Number(value) : value };
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    const handleEmitInvoice = async () => {
        if (!newInvoice.clientId || !newInvoice.dueDate || items.some(i => !i.description || i.amount <= 0)) {
            addToast({ type: 'error', title: 'Campos obrigatórios', message: 'Preencha o cliente, vencimento e pelo menos um item com valor.' });
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('clientId', newInvoice.clientId);
            formData.append('dueDate', newInvoice.dueDate);
            formData.append('type', newInvoice.type);
            formData.append('paymentMethod', newInvoice.paymentMethod);
            formData.append('description', newInvoice.description);
            formData.append('amount', totalAmount.toString());
            formData.append('items', JSON.stringify(items));

            if (newInvoice.type === 'TAX' && newInvoice.officialBoletoCode) {
                formData.append('officialBoletoCode', newInvoice.officialBoletoCode);
            }

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            await api.post('/asterysko/financial/invoices', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            addToast({ type: 'success', title: 'Sucesso', message: 'Fatura emitida com sucesso!' });
            setIsNewInvoiceOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Error emitting invoice:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível emitir a fatura.' });
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewInvoice({
            clientId: '',
            dueDate: '',
            type: 'SERVICE',
            paymentMethod: 'PIX',
            description: '',
            officialBoletoCode: '',
        });
        setItems([{ description: '', amount: 0 }]);
        setSelectedFile(null);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await api.put(`/asterysko/financial/invoices/${id}/status`, { status: newStatus });
            addToast({ type: 'success', title: 'Status Atualizado', message: 'Fatura atualizada com sucesso.' });
            fetchData();
            setSelectedInvoice(null);
        } catch (error) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar status.' });
        }
    };

    const handleDeleteInvoice = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.')) return;

        try {
            await api.delete(`/asterysko/financial/invoices/${id}`);
            addToast({ type: 'success', title: 'Sucesso', message: 'Fatura excluída com sucesso.' });
            fetchData();
            setSelectedInvoice(null);
        } catch (error) {
            console.error('Error deleting invoice:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível excluir a fatura.' });
        }
    };

    const rawMetrics = stats?.metrics || {};
    const metrics = {
        ...rawMetrics,
        monthlyRevenue: Number(rawMetrics.monthlyRevenue || 0),
        receivables: Number(rawMetrics.receivables || 0),
        pendingPaymentsCount: Number(rawMetrics.pendingPaymentsCount || 0),
        successRate: Number(rawMetrics.successRate || 0)
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-docka-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Financeiro Asterysko</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão de honorários, taxas INPI e faturamento.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors shadow-sm flex items-center gap-2">
                            <Download size={16} /> Relatório
                        </button>
                        <button
                            onClick={() => setIsNewInvoiceOpen(true)}
                            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
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
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">+0%</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ {(Number(metrics?.monthlyRevenue) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Receita Mensal</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><FileText size={20} /></div>
                            <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{(invoices || []).filter(i => i?.status === 'PENDING').length} faturas</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ {(Number(metrics?.receivables) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">A Receber</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><TrendingDown size={20} /></div>
                            <span className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-full">{Number(metrics?.pendingPaymentsCount) || 0} pendentes</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ {((Number(metrics?.pendingPaymentsCount) || 0) * 300).toLocaleString('pt-BR')}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500 mt-1">Taxas INPI (Provisão)</p>
                    </div>

                    <div className="bg-blue-600 dark:bg-blue-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-blue-100">
                                <TrendingUp size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Eficiência</span>
                            </div>
                            <h3 className="text-3xl font-bold">{Number(metrics?.successRate) || 0}%</h3>
                            <p className="text-sm text-blue-100 mt-1">Processos Concedidos</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Invoices List */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Faturas de Clientes</h3>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={12} />
                                    <input className="pl-7 pr-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md w-32 outline-none focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Buscar..." />
                                </div>
                                <button className="p-1 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-700 rounded"><Filter size={14} /></button>
                            </div>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white dark:bg-zinc-900 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Valor</th>
                                    <th className="px-6 py-4">Vencimento</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {invoices.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        onClick={() => setSelectedInvoice(inv)}
                                        className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${inv.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                inv.status === 'PENDING' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                                    'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                                }`}>
                                                {inv.status === 'PAID' ? 'Pago' : inv.status === 'PENDING' ? 'Pendente' : 'Atrasado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${inv.type === 'TAX' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'}`}>
                                                {inv.type === 'TAX' ? 'TAXA INPI' : 'SERVIÇO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100">{inv.clientName}</td>
                                        <td className="px-6 py-4 text-docka-900 dark:text-zinc-100 font-bold">R$ {Number(inv.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                                {invoices.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-docka-400 dark:text-zinc-600 italic">
                                            Nenhuma fatura encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Cashflow Mini */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-4">Fluxo de Caixa (Mensal)</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full"><ArrowUpRight size={16} /></div>
                                        <div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-500">Entradas</div>
                                            <div className="font-bold text-docka-900 dark:text-zinc-100">R$ {(Number(metrics?.cashflow?.entradas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-docka-100 dark:bg-zinc-800" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"><ArrowDownLeft size={16} /></div>
                                        <div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-500">Saídas</div>
                                            <div className="font-bold text-docka-900 dark:text-zinc-100">R$ {(Number(metrics?.cashflow?.saidas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-docka-100 dark:border-zinc-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase">Saldo Estimado</span>
                                    <span className={`text-lg font-bold ${(Number(metrics?.cashflow?.saldo) || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {(Number(metrics?.cashflow?.saldo) || 0) >= 0 ? '+ ' : '- '} R$ {Math.abs(Number(metrics?.cashflow?.saldo) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2">Meta Q1 2026</h3>
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-2xl font-bold text-blue-900 dark:text-blue-300">R$ {((Number(metrics?.goals?.target) || 150000) / 1000).toFixed(0)}k</span>
                                <span className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">{Number(metrics?.goals?.percentage) || 0}% atingido</span>
                            </div>
                            <div className="w-full h-2 bg-white dark:bg-zinc-800 rounded-full overflow-hidden border border-blue-100 dark:border-blue-900/30">
                                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Number(metrics?.goals?.percentage) || 0}%` }} />
                            </div>
                            <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-3">
                                Faltam R$ {((Number(metrics?.goals?.target) || 150000) - (Number(metrics?.goals?.achieved) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para bater a meta trimestral.
                            </p>
                        </div>
                    </div>
                </div>

                {/* MODAL: DETALHES DA FATURA */}
                <Modal
                    isOpen={!!selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    title={`Detalhes da Fatura: ${selectedInvoice?.id?.substring(0, 8) || ''}`}
                    size="lg"
                    footer={
                        <div className="flex justify-between w-full">
                            <div className="flex gap-2">
                                {selectedInvoice?.officialBoletoUrl && (
                                    <a
                                        href={`${api.defaults.baseURL}${selectedInvoice.officialBoletoUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg"
                                    >
                                        <Download size={16} /> Ver Boleto (INPI)
                                    </a>
                                )}
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">
                                    <FileText size={16} /> Baixar PDF Docka
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                                    className="p-2 text-docka-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1 text-xs"
                                    title="Excluir Fatura"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                                <button onClick={() => setSelectedInvoice(null)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Fechar</button>
                                {selectedInvoice && selectedInvoice.status !== 'PAID' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedInvoice.id, 'PAID')}
                                        className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                                    >
                                        Confirmar Pagamento
                                    </button>
                                )}
                            </div>
                        </div>
                    }
                >
                    {selectedInvoice && (
                        <div className="space-y-6">
                            <div className="bg-docka-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-docka-100 dark:border-zinc-800">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-1">Cliente</div>
                                        <div className="text-xl font-bold text-docka-900 dark:text-zinc-100">{selectedInvoice.clientName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-1">Status</div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${selectedInvoice.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                            }`}>
                                            {selectedInvoice.status === 'PAID' ? 'Liquidada' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <div className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-1">Data Emissão</div>
                                        <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{new Date(selectedInvoice.createdAt).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-1">Vencimento</div>
                                        <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-1">Total</div>
                                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">R$ {Number(selectedInvoice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedInvoice.type === 'TAX' && selectedInvoice.officialBoletoCode && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                    <div className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase mb-1 flex items-center gap-1">
                                        <AlertCircle size={10} /> Código do Boleto (INPI)
                                    </div>
                                    <div className="font-mono text-sm break-all font-bold text-amber-950 dark:text-amber-200">
                                        {selectedInvoice.officialBoletoCode}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-3 flex items-center gap-2">
                                    <FileText size={14} /> Itens Faturados
                                </h4>
                                <div className="border border-docka-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-docka-50 dark:bg-zinc-800 text-docka-500 dark:text-zinc-500 text-[10px] uppercase font-bold border-b border-docka-100 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-4 py-2">Descrição</th>
                                                <th className="px-4 py-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                            {(selectedInvoice.items || []).map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3 text-docka-900 dark:text-zinc-100 font-medium">{item.description}</td>
                                                    <td className="px-4 py-3 text-docka-900 dark:text-zinc-100 text-right">R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                            {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                                                <tr>
                                                    <td className="px-4 py-3 text-docka-900 dark:text-zinc-100 font-medium">{selectedInvoice.description || 'Serviços Prestados'}</td>
                                                    <td className="px-4 py-3 text-docka-900 dark:text-zinc-100 text-right">R$ {Number(selectedInvoice.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* MODAL: NOVA FATURA */}
                <Modal
                    isOpen={isNewInvoiceOpen}
                    onClose={() => !submitting && setIsNewInvoiceOpen(false)}
                    title="Emitir Nova Fatura"
                    size="lg"
                    footer={
                        <>
                            <button onClick={() => setIsNewInvoiceOpen(false)} disabled={submitting} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-50">Cancelar</button>
                            <button onClick={handleEmitInvoice} disabled={submitting} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2">
                                {submitting ? 'Emitindo...' : 'Emitir e Enviar'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Tipo de Fatura</label>
                                <div className="flex bg-docka-100 dark:bg-zinc-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setNewInvoice({ ...newInvoice, type: 'SERVICE' })}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${newInvoice.type === 'SERVICE' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-docka-500 dark:text-zinc-500'}`}
                                    >
                                        HONORÁRIOS
                                    </button>
                                    <button
                                        onClick={() => setNewInvoice({ ...newInvoice, type: 'TAX' })}
                                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${newInvoice.type === 'TAX' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-docka-500 dark:text-zinc-500'}`}
                                    >
                                        TAXA OFICIAL (INPI)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Método de Pagamento</label>
                                <select
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100"
                                    value={newInvoice.paymentMethod}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, paymentMethod: e.target.value })}
                                >
                                    <option value="PIX">PIX (Chave CNPJ)</option>
                                    <option value="BOLETO">Boleto Bancário</option>
                                    <option value="TRANSFER">Transferência</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente</label>
                                <div className="relative">
                                    <div
                                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-docka-900 dark:text-zinc-100 cursor-pointer flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-docka-400 dark:text-zinc-500" />
                                            <span>
                                                {clients.find(c => c.id === newInvoice.clientId)?.name || 'Selecione um cliente...'}
                                            </span>
                                        </div>
                                        <ChevronDown size={14} className={`text-docka-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {isClientDropdownOpen && (
                                        <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                            <div className="p-2 border-b border-docka-100 dark:border-zinc-800">
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400" />
                                                    <input
                                                        autoFocus
                                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-blue-400"
                                                        placeholder="Pesquisar cliente..."
                                                        value={clientSearch}
                                                        onChange={(e) => setClientSearch(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                                                {(clients || []).filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(c => (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => {
                                                            setNewInvoice({ ...newInvoice, clientId: c.id });
                                                            setIsClientDropdownOpen(false);
                                                            setClientSearch('');
                                                        }}
                                                        className="px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                                                    >
                                                        {c.name}
                                                    </div>
                                                ))}
                                                {(clients || []).filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 && (
                                                    <div className="px-3 py-4 text-xs text-center text-docka-400 italic">
                                                        Nenhum cliente encontrado.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Vencimento</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                    <input
                                        type="date"
                                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-docka-900 dark:text-zinc-100"
                                        value={newInvoice.dueDate}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {newInvoice.type === 'TAX' && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase mb-1.5 flex items-center gap-1">
                                        <Tag size={12} /> Código de Barras / Linha Digitável (INPI)
                                    </label>
                                    <input
                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-docka-900 dark:text-zinc-100 font-mono"
                                        placeholder="00000.00000 00000.000000..."
                                        value={newInvoice.officialBoletoCode}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, officialBoletoCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase mb-1.5 flex items-center gap-1">
                                        <Upload size={12} /> Upload do Boleto Gerado (PDF)
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                id="file-upload"
                                                className="hidden"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className="w-full flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-docka-500 dark:text-zinc-400 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <Link size={14} />
                                                {selectedFile ? selectedFile.name : 'Selecionar arquivo INPI...'}
                                            </label>
                                        </div>
                                        {selectedFile && (
                                            <button
                                                onClick={() => setSelectedFile(null)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Itens da Fatura</label>
                            <div className="bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg p-3 space-y-3">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 animate-in fade-in duration-300">
                                        <input
                                            className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm placeholder:text-docka-400 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100"
                                            placeholder="Descrição do serviço"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                        />
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-docka-400">R$</span>
                                            <input
                                                type="number"
                                                className="w-28 pl-7 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm text-docka-900 dark:text-zinc-100 text-right font-bold"
                                                placeholder="0,00"
                                                value={item.amount || ''}
                                                onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveItem(idx)}
                                            className="p-1.5 text-docka-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddItem}
                                    className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 mt-2"
                                >
                                    <Plus size={12} /> Adicionar Item
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-docka-100 dark:border-zinc-800">
                            <div className="text-left">
                                <div className="text-[10px] text-docka-500 dark:text-zinc-500 uppercase font-bold">Total Faturado</div>
                                <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            </div>
                            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 max-w-[200px]">
                                <p className="text-[10px] text-blue-700 dark:text-blue-300 italic leading-tight">
                                    O cliente receberá uma notificação por e-mail e no portal assim que a fatura for emitida.
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AsteryskoFinancialView;
