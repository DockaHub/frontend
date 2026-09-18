import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, ExternalLink, Copy, Edit2, Trash2, Loader2, X, Receipt } from 'lucide-react';
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
        <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white pb-[max(1rem,env(safe-area-inset-bottom))] font-sans transition-colors duration-300 dark:bg-zinc-950 sm:pb-16">
            
            {/* CREATE INVOICE MODAL */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-0 backdrop-blur-xs animate-in fade-in sm:p-4">
                    <div className="flex h-[100dvh] min-h-0 w-full max-w-lg flex-col gap-5 overflow-y-auto bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl dark:bg-zinc-900 sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl sm:border sm:border-zinc-200 sm:p-6 dark:sm:border-zinc-800">
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Receipt className="text-[#0412dd] dark:text-[#3b48ff]" size={20} />
                                <h3 className="font-season text-xl font-medium text-black dark:text-white">Emitir Nova Fatura Comercial</h3>
                            </div>
                            <button onClick={() => setIsCreateOpen(false)} className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Fechar emissão de fatura">
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

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                        <div className="mt-auto flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                            <button 
                                onClick={() => setIsCreateOpen(false)}
                                className="min-h-11 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCreateInvoice}
                                disabled={isSubmitting}
                                className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#0412dd] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff]"
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-0 backdrop-blur-xs animate-in fade-in sm:p-4">
                    <div className="flex h-[100dvh] min-h-0 w-full max-w-md flex-col gap-5 overflow-y-auto bg-white p-4 pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl dark:bg-zinc-900 sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl sm:border sm:border-zinc-200 sm:p-6 dark:sm:border-zinc-800">
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                            <h3 className="font-season text-xl font-medium text-black dark:text-white">Editar Fatura Comercial</h3>
                            <button onClick={() => setEditingInvoice(null)} className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200" aria-label="Fechar edição da fatura">
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

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                        <div className="mt-auto flex shrink-0 flex-col-reverse gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                            <button 
                                onClick={() => setEditingInvoice(null)}
                                className="min-h-11 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveInvoiceEdit}
                                disabled={isSubmitting}
                                className="min-h-11 rounded-lg bg-[#0412dd] px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff]"
                            >
                                {isSubmitting && <Loader2 size={14} className="animate-spin mr-1" />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-10 flex min-h-[76px] shrink-0 flex-col items-stretch justify-center gap-3 border-b border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="min-w-0">
                    <span className="font-season text-xl font-[420] text-black dark:text-white sm:text-[22px]">Financeiro</span>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Faturas, cobranças e honorários da Asterysko.</p>
                </div>

                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 sm:h-9 sm:min-h-0 sm:w-auto"
                >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0412dd] text-white dark:bg-[#3b48ff]"><Plus size={11} strokeWidth={3} /></span>
                    Emitir nova fatura
                </button>
            </div>

            {/* Dashboard KPI Grid */}
            <div className="grid grid-cols-2 border-l border-t border-[#e5e5e5] dark:border-zinc-800 lg:grid-cols-4">
                
                {/* Total Faturado */}
                <div className="flex min-w-0 flex-col justify-between gap-6 border-b border-r border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6 lg:gap-10 lg:p-[30px]">
                    <h3 className="text-xs font-medium text-black dark:text-zinc-300 sm:text-sm">Total faturado</h3>
                    <div>
                    <div className="break-words font-season text-[clamp(18px,5.5vw,32px)] font-[420] leading-none text-black dark:text-white">
                        {formatCurrency(totalBilled)}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold leading-4 text-[#9f9f9f] dark:text-zinc-500">Honorários emitidos no período</p>
                    </div>
                </div>

                {/* Total Recebido */}
                <div className="flex min-w-0 flex-col justify-between gap-6 border-b border-r border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6 lg:gap-10 lg:p-[30px]">
                    <h3 className="text-xs font-medium text-black dark:text-zinc-300 sm:text-sm">Total recebido</h3>
                    <div>
                    <div className="break-words font-season text-[clamp(18px,5.5vw,32px)] font-[420] leading-none text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalPaid)}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold leading-4 text-[#9f9f9f] dark:text-zinc-500">Pagamentos já confirmados</p>
                    </div>
                </div>
                
                {/* A Receber / Pendente */}
                <div className="flex min-w-0 flex-col justify-between gap-6 border-b border-r border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6 lg:gap-10 lg:p-[30px]">
                    <h3 className="text-xs font-medium text-black dark:text-zinc-300 sm:text-sm">A receber</h3>
                    <div>
                    <div className="break-words font-season text-[clamp(18px,5.5vw,32px)] font-[420] leading-none text-amber-600 dark:text-amber-400">
                        {formatCurrency(totalPending)}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold leading-4 text-[#9f9f9f] dark:text-zinc-500">Faturas dentro do vencimento</p>
                    </div>
                </div>

                {/* Vencidos */}
                <div className="flex min-w-0 flex-col justify-between gap-6 border-b border-r border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6 lg:gap-10 lg:p-[30px]">
                    <h3 className="text-xs font-medium text-black dark:text-zinc-300 sm:text-sm">Faturas vencidas</h3>
                    <div>
                    <div className="break-words font-season text-[clamp(18px,5.5vw,32px)] font-[420] leading-none text-red-600 dark:text-red-400">
                        {formatCurrency(totalOverdue)}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold leading-4 text-[#9f9f9f] dark:text-zinc-500">Cobranças que precisam de atenção</p>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col items-stretch justify-between gap-3 border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:px-6 md:flex-row md:items-center">
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
            <div className="w-full flex-1">
                <div className="bg-white dark:bg-zinc-950">
                    
                    {/* Table Header */}
                    <div className="hidden grid-cols-12 border-b border-[#e5e5e5] bg-[#fafafa] px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 lg:grid">
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
                                        className="grid grid-cols-2 items-center gap-3 px-4 py-4 text-xs transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 lg:grid-cols-12 lg:gap-0 lg:px-6"
                                    >
                                        {/* Status */}
                                        <div className="order-1 col-span-1 lg:order-none lg:col-span-2">
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
                                        <div className="order-3 col-span-2 min-w-0 lg:order-none lg:col-span-3 lg:pr-4">
                                            <p className="font-bold text-black dark:text-white truncate">{clientDisplayName}</p>
                                            <p className="text-[10.5px] font-mono text-zinc-400 truncate">{clientEmail}</p>
                                        </div>

                                        {/* Descrição */}
                                        <div className="order-4 col-span-2 min-w-0 lg:order-none lg:col-span-3 lg:pr-4">
                                            <p className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                                                {inv.description || 'Fatura de Honorários'}
                                            </p>
                                            <span className="text-[9.5px] font-semibold text-zinc-400 uppercase">{inv.paymentMethod || 'PIX'}</span>
                                        </div>

                                        {/* Vencimento */}
                                        <div className="order-5 col-span-1 font-medium text-zinc-650 dark:text-zinc-350 lg:order-none">
                                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">Vencimento</span>
                                            {formattedDueDate}
                                        </div>

                                        {/* Valor */}
                                        <div className="order-5 col-span-1 pr-0 text-right text-sm font-bold text-black dark:text-white lg:order-none lg:col-span-2 lg:pr-2">
                                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">Valor</span>
                                            {formattedVal}
                                        </div>

                                        {/* Ações */}
                                        <div className="relative order-2 col-span-1 text-right lg:order-none lg:text-center">
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
