import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2,
    Clock3, Plus, RefreshCw, TrendingUp, Wallet, X,
} from 'lucide-react';
import DashboardPage from '../../../../components/DashboardPage';
import { api } from '../../../../services/api';

type SourceStatus = 'connected' | 'offline' | 'not-configured';

interface FinanceSnapshot {
    generatedAt: string;
    financial: {
        revenue: number;
        expenses: number;
        operatingResult: number;
        margin: number | null;
        receivableAmount: number;
        overdueAmount: number;
        openInvoices: number;
        overdueInvoices: number;
        series: Array<{ key: string; label: string; revenue: number; expenses: number }>;
        sources: Array<{ id: string; label: string; status: SourceStatus; value: number }>;
        receivables: Array<{
            id: string; client: string; description: string; amount: number;
            dueDate: string; status: 'overdue' | 'pending'; business: string;
        }>;
        recentEntries: Array<{
            id: string; description: string; amount: number; type: 'INCOME' | 'EXPENSE';
            category: string; date: string;
        }>;
    };
}

const currency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
}).format(value || 0);

const fullCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
}).format(value || 0);

const DockaUnifiedFinanceView: React.FC = () => {
    const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [category, setCategory] = useState('OTHER');
    const [saving, setSaving] = useState(false);

    const load = useCallback(async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const response = await api.get('/dashboard/operations');
            setSnapshot(response.data);
            setError('');
        } catch {
            setError('Não foi possível consolidar os dados financeiros agora.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        load(true);
        const interval = window.setInterval(() => load(true), 30000);
        return () => window.clearInterval(interval);
    }, [load]);

    const maxChartValue = useMemo(() => Math.max(
        1,
        ...(snapshot?.financial.series || []).flatMap((item) => [item.revenue, item.expenses]),
    ), [snapshot]);

    const handleAddEntry = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post('/group-finance/entries', {
                description,
                amount: Number(amount),
                type,
                category,
            });
            setDescription('');
            setAmount('');
            setShowModal(false);
            await load(true);
        } catch {
            setError('Não foi possível salvar o lançamento.');
        } finally {
            setSaving(false);
        }
    };

    const finance = snapshot?.financial;

    return (
        <DashboardPage
            title="Financeiro consolidado"
            icon={Wallet}
            actions={
                <div className="flex items-center gap-2">
                    <button onClick={() => load()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                        <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Atualizar
                    </button>
                    <button onClick={() => setShowModal(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">
                        <Plus size={16} /> Novo lançamento
                    </button>
                </div>
            }
        >
            <div className="space-y-5 pb-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-zinc-500">Receitas verificadas, despesas registradas e cobranças de todos os negócios.</p>
                        <p className="mt-1 text-[11px] text-zinc-400">Resultado operacional não representa saldo bancário.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        Atualização automática · {snapshot ? new Date(snapshot.generatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                </div>

                {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertTriangle size={16} />{error}</div>}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Metric label="Receita confirmada no mês" value={currency(finance?.revenue || 0)} icon={ArrowUpRight} tone="emerald" />
                    <Metric label="Despesas registradas" value={currency(finance?.expenses || 0)} icon={ArrowDownRight} tone="red" />
                    <Metric label="Resultado operacional" value={currency(finance?.operatingResult || 0)} icon={TrendingUp} tone={(finance?.operatingResult || 0) >= 0 ? 'dark' : 'red'} />
                    <Metric label="A receber" value={currency(finance?.receivableAmount || 0)} detail={`${finance?.openInvoices || 0} cobranças abertas`} icon={Clock3} tone="amber" />
                    <Metric label="Vencido" value={currency(finance?.overdueAmount || 0)} detail={`${finance?.overdueInvoices || 0} cobranças vencidas`} icon={AlertTriangle} tone={(finance?.overdueInvoices || 0) > 0 ? 'red' : 'neutral'} />
                </div>

                {loading ? <LoadingState /> : (
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">
                        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="mb-6 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Receita x despesas</h2>
                                    <p className="mt-1 text-xs text-zinc-500">Últimos seis meses com dados confirmados.</p>
                                </div>
                                <div className="rounded-xl bg-zinc-100 px-3 py-2 text-right dark:bg-zinc-900">
                                    <span className="block text-[10px] uppercase tracking-wide text-zinc-400">Margem do mês</span>
                                    <strong className="text-sm text-zinc-900 dark:text-white">{finance?.margin == null ? 'Sem base' : `${finance.margin}%`}</strong>
                                </div>
                            </div>
                            <div className="flex h-52 items-end gap-3 border-b border-zinc-200 px-2 dark:border-zinc-800">
                                {(finance?.series || []).map((item) => (
                                    <div key={item.key} className="flex h-full flex-1 flex-col justify-end gap-2">
                                        <div className="flex flex-1 items-end justify-center gap-1">
                                            <div title={`Receita: ${fullCurrency(item.revenue)}`} className="w-3 rounded-t bg-emerald-500 transition-all" style={{ height: `${Math.max(item.revenue ? 4 : 1, (item.revenue / maxChartValue) * 100)}%` }} />
                                            <div title={`Despesas: ${fullCurrency(item.expenses)}`} className="w-3 rounded-t bg-red-400 transition-all" style={{ height: `${Math.max(item.expenses ? 4 : 1, (item.expenses / maxChartValue) * 100)}%` }} />
                                        </div>
                                        <span className="pb-2 text-center text-[10px] font-semibold uppercase text-zinc-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-500">
                                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Receita</span>
                                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-400" /> Despesas</span>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="mb-4">
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Cobertura das fontes</h2>
                                <p className="mt-1 text-xs text-zinc-500">O total só considera integrações que responderam.</p>
                            </div>
                            <div className="space-y-2">
                                {(finance?.sources || []).map((source) => <FinanceSource key={source.id} {...source} />)}
                            </div>
                        </section>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
                    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Contas a receber</h2>
                            <p className="mt-1 text-xs text-zinc-500">Cobranças abertas e vencidas, priorizadas por risco.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-xs">
                                <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-400 dark:bg-zinc-900/60"><tr><th className="px-5 py-3">Cliente</th><th className="px-4 py-3">Negócio</th><th className="px-4 py-3">Vencimento</th><th className="px-5 py-3 text-right">Valor</th></tr></thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {(finance?.receivables || []).map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                                            <td className="px-5 py-3"><strong className="block text-zinc-800 dark:text-zinc-100">{item.client}</strong><span className="text-zinc-400">{item.description}</span></td>
                                            <td className="px-4 py-3 text-zinc-500">{item.business}</td>
                                            <td className={`px-4 py-3 font-semibold ${item.status === 'overdue' ? 'text-red-600' : 'text-zinc-600 dark:text-zinc-300'}`}>{new Date(item.dueDate).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-5 py-3 text-right font-bold text-zinc-900 dark:text-white">{fullCurrency(item.amount)}</td>
                                        </tr>
                                    ))}
                                    {!finance?.receivables.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-zinc-400">Nenhuma cobrança aberta.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Lançamentos do grupo</h2>
                            <p className="mt-1 text-xs text-zinc-500">Entradas e custos adicionados manualmente.</p>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {(finance?.recentEntries || []).slice(0, 8).map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                    <div className="min-w-0"><strong className="block truncate text-xs text-zinc-800 dark:text-zinc-100">{item.description}</strong><span className="text-[10px] uppercase text-zinc-400">{item.category} · {new Date(item.date).toLocaleDateString('pt-BR')}</span></div>
                                    <span className={`shrink-0 text-xs font-bold ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>{item.type === 'INCOME' ? '+' : '-'} {fullCurrency(item.amount)}</span>
                                </div>
                            ))}
                            {!finance?.recentEntries.length && <div className="px-5 py-10 text-center text-xs text-zinc-400">Nenhum lançamento manual.</div>}
                        </div>
                    </section>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
                    <form onSubmit={handleAddEntry} className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5 dark:border-zinc-800"><div><h3 className="font-bold text-zinc-900 dark:text-white">Novo lançamento</h3><p className="text-xs text-zinc-500">Registre apenas valores confirmados.</p></div><button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100"><X size={18} /></button></div>
                        <div className="space-y-4 p-6">
                            <Field label="Descrição"><input required value={description} onChange={(e) => setDescription(e.target.value)} className="input-finance" placeholder="Ex.: Servidor, pagamento recebido..." /></Field>
                            <div className="grid grid-cols-2 gap-3"><Field label="Valor"><input required min="0.01" step="0.01" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-finance" /></Field><Field label="Tipo"><select value={type} onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')} className="input-finance"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option></select></Field></div>
                            <Field label="Categoria"><select value={category} onChange={(e) => setCategory(e.target.value)} className="input-finance"><option value="OTHER">Outros</option><option value="PAYROLL">Pessoas</option><option value="CLOUD">Infraestrutura</option><option value="SAAS">Software</option><option value="MARKETING">Marketing</option><option value="TAX">Impostos</option></select></Field>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800"><button type="button" onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-500">Cancelar</button><button disabled={saving} className="rounded-xl bg-zinc-950 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-950">{saving ? 'Salvando...' : 'Salvar lançamento'}</button></div>
                    </form>
                </div>
            )}
        </DashboardPage>
    );
};

const Metric = ({ label, value, detail, icon: Icon, tone }: { label: string; value: string; detail?: string; icon: React.ElementType; tone: string }) => {
    const tones: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
        red: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        dark: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950',
        neutral: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300',
    };
    return <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"><div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone] || tones.neutral}`}><Icon size={17} /></div><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p><strong className="mt-1 block text-xl tracking-tight text-zinc-900 dark:text-white">{value}</strong>{detail && <span className="mt-1 block text-[11px] text-zinc-400">{detail}</span>}</div>;
};

const FinanceSource = ({ label, status, value }: { label: string; status: SourceStatus; value: number }) => {
    const meta = status === 'connected'
        ? { text: 'Conectado', className: 'text-emerald-600', icon: CheckCircle2 }
        : status === 'offline'
            ? { text: 'Sem resposta', className: 'text-red-600', icon: AlertTriangle }
            : { text: 'Não integrado', className: 'text-amber-600', icon: Clock3 };
    const Icon = meta.icon;
    return <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 p-3 dark:border-zinc-800"><div><strong className="block text-xs text-zinc-800 dark:text-zinc-100">{label}</strong><span className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${meta.className}`}><Icon size={11} /> {meta.text}</span></div><span className="text-xs font-bold text-zinc-900 dark:text-white">{status === 'connected' ? currency(value) : '—'}</span></div>;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}<div className="mt-2 [&_.input-finance]:w-full [&_.input-finance]:rounded-xl [&_.input-finance]:border [&_.input-finance]:border-zinc-200 [&_.input-finance]:bg-white [&_.input-finance]:px-3 [&_.input-finance]:py-3 [&_.input-finance]:text-sm [&_.input-finance]:text-zinc-900 [&_.input-finance]:outline-none focus-within:[&_.input-finance]:border-zinc-500 dark:[&_.input-finance]:border-zinc-800 dark:[&_.input-finance]:bg-zinc-900 dark:[&_.input-finance]:text-white">{children}</div></label>;

const LoadingState = () => <div className="flex h-52 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"><RefreshCw size={20} className="animate-spin" /><span className="ml-2 text-xs">Consolidando dados financeiros...</span></div>;

export default DockaUnifiedFinanceView;
