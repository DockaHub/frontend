import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle2, XCircle, Plus, Lock, Unlock } from 'lucide-react';
import api from '../../../../../services/api';
import {
    ContactAttemptListResponse,
    ContactCandidate,
    ContactCandidateType,
    ContactEnrichmentAttempt,
    ContactEvidence,
    getApiErrorMessage
} from './asteryskoApiTypes';

interface AsteryskoBusinessContactDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attemptId?: string | null;
    opportunityId?: string | null;
    onRefresh?: () => void;
}

export const AsteryskoBusinessContactDetailsModal: React.FC<AsteryskoBusinessContactDetailsModalProps> = ({
    isOpen, onClose, attemptId, opportunityId, onRefresh
}) => {
    const [loading, setLoading] = useState(false);
    const [attempt, setAttempt] = useState<ContactEnrichmentAttempt | null>(null);
    const [candidates, setCandidates] = useState<ContactCandidate[]>([]);
    const [evidences, setEvidences] = useState<ContactEvidence[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Form manual
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualType, setManualType] = useState<ContactCandidateType>('email');
    const [manualValue, setManualValue] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        loadDetails();
    }, [isOpen, attemptId, opportunityId]);

    const loadDetails = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            if (attemptId) {
                const res = await api.get<ContactEnrichmentAttempt>(`/asterysko/business-contact-enrichments/${attemptId}`);
                setAttempt(res.data);
                setCandidates(res.data.candidates ?? []);
                setEvidences(res.data.evidences ?? []);
            } else if (opportunityId) {
                const listRes = await api.get<ContactAttemptListResponse>('/asterysko/business-contact-enrichments', {
                    params: { opportunityId, limit: 1 }
                });
                const latestAttempt = listRes.data.attempts[0];
                if (latestAttempt) {
                    const detailRes = await api.get<ContactEnrichmentAttempt>(
                        `/asterysko/business-contact-enrichments/${latestAttempt.id}`
                    );
                    setAttempt(detailRes.data);
                    setCandidates(detailRes.data.candidates ?? []);
                    setEvidences(detailRes.data.evidences ?? []);
                }
            }
        } catch (error: unknown) {
            setLoadError(getApiErrorMessage(error, 'Erro ao carregar detalhes do enriquecimento.'));
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (candidateId: string) => {
        const effectiveAttemptId = attempt?.id ?? attemptId;
        if (!effectiveAttemptId) return;
        setActionLoading(candidateId);
        try {
            await api.post(`/asterysko/business-contact-enrichments/${effectiveAttemptId}/candidates/${candidateId}/accept`, {
                createContact: true
            });
            await loadDetails();
            onRefresh?.();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao aceitar candidato'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (candidateId: string) => {
        const effectiveAttemptId = attempt?.id ?? attemptId;
        if (!effectiveAttemptId) return;
        const reason = prompt('Motivo da rejeição (opcional):');
        setActionLoading(candidateId);
        try {
            await api.post(`/asterysko/business-contact-enrichments/${effectiveAttemptId}/candidates/${candidateId}/reject`, {
                rejectionReason: reason || undefined
            });
            await loadDetails();
            onRefresh?.();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao rejeitar candidato'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();
        const effectiveAttemptId = attempt?.id ?? attemptId;
        if (!manualValue.trim() || !effectiveAttemptId) return;
        setActionLoading('manual');
        try {
            await api.post(`/asterysko/business-contact-enrichments/${effectiveAttemptId}/candidates/manual`, {
                type: manualType,
                rawValue: manualValue.trim(),
                opportunityId: opportunityId ?? attempt?.opportunityId
            });
            setManualValue('');
            setShowManualForm(false);
            await loadDetails();
            onRefresh?.();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao adicionar candidato manual'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleLockToggle = async (lock: boolean) => {
        const effectiveOpportunityId = attempt?.opportunityId ?? opportunityId;
        if (!effectiveOpportunityId) return;
        setActionLoading(lock ? 'lock' : 'unlock');
        try {
            await api.post(
                `/asterysko/business-contact-enrichments/${effectiveOpportunityId}/${lock ? 'lock' : 'unlock'}`
            );
            onRefresh?.();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, lock ? 'Erro ao proteger enriquecimento' : 'Erro ao liberar enriquecimento'));
        } finally {
            setActionLoading(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 my-8">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
                            <Mail className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Detalhamento de Canais Empresariais</h3>
                            <p className="text-xs text-slate-400">
                                {attempt?.officialDomain ? `Domínio: ${attempt.officialDomain}` : 'Canais de Contato'}
                                {attempt?.dryRun && <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-semibold border border-amber-500/30">DRY-RUN</span>}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                    {loadError && (
                        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
                            {loadError}
                        </div>
                    )}

                    {/* Sumário da Tentativa */}
                    {attempt && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resultado Final</span>
                                <p className="text-sm font-bold text-slate-900 mt-1 uppercase">{attempt.finalResult || attempt.status}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confiança Média</span>
                                <p className="text-sm font-bold text-indigo-600 mt-1">{attempt.finalConfidence ?? 0}%</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Páginas Analisadas</span>
                                <p className="text-sm font-bold text-slate-900 mt-1">{attempt.pagesAnalyzed} {attempt.cacheHit ? '(Cache)' : ''}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidatos</span>
                                <p className="text-sm font-bold text-slate-900 mt-1">{candidates.length} encontrados</p>
                            </div>
                            <div className="col-span-2 md:col-span-4 text-[11px] text-slate-500">
                                {evidences.length} evidência(s) vinculada(s) à tentativa.
                            </div>
                        </div>
                    )}

                    {/* Botão Adicionar Manual */}
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Candidatos Encontrados ({candidates.length})</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleLockToggle(true)}
                                disabled={actionLoading !== null || !(attempt?.opportunityId ?? opportunityId)}
                                className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 flex items-center space-x-1.5 disabled:opacity-50"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                <span>Proteger canais</span>
                            </button>
                            <button
                                onClick={() => handleLockToggle(false)}
                                disabled={actionLoading !== null || !(attempt?.opportunityId ?? opportunityId)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 flex items-center space-x-1.5 disabled:opacity-50"
                            >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Liberar canais</span>
                            </button>
                            <button
                                onClick={() => setShowManualForm(!showManualForm)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 flex items-center space-x-1.5 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Adicionar Canal Manual</span>
                            </button>
                        </div>
                    </div>

                    {/* Formulário Manual */}
                    {showManualForm && (
                        <form onSubmit={handleAddManual} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                            <h5 className="text-xs font-bold text-indigo-900 uppercase">Adicionar Novo Canal Manualmente</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select
                                    value={manualType}
                                    onChange={e => setManualType(e.target.value as ContactCandidateType)}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
                                >
                                    <option value="email">E-mail Comercial</option>
                                    <option value="phone">Telefone Fixo</option>
                                    <option value="whatsapp">WhatsApp Comercial</option>
                                    <option value="website">Website Oficial</option>
                                    <option value="contact_form">Formulário de Contato</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Digite o valor do canal (ex: contato@empresa.com.br)"
                                    value={manualValue}
                                    onChange={e => setManualValue(e.target.value)}
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 col-span-2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowManualForm(false)}
                                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'manual'}
                                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {actionLoading === 'manual' ? 'Salvando...' : 'Salvar Canal'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Lista de Candidatos */}
                    {loading ? (
                        <div className="py-8 text-center text-slate-400 text-sm">Carregando candidatos...</div>
                    ) : candidates.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm font-medium text-slate-600">Nenhum canal candidato encontrado para esta oportunidade.</p>
                            <p className="text-xs text-slate-400 mt-1">Utilize o botão acima para adicionar um canal manual.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {candidates.map(cand => (
                                <div
                                    key={cand.id}
                                    className={`p-4 rounded-xl border transition-all ${
                                        cand.status === 'accepted' ? 'bg-emerald-50/40 border-emerald-200' :
                                        cand.status === 'rejected' ? 'bg-slate-50 border-slate-200 opacity-60' :
                                        'bg-white border-slate-200 hover:border-indigo-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase">
                                                    {cand.type}
                                                </span>
                                                <span className="text-sm font-bold text-slate-900">{cand.displayValue}</span>
                                                {cand.privacyClassification === 'sensitive' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Sensível</span>
                                                )}
                                                {cand.privacyClassification === 'possible_personal' && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Possível Pessoal</span>
                                                )}
                                                {cand.isRoleBased && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">Role-Based</span>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                                                <span>Confiança: <strong className="text-indigo-600">{cand.confidence}%</strong></span>
                                                <span>Validação: <strong>{cand.validationStatus || 'unverifiable'}</strong></span>
                                                <span>Privacidade: <strong>{cand.privacyClassification}</strong></span>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex items-center space-x-2">
                                            {cand.status !== 'accepted' && (
                                                <button
                                                    onClick={() => handleAccept(cand.id)}
                                                    disabled={actionLoading === cand.id}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center space-x-1 transition-colors disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Aceitar</span>
                                                </button>
                                            )}
                                            {cand.status !== 'rejected' && (
                                                <button
                                                    onClick={() => handleReject(cand.id)}
                                                    disabled={actionLoading === cand.id}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 flex items-center space-x-1 transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Rejeitar</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Evidências do candidato */}
                                    {cand.evidences && cand.evidences.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evidências Capturadas:</span>
                                            {cand.evidences.map(ev => (
                                                <div key={ev.id} className="text-xs text-slate-600 flex items-center justify-between">
                                                    <span className="truncate max-w-md">• {ev.type} em {ev.url || ev.source}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400">Peso {ev.weight}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span>⚡ Governança de Canais Asterysko — Fase 2.5A</span>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
