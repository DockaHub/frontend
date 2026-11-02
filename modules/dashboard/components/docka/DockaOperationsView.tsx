import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity, AlertTriangle, ArrowUpRight, Building2, CheckCircle2, ChevronRight,
    CircleDollarSign, Clock3, Gauge, RefreshCw, ShieldAlert, Star, Users,
    Wifi, WifiOff, Workflow, XCircle,
} from 'lucide-react';
import { api } from '../../../../services/api';
import DashboardPage from '../../../../components/DashboardPage';

type HealthStatus = 'healthy' | 'attention' | 'offline' | 'unknown';
interface Snapshot {
    generatedAt: string;
    summary: { revenue: number; revenueGrowth: number | null; clients: number; teamMembers: number; openWork: number; overdueWork: number; incidents24h: number; warnings24h: number; activeNow: number; health: HealthStatus };
    operations: { completedTasks30d: number; automationRuns24h: number; automationSuccessRate: number | null; averageAllyoRating: number | null; allyoRatingCount: number };
    integrations: Array<{ id: string; name: string; status: HealthStatus; detail: string }>;
    alerts: Array<{ id: string; severity: string; title: string; detail: string; view: string }>;
    businesses: Array<{ id: string; name: string; slug: string; logo?: string | null; status: HealthStatus; revenue: number; clients: number; workload: number; overdue: number; metricLabel: string; telemetry: boolean }>;
    teamPerformance: Array<{ id: string; name: string; avatar: string | null; role: string | null; source: string; completed: number; open: number; overdue: number; completionRate: number }>;
    activity: Array<{ id: string; type: string; title: string; source: string; createdAt: string }>;
}

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0);
const relativeTime = (value: string) => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
    return `há ${Math.floor(seconds / 86400)}d`;
};
const statusMeta: Record<HealthStatus, { label: string; dot: string; badge: string }> = {
    healthy: { label: 'Saudável', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900' },
    attention: { label: 'Atenção', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900' },
    offline: { label: 'Indisponível', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900' },
    unknown: { label: 'Sem telemetria', dot: 'bg-zinc-400', badge: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700' },
};

const DockaOperationsView: React.FC = () => {
    const [data, setData] = useState<Snapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async (background = false) => {
        background ? setRefreshing(true) : setLoading(true);
        try {
            const response = await api.get<Snapshot>('/dashboard/operations');
            setData(response.data);
            setError('');
        } catch (requestError) {
            console.error('[Operations] Failed to load', requestError);
            setError('Não foi possível atualizar o consolidado. Os últimos dados permanecem na tela.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void load();
        const interval = window.setInterval(() => void load(true), 30_000);
        return () => window.clearInterval(interval);
    }, [load]);

    const navigate = (view: string, org?: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('view', view);
        if (org) url.searchParams.set('org', org);
        window.location.href = url.toString();
    };
    const businesses = useMemo(() => [...(data?.businesses || [])].sort((a, b) => {
        const rank: Record<HealthStatus, number> = { offline: 0, attention: 1, unknown: 2, healthy: 3 };
        return rank[a.status] - rank[b.status] || b.revenue - a.revenue;
    }), [data?.businesses]);

    return <DashboardPage title="Central de Operações" icon={Activity} padding="p-4 sm:p-6 lg:p-8" actions={<div className="flex items-center gap-2"><span className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" /><span className="relative h-2 w-2 rounded-full bg-emerald-500" /></span>Tempo real</span><button onClick={() => void load(true)} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-docka-200 bg-white px-3 py-2 text-xs font-bold text-docka-700 hover:bg-docka-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /><span className="hidden sm:inline">Atualizar</span></button></div>}>
        {loading && !data ? <div className="flex min-h-[420px] items-center justify-center"><RefreshCw className="animate-spin text-docka-400" size={28} /></div> : data ? <div className="mx-auto max-w-[1680px] animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-2xl font-semibold tracking-tight text-docka-950 dark:text-white">O que precisa da sua atenção agora</p><p className="mt-1 text-sm text-docka-500 dark:text-zinc-400">Operação, financeiro e integrações consolidados em uma única leitura.</p></div><p className="text-[11px] font-medium text-docka-400">Atualizado {relativeTime(data.generatedAt)}</p></div>
            {error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">{error}</div>}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <MetricCard icon={CircleDollarSign} label="Receita confirmada" value={money(data.summary.revenue)} detail={data.summary.revenueGrowth === null ? 'Sem base comparável' : `${data.summary.revenueGrowth >= 0 ? '+' : ''}${data.summary.revenueGrowth}% vs. mês anterior`} tone="dark" />
                <MetricCard icon={Workflow} label="Trabalho aberto" value={String(data.summary.openWork)} detail={`${data.operations.completedTasks30d} concluídos em 30 dias`} />
                <MetricCard icon={Clock3} label="Atrasos" value={String(data.summary.overdueWork)} detail="Tarefas e cobranças" tone={data.summary.overdueWork ? 'warning' : 'success'} />
                <MetricCard icon={ShieldAlert} label="Incidentes · 24h" value={String(data.summary.incidents24h)} detail={`${data.summary.warnings24h} aviso(s)`} tone={data.summary.incidents24h ? 'danger' : 'success'} />
                <MetricCard icon={Users} label="Clientes monitorados" value={String(data.summary.clients)} detail={`${data.summary.activeNow} pessoa(s) ativa(s) agora`} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <Panel title="Prioridades agora" subtitle="Ordenadas pelo impacto" action={data.alerts.length ? `${data.alerts.length} alerta(s)` : 'Tudo em ordem'}>{data.alerts.length ? <div className="divide-y divide-docka-100 dark:divide-zinc-800">{data.alerts.slice(0, 6).map((alert) => <button key={alert.id} onClick={() => navigate(alert.view)} className="group flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-docka-50/70 dark:hover:bg-zinc-800/40"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${alert.severity === 'critical' ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>{alert.severity === 'critical' ? <XCircle size={18} /> : <AlertTriangle size={18} />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-docka-900 dark:text-zinc-100">{alert.title}</span><span className="mt-0.5 block truncate text-xs text-docka-500 dark:text-zinc-400">{alert.detail}</span></span><ChevronRight size={16} className="text-docka-300 group-hover:text-docka-700" /></button>)}</div> : <div className="flex items-center gap-4 px-5 py-8"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"><CheckCircle2 size={22} /></span><div><p className="font-bold text-docka-900 dark:text-white">Nenhuma prioridade crítica</p><p className="text-sm text-docka-500 dark:text-zinc-400">Sem falhas ou atrasos detectados agora.</p></div></div>}</Panel>
                <Panel title="Saúde do ecossistema" subtitle={`${data.integrations.filter((item) => item.status === 'healthy').length}/${data.integrations.length} integrações saudáveis`}><div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">{data.integrations.map((item) => <IntegrationCard key={item.id} item={item} />)}</div></Panel>
            </section>

            <Panel title="Negócios do ecossistema" subtitle="Receita, clientes e carga operacional por empresa" action={`${businesses.filter((item) => item.telemetry).length}/${businesses.length} conectados`}><div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">{businesses.map((business) => <BusinessCard key={business.id} business={business} onOpen={() => navigate('overview', business.slug)} />)}</div></Panel>

            <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                <Panel title="Desempenho do time" subtitle="Entregas concluídas em 30 dias e carga aberta">{data.teamPerformance.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-b border-docka-100 text-[10px] uppercase tracking-wider text-docka-400 dark:border-zinc-800"><th className="px-5 py-3">Pessoa</th><th className="px-3 py-3 text-center">Concluídas</th><th className="px-3 py-3 text-center">Abertas</th><th className="px-3 py-3 text-center">Atrasadas</th><th className="px-5 py-3">Ritmo</th></tr></thead><tbody className="divide-y divide-docka-100 dark:divide-zinc-800">{data.teamPerformance.map((person) => <tr key={person.id} className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/30"><td className="px-5 py-3"><div className="flex items-center gap-3"><Avatar name={person.name} src={person.avatar} /><div><p className="text-sm font-bold text-docka-900 dark:text-white">{person.name}</p><p className="text-[11px] text-docka-500">{person.role || person.source}</p></div></div></td><td className="px-3 py-3 text-center text-sm font-bold text-emerald-600">{person.completed}</td><td className="px-3 py-3 text-center text-sm font-semibold">{person.open}</td><td className={`px-3 py-3 text-center text-sm font-bold ${person.overdue ? 'text-red-600' : 'text-docka-300'}`}>{person.overdue}</td><td className="px-5 py-3"><div className="flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-docka-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-docka-900 dark:bg-zinc-100" style={{ width: `${person.completionRate}%` }} /></div><span className="w-9 text-right text-[11px] font-bold text-docka-500">{person.completionRate}%</span></div></td></tr>)}</tbody></table></div> : <EmptyState text="Ainda não há tarefas suficientes para medir o time." />}</Panel>
                <Panel title="Qualidade operacional" subtitle="Indicadores para detectar gargalos"><div className="grid grid-cols-2 gap-3 p-4"><QualityMetric icon={Gauge} label="Sucesso das automações" value={data.operations.automationSuccessRate === null ? '—' : `${data.operations.automationSuccessRate}%`} detail={`${data.operations.automationRuns24h} em 24h`} /><QualityMetric icon={CheckCircle2} label="Entregas concluídas" value={String(data.operations.completedTasks30d)} detail="Últimos 30 dias" /><QualityMetric icon={Star} label="Avaliação Allyo" value={data.operations.averageAllyoRating ? data.operations.averageAllyoRating.toFixed(1) : '—'} detail={`${data.operations.allyoRatingCount} avaliações`} /><QualityMetric icon={Users} label="Time monitorado" value={String(data.summary.teamMembers)} detail="Pessoas conectadas" /></div></Panel>
            </section>

            <Panel title="Atividade recente" subtitle="Eventos relevantes de todos os negócios"><div className="grid gap-x-6 md:grid-cols-2">{data.activity.slice(0, 10).map((item) => <div key={item.id} className="flex min-w-0 gap-3 border-b border-docka-100 px-5 py-3.5 dark:border-zinc-800"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.type === 'error' ? 'bg-red-500' : item.type === 'automation' ? 'bg-violet-500' : 'bg-emerald-500'}`} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-docka-800 dark:text-zinc-200">{item.title}</p><p className="mt-0.5 text-[11px] text-docka-400">{item.source} · {relativeTime(item.createdAt)}</p></div></div>)}</div></Panel>
        </div> : <EmptyState text={error || 'Não foi possível carregar a operação.'} />}
    </DashboardPage>;
};

const Panel = ({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: string; children: React.ReactNode }) => <section className="overflow-hidden rounded-2xl border border-docka-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><header className="flex items-center justify-between gap-4 border-b border-docka-100 px-5 py-4 dark:border-zinc-800"><div><h2 className="text-sm font-bold text-docka-950 dark:text-white">{title}</h2>{subtitle && <p className="mt-0.5 text-[11px] text-docka-500 dark:text-zinc-400">{subtitle}</p>}</div>{action && <span className="shrink-0 rounded-full bg-docka-50 px-2.5 py-1 text-[10px] font-bold text-docka-500 dark:bg-zinc-800">{action}</span>}</header>{children}</section>;
const MetricCard = ({ icon: Icon, label, value, detail, tone = 'default' }: { icon: React.ElementType; label: string; value: string; detail: string; tone?: 'default' | 'dark' | 'danger' | 'warning' | 'success' }) => { const styles = tone === 'dark' ? 'border-docka-950 bg-docka-950 text-white dark:border-white dark:bg-white dark:text-zinc-950' : tone === 'danger' ? 'border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20' : tone === 'warning' ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20' : tone === 'success' ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-docka-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'; return <article className={`min-w-0 rounded-2xl border p-4 shadow-sm sm:p-5 ${styles}`}><div className="flex items-center justify-between"><span className={`text-[10px] font-bold uppercase tracking-wider ${tone === 'dark' ? 'opacity-60' : 'text-docka-500'}`}>{label}</span><Icon size={17} className={tone === 'dark' ? 'opacity-60' : 'text-docka-400'} /></div><p className="mt-4 truncate text-2xl font-semibold tracking-tight sm:text-[28px]">{value}</p><p className={`mt-1 truncate text-[11px] ${tone === 'dark' ? 'opacity-55' : 'text-docka-500'}`}>{detail}</p></article>; };
const IntegrationCard = ({ item }: { item: Snapshot['integrations'][number] }) => { const meta = statusMeta[item.status]; return <div className="flex items-center gap-3 rounded-2xl border border-docka-100 bg-docka-50/40 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40"><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-zinc-900 ${item.status === 'offline' ? 'text-red-500' : item.status === 'attention' ? 'text-amber-500' : 'text-emerald-600'}`}>{item.status === 'offline' ? <WifiOff size={17} /> : <Wifi size={17} />}</span><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold">{item.name}</p><span className={`h-2 w-2 rounded-full ${meta.dot}`} /></div><p className="truncate text-[11px] text-docka-500">{item.detail}</p></div></div>; };
const BusinessCard = ({ business, onOpen }: { business: Snapshot['businesses'][number]; onOpen: () => void }) => { const meta = statusMeta[business.status]; return <button onClick={onOpen} className="group rounded-2xl border border-docka-100 bg-docka-50/35 p-4 text-left transition hover:-translate-y-0.5 hover:border-docka-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/35 dark:hover:bg-zinc-900"><div className="flex items-start justify-between"><div className="flex items-center gap-3">{business.logo ? <img src={business.logo} alt="" className="h-10 w-10 rounded-xl border bg-white object-contain p-1.5" /> : <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-docka-950 text-sm font-bold text-white">{business.name[0]}</span>}<div><p className="font-bold">{business.name}</p><span className={`mt-1 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold ${meta.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span></div></div><ArrowUpRight size={15} className="text-docka-300 group-hover:text-docka-900" /></div><div className="mt-5 grid grid-cols-3 gap-2"><SmallStat label="Receita" value={money(business.revenue)} /><SmallStat label="Clientes" value={String(business.clients)} /><SmallStat label={business.metricLabel} value={business.telemetry ? String(business.workload) : '—'} /></div>{business.overdue > 0 && <p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-red-600"><AlertTriangle size={12} />{business.overdue} pendência(s)</p>}</button>; };
const SmallStat = ({ label, value }: { label: string; value: string }) => <div className="min-w-0"><p className="truncate text-[9px] uppercase tracking-wide text-docka-400">{label}</p><p className="mt-1 truncate text-xs font-bold">{value}</p></div>;
const QualityMetric = ({ icon: Icon, label, value, detail }: { icon: React.ElementType; label: string; value: string; detail: string }) => <div className="rounded-2xl border border-docka-100 bg-docka-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"><Icon size={17} className="text-docka-400" /><p className="mt-4 text-xl font-semibold">{value}</p><p className="mt-1 text-[11px] font-bold">{label}</p><p className="text-[10px] text-docka-400">{detail}</p></div>;
const Avatar = ({ name, src }: { name: string; src: string | null }) => src ? <img src={src} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-docka-100 text-[10px] font-bold">{name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>;
const EmptyState = ({ text }: { text: string }) => <div className="flex min-h-32 items-center justify-center px-6 py-10 text-center text-sm text-docka-500"><Building2 size={18} className="mr-2" />{text}</div>;

export default DockaOperationsView;
