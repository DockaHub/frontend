import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Target, UsersRound, WalletCards } from 'lucide-react';
import api from '../../../../services/api';

interface PerformanceEntry {
    id: string;
    dealId: string;
    title: string;
    plan?: string | null;
    paymentAmount: number;
    commission: number;
    commissionType: 'FIXED' | 'PERCENTAGE';
    commissionValue: number;
    commissionScope: 'FIRST_PAYMENT' | 'CONTRACT_LIFETIME';
    paidAt: string;
}

interface PerformanceData {
    month: string;
    currentMonth: string;
    label: string;
    accumulatedCommission: number;
    grossRevenue: number;
    salesCount: number;
    paymentsCount: number;
    entries: PerformanceEntry[];
    history: Array<{ month: string; label: string; commission: number; payments: number; clients: number }>;
}

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const shiftMonth = (month: string, delta: number) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

const AsteryskoPerformanceView: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Fortaleza', year: 'numeric', month: '2-digit' }).slice(0, 7));
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/asterysko/performance', { params: { month: selectedMonth } });
            setData(response.data);
        } catch (requestError: any) {
            setError(requestError.response?.data?.error || 'Não foi possível carregar suas comissões.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [selectedMonth]);

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-white font-sans pb-[env(safe-area-inset-bottom)] dark:bg-zinc-950">
            <header className="flex min-h-[76px] shrink-0 flex-col items-stretch justify-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="min-w-0">
                    <h1 className="font-season text-xl font-[420] text-black dark:text-white sm:text-[22px]">Minhas Metas</h1>
                    <p className="mt-0.5 truncate text-[11px] text-[#7f7f7f] dark:text-zinc-400 sm:text-xs">Comissões confirmadas por pagamento e histórico mensal.</p>
                </div>
                <div className="flex min-h-11 items-center justify-between rounded-full border border-[#e5e5e5] bg-white px-1 dark:border-zinc-700 dark:bg-zinc-900 sm:min-w-[310px]">
                    <button type="button" onClick={() => setSelectedMonth(current => shiftMonth(current, -1))} className="flex h-9 w-9 items-center justify-center rounded-full text-[#7f7f7f] hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Mês anterior"><ChevronLeft size={16} /></button>
                    <span className="min-w-0 flex-1 truncate px-2 text-center text-xs font-semibold capitalize text-black dark:text-white">{data?.label || selectedMonth}</span>
                    <button type="button" onClick={() => setSelectedMonth(current => shiftMonth(current, 1))} disabled={Boolean(data && selectedMonth >= data.currentMonth)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#7f7f7f] hover:bg-zinc-100 hover:text-black disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Próximo mês"><ChevronRight size={16} /></button>
                    <button type="button" onClick={() => void load()} className="flex h-9 w-9 items-center justify-center rounded-full text-[#7f7f7f] hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-800 dark:hover:text-white" aria-label="Atualizar"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
                </div>
            </header>

            {error && <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 sm:px-7">{error}</div>}

            {loading && !data ? (
                <div className="flex min-h-64 flex-1 items-center justify-center"><Loader2 className="animate-spin text-[#0412dd]" size={20} /></div>
            ) : data && (
                <>
                    <section className="grid grid-cols-1 border-l border-t border-[#e5e5e5] dark:border-zinc-800 sm:grid-cols-3">
                        <div className="flex min-w-0 flex-col justify-between gap-8 border-b border-r border-[#e5e5e5] bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:min-h-[190px] lg:gap-10 lg:p-[30px]">
                            <div className="flex items-center gap-2 text-xs font-medium text-black dark:text-zinc-300"><WalletCards size={15} className="text-[#0412dd] dark:text-[#3b48ff]" />Comissão do mês</div>
                            <div><strong className="block break-words font-season text-[clamp(24px,3vw,32px)] font-[420] leading-none text-[#0412dd] dark:text-[#3b48ff]">{money(data.accumulatedCommission)}</strong><p className="mt-3 text-[10px] font-semibold text-[#9f9f9f]">Somente pagamentos confirmados</p></div>
                        </div>
                        <div className="flex min-w-0 flex-col justify-between gap-8 border-b border-r border-[#e5e5e5] bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:min-h-[190px] lg:gap-10 lg:p-[30px]">
                            <div className="flex items-center gap-2 text-xs font-medium text-black dark:text-zinc-300"><UsersRound size={15} className="text-[#7f7f7f]" />Clientes com comissão</div>
                            <div><strong className="block font-season text-[32px] font-[420] leading-none text-black dark:text-white">{data.salesCount}</strong><p className="mt-3 text-[10px] font-semibold text-[#9f9f9f]">{data.paymentsCount} pagamento(s) comissionado(s)</p></div>
                        </div>
                        <div className="flex min-w-0 flex-col justify-between gap-8 border-b border-r border-[#e5e5e5] bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:min-h-[190px] lg:gap-10 lg:p-[30px]">
                            <div className="flex items-center gap-2 text-xs font-medium text-black dark:text-zinc-300"><Target size={15} className="text-[#7f7f7f]" />Base paga</div>
                            <div><strong className="block break-words font-season text-[clamp(24px,3vw,32px)] font-[420] leading-none text-black dark:text-white">{money(data.grossRevenue)}</strong><p className="mt-3 text-[10px] font-semibold text-[#9f9f9f]">Valor que gerou comissão</p></div>
                        </div>
                    </section>

                    <div className="grid min-h-0 w-full border-l border-[#e5e5e5] dark:border-zinc-800 lg:grid-cols-12">
                        <section className="min-w-0 border-b border-r border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-8">
                            <header className="border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:px-7 lg:px-10"><h2 className="font-season text-lg font-[420] text-black dark:text-white">Comissões do período</h2><p className="mt-0.5 text-[10.5px] text-[#9f9f9f]">Pagamentos confirmados no mês selecionado</p></header>
                            {data.entries.length === 0 ? <p className="px-5 py-14 text-center text-xs text-[#7f7f7f]">Nenhum pagamento comissionado neste mês.</p> : (
                                <div>{data.entries.map(entry => (
                                    <div key={entry.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[#e5e5e5] px-4 py-4 last:border-b-0 dark:border-zinc-800 sm:px-7 lg:px-10">
                                        <div className="min-w-0"><strong className="block truncate text-xs font-semibold text-black dark:text-white">{entry.title}</strong><span className="mt-1 block truncate text-[10.5px] text-[#9f9f9f]">{new Date(entry.paidAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })} · {entry.commissionType === 'PERCENTAGE' ? `${entry.commissionValue}%` : money(entry.commissionValue)} · {entry.commissionScope === 'FIRST_PAYMENT' ? 'primeiro pagamento' : 'toda a vigência'}</span></div>
                                        <strong className="shrink-0 font-season text-base font-[420] text-emerald-600">+ {money(entry.commission)}</strong>
                                    </div>
                                ))}</div>
                            )}
                        </section>

                        <section className="min-w-0 border-b border-r border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-4">
                            <header className="border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:px-7"><h2 className="font-season text-lg font-[420] text-black dark:text-white">Histórico mensal</h2><p className="mt-0.5 text-[10.5px] text-[#9f9f9f]">Selecione um mês para consultar</p></header>
                            <div>{data.history.map(item => (
                                <button key={item.month} type="button" onClick={() => setSelectedMonth(item.month)} className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e5e5e5] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/60 sm:px-7 ${item.month === selectedMonth ? 'border-l-2 border-l-[#0412dd] bg-blue-50/40 dark:bg-blue-950/15' : ''}`}>
                                    <span className="min-w-0"><strong className="block truncate text-xs font-semibold capitalize text-black dark:text-white">{item.label}</strong><small className="text-[10px] text-[#9f9f9f]">{item.clients} cliente(s) · {item.payments} pagamento(s)</small></span>
                                    <strong className="font-season text-sm font-[420] text-black dark:text-white">{money(item.commission)}</strong>
                                </button>
                            ))}</div>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
};

export default AsteryskoPerformanceView;
