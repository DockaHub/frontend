import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Clock, AlertTriangle, Plus, Search, MoreVertical, ExternalLink, Copy, Edit2, Trash2, Loader2, X, Receipt } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';

interface AsteryskoFinancialViewProps {
    organization?: Organization;
}

const AsteryskoFinancialView: React.FC<AsteryskoFinancialViewProps> = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PENDING' | 'OVERDUE'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create Invoice Form State
    const [selectedClientId, setSelectedClientId] = useState('');
    const [invoiceDesc, setInvoiceDesc] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [invoiceDueDate, setInvoiceDueDate] = useState('');
    const [invoicePaymentMethod, setInvoicePaymentMethod] = useState('PIX');

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/asterysko/financial/invoices');
            setInvoices(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch invoices', error);
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('/asterysko/clients');
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch clients', error);
            setClients([]);
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchClients();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Create Invoice Handler
    const handleCreateInvoice = async () => {
        if (!selectedClientId) {
            alert('Por favor, selecione um cliente.');
            return;
        }
        if (!invoiceAmount || !invoiceDueDate) {
            alert('Por favor, informe o valor e a data de vencimento.');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/asterysko/financial/invoices', {
                clientId: selectedClientId,
                amount: parseFloat(invoiceAmount.replace(',', '.')),
                dueDate: invoiceDueDate,
                description: invoiceDesc || 'Fatura de Honorários Comercial - Asterysko',
                paymentMethod: invoicePaymentMethod,
                type: 'SERVICE'
            });
            alert('Fatura gerada com sucesso! As notificações por e-mail e WhatsApp foram enviadas ao cliente.');
            setIsCreateOpen(false);
            setSelectedClientId('');
            setInvoiceDesc('');
            setInvoiceAmount('');
            setInvoiceDueDate('');
            fetchInvoices();
        } catch (error) {
            console.error('Failed to create invoice', error);
            alert('Erro ao criar fatura.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Save Edit Handler
    const handleSaveInvoiceEdit = async () => {
        if (!editingInvoice?.id) return;
        try {
            setIsSubmitting(true);
            await api.put(`/asterysko/financial/invoices/${editingInvoice.id}`, {
                description: editingInvoice.description,
                amount: parseFloat(String(editingInvoice.amount).replace(',', '.')),
                dueDate: editingInvoice.dueDate,
                status: editingInvoice.status,
                paymentMethod: editingInvoice.paymentMethod
            });
            alert('Fatura atualizada com sucesso!');
            setEditingInvoice(null);
            fetchInvoices();
        } catch (error) {
            console.error('Failed to edit invoice', error);
            alert('Erro ao atualizar fatura.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete Invoice Handler
    const handleDeleteInvoice = async (id: string) => {
        if (!window.confirm('Tem certeza de que deseja excluir esta fatura?')) return;
        try {
            await api.delete(`/asterysko/financial/invoices/${id}`);
            alert('Fatura excluída com sucesso!');
            fetchInvoices();
        } catch (error) {
            console.error('Failed to delete invoice', error);
            alert('Erro ao excluir fatura.');
        }
    };

    // Copy Payment Link Handler
    const handleCopyPaymentLink = (inv: any) => {
        const link = `https://cliente.asterysko.com/portal/financial?invoiceId=${inv.id}`;
        navigator.clipboard.writeText(link);
        alert('Link da fatura copiado para a área de transferência!');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Calculate totals for dashboard cards
    const serviceInvoices = invoices.filter(invoice => String(invoice.type || '').toUpperCase() !== 'TAX');
    const totalBilled = serviceInvoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalPaid = serviceInvoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalPending = serviceInvoices.filter(i => i.status === 'PENDING').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalOverdue = serviceInvoices.filter(i => i.status === 'OVERDUE').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Filter invoices list
    const filteredInvoices = invoices.filter(inv => {
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();
        const clientName = (inv.clientName || inv.client?.user?.name || '').toLowerCase();
        const clientEmail = (inv.client?.user?.email || '').toLowerCase();
        const desc = (inv.description || '').toLowerCase();

        const matchesSearch = !searchQuery || clientName.includes(searchLower) || clientEmail.includes(searchLower) || desc.includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col pb-16">
            
            {/* CREATE INVOICE MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Receipt className="text-[#0412dd] dark:text-[#3b48ff]" size={20} />
                                <h3 className="font-season text-xl font-medium text-black dark:text-white">Emitir Nova Fatura Comercial</h3>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Selecione o Cliente *</label>
                                <select 
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                >
                                    <option value="">Selecione um cliente cadastrado...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.user?.name || c.name || 'Cliente sem nome'} ({c.user?.email || 'Sem email'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Descrição dos Honorários</label>
                                <input 
                                    type="text"
                                    placeholder="ex: Fatura de Honorários - Registro de Marca"
                                    value={invoiceDesc}
                                    onChange={(e) => setInvoiceDesc(e.target.value)}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Valor (R$) *</label>
                                    <input 
                                        type="text"
                                        placeholder="1500,00"
                                        value={invoiceAmount}
                                        onChange={(e) => setInvoiceAmount(e.target.value)}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Data de Vencimento *</label>
                                    <input 
                                        type="date"
                                        value={invoiceDueDate}
                                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Forma de Pagamento</label>
                                <select 
                                    value={invoicePaymentMethod}
                                    onChange={(e) => setInvoicePaymentMethod(e.target.value)}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                >
                                    <option value="PIX">Pix / Transferência (Instantâneo)</option>
                                    <option value="BOLETO">Boleto Bancário</option>
                                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <button 
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCreateInvoice}
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                Gerar Fatura & Notificar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT INVOICE MODAL */}
            {editingInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-season text-xl font-medium text-black dark:text-white">Editar Fatura Comercial</h3>
                            <button onClick={() => setEditingInvoice(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Descrição</label>
                                <input 
                                    type="text"
                                    value={editingInvoice.description || ''}
                                    onChange={(e) => setEditingInvoice({ ...editingInvoice, description: e.target.value })}
                                    className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Valor (R$)</label>
                                    <input 
                                        type="text"
                                        value={editingInvoice.amount || ''}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, amount: e.target.value })}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Status</label>
                                    <select 
                                        value={editingInvoice.status || 'PENDING'}
                                        onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value })}
                                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs bg-white dark:bg-zinc-950 text-black dark:text-white outline-none focus:border-[#0412dd]"
                                    >
                                        <option value="PENDING">Aguardando Pagamento</option>
                                        <option value="PAID">Pago / Quitado</option>
                                        <option value="OVERDUE">Vencido</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <button 
                                onClick={() => setEditingInvoice(null)}
                                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveInvoiceEdit}
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                {isSubmitting && <Loader2 size={14} className="animate-spin mr-1" />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
                <div>
                    <span className="font-season text-[22px] font-[420] text-black dark:text-white">Visão Geral Financeira</span>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Gestão global de faturas, cobranças e honorários da Asterysko.</p>
                </div>

                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                    <Plus size={16} strokeWidth={3} /> Emitir Nova Fatura
                </button>
            </div>

            {/* Dashboard KPI Grid */}
            <div className="px-10 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Total Faturado */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-[#0412dd] dark:text-[#3b48ff] rounded-xl flex items-center justify-center mb-4">
                        <DollarSign size={20} />
                    </div>
                    <h3 className="text-xs font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">Total Faturado</h3>
                    <div className="font-season text-[28px] font-[420] text-black dark:text-white leading-none">
                        {formatCurrency(totalBilled)}
                    </div>
                </div>

                {/* Total Recebido */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                        <CreditCard size={20} />
                    </div>
                    <h3 className="text-xs font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">Total Recebido</h3>
                    <div className="font-season text-[28px] font-[420] text-green-600 dark:text-green-400 leading-none">
                        {formatCurrency(totalPaid)}
                    </div>
                </div>
                
                {/* A Receber / Pendente */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
                        <Clock size={20} />
                    </div>
                    <h3 className="text-xs font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">A Receber</h3>
                    <div className="font-season text-[28px] font-[420] text-amber-600 dark:text-amber-400 leading-none">
                        {formatCurrency(totalPending)}
                    </div>
                </div>

                {/* Vencidos */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-xs font-bold text-[#9f9f9f] uppercase tracking-wider mb-2">Faturas Vencidas</h3>
                    <div className="font-season text-[28px] font-[420] text-red-600 dark:text-red-400 leading-none">
                        {formatCurrency(totalOverdue)}
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="px-10 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-3 text-zinc-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar por cliente ou descrição..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black dark:text-white outline-none focus:border-[#0412dd] transition-colors"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full md:w-auto overflow-x-auto">
                    {[
                        { id: 'all', label: 'Todas as Faturas' },
                        { id: 'PAID', label: 'Pagas' },
                        { id: 'PENDING', label: 'Pendentes' },
                        { id: 'OVERDUE', label: 'Vencidas' },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id as any)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                statusFilter === tab.id 
                                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs' 
                                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            <div className="w-full flex-1 px-10">
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                    
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-6 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-950 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3">Cliente</div>
                        <div className="col-span-3">Descrição / Serviço</div>
                        <div className="col-span-1">Vencimento</div>
                        <div className="col-span-2 text-right">Valor</div>
                        <div className="col-span-1 text-center">Ações</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 relative">
                        {isLoading && (
                            <div className="py-12 flex justify-center items-center opacity-60">
                                <Loader2 className="animate-spin text-[#0412dd] dark:text-[#3b48ff] mr-2" size={20} />
                                <span className="text-xs font-bold text-black dark:text-white">Carregando faturas da Asterysko...</span>
                            </div>
                        )}

                        {!isLoading && filteredInvoices.length === 0 ? (
                            <div className="text-center py-16 opacity-50">
                                <Receipt size={36} className="mx-auto text-zinc-400 mb-2" />
                                <span className="text-xs font-bold text-black dark:text-white block">Nenhuma fatura encontrada.</span>
                                <span className="text-[11px] text-zinc-400">Tente ajustar os filtros ou emitir uma nova fatura.</span>
                            </div>
                        ) : (
                            filteredInvoices.map((inv) => {
                                const isPaid = inv.status === 'PAID';
                                const isOverdue = inv.status === 'OVERDUE';
                                const clientDisplayName = inv.clientName || inv.client?.user?.name || 'Cliente Asterysko';
                                const clientEmail = inv.client?.user?.email || 'Sem e-mail';
                                const formattedVal = formatCurrency(Number(inv.amount) || 0);
                                const formattedDueDate = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('pt-BR') : '--';

                                return (
                                    <div 
                                        key={inv.id} 
                                        className="grid grid-cols-12 px-6 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors items-center text-xs"
                                    >
                                        {/* Status */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                                                isPaid 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                                                    : isOverdue 
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                            }`}>
                                                {isPaid ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente'}
                                            </span>
                                        </div>

                                        {/* Cliente */}
                                        <div className="col-span-3 pr-4 min-w-0">
                                            <p className="font-bold text-black dark:text-white truncate">{clientDisplayName}</p>
                                            <p className="text-[10.5px] font-mono text-zinc-400 truncate">{clientEmail}</p>
                                        </div>

                                        {/* Descrição */}
                                        <div className="col-span-3 pr-4 min-w-0">
                                            <p className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                                                {inv.description || 'Fatura de Honorários'}
                                            </p>
                                            <span className="text-[9.5px] font-semibold text-zinc-400 uppercase">{inv.paymentMethod || 'PIX'}</span>
                                        </div>

                                        {/* Vencimento */}
                                        <div className="col-span-1 font-medium text-zinc-650 dark:text-zinc-350">
                                            {formattedDueDate}
                                        </div>

                                        {/* Valor */}
                                        <div className="col-span-2 text-right font-bold text-sm text-black dark:text-white pr-2">
                                            {formattedVal}
                                        </div>

                                        {/* Ações */}
                                        <div className="col-span-1 text-center relative">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === inv.id ? null : inv.id);
                                                }}
                                                className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {openMenuId === inv.id && (
                                                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                                                    <a 
                                                        href={`https://cliente.asterysko.com/portal/financial?invoiceId=${inv.id}`}
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                    >
                                                        <ExternalLink size={14} /> Ver Página da Fatura
                                                    </a>
                                                    
                                                    <button 
                                                        onClick={() => { handleCopyPaymentLink(inv); setOpenMenuId(null); }}
                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                    >
                                                        <Copy size={14} /> Copiar Link de Pagamento
                                                    </button>

                                                    <button 
                                                        onClick={() => { setEditingInvoice(inv); setOpenMenuId(null); }}
                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                    >
                                                        <Edit2 size={14} /> Editar Fatura
                                                    </button>

                                                    <button 
                                                        onClick={() => { handleDeleteInvoice(inv.id); setOpenMenuId(null); }}
                                                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1.5"
                                                    >
                                                        <Trash2 size={14} /> Excluir Fatura
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsteryskoFinancialView;
