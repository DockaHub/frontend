import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    X, Activity, Database, Play, AlertTriangle,
    RefreshCw, ToggleRight, ToggleLeft, Loader2,
    CheckCircle2, XCircle, Zap, Sparkles, Shield
} from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoBrandIdentificationTab } from './AsteryskoBrandIdentificationTab';
import { AsteryskoTrademarkScreeningTab } from './AsteryskoTrademarkScreeningTab';
import { AsteryskoBusinessContactEnrichmentTab } from './AsteryskoBusinessContactEnrichmentTab';
import { AsteryskoDecisionMakerEnrichmentTab } from './AsteryskoDecisionMakerEnrichmentTab';
import { AsteryskoScoutAiTab } from './AsteryskoScoutAiTab';
import { AsteryskoScoutAutomationSettings } from '../AsteryskoScoutAutomationSettings';
import { Bot, Mail, UserRoundSearch } from 'lucide-react';
import {
    getApiErrorMessage,
    IngestionFailure,
    IngestionRun,
    IngestionSource,
    IngestionStats,
    ItemsResponse
} from './asteryskoApiTypes';

interface AsteryskoEngineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenRadar?: (brandName: string, nclClass: string) => void;
    organizationId?: string;
}

type Tab = 'overview' | 'scout' | 'sources' | 'runs' | 'brands' | 'trademark' | 'channels' | 'decision-makers' | 'failures';

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, string> = {
        active: 'bg-emerald-500',
        running: 'bg-blue-500 animate-pulse',
        completed: 'bg-emerald-500',
        completed_with_errors: 'bg-amber-500',
        failed: 'bg-rose-500',
        paused: 'bg-zinc-400',
        disabled: 'bg-zinc-300',
        pending: 'bg-amber-400 animate-pulse',
        cancelled: 'bg-zinc-400',
        error: 'bg-rose-500'
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || 'bg-zinc-400'}`} />;
};

const RunStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, string> = {
        completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
        completed_with_errors: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
        failed: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/40',
        running: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40',
        pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
        cancelled: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    };
    const labelMap: Record<string, string> = {
        completed: 'Concluída',
        completed_with_errors: 'Com erros',
        failed: 'Falhou',
        running: 'Executando',
        pending: 'Aguardando',
        cancelled: 'Cancelada'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[status] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200'}`}>
            {labelMap[status] || status}
        </span>
    );
};

export const AsteryskoEngineModal: React.FC<AsteryskoEngineModalProps> = ({ isOpen, onClose, onOpenRadar, organizationId }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<IngestionStats | null>(null);
    const [sources, setSources] = useState<IngestionSource[]>([]);
    const [runs, setRuns] = useState<IngestionRun[]>([]);
    const [failures, setFailures] = useState<IngestionFailure[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const reqHeaders = useMemo(() => (
        organizationId ? { headers: { 'x-organization-id': organizationId } } : undefined
    ), [organizationId]);

    const loadStats = useCallback(async () => {
        try {
            const res = await api.get<IngestionStats>('/asterysko/ingestion/stats', reqHeaders);
            setStats(res.data);
        } catch (error: unknown) {
            setLoadError(getApiErrorMessage(error, 'Erro ao carregar métricas do motor.'));
        }
    }, [reqHeaders]);

    const loadSources = useCallback(async () => {
        try {
            const res = await api.get<IngestionSource[]>('/asterysko/ingestion/sources', reqHeaders);
            setSources(res.data || []);
        } catch (error: unknown) {
            setLoadError(getApiErrorMessage(error, 'Erro ao carregar fontes do motor.'));
        }
    }, [reqHeaders]);

    const loadRuns = useCallback(async () => {
        try {
            const res = await api.get<ItemsResponse<IngestionRun>>('/asterysko/ingestion/runs?limit=30', reqHeaders);
            setRuns(res.data.items || []);
        } catch (error: unknown) {
            setLoadError(getApiErrorMessage(error, 'Erro ao carregar execuções do motor.'));
        }
    }, [reqHeaders]);

    const loadFailures = useCallback(async () => {
        try {
            const res = await api.get<ItemsResponse<IngestionFailure>>('/asterysko/ingestion/items?status=failed&limit=30', reqHeaders);
            setFailures(res.data.items || []);
        } catch (error: unknown) {
            setLoadError(getApiErrorMessage(error, 'Erro ao carregar falhas do motor.'));
        }
    }, [reqHeaders]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        await Promise.all([loadStats(), loadSources(), loadRuns(), loadFailures()]);
        setLoading(false);
    }, [loadStats, loadSources, loadRuns, loadFailures]);

    useEffect(() => {
        if (isOpen) loadAll();
    }, [isOpen, loadAll]);

    const triggerRun = async (sourceId: string, dryRun = false) => {
        setActionLoading(`run-${sourceId}`);
        try {
            const endpoint = dryRun
                ? `/asterysko/ingestion/sources/${sourceId}/dry-run`
                : `/asterysko/ingestion/sources/${sourceId}/run`;
            await api.post(endpoint, {}, reqHeaders);
            setTimeout(() => { loadRuns(); loadStats(); }, 1500);
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao iniciar execução.'));
        } finally {
            setActionLoading(null);
        }
    };

    const toggleSourceStatus = async (sourceId: string, currentStatus: string) => {
        setActionLoading(`toggle-${sourceId}`);
        try {
            const endpoint = currentStatus === 'paused'
                ? `/asterysko/ingestion/sources/${sourceId}/resume`
                : `/asterysko/ingestion/sources/${sourceId}/pause`;
            await api.put(endpoint, {}, reqHeaders);
            await loadSources();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao alterar status da fonte.'));
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Visão Geral', icon: <Activity size={14} /> },
        { id: 'scout', label: 'Scout AI', icon: <Bot size={14} /> },
        { id: 'sources', label: 'Fontes', icon: <Database size={14} /> },
        { id: 'runs', label: 'Execuções', icon: <Play size={14} /> },
        { id: 'brands', label: 'Identificação de marcas', icon: <Sparkles size={14} /> },
        { id: 'trademark', label: 'Análise marcária', icon: <Shield size={14} /> },
        { id: 'channels', label: 'Canais empresariais', icon: <Mail size={14} /> },
        { id: 'decision-makers', label: 'Possíveis decisores', icon: <UserRoundSearch size={14} /> },
        { id: 'failures', label: 'Falhas', icon: <AlertTriangle size={14} /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                            <Zap size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Motor de Captação</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {stats?.isEngineEnabled ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Ativo em produção</span>
                                ) : (
                                    <span className="text-zinc-400">○ Desativado em produção</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadAll}
                            disabled={loading}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Atualizar"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4 border-b border-zinc-100 dark:border-zinc-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                            }`}
                        >
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loadError && (
                        <div className="mb-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
                            {loadError}
                        </div>
                    )}

                    {/* ─── VISÃO GERAL ─── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {loading && !stats ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-500" size={28} />
                                </div>
                            ) : stats ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Fontes Ativas', value: stats.activeSources, color: 'emerald' },
                                            { label: 'Execuções (24h)', value: stats.totalRuns24h, color: 'blue' },
                                            { label: 'Capturados (24h)', value: stats.captured24h, color: 'purple' },
                                            { label: 'Aguard. Marca', value: stats.waitingBrand, color: 'amber' },
                                        ].map(kpi => (
                                            <div key={kpi.label} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
                                                <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{kpi.value ?? '–'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {stats.lastRun && (
                                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Última Execução</p>
                                            <div className="flex items-center gap-3">
                                                <StatusDot status={stats.lastRun.status} />
                                                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                                    {stats.lastRun.source?.name}
                                                </span>
                                                <RunStatusBadge status={stats.lastRun.status} />
                                                <span className="text-xs text-zinc-400 ml-auto">
                                                    {new Date(stats.lastRun.createdAt).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {(stats.recentFailures?.length ?? 0) > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Falhas Recentes</p>
                                            <div className="space-y-2">
                                                {(stats.recentFailures ?? []).slice(0, 5).map(f => (
                                                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-xs">
                                                        <XCircle size={14} className="text-rose-500 flex-shrink-0" />
                                                        <span className="text-zinc-700 dark:text-zinc-300 flex-1 truncate">{f.fingerprint}</span>
                                                        <span className="text-zinc-400">{f.source?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-zinc-400 text-sm text-center py-12">Sem dados disponíveis.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'scout' && (
                        <AsteryskoScoutAutomationSettings organizationId={organizationId} />
                    )}

                    {/* ─── FONTES ─── */}
                    {activeTab === 'sources' && (
                        <div className="space-y-3">
                            {loading && sources.length === 0 ? (
                                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
                            ) : sources.length === 0 ? (
                                <p className="text-zinc-400 text-sm text-center py-12">Nenhuma fonte configurada.</p>
                            ) : sources.map(source => (
                                <div key={source.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <StatusDot status={source.status} />
                                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{source.name}</span>
                                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{source.key}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => toggleSourceStatus(source.id, source.status)}
                                                disabled={!!actionLoading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                title={source.status === 'paused' ? 'Retomar' : 'Pausar'}
                                            >
                                                {actionLoading === `toggle-${source.id}` ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : source.status === 'paused' ? (
                                                    <><ToggleLeft size={14} /> Pausada</>
                                                ) : (
                                                    <><ToggleRight size={14} /> Ativa</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => triggerRun(source.id, true)}
                                                disabled={!!actionLoading || source.status === 'paused'}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                                            >
                                                Dry-Run
                                            </button>
                                            <button
                                                onClick={() => triggerRun(source.id)}
                                                disabled={!!actionLoading || source.status === 'paused'}
                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                                            >
                                                {actionLoading === `run-${source.id}` ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                                Executar
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        <span>Lote: <strong className="text-zinc-700 dark:text-zinc-300">{source.batchSize}</strong></span>
                                        <span>Máx/execução: <strong className="text-zinc-700 dark:text-zinc-300">{source.maxItemsPerRun?.toLocaleString()}</strong></span>
                                        <span>Última exec: <strong className="text-zinc-700 dark:text-zinc-300">{source.lastRunAt ? new Date(source.lastRunAt).toLocaleString('pt-BR') : '–'}</strong></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ─── EXECUÇÕES ─── */}
                    {activeTab === 'runs' && (
                        <div className="space-y-2">
                            {loading && runs.length === 0 ? (
                                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
                            ) : runs.length === 0 ? (
                                <p className="text-zinc-400 text-sm text-center py-12">Nenhuma execução registrada.</p>
                            ) : runs.map(run => (
                                <div key={run.id} className="flex items-center gap-4 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs">
                                    <StatusDot status={run.status} />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-100 truncate block">{run.source?.name}</span>
                                        <span className="text-zinc-400">{new Date(run.createdAt).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <RunStatusBadge status={run.status} />
                                    {run.dryRun && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">DRY-RUN</span>
                                    )}
                                    <div className="text-right text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                                        <div>↓ {run.itemsFetched ?? 0} capturados</div>
                                        <div className="text-emerald-500">✓ {run.opportunitiesCreated ?? 0} criados</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ─── IDENTIFICAÇÃO DE MARCAS ─── */}
                    {activeTab === 'brands' && (
                        <AsteryskoBrandIdentificationTab organizationId={organizationId} />
                    )}

                    {/* ─── ANÁLISE MARCÁRIA ─── */}
                    {activeTab === 'trademark' && (
                        <AsteryskoTrademarkScreeningTab onOpenRadar={onOpenRadar} organizationId={organizationId} />
                    )}

                    {/* ─── CANAIS EMPRESARIAIS (FASE 2.5A) ─── */}
                    {activeTab === 'channels' && (
                        <AsteryskoBusinessContactEnrichmentTab organizationId={organizationId} />
                    )}

                    {/* ─── POSSÍVEIS DECISORES (FASE 2.5B) ─── */}
                    {activeTab === 'decision-makers' && (
                        <AsteryskoDecisionMakerEnrichmentTab organizationId={organizationId} />
                    )}

                    {/* ─── FALHAS ─── */}
                    {activeTab === 'failures' && (
                        <div className="space-y-2">
                            {loading && failures.length === 0 ? (
                                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
                            ) : failures.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 py-16 text-center">
                                    <CheckCircle2 size={40} className="text-emerald-400" />
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">Nenhuma falha registrada. 🎉</p>
                                </div>
                            ) : failures.map(item => (
                                <div key={item.id} className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-xs space-y-1">
                                    <div className="flex items-center gap-2 justify-between">
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-100 truncate">{item.fingerprint}</span>
                                        <span className="text-zinc-400">{item.source?.name}</span>
                                    </div>
                                    {item.lastError && (
                                        <p className="text-rose-600 dark:text-rose-400 font-mono truncate">{item.lastError}</p>
                                    )}
                                    <p className="text-zinc-400">{new Date(item.createdAt).toLocaleString('pt-BR')} · {item.processingAttempts} tentativas</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
