import React, { useEffect, useState } from 'react';
import {
    ArrowDownRight, ArrowUpRight, BarChart3, Calendar, DollarSign,
    RefreshCw, ShoppingCart, Ticket, Users,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FauvesReportsSnapshot, fauvesService } from '../../../../services/fauvesService';
import { LoadingState, PageHeader, Panel, SecondaryButton } from './FauvesUI';

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const chartGrid = '#e2e8f0';
const chartAccent = '#0d9488';

const Trend = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-[10px] font-medium text-slate-400">sem comparação</span>;
    const positive = value >= 0;
    return (
        <span className={`flex items-center gap-1 text-[10px] font-bold sm:text-xs ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(value).toLocaleString('pt-BR')}%
        </span>
    );
};

const MetricCard = ({ title, value, trend, icon: Icon, tone }: {
    title: string;
    value: string | number;
    trend: number | null;
    icon: React.ElementType;
    tone: string;
}) => (
    <Panel className="min-w-0 p-5">
        <div className="flex items-start justify-between gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={18} /></span>
            <Trend value={trend} />
        </div>
        <strong className="mt-5 block truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{value}</strong>
        <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-zinc-400">{title}</span>
    </Panel>
);

const SectionHeading = ({ children, description }: { children: React.ReactNode; description?: string }) => (
    <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{children}</h2>
        {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
);

const ReportsView: React.FC = () => {
    const [periodDays, setPeriodDays] = useState(30);
    const [snapshot, setSnapshot] = useState<FauvesReportsSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            setSnapshot(await fauvesService.getReportsSnapshot(periodDays));
        } catch (loadError) {
            console.error('Failed to load Fauves reports', loadError);
            setSnapshot(null);
            setError('Não foi possível consolidar os dados da Fauves. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [periodDays]);

    const actions = (
        <div className="flex items-center gap-2">
            <label className="flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-900">
                <Calendar size={14} className="shrink-0 text-slate-400" />
                <select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))} aria-label="Período do relatório" className="max-w-[150px] bg-transparent text-base font-semibold text-slate-700 outline-none dark:text-zinc-200 sm:max-w-none">
                    <option value={7}>Últimos 7 dias</option>
                    <option value={30}>Últimos 30 dias</option>
                    <option value={90}>Últimos 90 dias</option>
                </select>
            </label>
            <SecondaryButton onClick={() => void load()} disabled={loading} aria-label="Atualizar relatórios" title="Atualizar relatórios">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Atualizar</span>
            </SecondaryButton>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-300">
            <PageHeader
                eyebrow="Inteligência"
                title="Relatórios"
                description="Receita, pedidos, ingressos e crescimento da plataforma em uma visão consolidada."
                actions={actions}
            />

            {loading ? (
                <Panel><LoadingState label="Consolidando os dados da Fauves…" /></Panel>
            ) : !snapshot ? (
                <Panel className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-400 dark:bg-rose-950/30"><BarChart3 size={25} /></span>
                    <h2 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Não foi possível carregar os relatórios</h2>
                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-zinc-400">{error}</p>
                    <SecondaryButton onClick={() => void load()} className="mt-5"><RefreshCw size={14} /> Tentar novamente</SecondaryButton>
                </Panel>
            ) : (
                <div className="space-y-6">
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard title="Receita no período" value={currency(snapshot.revenue)} trend={snapshot.trends.revenue} icon={DollarSign} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300" />
                        <MetricCard title="Pedidos pagos" value={snapshot.orders.toLocaleString('pt-BR')} trend={snapshot.trends.orders} icon={ShoppingCart} tone="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300" />
                        <MetricCard title="Ingressos vendidos" value={snapshot.tickets.toLocaleString('pt-BR')} trend={snapshot.trends.tickets} icon={Ticket} tone="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300" />
                        <MetricCard title="Novos usuários" value={snapshot.users.toLocaleString('pt-BR')} trend={snapshot.trends.users} icon={Users} tone="bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300" />
                    </section>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <Panel className="overflow-hidden">
                            <SectionHeading description="Evolução diária no período selecionado">Receita por dia</SectionHeading>
                            <div className="h-[280px] p-4 pr-5 sm:h-[330px] sm:p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={snapshot.series}>
                                        <defs><linearGradient id="fauvesRevenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartAccent} stopOpacity={0.24} /><stop offset="95%" stopColor={chartAccent} stopOpacity={0} /></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { notation: 'compact' })}`} width={64} />
                                        <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ borderRadius: 12, borderColor: chartGrid, fontSize: 12 }} />
                                        <Area type="monotone" dataKey="revenue" name="Receita" stroke={chartAccent} fill="url(#fauvesRevenueGradient)" strokeWidth={2.5} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>

                        <Panel className="overflow-hidden">
                            <SectionHeading description="Volume confirmado por data">Ingressos vendidos por dia</SectionHeading>
                            <div className="h-[280px] p-4 pr-5 sm:h-[330px] sm:p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={snapshot.series}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={36} />
                                        <Tooltip contentStyle={{ borderRadius: 12, borderColor: chartGrid, fontSize: 12 }} />
                                        <Bar dataKey="tickets" name="Ingressos" fill={chartAccent} radius={[6, 6, 0, 0]} maxBarSize={28} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <RankingPanel
                            title="Eventos com maior resultado"
                            empty="Nenhum pedido pago no período."
                            rows={snapshot.topEvents.map((event) => ({ id: event.id, name: event.name, detail: `${event.tickets.toLocaleString('pt-BR')} ingressos`, value: currency(event.revenue) }))}
                        />
                        <RankingPanel
                            title="Produtoras com maior resultado"
                            empty="Nenhuma receita ranqueada neste período."
                            rows={snapshot.topOrganizations.map((organization) => ({ id: organization.id, name: organization.name, detail: `${organization.eventCount.toLocaleString('pt-BR')} eventos`, value: currency(organization.revenue) }))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const RankingPanel = ({ title, rows, empty }: { title: string; rows: Array<{ id: string; name: string; detail: string; value: string }>; empty: string }) => (
    <Panel className="overflow-hidden">
        <SectionHeading>{title}</SectionHeading>
        {rows.length ? (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {rows.map((row, index) => (
                    <div key={row.id} className="grid min-h-[72px] grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:px-6">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-300">{index + 1}</span>
                        <span className="min-w-0"><strong className="block truncate text-sm text-slate-900 dark:text-white">{row.name}</strong><small className="mt-1 block text-[10px] text-slate-400">{row.detail}</small></span>
                        <strong className="text-xs text-teal-700 dark:text-teal-300 sm:text-sm">{row.value}</strong>
                    </div>
                ))}
            </div>
        ) : <div className="px-5 py-14 text-center text-sm text-slate-400">{empty}</div>}
    </Panel>
);

export default ReportsView;
