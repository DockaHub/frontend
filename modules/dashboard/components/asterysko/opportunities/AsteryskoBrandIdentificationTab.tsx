import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoBrandDetailsModal } from './AsteryskoBrandDetailsModal';
import {
    BrandIdentificationCounts,
    BrandIdentificationItem,
    ItemsResponse
} from './asteryskoApiTypes';

export const AsteryskoBrandIdentificationTab: React.FC<{ organizationId?: string }> = ({ organizationId }) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<BrandIdentificationItem[]>([]);
    const [counts, setCounts] = useState<BrandIdentificationCounts>({});
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = organizationId ? { 'x-organization-id': organizationId } : undefined;
            const [listRes, countsRes] = await Promise.all([
                api.get<ItemsResponse<BrandIdentificationItem>>('/asterysko/brand-identifications', {
                    params: {
                        page,
                        limit: 15,
                        status: activeStatus
                    },
                    headers,
                }),
                api.get<BrandIdentificationCounts>('/asterysko/brand-identifications/counts', { headers })
            ]);

            setItems(listRes.data.items || []);
            setCounts(countsRes.data || {});
        } catch (err) {
            console.error('Erro ao carregar dados de identificação de marca:', err);
        } finally {
            setLoading(false);
        }
    }, [page, activeStatus, organizationId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openDetails = (id: string) => {
        setSelectedItemId(id);
        setIsDetailsOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'identified':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Identificada</span>;
            case 'review_required':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Revisão Necessária</span>;
            case 'multiple_candidates':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Múltiplas Marcas</span>;
            case 'not_found':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">Não Encontrada</span>;
            case 'failed':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Falha</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-600">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <button
                    onClick={() => { setActiveStatus('all'); setPage(1); }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${activeStatus === 'all' ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400' : 'bg-white dark:bg-zinc-950 border-zinc-200'}`}
                >
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Total Fila</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{counts.total || 0}</p>
                </button>
                <button
                    onClick={() => { setActiveStatus('identified'); setPage(1); }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${activeStatus === 'identified' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400' : 'bg-white dark:bg-zinc-950 border-zinc-200'}`}
                >
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Identificadas</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{counts.identified || 0}</p>
                </button>
                <button
                    onClick={() => { setActiveStatus('review_required'); setPage(1); }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${activeStatus === 'review_required' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400' : 'bg-white dark:bg-zinc-950 border-zinc-200'}`}
                >
                    <span className="text-[10px] font-bold uppercase text-amber-600">Para Revisar</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{counts.review_required || 0}</p>
                </button>
                <button
                    onClick={() => { setActiveStatus('multiple_candidates'); setPage(1); }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${activeStatus === 'multiple_candidates' ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400' : 'bg-white dark:bg-zinc-950 border-zinc-200'}`}
                >
                    <span className="text-[10px] font-bold uppercase text-purple-600">Múltiplas Marcas</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{counts.multiple_candidates || 0}</p>
                </button>
                <button
                    onClick={() => { setActiveStatus('not_found'); setPage(1); }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${activeStatus === 'not_found' ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400' : 'bg-white dark:bg-zinc-950 border-zinc-200'}`}
                >
                    <span className="text-[10px] font-bold uppercase text-zinc-500">Não Encontrada</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{counts.not_found || 0}</p>
                </button>
                <button
                    onClick={() => { setActiveStatus('failed'); setPage(1); }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${activeStatus === 'failed' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400' : 'bg-white dark:bg-zinc-950 border-zinc-200'}`}
                >
                    <span className="text-[10px] font-bold uppercase text-rose-600">Falhas</span>
                    <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{counts.failed || 0}</p>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Empresa / Razão Social</th>
                                <th className="p-4">Marca Candidata Principal</th>
                                <th className="p-4">Confiança</th>
                                <th className="p-4">Status Identificação</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading && items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <Loader2 className="animate-spin text-purple-600 mx-auto" size={24} />
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-zinc-400">
                                        Nenhum item encontrado na fila de identificação de marca.
                                    </td>
                                </tr>
                            ) : items.map(item => {
                                const selectedCand = item.brandCandidates?.find(candidate => candidate.isSelected) || item.brandCandidates?.[0];
                                return (
                                    <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-zinc-900 dark:text-white">
                                                {item.opportunity?.companyName || item.normalizedPayload?.companyName || '–'}
                                            </div>
                                            <div className="text-[11px] text-zinc-400 font-mono">
                                                {item.opportunity?.cnpj || item.normalizedPayload?.cnpj || 'Sem CNPJ'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-purple-700 dark:text-purple-300">
                                                {selectedCand?.displayName || '–'}
                                            </div>
                                            {selectedCand?.normalizedName && (
                                                <div className="text-[10px] text-zinc-400 font-mono">
                                                    {selectedCand.normalizedName}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">
                                            {item.brandIdentificationConfidence ? `${item.brandIdentificationConfidence}%` : '–'}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(item.brandIdentificationStatus)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => openDetails(item.id)}
                                                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 transition-colors flex items-center gap-1 ml-auto"
                                            >
                                                <Eye size={14} /> Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalhes */}
            <AsteryskoBrandDetailsModal
                isOpen={isDetailsOpen}
                sourceItemId={selectedItemId}
                onClose={() => setIsDetailsOpen(false)}
                onUpdated={loadData}
            />
        </div>
    );
};
