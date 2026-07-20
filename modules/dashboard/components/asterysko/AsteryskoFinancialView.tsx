import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';

interface Invoice {
    id: string;
    organizationId?: string;
    clientId?: string;
    clientName?: string;
    processId?: string;
    processNumber?: string;
    value: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
}

interface AsteryskoFinancialViewProps {
    organization?: Organization;
}

const AsteryskoFinancialView: React.FC<AsteryskoFinancialViewProps> = ({ organization }) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchInvoices = async () => {
        try {
            setIsLoading(true);
            const orgId = organization?.id || 'org_1';
            const response = await api.get(`/asterysko/invoices?organizationId=${orgId}`);
            setInvoices(response.data);
        } catch (error) {
            console.error('Failed to fetch invoices', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [organization?.id]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Calculate totals for dashboard cards
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.value, 0);
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800">
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">Financeiro</span>
            </div>

            {/* Dashboard Grid */}
            <div className="px-10 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Entradas */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-8 shadow-sm">
                    <h3 className="text-sm font-medium text-black dark:text-white mb-6">Entradas</h3>
                    <div className="font-season text-[32px] font-[420] text-black dark:text-white leading-none mb-3">
                        {formatCurrency(totalPaid)}
                    </div>
                    <div className="text-[10px] font-semibold text-[#9f9f9f]">
                        +2% vs mês anterior
                    </div>
                </div>

                {/* Saídas */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-8 shadow-sm">
                    <h3 className="text-sm font-medium text-black dark:text-white mb-6">Saídas</h3>
                    <div className="font-season text-[32px] font-[420] text-black dark:text-white leading-none mb-3">
                        R$ 0,00
                    </div>
                    <div className="text-[10px] font-semibold text-[#9f9f9f]">
                        Comissões, contas
                    </div>
                </div>
                
                {/* A receber */}
                <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-8 shadow-sm">
                    <h3 className="text-sm font-medium text-black dark:text-white mb-6">A receber</h3>
                    <div className="font-season text-[32px] font-[420] text-black dark:text-white leading-none mb-3">
                        {formatCurrency(totalPending)}
                    </div>
                    <div className="text-[10px] font-semibold text-[#9f9f9f]">
                        +5% vs mês anterior
                    </div>
                </div>
            </div>

            {/* Faturas Title */}
            <div className="px-10 pb-4">
                <h3 className="text-[14px] font-medium text-black dark:text-white">Faturas</h3>
            </div>

            {/* Table */}
            <div className="w-full flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-10 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/50">
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Status</div>
                    <div className="col-span-4 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Cliente</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Processo</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Valor</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Validade</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col relative">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex justify-center pt-12 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                            <Loader2 className="animate-spin text-[#0412dd] dark:text-[#3b48ff]" size={24} />
                        </div>
                    )}
                    {invoices.length === 0 && !isLoading ? (
                        <div className="text-center py-12 opacity-40">
                            <span className="text-[11px] font-medium text-black dark:text-white">Nenhuma fatura encontrada.</span>
                        </div>
                    ) : (
                        invoices.map((invoice) => (
                            <div key={invoice.id} className="grid grid-cols-12 px-10 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors items-center">
                                
                                <div className="col-span-2 pr-4">
                                    <span className={`text-[12px] font-semibold ${
                                        invoice.status === 'paid' ? 'text-[#76ba00]' : 
                                        invoice.status === 'overdue' ? 'text-rose-500' : 
                                        'text-amber-500'
                                    }`}>
                                        {invoice.status === 'paid' ? 'Pago' : invoice.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                                    </span>
                                </div>
                                
                                <div className="col-span-4 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                    {invoice.clientName || 'N/A'}
                                </div>
                                
                                <div className="col-span-2 text-[13px] font-medium font-mono text-black dark:text-white pr-4 truncate">
                                    {invoice.processNumber || '-'}
                                </div>
                                
                                <div className="col-span-2 text-[13px] font-medium text-black dark:text-white pr-4">
                                    {formatCurrency(invoice.value)}
                                </div>
                                
                                <div className="col-span-2 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                    {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                                </div>
                                
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {invoices.length > 0 && (
                    <div className="mt-6 pb-12 flex justify-center">
                        <button className="text-[10px] font-semibold text-[#0412dd] dark:text-[#3b48ff] uppercase tracking-wider hover:opacity-80 transition-opacity">
                            CARREGAR MAIS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsteryskoFinancialView;
