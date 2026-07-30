import React, { useState, useEffect } from 'react';
import {
    X, Check, XCircle, ExternalLink, Loader2, Sparkles
} from 'lucide-react';
import api from '../../../../../services/api';
import {
    BrandIdentificationItem,
    getApiErrorMessage
} from './asteryskoApiTypes';

interface AsteryskoBrandDetailsModalProps {
    isOpen: boolean;
    sourceItemId: string | null;
    onClose: () => void;
    onUpdated?: () => void;
}

export const AsteryskoBrandDetailsModal: React.FC<AsteryskoBrandDetailsModalProps> = ({
    isOpen, sourceItemId, onClose, onUpdated
}) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [item, setItem] = useState<BrandIdentificationItem | null>(null);

    useEffect(() => {
        if (isOpen && sourceItemId) {
            setLoading(true);
            api.get<BrandIdentificationItem>(`/asterysko/brand-identifications/${sourceItemId}`)
                .then(res => setItem(res.data))
                .catch(err => console.error('Erro ao carregar detalhes da marca:', err))
                .finally(() => setLoading(false));
        } else {
            setItem(null);
        }
    }, [isOpen, sourceItemId]);

    const handleAcceptCandidate = async (candidateId: string) => {
        if (!sourceItemId) return;
        setActionLoading(true);
        try {
            await api.post(`/asterysko/brand-identifications/${sourceItemId}/candidates/${candidateId}/accept`);
            if (onUpdated) onUpdated();
            onClose();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao aceitar candidato.'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectCandidate = async (candidateId: string) => {
        if (!sourceItemId) return;
        setActionLoading(true);
        try {
            await api.post(`/asterysko/brand-identifications/${sourceItemId}/candidates/${candidateId}/reject`);
            const res = await api.get<BrandIdentificationItem>(`/asterysko/brand-identifications/${sourceItemId}`);
            setItem(res.data);
            if (onUpdated) onUpdated();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao rejeitar candidato.'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkNotFound = async () => {
        if (!sourceItemId) return;
        const reason = prompt('Motivo para marcar como não encontrada (opcional):');
        setActionLoading(true);
        try {
            await api.post(`/asterysko/brand-identifications/${sourceItemId}/mark-not-found`, { reason });
            if (onUpdated) onUpdated();
            onClose();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao atualizar status.'));
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    const normalizedPayload = item?.normalizedPayload || {};
    const rawPayload = item?.rawPayload || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                        <h2 className="text-base font-bold text-zinc-900 dark:text-white">Detalhes da Identificação da Marca</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-purple-600" size={32} />
                        </div>
                    ) : item ? (
                        <>
                            {/* Dados da Empresa */}
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Dados da Empresa Capturada</span>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div><span className="text-zinc-400">Razão Social:</span> <strong className="text-zinc-800 dark:text-zinc-200">{normalizedPayload.companyName || rawPayload.companyName || '–'}</strong></div>
                                    <div><span className="text-zinc-400">Nome Fantasia:</span> <strong className="text-zinc-800 dark:text-zinc-200">{normalizedPayload.tradeName || rawPayload.tradeName || '–'}</strong></div>
                                    <div><span className="text-zinc-400">CNPJ:</span> <span className="font-mono">{normalizedPayload.cnpj || '–'}</span></div>
                                    <div><span className="text-zinc-400">Domínio / Website:</span> {normalizedPayload.website ? <a href={normalizedPayload.website} target="_blank" rel="noreferrer" className="text-blue-600 underline flex items-center gap-1 inline-flex">{normalizedPayload.domain || normalizedPayload.website} <ExternalLink size={10} /></a> : '–'}</div>
                                </div>
                            </div>

                            {/* Candidatos de Marca */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Candidatos de Marca Identificados</h3>
                                <div className="space-y-3">
                                    {item.brandCandidates?.length === 0 ? (
                                        <p className="text-xs text-zinc-400 italic">Nenhum candidato de marca gerado.</p>
                                    ) : item.brandCandidates?.map(cand => (
                                        <div key={cand.id} className={`p-4 rounded-xl border transition-all ${cand.isSelected ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-sm text-zinc-900 dark:text-white">{cand.displayName}</strong>
                                                        {cand.status === 'accepted' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">Aceito</span>}
                                                        {cand.isSelected && cand.status !== 'accepted' && <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">Selecionado pelo Motor</span>}
                                                    </div>
                                                    <p className="text-[11px] font-mono text-zinc-400 mt-0.5">Normalizado: {cand.normalizedName}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{cand.confidence}% confiança</span>
                                                    {cand.status !== 'accepted' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRejectCandidate(cand.id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1"
                                                            >
                                                                <XCircle size={12} /> Rejeitar
                                                            </button>
                                                            <button
                                                                onClick={() => handleAcceptCandidate(cand.id)}
                                                                disabled={actionLoading}
                                                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                                                            >
                                                                <Check size={12} /> Aceitar
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Score Breakdown */}
                                            {cand.scoreBreakdown && Array.isArray(cand.scoreBreakdown) && (
                                                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] space-y-1 text-zinc-500">
                                                    {cand.scoreBreakdown.map((sb, idx) => (
                                                        <div key={idx} className="flex justify-between">
                                                            <span>• {sb.reason}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Evidências */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Evidências Coletadas ({item.brandEvidences?.length || 0})</h3>
                                <div className="space-y-2">
                                    {item.brandEvidences?.map(ev => (
                                        <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs bg-zinc-50/50 dark:bg-zinc-900/50">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{ev.type}</span>
                                                <strong className="text-zinc-800 dark:text-zinc-200">{ev.value}</strong>
                                            </div>
                                            <span className={`text-[10px] font-bold ${ev.strength === 'strong' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {ev.strength} (+{ev.weight} pts)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <button
                        onClick={handleMarkNotFound}
                        disabled={actionLoading}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        Marca Não Encontrada
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
