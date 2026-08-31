import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, DollarSign, Loader2, RefreshCw, ShoppingCart, Ticket, Users } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FauvesReportsSnapshot, fauvesService } from '../../../../services/fauvesService';

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Trend = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-[11px] font-semibold text-slate-400">sem base anterior</span>;
    const positive = value >= 0;
    return <span className={`flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-600' : 'text-rose-500'}`}>
        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(value).toLocaleString('pt-BR')}%
    </span>;
};

const MetricCard = ({ title, value, trend, icon: Icon, color }: { title: string; value: string | number; trend: number | null; icon: React.ElementType; color: string }) => (
    <div className="rounded-xl border border-docka-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex items-start justify-between"><div className={`rounded-lg bg-slate-50 p-2 dark:bg-zinc-800 ${color}`}><Icon size={19} /></div><Trend value={trend} /></div>
        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{value}</div>
        <div className="mt-1 text-xs font-semibold text-docka-500 dark:text-zinc-400">{title}</div>
        <div className="mt-1 text-[10px] text-docka-400">comparado ao período anterior</div>
    </div>
);

const ReportsView: React.FC = () => {
    const [periodDays, setPeriodDays] = useState(30);
    const [snapshot, setSnapshot] = useState<FauvesReportsSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true); setError('');
        try { setSnapshot(await fauvesService.getReportsSnapshot(periodDays)); }
        catch (loadError) { console.error('Failed to load Fauves reports', loadError); setSnapshot(null); setError('Não foi possível consolidar os dados da API Fauves. Tente novamente.'); }
        finally { setLoading(false); }
    };

    useEffect(() => { void load(); }, [periodDays]);

    if (loading) return <div className="flex h-[60vh] flex-col items-center justify-center text-docka-400"><Loader2 size={38} className="mb-4 animate-spin" /><p className="text-sm font-medium">Consolidando dados reais da Fauves…</p></div>;
    if (!snapshot) return <div className="flex h-[55vh] flex-col items-center justify-center text-center"><BarChart3 size={40} className="mb-4 text-rose-300" /><p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{error}</p><button onClick={() => void load()} className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-zinc-900"><RefreshCw size={14} /> Tentar novamente</button></div>;

    return <div className="animate-in fade-in pb-20 duration-500">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div><h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Relatórios & Análises</h1><p className="mt-1 text-sm text-docka-500 dark:text-zinc-400">Pedidos pagos, receita, ingressos e novos usuários consolidados da API Fauves.</p></div>
            <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-lg border border-docka-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"><Calendar size={14} className="text-docka-400" /><select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))} className="bg-transparent text-xs font-bold outline-none"><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option></select></div><button onClick={() => void load()} className="rounded-lg border border-docka-200 bg-white p-2.5 text-docka-500 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900" aria-label="Atualizar relatórios"><RefreshCw size={15} /></button></div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Receita no período" value={currency(snapshot.revenue)} trend={snapshot.trends.revenue} icon={DollarSign} color="text-emerald-600" />
            <MetricCard title="Pedidos pagos" value={snapshot.orders.toLocaleString('pt-BR')} trend={snapshot.trends.orders} icon={ShoppingCart} color="text-indigo-600" />
            <MetricCard title="Ingressos vendidos" value={snapshot.tickets.toLocaleString('pt-BR')} trend={snapshot.trends.tickets} icon={Ticket} color="text-purple-600" />
            <MetricCard title="Novos usuários" value={snapshot.users.toLocaleString('pt-BR')} trend={snapshot.trends.users} icon={Users} color="text-cyan-600" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-docka-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><h2 className="mb-5 text-sm font-bold text-docka-900 dark:text-zinc-100">Receita diária</h2><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={snapshot.series}><defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.32} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" /><YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { notation: 'compact' })}`} width={72} /><Tooltip formatter={(value) => currency(Number(value))} /><Area type="monotone" dataKey="revenue" name="Receita" stroke="#4f46e5" fill="url(#revenueGradient)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>
            <section className="rounded-xl border border-docka-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><h2 className="mb-5 text-sm font-bold text-docka-900 dark:text-zinc-100">Ingressos vendidos por dia</h2><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={snapshot.series}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={42} /><Tooltip /><Bar dataKey="tickets" name="Ingressos" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={28} /></BarChart></ResponsiveContainer></div></section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-docka-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="border-b border-docka-100 px-5 py-4 dark:border-zinc-800"><h2 className="text-sm font-bold">Top eventos no período</h2></div><table className="w-full text-xs"><thead className="bg-docka-50 text-left text-[10px] uppercase text-docka-400 dark:bg-zinc-800/50"><tr><th className="px-5 py-3">Evento</th><th className="px-5 py-3 text-center">Ingressos</th><th className="px-5 py-3 text-right">Receita</th></tr></thead><tbody className="divide-y divide-docka-100 dark:divide-zinc-800">{snapshot.topEvents.length ? snapshot.topEvents.map((event) => <tr key={event.id}><td className="px-5 py-4 font-semibold">{event.name}</td><td className="px-5 py-4 text-center">{event.tickets.toLocaleString('pt-BR')}</td><td className="px-5 py-4 text-right font-bold text-indigo-600">{currency(event.revenue)}</td></tr>) : <tr><td colSpan={3} className="px-5 py-12 text-center text-docka-400">Nenhum pedido pago no período.</td></tr>}</tbody></table></section>
            <section className="overflow-hidden rounded-xl border border-docka-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="border-b border-docka-100 px-5 py-4 dark:border-zinc-800"><h2 className="text-sm font-bold">Top produtoras no mês atual</h2></div><table className="w-full text-xs"><thead className="bg-docka-50 text-left text-[10px] uppercase text-docka-400 dark:bg-zinc-800/50"><tr><th className="px-5 py-3">Produtora</th><th className="px-5 py-3 text-center">Eventos</th><th className="px-5 py-3 text-right">Receita</th></tr></thead><tbody className="divide-y divide-docka-100 dark:divide-zinc-800">{snapshot.topOrganizations.length ? snapshot.topOrganizations.map((organization) => <tr key={organization.id}><td className="px-5 py-4 font-semibold">{organization.name}</td><td className="px-5 py-4 text-center">{organization.eventCount.toLocaleString('pt-BR')}</td><td className="px-5 py-4 text-right font-bold text-indigo-600">{currency(organization.revenue)}</td></tr>) : <tr><td colSpan={3} className="px-5 py-12 text-center text-docka-400">Nenhuma receita ranqueada neste mês.</td></tr>}</tbody></table></section>
        </div>
    </div>;
};

export default ReportsView;
