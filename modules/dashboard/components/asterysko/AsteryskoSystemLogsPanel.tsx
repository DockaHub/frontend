import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    RefreshCw,
    Search,
    Server,
    ShieldCheck,
} from 'lucide-react';
import api from '../../../../services/api';

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
type LogSource = 'system' | 'asterysko' | 'inpi' | 'automation';

interface SystemLogItem {
    id: string;
    level: LogLevel;
    source: LogSource;
    product: string;
    message: string;
    details: unknown;
    createdAt: string;
}

interface SystemLogsSummary {
    errors: number;
    warnings: number;
    events: number;
    failedInpi: number;
    failedAutomations: number;
    status: 'healthy' | 'attention';
}

interface SystemLogsResponse {
    items: SystemLogItem[];
    nextCursor: string | null;
    summary: SystemLogsSummary;
    generatedAt: string;
}

const SOURCE_LABELS: Record<LogSource, string> = {
    system: 'Aplicação',
    asterysko: 'Asterysko',
    inpi: 'INPI / RPI',
    automation: 'Automações',
};

const LEVEL_STYLES: Record<LogLevel, string> = {
    ERROR: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300',
    WARN: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    INFO: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300',
    DEBUG: 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

const LEVEL_LABELS: Record<LogLevel, string> = {
    ERROR: 'Erro',
    WARN: 'Alerta',
    INFO: 'Informação',
    DEBUG: 'Debug',
};

const formatDateTime = (value: string) => new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'America/Fortaleza',
}).format(new Date(value));

const AsteryskoSystemLogsPanel: React.FC = () => {
    const [items, setItems] = useState<SystemLogItem[]>([]);
    const [summary, setSummary] = useState<SystemLogsSummary | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('all');
    const [source, setSource] = useState('all');
    const [product, setProduct] = useState('all');
    const [period, setPeriod] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const requestIdRef = useRef(0);

    const products = useMemo(() => {
        const values = new Set(items.map(item => item.product).filter(Boolean));
        ['asterysko', 'manyspace', 'allyo', 'fauves'].forEach(value => values.add(value));
        return Array.from(values).sort();
    }, [items]);

    const loadLogs = useCallback(async ({ append = false, silent = false }: { append?: boolean; silent?: boolean } = {}) => {
        const requestId = ++requestIdRef.current;
        if (append) setLoadingMore(true);
        else if (!silent) setLoading(true);
        setError('');

        try {
            const response = await api.get<SystemLogsResponse>('/system-logs', {
                params: {
                    limit: 50,
                    period,
                    level,
                    source,
                    product,
                    search: search.trim() || undefined,
                    before: append ? nextCursor : undefined,
                },
            });
            if (requestId !== requestIdRef.current) return;
            setItems(current => {
                if (!append) return response.data.items;
                const known = new Set(current.map(item => item.id));
                return [...current, ...response.data.items.filter(item => !known.has(item.id))];
            });
            setNextCursor(response.data.nextCursor);
            setSummary(response.data.summary);
            setGeneratedAt(response.data.generatedAt);
        } catch (requestError: any) {
            if (requestId !== requestIdRef.current) return;
            const status = requestError?.response?.status;
            setError(status === 403
                ? 'Seu usuário não tem permissão de administrador para visualizar logs técnicos.'
                : 'Não foi possível carregar os logs agora. Tente atualizar novamente.');
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [level, nextCursor, period, product, search, source]);

    useEffect(() => {
        const timer = window.setTimeout(() => void loadLogs(), 300);
        return () => window.clearTimeout(timer);
    }, [level, period, product, search, source]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!autoRefresh) return;
        const timer = window.setInterval(() => void loadLogs({ silent: true }), 30_000);
        return () => window.clearInterval(timer);
    }, [autoRefresh, loadLogs]);

    const toggleExpanded = (id: string) => {
        setExpanded(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <section className="overflow-hidden border border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex min-h-[72px] flex-col justify-center gap-4 border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
                    <div>
                        <h3 className="flex items-center gap-2 font-season text-lg font-[420] text-black dark:text-white">
                            <Server size={17} /> Logs do sistema
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Visão unificada da aplicação, Asterysko, INPI e automações. Credenciais são ocultadas automaticamente.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={event => setAutoRefresh(event.target.checked)}
                                className="accent-blue-600"
                            />
                            Atualizar a cada 30s
                        </label>
                        <button
                            type="button"
                            onClick={() => void loadLogs()}
                            disabled={loading}
                            className="flex min-h-9 items-center gap-2 rounded-full bg-[#0412dd] px-4 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff] dark:hover:bg-blue-500"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-7 lg:grid-cols-4 lg:p-10">
                    <div className={`border p-4 ${summary?.status === 'healthy' ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Saúde operacional</span>
                            {summary?.status === 'healthy' ? <CheckCircle2 size={17} className="text-emerald-600" /> : <AlertTriangle size={17} className="text-amber-600" />}
                        </div>
                        <p className="mt-2 font-season text-xl font-[420] text-zinc-900 dark:text-zinc-100">
                            {summary?.status === 'healthy' ? 'Sem falhas' : 'Requer atenção'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">Resumo das últimas 24 horas</p>
                    </div>
                    <div className="border border-red-100 bg-red-50/40 p-4 dark:border-red-950 dark:bg-red-950/10">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Erros</span>
                        <p className="mt-2 font-season text-2xl font-[420] text-red-600 dark:text-red-400">{summary?.errors ?? '—'}</p>
                        <p className="mt-1 text-xs text-zinc-500">Falhas registradas</p>
                    </div>
                    <div className="border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-950 dark:bg-amber-950/10">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Alertas</span>
                        <p className="mt-2 font-season text-2xl font-[420] text-amber-600 dark:text-amber-400">{summary?.warnings ?? '—'}</p>
                        <p className="mt-1 text-xs text-zinc-500">Situações para acompanhar</p>
                    </div>
                    <div className="border border-blue-100 bg-blue-50/40 p-4 dark:border-blue-950 dark:bg-blue-950/10">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">Eventos</span>
                        <p className="mt-2 font-season text-2xl font-[420] text-blue-600 dark:text-blue-400">{summary?.events ?? '—'}</p>
                        <p className="mt-1 text-xs text-zinc-500">Atividade do logger global</p>
                    </div>
                </div>

                {summary && (summary.failedInpi > 0 || summary.failedAutomations > 0) && (
                    <div className="mx-4 mb-5 flex flex-wrap gap-x-5 gap-y-2 border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 sm:mx-6">
                        <strong>Falhas estruturadas nas últimas 24h:</strong>
                        <span>INPI/RPI: {summary.failedInpi}</span>
                        <span>Automações: {summary.failedAutomations}</span>
                    </div>
                )}
            </section>

            <section className="overflow-hidden border border-[#e5e5e5] bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="grid gap-3 border-b border-[#e5e5e5] p-4 dark:border-zinc-800 sm:grid-cols-2 lg:grid-cols-5 sm:p-5">
                    <label className="relative sm:col-span-2 lg:col-span-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Buscar mensagem..."
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-xs text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                    </label>
                    <select value={level} onChange={event => setLevel(event.target.value)} className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <option value="all">Todas as severidades</option>
                        <option value="ERROR">Erros</option>
                        <option value="WARN">Alertas</option>
                        <option value="INFO">Informações</option>
                        <option value="DEBUG">Debug</option>
                    </select>
                    <select value={source} onChange={event => setSource(event.target.value)} className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <option value="all">Todas as fontes</option>
                        <option value="system">Aplicação</option>
                        <option value="asterysko">Atividades Asterysko</option>
                        <option value="inpi">INPI / RPI</option>
                        <option value="automation">Automações</option>
                    </select>
                    <select value={product} onChange={event => setProduct(event.target.value)} className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold capitalize text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <option value="all">Todos os produtos</option>
                        {products.map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                    <select value={period} onChange={event => setPeriod(event.target.value)} className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <option value="1h">Última hora</option>
                        <option value="24h">Últimas 24 horas</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="all">Todo o histórico</option>
                    </select>
                </div>

                {error ? (
                    <div className="m-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>
                ) : loading ? (
                    <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-zinc-500">
                        <RefreshCw size={17} className="animate-spin" /> Carregando logs...
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex min-h-56 flex-col items-center justify-center p-6 text-center text-zinc-500">
                        <ShieldCheck size={28} className="mb-3 text-emerald-500" />
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200">Nenhum registro encontrado</p>
                        <p className="mt-1 text-xs">Não há logs que correspondam aos filtros selecionados.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {items.map(item => {
                            const isExpanded = expanded.has(item.id);
                            const hasDetails = item.details !== null && item.details !== undefined;
                            return (
                                <article key={item.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/70">
                                    <button
                                        type="button"
                                        onClick={() => hasDetails && toggleExpanded(item.id)}
                                        className="grid w-full gap-3 px-4 py-4 text-left sm:grid-cols-[20px_82px_130px_minmax(0,1fr)_165px] sm:items-center sm:px-5"
                                    >
                                        <span className="hidden text-zinc-400 sm:block">{hasDetails ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : null}</span>
                                        <span className={`w-fit rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${LEVEL_STYLES[item.level]}`}>{LEVEL_LABELS[item.level]}</span>
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300"><Activity size={13} /> {SOURCE_LABELS[item.source]}</span>
                                        <span className="min-w-0 text-xs font-medium leading-5 text-zinc-800 dark:text-zinc-200 sm:truncate" title={item.message}>{item.message}</span>
                                        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 sm:justify-end"><Clock3 size={12} /> {formatDateTime(item.createdAt)}</span>
                                    </button>
                                    {isExpanded && hasDetails && (
                                        <div className="border-t border-zinc-100 bg-zinc-950 px-4 py-4 dark:border-zinc-800 sm:px-10">
                                            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                                                <span>Produto: {item.product}</span><span>•</span><span>ID: {item.id}</span>
                                            </div>
                                            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-emerald-300">{JSON.stringify(item.details, null, 2)}</pre>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-[#e5e5e5] px-4 py-4 text-xs text-zinc-500 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <span>{generatedAt ? `Última leitura: ${formatDateTime(generatedAt)}` : 'Aguardando leitura'} • {items.length} registro(s) exibido(s)</span>
                    {nextCursor && (
                        <button
                            type="button"
                            disabled={loadingMore}
                            onClick={() => void loadLogs({ append: true })}
                            className="rounded-lg border border-zinc-200 px-3 py-2 font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            {loadingMore ? 'Carregando...' : 'Carregar registros anteriores'}
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AsteryskoSystemLogsPanel;
