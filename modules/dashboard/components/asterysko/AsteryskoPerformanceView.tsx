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

    useEffect(() => { load(); }, [selectedMonth]);

    return (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#fafafa] pb-[env(safe-area-inset-bottom)] dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6 lg:px-10 lg:py-6">
                <div>
                    <h1 className="font-season text-[22px] font-[420] text-black dark:text-white">Minhas Metas</h1>
                    <p className="mt-1 text-xs text-zinc-500">Comissões confirmadas por pagamento e histórico mensal.</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                    <button type="button" onClick={() => setSelectedMonth(current => shiftMonth(current, -1))} className="rounded-lg p-2 hover:bg-white dark:hover:bg-zinc-800" aria-label="Mês anterior"><ChevronLeft size={16} /></button>
                    <span className="min-w-[150px] px-2 text-center text-xs font-bold capitalize text-black dark:text-white">{data?.label || selectedMonth}</span>
                    <button type="button" onClick={() => setSelectedMonth(current => shiftMonth(current, 1))} disabled={Boolean(data && selectedMonth >= data.currentMonth)} className="rounded-lg p-2 hover:bg-white disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="Próximo mês"><ChevronRight size={16} /></button>
                    <button type="button" onClick={load} className="rounded-lg p-2 hover:bg-white dark:hover:bg-zinc-800" aria-label="Atualizar"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 sm:p-6 lg:p-10">
                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
                {loading && !data ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-[#0412dd]" /></div> : data && (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-indigo-100 bg-[#0412dd] p-5 text-white shadow-sm dark:border-indigo-900">
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-100"><WalletCards size={16} /> Comissão do mês</div>
                                <strong className="mt-4 block text-3xl tracking-tight">{money(data.accumulatedCommission)}</strong>
                                <p className="mt-2 text-[11px] text-indigo-100">Somente pagamentos confirmados.</p>
                            </div>
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500"><UsersRound size={16} /> Clientes com comissão</div>
                                <strong className="mt-4 block text-3xl text-black dark:text-white">{data.salesCount}</strong>
                                <p className="mt-2 text-[11px] text-zinc-500">{data.paymentsCount} pagamento(s) comissionado(s).</p>
                            </div>
                            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Target size={16} /> Base paga</div>
                                <strong className="mt-4 block text-3xl text-black dark:text-white">{money(data.grossRevenue)}</strong>
                                <p className="mt-2 text-[11px] text-zinc-500">Valor dos pagamentos que geraram comissão.</p>
                            </div>
                        </div>

                        <div className="grid min-h-0 gap-5 lg:grid-cols-[1.55fr_1fr]">
                            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800"><h2 className="text-sm font-bold text-black dark:text-white">Comissões do período</h2></div>
                                {data.entries.length === 0 ? <p className="px-5 py-12 text-center text-sm text-zinc-500">Nenhum pagamento comissionado neste mês.</p> : (
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{data.entries.map(entry => (
                                        <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4">
                                            <div className="min-w-0"><strong className="block truncate text-sm text-black dark:text-white">{entry.title}</strong><span className="mt-1 block text-[11px] text-zinc-500">{new Date(entry.paidAt).toLocaleDateString('pt-BR')} · {entry.commissionType === 'PERCENTAGE' ? `${entry.commissionValue}%` : money(entry.commissionValue)} · {entry.commissionScope === 'FIRST_PAYMENT' ? 'primeiro pagamento' : 'toda a vigência'}</span></div>
                                            <strong className="shrink-0 text-sm text-emerald-600">+ {money(entry.commission)}</strong>
                                        </div>
                                    ))}</div>
                                )}
                            </section>

                            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800"><h2 className="text-sm font-bold text-black dark:text-white">Histórico mensal</h2></div>
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{data.history.map(item => (
                                    <button key={item.month} type="button" onClick={() => setSelectedMonth(item.month)} className={`flex w-full items-center justify-between px-5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${item.month === selectedMonth ? 'bg-indigo-50/70 dark:bg-indigo-950/20' : ''}`}>
                                        <span><strong className="block text-xs capitalize text-black dark:text-white">{item.label}</strong><small className="text-[10.5px] text-zinc-500">{item.clients} cliente(s) · {item.payments} pagamento(s)</small></span>
                                        <strong className="text-xs text-black dark:text-white">{money(item.commission)}</strong>
                                    </button>
                                ))}</div>
                            </section>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AsteryskoPerformanceView;
