import React, { useEffect, useMemo, useState } from 'react';
import {
    Activity, ArrowDownToLine, Building2, CalendarDays, CircleDollarSign,
    CreditCard, RefreshCw, Sparkles, Ticket, TrendingUp, Users,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fauvesService, FauvesOverviewSnapshot } from '../../../../services/fauvesService';
import { currency, LoadingState, PageHeader, Panel, SecondaryButton, shortCurrency, StatusBadge } from './FauvesUI';

const EMPTY: FauvesOverviewSnapshot = {
    gmv: 0, platformRevenue: 0, ticketsToday: 0, courtesyTicketsToday: 0,
    pendingWithdrawals: 0, activeEvents: 0, activeOrganizations: 0,
    paymentMix: { pix: 0, card: 0 }, revenueSeries: [], integrations: [], activities: [],
};

const fallbackSeries = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'].map((label) => ({ label, current: 0, previous: 0 }));

const RevenueChart = ({ data }: { data: FauvesOverviewSnapshot['revenueSeries'] }) => {
    const series = data.length > 1 ? data.slice(-12) : fallbackSeries;
    return (
        <div className="mt-6">
            <div className="mb-4 flex items-center gap-5 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-teal-500" /> Período atual</span>
                <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-slate-300 dark:bg-zinc-600" /> Período anterior</span>
            </div>
            <div className="h-64 rounded-xl bg-gradient-to-b from-teal-50/60 to-transparent pt-3 dark:from-teal-950/20">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <defs><linearGradient id="fauvesArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.28} /><stop offset="95%" stopColor="#14b8a6" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid vertical={false} stroke="#94a3b8" strokeOpacity={0.12} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(value) => shortCurrency(Number(value))} />
                        <Tooltip formatter={(value) => currency(Number(value))} contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 11 }} />
                        <Area type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="7 7" fill="transparent" />
                        <Area type="monotone" dataKey="current" stroke="#0d9488" strokeWidth={3} fill="url(#fauvesArea)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const PaymentDonut = ({ pix, card }: { pix: number; card: number }) => {
    const normalizedPix = pix + card > 0 ? (pix / (pix + card)) * 100 : 0;
    const chartData = [{ name: 'Pix', value: pix }, { name: 'Cartão', value: card }];
    return (
        <div className="flex items-center gap-6 py-5">
            <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} dataKey="value" innerRadius={44} outerRadius={62} strokeWidth={0}>{chartData.map((item, index) => <Cell key={item.name} fill={index === 0 ? '#14b8a6' : '#334155'} />)}</Pie><Tooltip formatter={(value) => currency(Number(value))} /></PieChart></ResponsiveContainer>
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-zinc-900"><span className="text-xl font-bold text-slate-950 dark:text-white">{Math.round(normalizedPix)}%</span><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pix</span></div>
            </div>
            <div className="flex-1 space-y-4">
                <div><div className="flex justify-between text-xs"><span className="font-semibold text-slate-700 dark:text-zinc-200">Pix</span><span>{currency(pix)}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-teal-500" style={{ width: `${normalizedPix}%` }} /></div></div>
                <div><div className="flex justify-between text-xs"><span className="font-semibold text-slate-700 dark:text-zinc-200">Cartão</span><span>{currency(card)}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-slate-700 dark:bg-zinc-400" style={{ width: `${100 - normalizedPix}%` }} /></div></div>
            </div>
        </div>
    );
};

const FauvesOverviewView: React.FC = () => {
    const [snapshot, setSnapshot] = useState<FauvesOverviewSnapshot>(EMPTY);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const [overview, rankingData] = await Promise.all([
            fauvesService.getOverviewSnapshot(),
            fauvesService.getRanking().catch(() => []),
        ]);
        setSnapshot(overview);
        setRanking(Array.isArray(rankingData) ? rankingData : []);
        setLoading(false);
    };

    useEffect(() => { void load(); }, []);

    const metrics = useMemo(() => [
        { label: 'GMV total', value: shortCurrency(snapshot.gmv), detail: currency(snapshot.gmv), icon: CircleDollarSign, accent: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
        { label: 'Receita Fauves', value: shortCurrency(snapshot.platformRevenue), detail: 'Take-rate acumulado', icon: TrendingUp, accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
        { label: 'Ingressos hoje', value: snapshot.ticketsToday.toLocaleString('pt-BR'), detail: `${snapshot.courtesyTicketsToday} cortesias`, icon: Ticket, accent: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
        { label: 'Saques pendentes', value: shortCurrency(snapshot.pendingWithdrawals), detail: 'Fila Pix operacional', icon: ArrowDownToLine, accent: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
        { label: 'Eventos ativos', value: snapshot.activeEvents.toLocaleString('pt-BR'), detail: 'Publicados e vendendo', icon: CalendarDays, accent: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
        { label: 'Calendários', value: snapshot.activeOrganizations.toLocaleString('pt-BR'), detail: 'Produtoras operando', icon: Building2, accent: 'text-slate-600 bg-slate-100 dark:bg-zinc-800' },
    ], [snapshot]);

    return (
        <div className="animate-in fade-in duration-500">
            <PageHeader eyebrow="Fauves HQ · Live telemetry" title="Centro de comando" description="Visão consolidada da receita, operação e saúde da plataforma em tempo real." actions={<><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"><Activity size={13} /> Operação online</span><SecondaryButton onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar</SecondaryButton></>} />
            {loading ? <Panel><LoadingState /></Panel> : <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{metrics.map((metric) => <Panel key={metric.label} className="group p-5 transition hover:-translate-y-0.5 hover:border-teal-300"><div className={`mb-5 inline-flex rounded-xl p-2.5 ${metric.accent}`}><metric.icon size={18} /></div><div className="truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white" title={metric.detail}>{metric.value}</div><div className="mt-1 text-xs font-semibold text-slate-600 dark:text-zinc-300">{metric.label}</div><div className="mt-1 text-[10px] text-slate-400">{metric.detail}</div></Panel>)}</div>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,.8fr)]">
                    <Panel className="p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Faturamento</h2><p className="mt-1 text-xs text-slate-400">Comparativo por período</p></div><Sparkles size={18} className="text-teal-500" /></div><RevenueChart data={snapshot.revenueSeries} /></Panel>
                    <Panel className="p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900 dark:text-white">Mix de pagamentos</h2><p className="mt-1 text-xs text-slate-400">Pix vs. cartão de crédito</p></div><CreditCard size={18} className="text-slate-400" /></div><PaymentDonut pix={snapshot.paymentMix.pix} card={snapshot.paymentMix.card} /></Panel>
                </div>
                <div className="mt-6 grid gap-6 xl:grid-cols-3">
                    <Panel className="overflow-hidden xl:col-span-1"><div className="border-b border-slate-100 px-6 py-5 dark:border-zinc-800"><h2 className="font-bold text-slate-900 dark:text-white">Top produtoras</h2><p className="mt-1 text-xs text-slate-400">Ranking por GMV</p></div><div className="p-5">{ranking.length ? <div className="space-y-4">{ranking.slice(0, 10).map((item, index) => <div key={item.id || item.name || index} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-zinc-800">{index + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-xs font-bold text-slate-800 dark:text-zinc-100">{item.name || item.organizationName}</div><div className="mt-1 h-1 rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.max(5, (Number(item.value || item.revenue || 0) / Number(ranking[0]?.value || ranking[0]?.revenue || 1)) * 100)}%` }} /></div></div><span className="text-xs font-semibold text-slate-500">{shortCurrency(Number(item.value || item.revenue || 0))}</span></div>)}</div> : <div className="py-12 text-center text-xs text-slate-400">Sem faturamento ranqueado no período.</div>}</div></Panel>
                    <Panel className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-5 dark:border-zinc-800"><h2 className="font-bold text-slate-900 dark:text-white">Saúde das integrações</h2><p className="mt-1 text-xs text-slate-400">Serviços críticos da operação</p></div><div className="divide-y divide-slate-100 dark:divide-zinc-800">{(snapshot.integrations.length ? snapshot.integrations : ['Efí Bank', 'Resend', 'Cloudflare R2', 'Database'].map((name) => ({ name, status: 'degraded' as const, latency: undefined }))).map((integration) => <div key={integration.name} className="flex items-center justify-between px-6 py-4"><div><div className="text-xs font-bold text-slate-800 dark:text-zinc-100">{integration.name}</div><div className="mt-1 text-[10px] text-slate-400">{integration.latency || 'Aguardando telemetria'}</div></div><StatusBadge value={integration.status} /></div>)}</div></Panel>
                    <Panel className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-5 dark:border-zinc-800"><h2 className="font-bold text-slate-900 dark:text-white">Atividade ao vivo</h2><p className="mt-1 text-xs text-slate-400">Últimos eventos operacionais</p></div><div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800">{snapshot.activities.length ? snapshot.activities.map((item) => <div key={item.id} className="flex gap-3 px-6 py-4"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,.12)]" /><div className="min-w-0 flex-1"><div className="text-xs font-bold text-slate-800 dark:text-zinc-100">{item.title}</div><p className="mt-1 truncate text-[10px] text-slate-400">{item.description}</p></div>{item.amount !== undefined && <span className="text-xs font-bold text-emerald-600">{shortCurrency(item.amount)}</span>}</div>) : <div className="flex min-h-56 flex-col items-center justify-center text-center text-xs text-slate-400"><Users size={24} className="mb-3 opacity-40" />Nenhuma atividade recebida.</div>}</div></Panel>
                </div>
            </>}
        </div>
    );
};

export default FauvesOverviewView;
