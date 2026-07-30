import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Loader2, Play, Search, ShieldCheck } from 'lucide-react';
import api from '../../../../../services/api';
import { getApiErrorMessage, ScoutSearchProfile, ScoutStatus } from './asteryskoApiTypes';

const listToText = (values: string[]) => values.join(', ');
const textToList = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);

export const AsteryskoScoutAiTab: React.FC = () => {
    const [status, setStatus] = useState<ScoutStatus | null>(null);
    const [profile, setProfile] = useState<ScoutSearchProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [promotingId, setPromotingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<ScoutStatus>('/asterysko/scout-ai/status');
            setStatus(response.data);
            setProfile(response.data.profile);
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError, 'Não foi possível carregar o Scout AI.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    const run = async () => {
        if (!profile) return;
        setRunning(true);
        setError(null);
        try {
            await api.post('/asterysko/scout-ai/run', { profile });
            await load();
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError, 'Falha ao executar o Scout AI.'));
        } finally {
            setRunning(false);
        }
    };

    const promoteToReview = async (sourceItemId: string) => {
        setPromotingId(sourceItemId);
        setError(null);
        try {
            await api.post(`/asterysko/scout-ai/source-items/${sourceItemId}/promote-review`);
            await load();
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError, 'SourceItem ainda não pode ser promovido para revisão.'));
        } finally {
            setPromotingId(null);
        }
    };

    if (loading && !status) {
        return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-600" /></div>;
    }
    if (!status || !profile) {
        return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error || 'Scout AI indisponível.'}</div>;
    }

    const safe = !status.autoRun && !status.safety.autoCrm && !status.safety.autoSend && !status.safety.subordinateAutoRun;
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${status.enabled ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Scout AI {status.enabled ? 'habilitado' : 'desativado'}</p>
                        <p className="text-xs text-zinc-500">{status.provider} · {status.model} · execução manual</p>
                    </div>
                </div>
                <button
                    onClick={() => void run()}
                    disabled={!status.enabled || !safe || running}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Executar Scout
                </button>
            </div>

            {!status.enabled && (
                <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
                    <AlertTriangle size={15} className="shrink-0" />
                    A flag ASTERYSKO_SCOUT_AI_ENABLED permanece false. Nenhuma pesquisa será executada.
                </div>
            )}
            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                    ['Analisadas', status.metrics.analyzed],
                    ['Criadas', status.metrics.created],
                    ['Revisões', status.metrics.reviews],
                    ['Duplicadas', status.metrics.duplicates],
                    ['Rejeitadas', status.metrics.rejected],
                ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{label}</p>
                        <p className="mt-1 text-xl font-black text-zinc-900 dark:text-white">{value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-4 flex items-center gap-2">
                    <Search size={15} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Perfil da busca</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {[
                        ['Cidades', 'cities'],
                        ['Estados', 'states'],
                        ['Segmentos', 'segments'],
                    ].map(([label, key]) => (
                        <label key={key} className={key === 'segments' ? 'sm:col-span-2' : ''}>
                            <span className="mb-1 block text-[11px] font-bold text-zinc-500">{label}</span>
                            <input
                                value={listToText(profile[key as 'cities' | 'states' | 'segments'])}
                                onChange={event => setProfile({ ...profile, [key]: textToList(event.target.value) })}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                            />
                        </label>
                    ))}
                    <label>
                        <span className="mb-1 block text-[11px] font-bold text-zinc-500">Limite de empresas</span>
                        <input
                            type="number" min={1} max={status.limits.companiesPerRun}
                            value={profile.maxCompanies}
                            onChange={event => setProfile({ ...profile, maxCompanies: Number(event.target.value) })}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                        />
                    </label>
                    <label>
                        <span className="mb-1 block text-[11px] font-bold text-zinc-500">Confiança mínima (%)</span>
                        <input
                            type="number" min={status.limits.minimumCompanyConfidence} max={100}
                            value={profile.minimumConfidence}
                            onChange={event => setProfile({ ...profile, minimumConfidence: Number(event.target.value) })}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                        />
                    </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-zinc-500">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">máx. {status.limits.searchesPerRun} pesquisas</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">máx. {status.limits.companiesPerDay}/dia</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">concorrência {status.safety.concurrency}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">entrada ≤ {status.limits.inputTokensPerRun.toLocaleString('pt-BR')} tokens</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-800">saída ≤ {status.limits.outputTokensPerRun.toLocaleString('pt-BR')} tokens</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><ShieldCheck size={11} /> CRM e envios bloqueados</span>
                </div>
            </div>

            <div>
                <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">SourceItems em revisão</h3>
                </div>
                {status.reviewItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center text-xs text-zinc-400 dark:border-zinc-700">
                        Nenhum SourceItem aguardando revisão.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {status.reviewItems.map(item => (
                            <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/10">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-zinc-900 dark:text-white">{item.companyName || 'Empresa não identificada'}</p>
                                        {item.websiteCandidate && (
                                            <a href={item.websiteCandidate} target="_blank" rel="noreferrer" className="mt-1 block text-blue-600 hover:underline">
                                                {item.websiteCandidate}
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => void promoteToReview(item.id)}
                                        disabled={promotingId === item.id}
                                        className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-zinc-950 dark:text-amber-300"
                                    >
                                        {promotingId === item.id && <Loader2 size={13} className="animate-spin" />}
                                        Promover para oportunidade em revisão
                                    </button>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                    <span>Empresa: <strong>{item.companyConfidence}%</strong></span>
                                    <span>Website: <strong>{item.websiteConfidence}%</strong></span>
                                    <span>Combinada: <strong>{item.combinedConfidence ?? 'pendente'}{item.combinedConfidence !== null && item.combinedConfidence !== undefined ? '%' : ''}</strong></span>
                                </div>
                                <p className="mt-2 text-amber-900 dark:text-amber-200"><strong>Motivo:</strong> {item.nonPromotionReason}</p>
                                <p className="mt-1 text-zinc-500"><strong>Etapa:</strong> {item.stage} · <strong>Ação:</strong> {item.recommendedAction}</p>
                                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                                    <strong>Canais:</strong> {item.channels.length > 0
                                        ? item.channels.map(channel => `${channel.type}: ${channel.value}`).join(' · ')
                                        : 'nenhum'}
                                </p>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                                    <strong>Possíveis decisores:</strong> {item.possibleDecisionMakers.length > 0
                                        ? item.possibleDecisionMakers.map(candidate => `${candidate.name || 'Função'}${candidate.role ? ` — ${candidate.role}` : ''}`).join(' · ')
                                        : 'nenhum'}
                                </p>
                                <p className="mt-1 text-zinc-500"><strong>Sinais ausentes:</strong> {item.missingSignals.join(' · ') || 'nenhum'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="mb-3 flex items-center gap-2">
                    <Bot size={15} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Execuções recentes</h3>
                </div>
                {status.recentRuns.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 py-10 text-center text-xs text-zinc-400 dark:border-zinc-700">Nenhuma execução do Scout registrada.</div>
                ) : (
                    <div className="space-y-2">
                        {status.recentRuns.map(runItem => (
                            <div key={runItem.id} className="rounded-xl border border-zinc-200 p-3 text-xs dark:border-zinc-800">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-100">
                                        {runItem.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
                                        {new Date(runItem.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                    <span className="text-zinc-500">{runItem.itemsFetched ?? 0} analisadas · {runItem.opportunitiesCreated ?? 0} criadas</span>
                                </div>
                                {(runItem.metadata?.queries?.length ?? 0) > 0 && (
                                    <p className="mt-2 truncate text-zinc-500">Pesquisas: {runItem.metadata?.queries?.join(' · ')}</p>
                                )}
                                <p className="mt-1 text-zinc-400">
                                    Consumo: {runItem.metadata?.usage?.modelCalls ?? 0} chamadas · {runItem.metadata?.usage?.totalTokens ?? 0} tokens
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
