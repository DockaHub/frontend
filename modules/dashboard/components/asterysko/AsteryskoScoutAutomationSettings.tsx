import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    Bot,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Coins,
    Loader2,
    RefreshCw,
    Save,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';

interface ScoutAutomationSettings {
    enabled: boolean;
    mode: 'scheduled' | 'continuous';
    time: string;
    weekdays: number[];
    intervalMinutes: number;
    maxRunsPerDay: number;
    segments: string[];
    timezone: 'America/Fortaleza';
}

interface ScoutRunLog {
    id: string;
    status: string;
    triggerType: string;
    createdAt: string;
    startedAt?: string | null;
    finishedAt?: string | null;
    itemsFetched: number;
    itemsNormalized: number;
    opportunitiesCreated: number;
    opportunitiesLinked: number;
    duplicatesFound: number;
    itemsSkipped: number;
    itemsFailed: number;
    errorSummary?: string | null;
    queries: string[];
    automation: {
        triggerSource?: string | null;
        scheduledSlot?: string | null;
        segment?: string | null;
        durationMs: number;
        interruptionReason?: string | null;
        failureClass?: string | null;
    };
    discovery: {
        rawResults: number;
        uniqueCandidates: number;
        websitesConfirmed: number;
        sourceItemsCreated: number;
        estimatedCostUsd: number;
        rejectionsByReason: Record<string, number>;
    };
    usage: {
        planningTokens: number;
        searchTokens: number;
        structuringTokens: number;
        totalTokens: number;
        webSearchCalls: number;
        modelCalls: number;
    };
}

interface ScoutStatus {
    enabled: boolean;
    autoRun: boolean;
    provider: string;
    model: string;
    autoCrm: boolean;
    autoSend: boolean;
    automation: {
        schedulerEnabled: boolean;
        sourceStatus?: string | null;
        circuitOpen: boolean;
        lastAutomaticRunAt?: string | null;
        automaticRunsToday: number;
        lastTriggerSource?: string | null;
        lastScheduledSlot?: string | null;
        nextRunAt?: string | null;
        interruptionReason?: string | null;
        settings: ScoutAutomationSettings;
        segments: string[];
        availableSegments: string[];
    };
    safety: {
        autoCrm: boolean;
        autoSend: boolean;
        subordinateAutoRun: boolean;
        concurrency: number;
    };
    limits: {
        searchesPerRun: number;
        webSearchCallsPerRun: number;
        rawCandidatesPerRun: number;
        priorityWebsiteValidationsPerRun: number;
        companiesPerRun: number;
        companiesPerDay: number;
        operationalOutputTokensPerRun: number;
        outputTokenSafetyReserve: number;
    };
    metrics: {
        analyzed: number;
        created: number;
        reviews: number;
        duplicates: number;
        rejected: number;
    };
    reviewItems: unknown[];
    recentRuns: ScoutRunLog[];
}

const WEEKDAYS = [
    { value: 1, short: 'Seg', label: 'Segunda-feira' },
    { value: 2, short: 'Ter', label: 'Terça-feira' },
    { value: 3, short: 'Qua', label: 'Quarta-feira' },
    { value: 4, short: 'Qui', label: 'Quinta-feira' },
    { value: 5, short: 'Sex', label: 'Sexta-feira' },
    { value: 6, short: 'Sáb', label: 'Sábado' },
    { value: 0, short: 'Dom', label: 'Domingo' },
];

const formatDateTime = (value?: string | null) => value
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Fortaleza',
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value))
    : '—';

const formatDuration = (milliseconds: number) => {
    if (!milliseconds) return '—';
    const seconds = Math.round(milliseconds / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}min ${seconds % 60}s`;
};

const friendlyScoutError = (value?: string | null): string | null => {
    if (!value) return null;
    if (/^structuring_failed:.*(?:unterminated string in json|unexpected end of json)/i.test(value)) {
        return 'A OpenAI devolveu uma resposta truncada durante a estruturação. Nenhum dado foi criado e o ciclo foi encerrado com segurança.';
    }
    if (/^structuring_(?:failed|incomplete)/i.test(value)) {
        return 'A etapa de estruturação da OpenAI não foi concluída. Nenhum dado parcial foi persistido.';
    }
    if (/^search_(?:failed|incomplete|empty)/i.test(value)) {
        return 'A pesquisa web não foi concluída. Nenhum resultado parcial foi persistido.';
    }
    return value;
};

const runFeedback = (run: ScoutRunLog): string => {
    if (run.errorSummary || run.automation.interruptionReason) {
        return friendlyScoutError(run.errorSummary || run.automation.interruptionReason)
            || 'A execução terminou com uma interrupção.';
    }
    if (run.status === 'running') return 'Pesquisa em andamento. Os números serão atualizados automaticamente.';
    if (run.discovery.uniqueCandidates > 0 && run.discovery.websitesConfirmed === 0) {
        return `${run.discovery.uniqueCandidates} candidatas foram encontradas, mas nenhum website atingiu os critérios de identidade e localização.`;
    }
    if (run.opportunitiesCreated === 0 && run.discovery.websitesConfirmed > 0) {
        return 'Websites foram confirmados, mas nenhuma candidata atingiu os critérios de promoção.';
    }
    if (run.opportunitiesCreated > 0) {
        return `${run.opportunitiesCreated} oportunidade(s) foram promovidas para “Para analisar”.`;
    }
    return 'Execução concluída sem novas candidatas elegíveis.';
};

const getRequestError = (error: any, fallback: string) => (
    error?.response?.data?.error || error?.message || fallback
);

export const AsteryskoScoutAutomationSettings: React.FC<{ organizationId?: string }> = ({
    organizationId,
}) => {
    const { addToast } = useToast();
    const [status, setStatus] = useState<ScoutStatus | null>(null);
    const [settings, setSettings] = useState<ScoutAutomationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const headers = useMemo(() => (
        organizationId ? { 'x-organization-id': organizationId } : undefined
    ), [organizationId]);

    const load = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        setError(null);
        try {
            const response = await api.get<ScoutStatus>('/asterysko/scout-ai/status', { headers });
            setStatus(response.data);
            setSettings(response.data.automation.settings);
        } catch (requestError: any) {
            setError(getRequestError(requestError, 'Não foi possível carregar o estado do Scout AI.'));
        } finally {
            if (!quiet) setLoading(false);
        }
    }, [headers]);

    useEffect(() => {
        void load();
        const interval = window.setInterval(() => void load(true), 30_000);
        return () => window.clearInterval(interval);
    }, [load]);

    const save = async () => {
        if (!settings) return;
        setSaving(true);
        setError(null);
        try {
            await api.patch('/asterysko/scout-ai/automation/settings', {
                enabled: settings.enabled,
                mode: settings.mode,
                time: settings.time,
                weekdays: settings.weekdays,
                intervalMinutes: settings.intervalMinutes,
                maxRunsPerDay: settings.maxRunsPerDay,
                segments: settings.segments,
            }, { headers });
            addToast({
                type: 'success',
                title: 'Programação atualizada',
                message: 'A alteração foi salva sem disparar uma nova pesquisa.',
            });
            await load(true);
        } catch (requestError: any) {
            const message = getRequestError(requestError, 'Falha ao salvar a programação.');
            setError(message);
            addToast({ type: 'error', title: 'Scout AI', message });
        } finally {
            setSaving(false);
        }
    };

    const toggleWeekday = (day: number) => {
        if (!settings) return;
        const selected = settings.weekdays.includes(day);
        if (selected && settings.weekdays.length === 1) return;
        setSettings({
            ...settings,
            weekdays: selected
                ? settings.weekdays.filter(item => item !== day)
                : [...settings.weekdays, day].sort(),
        });
    };

    const toggleSegment = (segment: string) => {
        if (!settings) return;
        const selected = settings.segments.includes(segment);
        if (selected && settings.segments.length === 1) return;
        setSettings({
            ...settings,
            segments: selected
                ? settings.segments.filter(item => item !== segment)
                : [...settings.segments, segment],
        });
    };

    if (loading && !status) {
        return (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <Loader2 className="animate-spin text-[#0412dd]" />
            </div>
        );
    }

    if (!status || !settings) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                {error || 'Scout AI indisponível.'}
            </div>
        );
    }

    const lastRun = status.recentRuns[0];
    const environmentAllowsAutomation = status.enabled && status.autoRun;
    const automationLabel = status.automation.schedulerEnabled
        ? settings.mode === 'continuous' ? 'Ativo continuamente' : 'Ativo por agenda'
        : status.automation.circuitOpen
            ? 'Circuito aberto'
            : !settings.enabled
                ? 'Pausado'
                : !environmentAllowsAutomation
                    ? 'Bloqueado por configuração'
                    : 'Aguardando';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <span className={`mt-1 h-3 w-3 rounded-full ${
                            status.automation.schedulerEnabled ? 'bg-emerald-500' : status.automation.circuitOpen ? 'bg-rose-500' : 'bg-amber-400'
                        }`} />
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Scout AI automático · {automationLabel}</h3>
                            <p className="mt-1 text-xs text-zinc-500">
                                {status.provider} · {status.model} · horário de Fortaleza
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => void load()}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatusCard
                        icon={<Clock3 size={16} />}
                        label="Última execução"
                        value={formatDateTime(status.automation.lastAutomaticRunAt)}
                        detail={status.automation.lastTriggerSource || 'nenhuma execução automática'}
                    />
                    <StatusCard
                        icon={<CalendarClock size={16} />}
                        label="Próxima execução"
                        value={!settings.enabled
                            ? 'Pausada'
                            : settings.mode === 'continuous'
                                && status.automation.automaticRunsToday >= settings.maxRunsPerDay
                                ? 'Retoma amanhã'
                                : formatDateTime(status.automation.nextRunAt)}
                        detail={settings.mode === 'continuous'
                            ? `a cada ${settings.intervalMinutes} min · ${status.automation.automaticRunsToday}/${settings.maxRunsPerDay} ciclos hoje`
                            : `${settings.time} · ${settings.timezone}`}
                    />
                    <StatusCard
                        icon={status.automation.circuitOpen ? <XCircle size={16} /> : <ShieldCheck size={16} />}
                        label="Circuit breaker"
                        value={status.automation.circuitOpen ? 'Aberto' : 'Fechado'}
                        detail={friendlyScoutError(status.automation.interruptionReason) || 'sem bloqueios técnicos'}
                        danger={status.automation.circuitOpen}
                    />
                    <StatusCard
                        icon={<Activity size={16} />}
                        label="Último resultado"
                        value={lastRun ? `${lastRun.opportunitiesCreated} oportunidade(s)` : 'Sem histórico'}
                        detail={lastRun ? `${lastRun.discovery.uniqueCandidates} candidatas · ${lastRun.discovery.websitesConfirmed} websites` : '—'}
                    />
                </div>

                {lastRun && (
                    <div className={`mt-4 rounded-xl border p-3 text-xs ${
                        lastRun.errorSummary
                            ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'
                            : 'border-blue-100 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300'
                    }`}>
                        <strong>Feedback da última rodada:</strong> {runFeedback(lastRun)}
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                        <CalendarClock size={16} className="text-[#0412dd]" />
                        Programação
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">Salvar não executa o Scout nem consome o slot do dia.</p>
                </div>
                <div className="space-y-5 p-5">
                    <label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                        <span>
                            <span className="block text-sm font-bold text-zinc-900 dark:text-white">Execução programada</span>
                            <span className="mt-0.5 block text-xs text-zinc-500">Controle persistente abaixo da chave-mestra do ambiente.</span>
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.enabled}
                            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                            className={`relative h-7 w-12 rounded-full transition-colors ${settings.enabled ? 'bg-[#0412dd]' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                        >
                            <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </label>

                    <div>
                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Modo de execução</span>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, mode: 'scheduled' })}
                                className={`rounded-xl border p-4 text-left transition-colors ${
                                    settings.mode === 'scheduled'
                                        ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-500/10 dark:border-blue-800 dark:bg-blue-950/20'
                                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950'
                                }`}
                            >
                                <span className="block text-sm font-bold text-zinc-900 dark:text-white">Agendado</span>
                                <span className="mt-1 block text-xs text-zinc-500">Executa nos dias e horário escolhidos.</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, mode: 'continuous' })}
                                className={`rounded-xl border p-4 text-left transition-colors ${
                                    settings.mode === 'continuous'
                                        ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/20'
                                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950'
                                }`}
                            >
                                <span className="block text-sm font-bold text-zinc-900 dark:text-white">Contínuo</span>
                                <span className="mt-1 block text-xs text-zinc-500">Repete ciclos controlados até você desativar.</span>
                            </button>
                        </div>
                    </div>

                    {settings.mode === 'scheduled' ? (
                        <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                            <label>
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Horário</span>
                                <input
                                    type="time"
                                    value={settings.time}
                                    onChange={event => setSettings({ ...settings, time: event.target.value })}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-[#0412dd] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                />
                                <span className="mt-1 block text-[10px] text-zinc-400">America/Fortaleza</span>
                            </label>
                            <div>
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Dias da semana</span>
                                <div className="flex flex-wrap gap-2">
                                    {WEEKDAYS.map(day => {
                                        const selected = settings.weekdays.includes(day.value);
                                        return (
                                            <button
                                                key={day.value}
                                                type="button"
                                                title={day.label}
                                                onClick={() => toggleWeekday(day.value)}
                                                className={`min-w-11 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                                                    selected
                                                        ? 'bg-[#0412dd] text-white'
                                                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}
                                            >
                                                {day.short}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                            <label>
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Intervalo entre ciclos</span>
                                <select
                                    value={settings.intervalMinutes}
                                    onChange={event => setSettings({ ...settings, intervalMinutes: Number(event.target.value) })}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-[#0412dd] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                >
                                    <option value={30}>A cada 30 minutos</option>
                                    <option value={60}>A cada 1 hora</option>
                                    <option value={120}>A cada 2 horas</option>
                                    <option value={240}>A cada 4 horas</option>
                                    <option value={480}>A cada 8 horas</option>
                                </select>
                                <span className="mt-1 block text-[10px] text-zinc-400">O próximo ciclo só começa depois que o anterior terminar.</span>
                            </label>
                            <label>
                                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Máximo de ciclos por dia</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={24}
                                    value={settings.maxRunsPerDay}
                                    onChange={event => setSettings({
                                        ...settings,
                                        maxRunsPerDay: Math.min(24, Math.max(1, Number(event.target.value))),
                                    })}
                                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 outline-none focus:border-[#0412dd] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                                />
                                <span className="mt-1 block text-[10px] text-zinc-400">
                                    Hoje: {status.automation.automaticRunsToday} ciclo(s). O limite reinicia à meia-noite.
                                </span>
                            </label>
                        </div>
                    )}

                    <div>
                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-zinc-500">Rotação de segmentos</span>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {status.automation.availableSegments.map(segment => {
                                const selected = settings.segments.includes(segment);
                                return (
                                    <label
                                        key={segment}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-semibold transition-colors ${
                                            selected
                                                ? 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200'
                                                : 'border-zinc-200 text-zinc-500 dark:border-zinc-800'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => toggleSegment(segment)}
                                            className="accent-[#0412dd]"
                                        />
                                        {segment}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500">
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">até {status.limits.searchesPerRun} consultas</span>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">até {status.limits.webSearchCallsPerRun} web searches</span>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">até {status.limits.companiesPerRun} oportunidades</span>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">concorrência {status.safety.concurrency}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => void save()}
                            disabled={
                                saving
                                || (settings.mode === 'scheduled' && settings.weekdays.length === 0)
                                || settings.segments.length === 0
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0412dd] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Salvar programação
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                            <Bot size={16} className="text-[#0412dd]" />
                            Histórico e logs
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">Últimas 10 execuções, com consumo e motivo do resultado.</p>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {status.reviewItems.length} em revisão
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <ShieldCheck size={11} /> CRM e envios bloqueados
                        </span>
                    </div>
                </div>

                {status.recentRuns.length === 0 ? (
                    <div className="p-10 text-center text-xs text-zinc-400">Nenhuma execução registrada.</div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {status.recentRuns.map(run => (
                            <div key={run.id} className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        {run.status === 'completed'
                                            ? <CheckCircle2 size={17} className="mt-0.5 text-emerald-500" />
                                            : run.status === 'running'
                                                ? <Loader2 size={17} className="mt-0.5 animate-spin text-blue-500" />
                                                : <AlertTriangle size={17} className="mt-0.5 text-amber-500" />}
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                {run.automation.segment || 'Execução Scout'}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-zinc-500">
                                                {formatDateTime(run.startedAt || run.createdAt)} · {run.triggerType} / {run.automation.triggerSource || 'manual'} · {formatDuration(run.automation.durationMs)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                                        run.status === 'completed'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                                            : run.status === 'failed'
                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                                    }`}>
                                        {run.status.replaceAll('_', ' ')}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                                    <Metric label="Candidatas" value={run.discovery.uniqueCandidates} />
                                    <Metric label="Websites" value={run.discovery.websitesConfirmed} />
                                    <Metric label="Oportunidades" value={run.opportunitiesCreated} />
                                    <Metric label="Duplicadas" value={run.duplicatesFound} />
                                    <Metric label="Falhas" value={run.itemsFailed} />
                                </div>

                                <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
                                    {runFeedback(run)}
                                </p>

                                {run.queries.length > 0 && (
                                    <p className="mt-2 text-[11px] text-zinc-500">
                                        <strong>Consultas:</strong> {run.queries.join(' · ')}
                                    </p>
                                )}
                                {Object.keys(run.discovery.rejectionsByReason || {}).length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {Object.entries(run.discovery.rejectionsByReason || {}).map(([reason, count]) => (
                                            <span key={reason} className="rounded-full bg-amber-50 px-2 py-1 text-[10px] text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
                                                {reason.replaceAll('_', ' ')}: {count}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-400">
                                    <span className="inline-flex items-center gap-1"><Activity size={11} /> {run.usage.modelCalls} chamadas · {run.usage.webSearchCalls} buscas</span>
                                    <span>{run.usage.totalTokens.toLocaleString('pt-BR')} tokens</span>
                                    <span className="inline-flex items-center gap-1"><Coins size={11} /> US$ {run.discovery.estimatedCostUsd.toFixed(4)}</span>
                                    {run.automation.scheduledSlot && <span>Slot: {run.automation.scheduledSlot}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    detail: string;
    danger?: boolean;
}> = ({ icon, label, value, detail, danger }) => (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide ${danger ? 'text-rose-500' : 'text-zinc-400'}`}>
            {icon} {label}
        </div>
        <p className={`mt-2 text-sm font-black ${danger ? 'text-rose-600' : 'text-zinc-900 dark:text-white'}`}>{value}</p>
        <p className="mt-1 line-clamp-2 text-[10px] text-zinc-500">{detail}</p>
    </div>
);

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
        <p className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-0.5 text-sm font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
);
