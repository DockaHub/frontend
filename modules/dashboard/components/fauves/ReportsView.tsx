import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, DollarSign, Loader2, RefreshCw, ShoppingCart, Ticket, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FauvesReportsSnapshot, fauvesService } from '../../../../services/fauvesService';
import { FauvesPageHeader, SecondaryButton } from './FauvesUI';

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Trend = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-[10px] font-medium text-zinc-400">sem comparação</span>;
    const positive = value >= 0;
    return <span className={`flex items-center gap-1 text-[10px] font-semibold sm:text-xs ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
        {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{Math.abs(value).toLocaleString('pt-BR')}%
    </span>;
};

const MetricCard = ({ title, value, trend, icon: Icon, color }: { title: string; value: string | number; trend: number | null; icon: React.ElementType; color: string }) => (
    <div className="min-w-0 bg-white p-4 dark:bg-zinc-950 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-2"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 ${color}`}><Icon size={17} /></span><Trend value={trend} /></div>
        <div className="truncate text-xl font-semibold text-black dark:text-white sm:text-2xl">{value}</div>
        <div className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 sm:text-xs">{title}</div>
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

    const actions = <div className="flex items-center gap-2">
        <label className="flex min-h-10 items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 dark:border-zinc-700 dark:bg-zinc-900">
            <Calendar size={14} className="shrink-0 text-zinc-400" />
            <select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))} aria-label="Período do relatório" className="max-w-[116px] bg-transparent text-xs font-semibold outline-none sm:max-w-none">
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
                <option value={90}>Últimos 90 dias</option>
            </select>
        </label>
        <SecondaryButton onClick={() => void load()} disabled={loading} aria-label="Atualizar relatórios"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></SecondaryButton>
    </div>;

    return <div className="h-full min-h-0 overflow-y-auto bg-white pb-12 dark:bg-zinc-950">
        <FauvesPageHeader title="Relatórios" description="Receita, pedidos, ingressos e crescimento da plataforma." actions={actions} />
        {loading ? <div className="flex min-h-[55vh] flex-col items-center justify-center text-zinc-400"><Loader2 size={30} className="mb-4 animate-spin text-[#2a2ad7]" /><p className="text-sm">Consolidando os dados…</p></div> : !snapshot ? <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center"><BarChart3 size={36} className="mb-4 text-rose-300" /><p className="max-w-md text-sm font-medium text-zinc-700 dark:text-zinc-200">{error}</p><SecondaryButton onClick={() => void load()} className="mt-5"><RefreshCw size={14} /> Tentar novamente</SecondaryButton></div> : <main className="p-4 sm:p-6 lg:p-8">
            <section className="mb-4 grid grid-cols-2 gap-px overflow-hidden border border-[#e5e5e5] bg-[#e5e5e5] dark:border-zinc-800 dark:bg-zinc-800 xl:grid-cols-4">
                <MetricCard title="Receita no período" value={currency(snapshot.revenue)} trend={snapshot.trends.revenue} icon={DollarSign} color="text-emerald-600" />
                <MetricCard title="Pedidos pagos" value={snapshot.orders.toLocaleString('pt-BR')} trend={snapshot.trends.orders} icon={ShoppingCart} color="text-indigo-600" />
                <MetricCard title="Ingressos vendidos" value={snapshot.tickets.toLocaleString('pt-BR')} trend={snapshot.trends.tickets} icon={Ticket} color="text-purple-600" />
                <MetricCard title="Novos usuários" value={snapshot.users.toLocaleString('pt-BR')} trend={snapshot.trends.users} icon={Users} color="text-cyan-600" />
            </section>

            <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"><h2 className="mb-4 text-sm font-semibold text-black dark:text-white">Receita por dia</h2><div className="h-[240px] sm:h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={snapshot.series}><defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2a2ad7" stopOpacity={0.28} /><stop offset="95%" stopColor="#2a2ad7" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { notation: 'compact' })}`} width={64} /><Tooltip formatter={(value) => currency(Number(value))} /><Area type="monotone" dataKey="revenue" name="Receita" stroke="#2a2ad7" fill="url(#revenueGradient)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>
                <section className="border border-[#e5e5e5] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-5"><h2 className="mb-4 text-sm font-semibold text-black dark:text-white">Ingressos vendidos por dia</h2><div className="h-[240px] sm:h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={snapshot.series}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={36} /><Tooltip /><Bar dataKey="tickets" name="Ingressos" fill="#2a2ad7" radius={[4, 4, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div></section>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <section className="overflow-hidden border border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950"><div className="border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:px-5"><h2 className="text-sm font-semibold">Eventos com maior resultado</h2></div><div className="divide-y divide-[#e5e5e5] dark:divide-zinc-800">{snapshot.topEvents.length ? snapshot.topEvents.map((event, index) => <div key={event.id} className="grid min-h-[68px] grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"><span className="text-xs font-semibold text-zinc-400">{index + 1}</span><span className="min-w-0"><strong className="block truncate text-sm text-black dark:text-white">{event.name}</strong><small className="mt-1 block text-[10px] text-zinc-400">{event.tickets.toLocaleString('pt-BR')} ingressos</small></span><strong className="text-xs text-[#2a2ad7] dark:text-indigo-400 sm:text-sm">{currency(event.revenue)}</strong></div>) : <div className="px-5 py-12 text-center text-sm text-zinc-400">Nenhum pedido pago no período.</div>}</div></section>
                <section className="overflow-hidden border border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950"><div className="border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:px-5"><h2 className="text-sm font-semibold">Produtoras com maior resultado</h2></div><div className="divide-y divide-[#e5e5e5] dark:divide-zinc-800">{snapshot.topOrganizations.length ? snapshot.topOrganizations.map((organization, index) => <div key={organization.id} className="grid min-h-[68px] grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"><span className="text-xs font-semibold text-zinc-400">{index + 1}</span><span className="min-w-0"><strong className="block truncate text-sm text-black dark:text-white">{organization.name}</strong><small className="mt-1 block text-[10px] text-zinc-400">{organization.eventCount.toLocaleString('pt-BR')} eventos</small></span><strong className="text-xs text-[#2a2ad7] dark:text-indigo-400 sm:text-sm">{currency(organization.revenue)}</strong></div>) : <div className="px-5 py-12 text-center text-sm text-zinc-400">Nenhuma receita ranqueada neste mês.</div>}</div></section>
            </div>
        </main>}
    </div>;
};

export default ReportsView;
