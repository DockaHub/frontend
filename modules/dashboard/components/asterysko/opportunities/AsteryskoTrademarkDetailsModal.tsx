import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Shield, Lock, Unlock, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import api from '../../../../../services/api';
import {
    getApiErrorMessage,
    TrademarkRisk,
    TrademarkScreeningDetails
} from './asteryskoApiTypes';

interface AsteryskoTrademarkDetailsModalProps {
    screeningId: string;
    onClose: () => void;
    onRefresh: () => void;
    onOpenRadar?: (brandName: string, nclClass: string) => void;
}

export const AsteryskoTrademarkDetailsModal: React.FC<AsteryskoTrademarkDetailsModalProps> = ({
    screeningId,
    onClose,
    onRefresh,
    onOpenRadar
}) => {
    const [data, setData] = useState<TrademarkScreeningDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [activeTab, setActiveTab] = useState<'matches' | 'queries' | 'evidences'>('matches');

    React.useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get<TrademarkScreeningDetails>(`/asterysko/trademark-screenings/${screeningId}`);
                setData(res.data);
            } catch (err) {
                console.error('Failed to load screening details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [screeningId]);

    const handleReview = async (decision: string, confirmedRisk?: TrademarkRisk) => {
        try {
            setReviewing(true);
            await api.post(`/asterysko/trademark-screenings/${screeningId}/review`, {
                decision,
                notes: reviewNotes,
                confirmedRisk
            });
            onRefresh();
            onClose();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Falha ao enviar revisão'));
        } finally {
            setReviewing(false);
        }
    };

    const handleLockToggle = async () => {
        try {
            const isLocked = data?.opportunity?.trademarkScreeningLocked;
            const endpoint = isLocked ? `/asterysko/trademark-screenings/${screeningId}/unlock` : `/asterysko/trademark-screenings/${screeningId}/lock`;
            await api.post(endpoint);
            setData(prev => prev ? {
                ...prev,
                opportunity: prev.opportunity ? { ...prev.opportunity, trademarkScreeningLocked: !isLocked } : null
            } : null);
            onRefresh();
        } catch (err) {
            console.error('Failed to toggle lock', err);
        }
    };

    if (loading || !data) {
        return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 text-center">
                    <RefreshCw className="animate-spin text-[#0412dd] mx-auto mb-4" size={32} />
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Carregando análise marcária...</p>
                </div>
            </div>
        );
    }

    const riskColor = data.finalRisk === 'high' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200' :
                      data.finalRisk === 'medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200' :
                      'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <Shield className="text-[#0412dd]" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{data.brandName}</h2>
                            <p className="text-xs text-zinc-500 font-mono">
                                Empresa: {data.companyName || 'N/A'} • CNPJ: {data.cnpj || 'N/A'} • Tentativa ID: {data.id.substring(0, 8)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {data.opportunity && (
                            <button
                                onClick={handleLockToggle}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                                    data.opportunity.trademarkScreeningLocked
                                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400'
                                        : 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300'
                                }`}
                            >
                                {data.opportunity.trademarkScreeningLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                {data.opportunity.trademarkScreeningLocked ? 'Análise Travada' : 'Travar Análise'}
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Summary Banner */}
                    <div className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${riskColor}`}>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                {data.finalRisk === 'high' && <AlertTriangle size={20} />}
                                {data.finalRisk === 'medium' && <Info size={20} />}
                                {data.finalRisk === 'low' && <CheckCircle size={20} />}
                                <span className="font-bold uppercase tracking-wider text-xs">
                                    Resultado Preliminar: {data.result || 'Sem Anterioridade'} ({data.finalRisk?.toUpperCase() || 'LOW'} RISK)
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed opacity-90">
                                Base consultada: <strong className="font-semibold">{data.baseVersion || 'RPI Oficial'}</strong> ({new Date(data.baseReferenceDate || data.createdAt).toLocaleDateString('pt-BR')}). Confiança técnica: {data.finalConfidence || 90}%.
                            </p>
                        </div>

                        {onOpenRadar && (
                            <button
                                onClick={() => onOpenRadar(data.brandName, data.candidateClasses?.[0] || '35')}
                                className="px-4 py-2 bg-[#0412dd] text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors flex items-center gap-1.5 shrink-0"
                            >
                                <ExternalLink size={14} />
                                Abrir no Radar da Marca
                            </button>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
                        <button
                            onClick={() => setActiveTab('matches')}
                            className={`pb-3 text-xs font-bold transition-colors relative ${
                                activeTab === 'matches'
                                    ? 'text-[#0412dd] border-b-2 border-[#0412dd]'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            Correspondências Encontradas ({data.matches?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('queries')}
                            className={`pb-3 text-xs font-bold transition-colors relative ${
                                activeTab === 'queries'
                                    ? 'text-[#0412dd] border-b-2 border-[#0412dd]'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            Consultas Executadas ({data.queries?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('evidences')}
                            className={`pb-3 text-xs font-bold transition-colors relative ${
                                activeTab === 'evidences'
                                    ? 'text-[#0412dd] border-b-2 border-[#0412dd]'
                                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            Evidências Estruturadas ({data.evidences?.length || 0})
                        </button>
                    </div>

                    {/* Tab 1: Matches */}
                    {activeTab === 'matches' && (
                        <div className="space-y-4">
                            {data.matches?.length === 0 ? (
                                <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    Nenhuma anterioridade relevante foi registrada nesta consulta.
                                </div>
                            ) : (
                                (data.matches ?? []).map(m => (
                                    <div key={m.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{m.markName}</span>
                                                <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                                                    Proc. {m.processNumber}
                                                </span>
                                                <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded font-medium">
                                                    Classe NCL {m.classes?.join(', ') || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                Titular: <strong className="font-semibold">{m.ownerName || 'INPI'}</strong> • Status: <span className="underline">{m.processStatus}</span> ({m.processStatusGroup})
                                            </p>
                                            <p className="text-[11px] text-zinc-500 italic">{m.explanation}</p>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{m.combinedScore}%</div>
                                                <div className="text-[10px] uppercase font-semibold text-zinc-400">Score Combinado</div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                                m.riskContribution === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                                m.riskContribution === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                            }`}>
                                                {m.riskContribution}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab 2: Queries */}
                    {activeTab === 'queries' && (
                        <div className="space-y-3">
                            {data.queries?.map(q => (
                                <div key={q.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs font-mono">
                                    <div>
                                        <span className="font-bold text-[#0412dd]">{q.queryType}</span>: "{q.rawQuery}" (Norm: "{q.normalizedQuery}")
                                    </div>
                                    <div className="text-zinc-500">
                                        {q.resultCount} resultados • {q.durationMs}ms
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 3: Evidences */}
                    {activeTab === 'evidences' && (
                        <div className="space-y-3">
                            {data.evidences?.map(e => (
                                <div key={e.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                                        <span>{e.title}</span>
                                        <span className="font-mono text-[10px] text-zinc-500 font-normal">Força: {e.strength}</span>
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-400 mt-1">{e.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Human Review Section */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Eye size={16} className="text-[#0412dd]" /> Painel de Revisão Humana
                        </h3>

                        {data.reviewDecision ? (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-xs">
                                Revisado em {data.reviewedAt ? new Date(data.reviewedAt).toLocaleDateString('pt-BR') : 'data não informada'} • Decisão: <strong>{data.reviewDecision}</strong>.
                                {data.reviewNotes && <p className="mt-1 italic">Obs: "{data.reviewNotes}"</p>}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Observações da análise técnica preliminar..."
                                    className="w-full h-20 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0412dd]"
                                />
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        disabled={reviewing}
                                        onClick={() => handleReview('confirmed_low_risk', 'low')}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        Confirmar Baixo Risco (Low)
                                    </button>
                                    <button
                                        disabled={reviewing}
                                        onClick={() => handleReview('confirmed_medium_risk', 'medium')}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        Confirmar Médio Risco (Medium)
                                    </button>
                                    <button
                                        disabled={reviewing}
                                        onClick={() => handleReview('confirmed_high_risk', 'high')}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        Confirmar Alto Conflito (High)
                                    </button>
                                    <button
                                        disabled={reviewing}
                                        onClick={() => handleReview('confirmed_same_owner', 'low')}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        Confirmar Mesmo Titular
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
