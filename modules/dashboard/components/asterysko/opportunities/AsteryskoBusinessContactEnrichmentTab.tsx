import React, { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Eye, Shield } from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoBusinessContactDetailsModal } from './AsteryskoBusinessContactDetailsModal';
import {
    ContactAttemptListResponse,
    ContactCountsResponse,
    ContactEnrichmentAttempt,
    getApiErrorMessage
} from './asteryskoApiTypes';

export const AsteryskoBusinessContactEnrichmentTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState<ContactEnrichmentAttempt[]>([]);
    const [counts, setCounts] = useState<ContactCountsResponse | null>(null);
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const [listRes, countsRes] = await Promise.all([
                api.get<ContactAttemptListResponse>('/asterysko/business-contact-enrichments', {
                    params: {
                        page,
                        limit: 15,
                        status: activeStatus !== 'all' ? activeStatus : undefined,
                    }
                }),
                api.get<ContactCountsResponse>('/asterysko/business-contact-enrichments/counts')
            ]);

            setAttempts(listRes.data.attempts ?? []);
            setTotalPages(Math.ceil((listRes.data.total ?? 0) / 15) || 1);
            setCounts(countsRes.data);
        } catch (error: unknown) {
            setLoadError(getApiErrorMessage(error, 'Erro ao carregar tentativas de enriquecimento.'));
        } finally {
            setLoading(false);
        }
    }, [page, activeStatus]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openDetails = (id: string) => {
        setSelectedAttemptId(id);
        setIsDetailsOpen(true);
    };

    const handleReprocess = async (id: string) => {
        setActionLoading(id);
        try {
            await api.post(`/asterysko/business-contact-enrichments/${id}/reprocess`);
            await loadData();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Erro ao reprocessar tentativa'));
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string, result?: string | null) => {
        const val = result || status;
        switch (val) {
            case 'completed':
            case 'enriched':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Enriquecido</span>;
            case 'completed_partial':
            case 'partial':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Parcial</span>;
            case 'review_required':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Revisão Humana</span>;
            case 'no_contact_found':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Sem Contato</span>;
            case 'failed':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Falha</span>;
            case 'running':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">Em Execução</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{val}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Métricas */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        <span>Motor de Canais Empresariais (Fase 2.5A)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Descoberta e governança de canais oficiais sem envio de mensagens nem automações proibidas.
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 flex items-center space-x-2 transition-colors self-start md:self-auto"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                </button>
            </div>

            {/* Banner de Segurança Dry-Run */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Modo de Segurança Dry-Run Ativo (ASTERYSKO_BUSINESS_CONTACT_ENRICHMENT_DRY_RUN=true)</p>
                    <p className="text-amber-800">
                        Canais encontrados são classificados como candidatos e exigem revisão ou aceite manual antes de compor contatos comerciais. Nenhuma mensagem é enviada nem dados são alterados no CRM automaticamente.
                    </p>
                </div>
            </div>

            {loadError && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700">
                    {loadError}
                </div>
            )}

            <p className="text-[11px] text-slate-500">
                Tentativas contabilizadas: {counts?.counts.attempts.reduce(
                    (total, entry) => total + entry._count,
                    0
                ) ?? 0}
            </p>

            {/* Filtros de Status */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'Todas as Tentativas' },
                    { id: 'completed', label: 'Enriquecidos' },
                    { id: 'review_required', label: 'Revisão Humana' },
                    { id: 'no_contact_found', label: 'Sem Contato' },
                    { id: 'failed', label: 'Falhas' },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => { setActiveStatus(f.id); setPage(1); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                            activeStatus === f.id
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Tabela de Tentativas */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Domínio / Empresa</th>
                                <th className="py-3 px-4">Status Website</th>
                                <th className="py-3 px-4">Resultado</th>
                                <th className="py-3 px-4">Confiança</th>
                                <th className="py-3 px-4">Candidatos</th>
                                <th className="py-3 px-4">Páginas</th>
                                <th className="py-3 px-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        Carregando histórico de enriquecimento...
                                    </td>
                                </tr>
                            ) : attempts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        Nenhuma tentativa registrada para o filtro selecionado.
                                    </td>
                                </tr>
                            ) : (
                                attempts.map(att => (
                                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                                            <div>{att.officialDomain || att.officialWebsiteUrl || 'N/D'}</div>
                                            <div className="text-[10px] text-slate-400 font-normal">Ref: {new Date(att.createdAt).toLocaleDateString('pt-BR')}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-600">
                                            {att.websiteStatus || 'N/D'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(att.status, att.finalResult)}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-indigo-600">
                                            {att.finalConfidence ?? 0}%
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-800">
                                            {att.candidateCount || 0} ({att.acceptedCandidateCount || 0} aceitos)
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            {att.pagesAnalyzed} pág. {att.cacheHit && <span className="text-[10px] text-indigo-500 font-semibold">(Cache)</span>}
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => openDetails(att.id)}
                                                className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 inline-flex items-center space-x-1"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Ver</span>
                                            </button>
                                            <button
                                                onClick={() => handleReprocess(att.id)}
                                                disabled={actionLoading === att.id}
                                                className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 inline-flex items-center space-x-1"
                                            >
                                                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === att.id ? 'animate-spin' : ''}`} />
                                                <span>Reprocessar</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                        <span>Página {page} de {totalPages}</span>
                        <div className="space-x-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Detalhes */}
            <AsteryskoBusinessContactDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => { setIsDetailsOpen(false); setSelectedAttemptId(null); }}
                attemptId={selectedAttemptId}
                onRefresh={loadData}
            />
        </div>
    );
};
