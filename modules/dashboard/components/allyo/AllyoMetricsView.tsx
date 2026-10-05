import { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock3,
    Gauge,
    RefreshCw,
    Star,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    allyoService,
    type AllyoClient,
    type AllyoDemand,
    type AllyoDemandTask,
} from '../../../../services/allyoService';
import { ALLYO_BORDER, AllyoPageHeader } from './AllyoUI';

type Period = '30' | '90' | 'ytd' | 'all';

const PERIODS: Array<{ value: Period; label: string }> = [
    { value: '30', label: '30 dias' },
    { value: '90', label: '90 dias' },
    { value: 'ytd', label: 'Este ano' },
    { value: 'all', label: 'Todo período' },
];

const completedStatuses = new Set(['concluido', 'concluida', 'aprovado', 'aprovada']);
const normalize = (value?: string | null) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
const isCompleted = (status?: string | null) => completedStatuses.has(normalize(status));
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const percent = (value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const credits = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const parseDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const periodStart = (period: Period) => {
    const now = new Date();
    if (period === 'all') return null;
    if (period === 'ytd') return new Date(now.getFullYear(), 0, 1);
    const start = new Date(now);
    start.setDate(start.getDate() - Number(period));
    return start;
};

interface TaskWithContext extends AllyoDemandTask {
    clientName: string;
    projectName: string;
}

const flattenTasks = (demands: AllyoDemand[]): TaskWithContext[] => demands.flatMap((demand) => {
    const tasks = Array.isArray(demand.tasksList) ? demand.tasksList : [];
    return tasks.map((task) => ({
        ...task,
        clientName: demand.workspace?.name || 'Cliente não informado',
        projectName: demand.name,
    }));
});

const AllyoMetricsView = () => {
    const [period, setPeriod] = useState<Period>('90');
    const [demands, setDemands] = useState<AllyoDemand[]>([]);
    const [clients, setClients] = useState<AllyoClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [demandResponse, clientResponse] = await Promise.all([
                allyoService.getDemands(),
                allyoService.getClients(),
            ]);
            setDemands(Array.isArray(demandResponse.demands) ? demandResponse.demands : []);
            setClients(Array.isArray(clientResponse.clients) ? clientResponse.clients : []);
        } catch (loadError) {
            console.warn('[AllyoMetricsView] Erro ao carregar métricas:', loadError);
            setError('Não foi possível atualizar as métricas agora.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const dashboard = useMemo(() => {
        const allTasks = flattenTasks(demands);
        const start = periodStart(period);
        const inPeriod = (task: TaskWithContext) => {
            if (!start) return true;
            const reference = parseDate(task.updatedAt || task.createdAt);
            return Boolean(reference && reference >= start);
        };
        const tasks = allTasks.filter(inPeriod);
        const completed = tasks.filter((task) => isCompleted(task.status));
        const active = allTasks.filter((task) => !isCompleted(task.status) && normalize(task.status) !== 'inativa');
        const now = new Date();
        const overdue = active.filter((task) => {
            const deadline = parseDate(task.deadlineAt);
            return deadline ? deadline < now : false;
        });
        const blocked = active.filter((task) => task.dependencyBlocked || normalize(task.status).includes('bloque'));
        const inReview = active.filter((task) => normalize(task.status).includes('revis'));
        const rated = completed.filter((task) => number(task.feedback?.rating) > 0);
        const averageRating = rated.length
            ? rated.reduce((total, task) => total + number(task.feedback?.rating), 0) / rated.length
            : 0;

        const comparableSla = completed.filter((task) => parseDate(task.deadlineAt) && parseDate(task.updatedAt));
        const onTime = comparableSla.filter((task) => {
            const deadline = parseDate(task.deadlineAt);
            const finished = parseDate(task.updatedAt);
            return Boolean(deadline && finished && finished <= deadline);
        });
        const sla = comparableSla.length ? (onTime.length / comparableSla.length) * 100 : 0;

        const contractedCredits = clients.reduce((total, client) => total + number(client.monthlyCredits), 0);
        const usedCredits = clients.reduce((total, client) => total + number(client.usedCredits), 0);
        const creditUsage = contractedCredits ? (usedCredits / contractedCredits) * 100 : 0;

        const statusEntries = [
            { label: 'A iniciar', value: tasks.filter((task) => normalize(task.status) === 'a iniciar').length, color: '#9db669' },
            { label: 'Em andamento', value: tasks.filter((task) => normalize(task.status) === 'em andamento').length, color: '#2a2ad7' },
            { label: 'Em revisão', value: tasks.filter((task) => normalize(task.status).includes('revis')).length, color: '#fd6b32' },
            { label: 'Concluídas', value: completed.length, color: '#00a33c' },
        ];
        const statusTotal = Math.max(1, statusEntries.reduce((total, item) => total + item.value, 0));

        const monthlyMap = new Map<string, { key: string; label: string; entregas: number; creditos: number }>();
        tasks.forEach((task) => {
            const date = parseDate(task.updatedAt || task.createdAt);
            if (!date) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = monthlyMap.get(key) || {
                key,
                label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', ''),
                entregas: 0,
                creditos: 0,
            };
            if (isCompleted(task.status)) current.entregas += 1;
            current.creditos += number(task.creditsConsumed || task.credits);
            monthlyMap.set(key, current);
        });
        const monthly = Array.from(monthlyMap.values()).sort((left, right) => left.key.localeCompare(right.key)).slice(-8);

        const specialties = new Map<string, { total: number; completed: number; credits: number }>();
        tasks.forEach((task) => {
            const label = task.team || 'Sem especialidade';
            const current = specialties.get(label) || { total: 0, completed: 0, credits: 0 };
            current.total += 1;
            current.completed += isCompleted(task.status) ? 1 : 0;
            current.credits += number(task.creditsConsumed || task.credits);
            specialties.set(label, current);
        });

        const clientUsage = clients
            .map((client) => ({
                id: client.id,
                name: client.name,
                used: number(client.usedCredits),
                contracted: number(client.monthlyCredits),
                usage: number(client.monthlyCredits) ? (number(client.usedCredits) / number(client.monthlyCredits)) * 100 : 0,
            }))
            .sort((left, right) => right.usage - left.usage);

        return {
            tasks,
            completed,
            active,
            overdue,
            blocked,
            inReview,
            averageRating,
            rated,
            sla,
            comparableSla,
            contractedCredits,
            usedCredits,
            creditUsage,
            statusEntries,
            statusTotal,
            monthly,
            specialties: Array.from(specialties.entries()).map(([name, values]) => ({ name, ...values })).sort((a, b) => b.total - a.total),
            clientUsage,
        };
    }, [clients, demands, period]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader
                title="Métricas"
                actions={(
                    <div className="flex items-center gap-2">
                        <select
                            value={period}
                            onChange={(event) => setPeriod(event.target.value as Period)}
                            aria-label="Período das métricas"
                            className="h-9 rounded-lg border border-[#e5e5e5] bg-white px-3 text-xs font-semibold outline-none focus:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                        <button type="button" onClick={() => void load()} disabled={isLoading} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e5e5] text-[#7f7f7f] transition hover:border-[#9db669] hover:text-black disabled:opacity-50 dark:border-zinc-700 dark:hover:text-white" aria-label="Atualizar métricas">
                            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                )}
            />

            {error && <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-xs font-medium text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300 sm:px-[30px]">{error}</div>}

            <main className="space-y-5 p-5 sm:p-[30px]">
                <section className="grid grid-cols-2 gap-[10px] xl:grid-cols-4" aria-label="Indicadores principais">
                    <MetricCard icon={<Gauge size={17} />} label="Uso de créditos" value={percent(dashboard.creditUsage)} detail={`${credits(dashboard.usedCredits)} de ${credits(dashboard.contractedCredits)} créditos`} tone={dashboard.creditUsage > 100 ? 'warning' : 'default'} loading={isLoading} />
                    <MetricCard icon={<CheckCircle2 size={17} />} label="SLA de entrega" value={dashboard.comparableSla.length ? percent(dashboard.sla) : '—'} detail={`${dashboard.comparableSla.length} entregas com prazo comparável`} tone={dashboard.sla > 0 && dashboard.sla < 85 ? 'warning' : 'default'} loading={isLoading} />
                    <MetricCard icon={<Star size={17} />} label="Avaliação média" value={dashboard.rated.length ? dashboard.averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '—'} detail={`${dashboard.rated.length} avaliações no período`} loading={isLoading} />
                    <MetricCard icon={<BarChart3 size={17} />} label="Entregas concluídas" value={String(dashboard.completed.length)} detail={`${dashboard.active.length} tarefas ativas agora`} loading={isLoading} />
                </section>

                <section className="grid gap-[10px] xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,.75fr)]">
                    <Panel title="Evolução operacional" subtitle="Entregas e créditos por mês">
                        <div className="h-[280px] px-2 pb-3 pt-5 sm:px-5">
                            {dashboard.monthly.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={dashboard.monthly} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="allyoMetricsFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#9db669" stopOpacity={0.35} />
                                                <stop offset="100%" stopColor="#9db669" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7f7f7f' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#7f7f7f' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#e5e5e5', fontSize: 11 }} />
                                        <Area type="monotone" dataKey="entregas" name="Entregas" stroke="#66783f" strokeWidth={2} fill="url(#allyoMetricsFill)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <EmptyState label="Ainda não há histórico suficiente para o gráfico." />}
                        </div>
                    </Panel>

                    <Panel title="Fluxo das tarefas" subtitle={`${dashboard.tasks.length} tarefas no período`}>
                        <div className="space-y-5 p-5">
                            {dashboard.statusEntries.map((item) => (
                                <div key={item.label}>
                                    <div className="mb-2 flex items-center justify-between text-xs"><span>{item.label}</span><strong>{item.value}</strong></div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0] dark:bg-zinc-800"><div className="h-full rounded-full" style={{ width: `${(item.value / dashboard.statusTotal) * 100}%`, backgroundColor: item.color }} /></div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </section>

                <section className="grid gap-[10px] xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]">
                    <Panel title="Utilização por cliente" subtitle="Franquia mensal contratada">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[590px] text-left text-xs">
                                <thead className="border-b border-[#e5e5e5] text-[10px] uppercase tracking-[.04em] text-[#7f7f7f] dark:border-zinc-800"><tr><th className="px-5 py-3 font-semibold">Cliente</th><th className="px-4 py-3 font-semibold">Utilização</th><th className="px-4 py-3 text-right font-semibold">Usados</th><th className="px-5 py-3 text-right font-semibold">Contratados</th></tr></thead>
                                <tbody className="divide-y divide-[#efefef] dark:divide-zinc-800">
                                    {dashboard.clientUsage.slice(0, 8).map((client) => (
                                        <tr key={client.id}>
                                            <td className="px-5 py-3 font-semibold">{client.name}</td>
                                            <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#efefef] dark:bg-zinc-800"><div className={`h-full rounded-full ${client.usage > 100 ? 'bg-[#fd6b32]' : 'bg-[#9db669]'}`} style={{ width: `${Math.min(100, client.usage)}%` }} /></div><span className={client.usage > 100 ? 'font-semibold text-[#fd6b32]' : ''}>{percent(client.usage)}</span></div></td>
                                            <td className="px-4 py-3 text-right">{credits(client.used)}</td>
                                            <td className="px-5 py-3 text-right text-[#7f7f7f]">{credits(client.contracted)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!isLoading && dashboard.clientUsage.length === 0 && <EmptyState label="Nenhum cliente com franquia disponível." />}
                        </div>
                    </Panel>

                    <Panel title="Pontos de atenção" subtitle="Fila operacional atual">
                        <div className="divide-y divide-[#efefef] dark:divide-zinc-800">
                            <AlertRow icon={<Clock3 size={16} />} label="Tarefas em atraso" value={dashboard.overdue.length} critical={dashboard.overdue.length > 0} />
                            <AlertRow icon={<AlertTriangle size={16} />} label="Dependências bloqueadas" value={dashboard.blocked.length} critical={dashboard.blocked.length > 0} />
                            <AlertRow icon={<RefreshCw size={16} />} label="Aguardando revisão" value={dashboard.inReview.length} critical={dashboard.inReview.length > 4} />
                            <AlertRow icon={<Gauge size={16} />} label="Clientes acima da franquia" value={dashboard.clientUsage.filter((client) => client.usage > 100).length} critical={dashboard.clientUsage.some((client) => client.usage > 100)} />
                        </div>
                    </Panel>
                </section>

                <Panel title="Desempenho por especialidade" subtitle="Volume e consumo no período">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-xs">
                            <thead className="border-b border-[#e5e5e5] text-[10px] uppercase tracking-[.04em] text-[#7f7f7f] dark:border-zinc-800"><tr><th className="px-5 py-3 font-semibold">Especialidade</th><th className="px-4 py-3 text-right font-semibold">Tarefas</th><th className="px-4 py-3 text-right font-semibold">Concluídas</th><th className="px-4 py-3 text-right font-semibold">Taxa de conclusão</th><th className="px-5 py-3 text-right font-semibold">Créditos</th></tr></thead>
                            <tbody className="divide-y divide-[#efefef] dark:divide-zinc-800">
                                {dashboard.specialties.map((item) => (
                                    <tr key={item.name}><td className="px-5 py-3 font-semibold">{item.name}</td><td className="px-4 py-3 text-right">{item.total}</td><td className="px-4 py-3 text-right">{item.completed}</td><td className="px-4 py-3 text-right">{percent(item.total ? (item.completed / item.total) * 100 : 0)}</td><td className="px-5 py-3 text-right text-[#7f7f7f]">{credits(item.credits)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        {!isLoading && dashboard.specialties.length === 0 && <EmptyState label="Nenhuma tarefa encontrada no período." />}
                    </div>
                </Panel>

                <p className="pb-2 text-[10px] leading-5 text-[#8d8d8d]">Indicadores calculados diretamente com projetos, tarefas, avaliações e franquias da Allyo. O SLA compara a última atualização da tarefa concluída com o prazo registrado. Métricas financeiras e de retenção dependem da futura integração com CRM/faturamento.</p>
            </main>
        </div>
    );
};

const Panel = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <section className={`overflow-hidden rounded-[12px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}>
        <div className={`flex min-h-[60px] items-center justify-between gap-3 border-b px-5 ${ALLYO_BORDER}`}><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-0.5 text-[10px] text-[#8d8d8d]">{subtitle}</p></div></div>
        {children}
    </section>
);

const MetricCard = ({ icon, label, value, detail, loading, tone = 'default' }: { icon: React.ReactNode; label: string; value: string; detail: string; loading: boolean; tone?: 'default' | 'warning' }) => (
    <article className={`min-w-0 rounded-[12px] border p-4 sm:p-5 ${tone === 'warning' ? 'border-[#fd6b32]/50 bg-[#fffaf7] dark:bg-orange-950/10' : `${ALLYO_BORDER} bg-white dark:bg-zinc-950`}`}>
        <div className="flex items-center gap-2 text-[#7f7f7f]"><span className={tone === 'warning' ? 'text-[#fd6b32]' : 'text-[#9db669]'}>{icon}</span><span className="truncate text-[10px] font-bold uppercase tracking-[.04em]">{label}</span></div>
        <strong className={`mt-5 block text-[26px] font-semibold tracking-tight ${loading ? 'animate-pulse text-zinc-300' : ''}`}>{loading ? '—' : value}</strong>
        <span className="mt-1 block truncate text-[10px] text-[#8d8d8d]">{detail}</span>
    </article>
);

const AlertRow = ({ icon, label, value, critical }: { icon: React.ReactNode; label: string; value: number; critical: boolean }) => (
    <div className="flex items-center gap-3 px-5 py-4"><span className={critical ? 'text-[#fd6b32]' : 'text-[#9db669]'}>{icon}</span><span className="min-w-0 flex-1 truncate text-xs">{label}</span><strong className={`text-sm ${critical ? 'text-[#fd6b32]' : ''}`}>{value}</strong></div>
);

const EmptyState = ({ label }: { label: string }) => <div className="flex min-h-[120px] items-center justify-center px-6 text-center text-xs text-[#8d8d8d]">{label}</div>;

export default AllyoMetricsView;
