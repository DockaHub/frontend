import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BriefcaseBusiness, Check, ExternalLink, Eye, Loader2, Lock, RefreshCw,
    ShieldCheck, Unlock, UserRoundSearch, UsersRound, X,
} from 'lucide-react';
import api from '../../../../../services/api';
import {
    DecisionMakerAttempt, DecisionMakerAttemptList, DecisionMakerCandidate,
    DecisionMakerCounts, getApiErrorMessage,
} from './asteryskoApiTypes';

const labels: Record<string, string> = {
    person_identified: 'Pessoa identificada',
    role_only_identified: 'Função/departamento',
    multiple_candidates: 'Múltiplos candidatos',
    partial: 'Parcial',
    review_required: 'Revisão necessária',
    no_candidate_found: 'Nenhum candidato',
    failed: 'Falha técnica',
    current_confirmed: 'Atual confirmado',
    current_probable: 'Atual provável',
    historical: 'Histórico',
    outdated: 'Desatualizado',
    conflicting: 'Conflitante',
    professional_public: 'Profissional público',
    professional_named: 'Profissional identificado',
    role_only: 'Somente função',
};
const label = (value?: string | null) => value ? labels[value] ?? value.replace(/_/g, ' ') : '—';
const badge = (value?: string | null) => {
    const danger = value === 'failed' || value === 'conflicting' || value === 'sensitive';
    const warning = value === 'review_required' || value === 'historical' || value === 'multiple_candidates';
    const colors = danger ? 'bg-rose-50 text-rose-700 border-rose-200'
        : warning ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${colors}`}>{label(value)}</span>;
};

export const AsteryskoDecisionMakerEnrichmentTab: React.FC<{ organizationId?: string }> = ({ organizationId }) => {
    const [attempts, setAttempts] = useState<DecisionMakerAttempt[]>([]);
    const [counts, setCounts] = useState<DecisionMakerCounts | null>(null);
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = organizationId ? { 'x-organization-id': organizationId } : undefined;
            const [attemptResponse, countResponse] = await Promise.all([
                api.get<DecisionMakerAttemptList>('/asterysko/decision-maker-enrichments', {
                    params: { page, limit: 15, status: status === 'all' ? undefined : status },
                    headers,
                }),
                api.get<DecisionMakerCounts>('/asterysko/decision-maker-enrichments/counts', { headers }),
            ]);
            setAttempts(attemptResponse.data.attempts);
            setTotal(attemptResponse.data.total);
            setCounts(countResponse.data);
        } catch (loadError: unknown) {
            setError(getApiErrorMessage(loadError, 'Não foi possível carregar possíveis decisores.'));
        } finally {
            setLoading(false);
        }
    }, [page, status, organizationId]);

    useEffect(() => { void load(); }, [load]);
    const totalPages = Math.max(1, Math.ceil(total / 15));
    const candidateTotal = useMemo(
        () => counts?.counts.candidates.reduce((sum, entry) => sum + entry._count, 0) ?? 0,
        [counts],
    );

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
                        <UserRoundSearch size={19} className="text-violet-600" />
                        Possíveis decisores
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">Pessoas, funções e departamentos profissionais para revisão humana. Nenhum envio ao CRM.</p>
                </div>
                <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 self-start rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
                </button>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
                <ShieldCheck size={18} className="shrink-0" />
                <div><strong>Produção desativada · dry-run ativo.</strong> Aceites são simulados; não criam decisor confirmado, contato, lead ou mensagem.</div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                    ['Tentativas', total],
                    ['Candidatos técnicos', candidateTotal],
                    ['Aceitos', counts?.counts.accepted ?? 0],
                    ['Automação', counts?.config.autoRun ? 'Ativa' : 'Desativada'],
                ].map(([title, value]) => (
                    <div key={String(title)} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{title}</p>
                        <p className="mt-1 text-xl font-black text-zinc-900 dark:text-white">{value}</p>
                    </div>
                ))}
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}

            <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                    ['all', 'Todas'], ['completed', 'Concluídas'], ['review_required', 'Revisão'],
                    ['no_candidate_found', 'Sem candidato'], ['failed', 'Falhas'],
                ].map(([id, title]) => (
                    <button key={id} onClick={() => { setStatus(id); setPage(1); }} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${status === id ? 'bg-violet-600 text-white' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>{title}</button>
                ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left text-xs">
                        <thead className="border-b border-zinc-200 bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                            <tr><th className="p-3">Empresa</th><th className="p-3">Resultado</th><th className="p-3">Confiança</th><th className="p-3">Candidatos</th><th className="p-3">Páginas</th><th className="p-3">Execução</th><th className="p-3 text-right">Ações</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? (
                                <tr><td colSpan={7} className="p-10 text-center text-zinc-400"><Loader2 className="mx-auto animate-spin" /></td></tr>
                            ) : attempts.length === 0 ? (
                                <tr><td colSpan={7} className="p-10 text-center text-zinc-400">Nenhuma tentativa neste filtro.</td></tr>
                            ) : attempts.map(attempt => (
                                <tr key={attempt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                                    <td className="p-3"><strong className="block text-zinc-800 dark:text-zinc-100">{attempt.opportunity?.brandName ?? attempt.officialDomain ?? '—'}</strong><span className="text-[10px] text-zinc-400">{attempt.opportunity?.companyName ?? attempt.officialDomain}</span></td>
                                    <td className="p-3">{badge(attempt.finalResult ?? attempt.status)}</td>
                                    <td className="p-3 font-bold text-violet-600">{Math.round(attempt.finalConfidence ?? 0)}%</td>
                                    <td className="p-3">{attempt._count?.candidates ?? attempt.candidateCount}</td>
                                    <td className="p-3">{attempt.pagesAnalyzed}{attempt.cacheHit ? ' · cache' : ''}</td>
                                    <td className="p-3">{attempt.dryRun ? 'DRY-RUN' : 'Manual'}</td>
                                    <td className="p-3 text-right"><button onClick={() => setSelectedId(attempt.id)} className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1.5 font-semibold text-violet-700"><Eye size={13} /> Revisar</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                    <span>Página {page} de {totalPages}</span>
                    <div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(current => current - 1)} className="rounded border px-2 py-1 disabled:opacity-40">Anterior</button><button disabled={page === totalPages} onClick={() => setPage(current => current + 1)} className="rounded border px-2 py-1 disabled:opacity-40">Próxima</button></div>
                </div>
            </div>

            <DecisionMakerDetailsModal attemptId={selectedId} onClose={() => setSelectedId(null)} onChanged={load} organizationId={organizationId} />
        </div>
    );
};

const DecisionMakerDetailsModal: React.FC<{ attemptId: string | null; onClose: () => void; onChanged: () => Promise<void>; organizationId?: string }> = ({ attemptId, onClose, onChanged, organizationId }) => {
    const [attempt, setAttempt] = useState<DecisionMakerAttempt | null>(null);
    const [loading, setLoading] = useState(false);
    const [action, setAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const headers = useMemo(() => (organizationId ? { 'x-organization-id': organizationId } : undefined), [organizationId]);

    const load = useCallback(async () => {
        if (!attemptId) return;
        setLoading(true);
        setError(null);
        try {
            setAttempt((await api.get<DecisionMakerAttempt>(`/asterysko/decision-maker-enrichments/${attemptId}`, { headers })).data);
        } catch (loadError: unknown) {
            setError(getApiErrorMessage(loadError, 'Não foi possível abrir os detalhes.'));
        } finally {
            setLoading(false);
        }
    }, [attemptId, headers]);
    useEffect(() => { void load(); }, [load]);
    if (!attemptId) return null;

    const execute = async (key: string, operation: () => Promise<unknown>) => {
        setAction(key);
        try {
            const response = await operation();
            if (typeof response === 'object' && response && 'data' in response) {
                const data = (response as { data?: { message?: string } }).data;
                if (data?.message) window.alert(data.message);
            }
            await load();
            await onChanged();
        } catch (actionError: unknown) {
            window.alert(getApiErrorMessage(actionError, 'Ação não concluída.'));
        } finally {
            setAction(null);
        }
    };
    const reject = (candidate: DecisionMakerCandidate) => {
        const reason = window.prompt('Motivo da rejeição:', 'Fonte insuficiente.');
        if (reason) void execute(`reject-${candidate.id}`, () => api.post(`/asterysko/decision-maker-enrichments/${attemptId}/candidates/${candidate.id}/reject`, { reason }, { headers }));
    };
    const editAndAccept = (candidate: DecisionMakerCandidate) => {
        const fullName = window.prompt('Nome profissional:', candidate.fullName ?? '');
        if (fullName === null) return;
        const roleTitle = window.prompt('Cargo:', candidate.roleTitle ?? '');
        if (roleTitle === null) return;
        void execute(`edit-${candidate.id}`, () => api.post(`/asterysko/decision-maker-enrichments/${attemptId}/candidates/${candidate.id}/accept`, {
            edit: { candidateType: candidate.candidateType, fullName, roleTitle, department: candidate.department, seniority: candidate.seniority, decisionRelevance: candidate.decisionRelevance, employmentStatus: candidate.employmentStatus },
        }, { headers }));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
                    <div><h4 className="font-bold text-zinc-900 dark:text-white">Revisão de possíveis decisores</h4><p className="text-xs text-zinc-500">{attempt?.opportunity?.brandName ?? attempt?.officialDomain}</p></div>
                    <button onClick={onClose} className="rounded-lg border p-2"><X size={15} /></button>
                </div>
                <div className="overflow-y-auto p-5">
                    {loading ? <Loader2 className="mx-auto my-16 animate-spin text-violet-600" /> : error ? <p className="text-sm text-rose-600">{error}</p> : attempt && (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"><span className="text-[10px] uppercase text-zinc-400">Resultado</span><div className="mt-1">{badge(attempt.finalResult)}</div></div>
                                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"><span className="text-[10px] uppercase text-zinc-400">Confiança</span><strong className="mt-1 block">{Math.round(attempt.finalConfidence ?? 0)}%</strong></div>
                                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"><span className="text-[10px] uppercase text-zinc-400">Segurança</span><strong className="mt-1 block">{attempt.dryRun ? 'DRY-RUN' : 'Manual'}</strong></div>
                            </div>
                            <section>
                                <h5 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-zinc-500"><UsersRound size={14} /> Candidatos</h5>
                                <div className="space-y-3">
                                    {(attempt.candidates ?? []).length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-xs text-zinc-400">Nenhum candidato técnico.</p> : attempt.candidates?.map(candidate => (
                                        <div key={candidate.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div><strong className="text-sm text-zinc-900 dark:text-white">{candidate.fullName ?? candidate.department ?? label(candidate.candidateType)}</strong><p className="text-xs text-zinc-500">{candidate.roleTitle ?? label(candidate.roleCategory)} · {label(candidate.seniority)}</p><div className="mt-2 flex flex-wrap gap-1.5">{badge(candidate.employmentStatus)}{badge(candidate.privacyClassification)}{badge(candidate.decisionRelevance)}</div></div>
                                                <strong className="text-violet-600">{Math.round(candidate.confidence)}%</strong>
                                            </div>
                                            {(candidate.evidences ?? []).map(evidence => <div key={evidence.id} className="mt-3 rounded-lg bg-zinc-50 p-2 text-[11px] text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"><strong>{label(evidence.type)}</strong>{evidence.sanitizedSnippet && <p className="mt-1">{evidence.sanitizedSnippet}</p>}{evidence.url && <a href={evidence.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-violet-600">Abrir evidência <ExternalLink size={10} /></a>}</div>)}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <button disabled={!!action} onClick={() => void execute(`accept-${candidate.id}`, () => api.post(`/asterysko/decision-maker-enrichments/${attemptId}/candidates/${candidate.id}/accept`, {}, { headers }))} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"><Check size={12} /> Aceitar</button>
                                                <button disabled={!!action} onClick={() => editAndAccept(candidate)} className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">Editar e aceitar</button>
                                                <button disabled={!!action} onClick={() => reject(candidate)} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700">Rejeitar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                                <button disabled={!!action} onClick={() => void execute('reprocess', () => api.post(`/asterysko/decision-maker-enrichments/${attemptId}/reprocess`, {}, { headers }))} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><RefreshCw size={13} /> Reprocessar</button>
                                <button disabled={!!action} onClick={() => void execute('lock', () => api.post(`/asterysko/decision-maker-enrichments/${attemptId}/${attempt.opportunity?.decisionMakerEnrichmentLocked ? 'unlock' : 'lock'}`, {}, { headers }))} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold">{attempt.opportunity?.decisionMakerEnrichmentLocked ? <Unlock size={13} /> : <Lock size={13} />}{attempt.opportunity?.decisionMakerEnrichmentLocked ? 'Desbloquear' : 'Bloquear'}</button>
                                {attempt.officialWebsiteUrl && <a href={attempt.officialWebsiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><ExternalLink size={13} /> Abrir website</a>}
                                {attempt.opportunityId && <a href={`/dashboard/asterysko?opportunityId=${encodeURIComponent(attempt.opportunityId)}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><BriefcaseBusiness size={13} /> Abrir oportunidade</a>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
