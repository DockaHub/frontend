import React, { useState, useEffect, useCallback } from 'react';
import { 
    Plus, Search, RefreshCw, Send, AlertOctagon,
    ChevronLeft, ChevronRight, Eye, Loader2, Zap, X, Trash2
} from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoNewOpportunityModal } from './AsteryskoNewOpportunityModal';
import {
    AsteryskoOpportunityDetailsModal,
    prefetchOpportunitySummary,
} from './AsteryskoOpportunityDetailsModal';
import { AsteryskoDiscardModal } from './AsteryskoDiscardModal';
import { AsteryskoSendToCrmModal } from './AsteryskoSendToCrmModal';
import { AsteryskoEngineModal } from './AsteryskoEngineModal';
import {
    AsteryskoOpportunity,
    OpportunityCounts
} from './asteryskoApiTypes';

interface Props {
    organizationId?: string;
    onTotalChange?: (total: number) => void;
}

const LIST_CACHE_TTL_MS = 15_000;
const COUNTS_CACHE_TTL_MS = 30_000;
const opportunitiesCache = new Map<string, { data: any; expiresAt: number }>();
const opportunityCountsCache = new Map<string, { data: any; expiresAt: number }>();

export const AsteryskoOpportunitiesTab: React.FC<Props> = ({ organizationId, onTotalChange }) => {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<AsteryskoOpportunity[]>([]);
    const [counts, setCounts] = useState<OpportunityCounts>({
        total: 0,
        review: 0,
        qualified: 0,
        sent_to_crm: 0,
        discarded: 0,
        captured: 0,
        processing: 0,
        doNotContact: 0
    });

    // Filtros e Paginação
    const [activeStatus, setActiveStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 15;

    // Modais Modos de Ação
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
    const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDiscardOpen, setIsDiscardOpen] = useState(false);
    const [isSendToCrmOpen, setIsSendToCrmOpen] = useState(false);
    const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
    const [actionTargetOpp, setActionTargetOpp] = useState<AsteryskoOpportunity | null>(null);

    // Seleção em lote para envio ao CRM ou exclusão
    const [selectedOppIds, setSelectedOppIds] = useState<string[]>([]);
    const [batchSending, setBatchSending] = useState(false);
    const [batchDeleting, setBatchDeleting] = useState(false);
    const [batchFeedback, setBatchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const toggleSelectOpp = (id: string) => {
        setSelectedOppIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const isAllSelected = items.length > 0 && items.every(opp => selectedOppIds.includes(opp.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedOppIds(prev => prev.filter(id => !items.some(opp => opp.id === id)));
        } else {
            const newIds = items.map(opp => opp.id).filter(id => !selectedOppIds.includes(id));
            setSelectedOppIds(prev => [...prev, ...newIds]);
        }
    };

    const clearSelection = () => {
        setSelectedOppIds([]);
    };

    const handleBatchSendToCrm = async () => {
        if (selectedOppIds.length === 0) return;
        setBatchSending(true);
        setBatchFeedback(null);
        try {
            const res = await api.post('/asterysko/opportunities/batch-send-to-crm', {
                opportunityIds: selectedOppIds,
            }, {
                headers: organizationId ? { 'x-organization-id': organizationId } : undefined,
            });
            setBatchFeedback({
                type: 'success',
                message: `${res.data.sentCount} oportunidade(s) enviada(s) com sucesso ao CRM!`,
            });
            setSelectedOppIds([]);
            opportunitiesCache.clear();
            opportunityCountsCache.clear();
            await loadData(true);
        } catch (err: any) {
            setBatchFeedback({
                type: 'error',
                message: err?.response?.data?.error || err?.message || 'Falha ao enviar lote de oportunidades ao CRM.',
            });
        } finally {
            setBatchSending(false);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedOppIds.length === 0) return;
        const confirmMsg = `Tem certeza que deseja excluir permanentemente as ${selectedOppIds.length} oportunidade(s) selecionada(s)? Esta ação não pode ser desfeita.`;
        if (!window.confirm(confirmMsg)) return;

        setBatchDeleting(true);
        setBatchFeedback(null);
        try {
            const res = await api.post('/asterysko/opportunities/batch-delete', {
                opportunityIds: selectedOppIds,
            }, {
                headers: organizationId ? { 'x-organization-id': organizationId } : undefined,
            });
            setBatchFeedback({
                type: 'success',
                message: res.data.message || `${res.data.deletedCount || selectedOppIds.length} oportunidade(s) excluída(s) com sucesso!`,
            });
            setSelectedOppIds([]);
            opportunitiesCache.clear();
            opportunityCountsCache.clear();
            await loadData(true);
        } catch (err: any) {
            setBatchFeedback({
                type: 'error',
                message: err?.response?.data?.error || err?.message || 'Falha ao excluir oportunidades selecionadas.',
            });
        } finally {
            setBatchDeleting(false);
        }
    };

    const handleDeleteOpportunity = async (opp: AsteryskoOpportunity) => {
        const name = opp.brandName || opp.companyName || 'esta oportunidade';
        const confirmMsg = `Tem certeza que deseja excluir permanentemente "${name}"? Esta ação não pode ser desfeita.`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await api.delete(`/asterysko/opportunities/${opp.id}`, {
                headers: organizationId ? { 'x-organization-id': organizationId } : undefined,
            });
            setBatchFeedback({
                type: 'success',
                message: `Oportunidade "${name}" excluída com sucesso!`,
            });
            setSelectedOppIds(prev => prev.filter(id => id !== opp.id));
            opportunitiesCache.clear();
            opportunityCountsCache.clear();
            await loadData(true);
        } catch (err: any) {
            setBatchFeedback({
                type: 'error',
                message: err?.response?.data?.error || err?.message || 'Falha ao excluir oportunidade.',
            });
        }
    };

    const handleCleanFixtures = async () => {
        if (!window.confirm('Deseja excluir permanentemente todas as oportunidades fictícias/de teste (Fixture) geradas no ambiente?')) return;
        setBatchDeleting(true);
        setBatchFeedback(null);
        try {
            const res = await api.post('/asterysko/opportunities/clean-fixtures', {}, {
                headers: organizationId ? { 'x-organization-id': organizationId } : undefined,
            });
            setBatchFeedback({
                type: 'success',
                message: res.data.message || `${res.data.deletedCount} oportunidade(s) de teste removida(s) com sucesso!`,
            });
            setSelectedOppIds([]);
            opportunitiesCache.clear();
            opportunityCountsCache.clear();
            await loadData(true);
        } catch (err: any) {
            setBatchFeedback({
                type: 'error',
                message: err?.response?.data?.error || err?.message || 'Falha ao limpar oportunidades de teste.',
            });
        } finally {
            setBatchDeleting(false);
        }
    };

    const loadData = useCallback(async (force = false) => {
        if (!organizationId) {
            setItems([]);
            setCounts(current => ({ ...current, total: 0 }));
            onTotalChange?.(0);
            return;
        }
        const cacheKey = JSON.stringify([organizationId, page, activeStatus, appliedSearch]);
        const cached = opportunitiesCache.get(cacheKey);
        if (!force && cached && cached.expiresAt > Date.now()) {
            setItems(cached.data.items);
            setTotalPages(cached.data.totalPages);
            setCounts(cached.data.counts);
            onTotalChange?.(cached.data.counts.total || 0);
            return;
        }

        setLoading(!cached);
        try {
            const cachedCounts = opportunityCountsCache.get(organizationId);
            const countsRequest = !force && cachedCounts && cachedCounts.expiresAt > Date.now()
                ? Promise.resolve(cachedCounts.data)
                : api.get('/asterysko/opportunities/counts', {
                    headers: { 'x-organization-id': organizationId }
                }).then(({ data }) => {
                    opportunityCountsCache.set(organizationId, {
                        data,
                        expiresAt: Date.now() + COUNTS_CACHE_TTL_MS,
                    });
                    return data;
                });

            const [listRes, nextCounts] = await Promise.all([
                api.get('/asterysko/opportunities', {
                    headers: { 'x-organization-id': organizationId },
                    params: {
                        page,
                        limit,
                        status: activeStatus,
                        search: appliedSearch || undefined,
                        compact: true,
                    }
                }),
                countsRequest,
            ]);

            const nextData = {
                items: listRes.data.items || [],
                totalPages: listRes.data.pagination?.totalPages || 1,
                counts: nextCounts,
            };
            opportunitiesCache.set(cacheKey, {
                data: nextData,
                expiresAt: Date.now() + LIST_CACHE_TTL_MS,
            });
            setItems(nextData.items);
            setTotalPages(nextData.totalPages);
            setCounts(nextData.counts);
            onTotalChange?.(nextCounts.total || 0);
        } catch (error) {
            console.error('Failed to load opportunities data', error);
        } finally {
            setLoading(false);
        }
    }, [page, activeStatus, appliedSearch, organizationId, onTotalChange]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setAppliedSearch(searchQuery.trim());
        }, 350);
        return () => window.clearTimeout(timer);
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setAppliedSearch(searchQuery.trim());
    };

    const openDetails = (opp: any) => {
        setSelectedOppId(opp.id);
        setSelectedOpportunity(opp);
        setIsDetailsOpen(true);
    };

    const openDiscard = (opp: AsteryskoOpportunity) => {
        setActionTargetOpp(opp);
        setIsDiscardOpen(true);
    };

    const openSendToCrm = (opp: AsteryskoOpportunity) => {
        setActionTargetOpp(opp);
        setIsSendToCrmOpen(true);
    };

    const formatScore = (val: number | null | undefined) => {
        if (val === null || val === undefined) return <span className="text-zinc-400 font-normal italic text-[11px]">Não analisado</span>;
        return <span className="font-bold text-xs">{val}/100</span>;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'captured':
            case 'review':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">Para analisar</span>;
            case 'qualified':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">Qualificada</span>;
            case 'discarded':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">Descartada</span>;
            case 'sent_to_crm':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">Enviada ao CRM</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{status}</span>;
        }
    };

    const hasFixtureItems = items.some(opp => 
        /fixture/i.test(opp.brandName || '') || 
        /fixture/i.test(opp.companyName || '') || 
        /fixture/i.test(opp.tradeName || '') ||
        opp.sourceType === 'manual_fixture'
    );

    return (
        <div className="space-y-6">
            {/* Header Secundário da Aba Oportunidades */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Oportunidades de Prospecção
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Empresas e marcas identificadas para análise e possível prospecção.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => void loadData(true)}
                        className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Atualizar lista"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => setIsEngineModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                        title="Motor de Captação"
                    >
                        <Zap size={14} /> Motor
                    </button>
                    <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={16} /> Nova Oportunidade
                    </button>
                </div>
            </div>

            {/* KPI Cards Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                <button
                    onClick={() => { setActiveStatus('review'); setPage(1); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        activeStatus === 'review' 
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20' 
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Para Analisar</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.review}</p>
                </button>

                <button
                    onClick={() => { setActiveStatus('qualified'); setPage(1); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        activeStatus === 'qualified' 
                            ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 ring-2 ring-purple-500/20' 
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Qualificadas</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.qualified}</p>
                </button>

                <button
                    onClick={() => { setActiveStatus('sent_to_crm'); setPage(1); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        activeStatus === 'sent_to_crm' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20' 
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Enviadas ao CRM</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.sent_to_crm}</p>
                </button>

                <button
                    onClick={() => { setActiveStatus('discarded'); setPage(1); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        activeStatus === 'discarded' 
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/20' 
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Descartadas</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.discarded}</p>
                </button>

                <button
                    onClick={() => { setActiveStatus('all'); setPage(1); }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-4 lg:col-span-1 ${
                        activeStatus === 'all' 
                            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/20' 
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Geral</span>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{counts.total}</p>
                </button>
            </div>

            {/* Controls Bar & Filters */}
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search input */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por marca, CNPJ, domínio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0412dd]"
                    />
                </form>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Todas' },
                        { id: 'review', label: 'Para analisar' },
                        { id: 'qualified', label: 'Qualificadas' },
                        { id: 'sent_to_crm', label: 'Enviadas ao CRM' },
                        { id: 'discarded', label: 'Descartadas' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveStatus(tab.id); setPage(1); }}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                activeStatus === tab.id
                                    ? 'bg-[#0412dd] dark:bg-[#3b48ff] text-white shadow-sm'
                                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Batch Action Toolbar */}
            {selectedOppIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-4 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30">
                    <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0412dd] text-xs font-bold text-white">
                            {selectedOppIds.length}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            oportunidade(s) selecionada(s)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                            Limpar seleção
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleBatchDelete()}
                            disabled={batchDeleting || batchSending}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                            {batchDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Excluir Selecionadas
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleBatchSendToCrm()}
                            disabled={batchSending || batchDeleting}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0412dd] px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                        >
                            {batchSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Enviar Selecionadas ao CRM
                        </button>
                    </div>
                </div>
            )}

            {hasFixtureItems && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200 shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <AlertOctagon size={18} className="text-amber-600 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Empresas fictícias de teste detectadas</p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">Identificamos empresas "Fixture" criadas indevidamente por testes anteriores.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => void handleCleanFixtures()}
                        disabled={batchDeleting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
                    >
                        {batchDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        Excluir Todas as Empresas Fixture
                    </button>
                </div>
            )}

            {batchFeedback && (
                <div className={`flex items-center justify-between rounded-xl border p-3.5 text-xs ${
                    batchFeedback.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'
                }`}>
                    <span>{batchFeedback.message}</span>
                    <button type="button" onClick={() => setBatchFeedback(null)} className="text-zinc-400 hover:text-zinc-700">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                <th className="py-3.5 pl-4 pr-1 w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded accent-[#0412dd] cursor-pointer"
                                        title="Selecionar todas desta página"
                                    />
                                </th>
                                <th className="py-3.5 px-3">Marca & Empresa</th>
                                <th className="py-3.5 px-4">Segmento</th>
                                <th className="py-3.5 px-4">Localização</th>
                                <th className="py-3.5 px-4 text-center">Proteção</th>
                                <th className="py-3.5 px-4 text-center">Viabilidade</th>
                                <th className="py-3.5 px-4 text-center">Potencial</th>
                                <th className="py-3.5 px-4">Origem</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-zinc-400">
                                        <Loader2 size={20} className="animate-spin text-[#0412dd] mx-auto mb-2" />
                                        Carregando oportunidades...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-zinc-400">
                                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Nenhuma oportunidade encontrada</p>
                                        <p className="text-xs mt-0.5">Cadastre uma nova oportunidade ou ajuste os filtros acima.</p>
                                    </td>
                                </tr>
                            ) : (
                                items.map((opp) => (
                                    <tr 
                                        key={opp.id} 
                                        onClick={() => openDetails(opp)}
                                        onMouseEnter={() => prefetchOpportunitySummary(opp.id, organizationId)}
                                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
                                    >
                                        {/* Checkbox de seleção */}
                                        <td className="py-3.5 pl-4 pr-1" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOppIds.includes(opp.id)}
                                                onChange={() => toggleSelectOpp(opp.id)}
                                                className="h-4 w-4 rounded accent-[#0412dd] cursor-pointer"
                                            />
                                        </td>

                                        {/* Marca & Empresa */}
                                        <td className="py-3.5 px-3">
                                            <div className="font-bold text-zinc-900 dark:text-white text-sm">
                                                {opp.brandName}
                                            </div>
                                            <div className="text-[11px] text-zinc-400 font-medium truncate max-w-[200px]">
                                                {opp.companyName || opp.tradeName || (opp.cnpj ? `CNPJ: ${opp.cnpj}` : 'Pessoa Física')}
                                            </div>
                                        </td>

                                        {/* Segmento */}
                                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                                            {opp.segment || '—'}
                                        </td>

                                        {/* Localização */}
                                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                                            {opp.city ? `${opp.city}/${opp.state || ''}` : '—'}
                                        </td>

                                        {/* Pontuações */}
                                        <td className="py-3.5 px-4 text-center">
                                            {formatScore(opp.protectionNeed)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {formatScore(opp.preliminaryViability)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            {formatScore(opp.commercialPotential)}
                                        </td>

                                        {/* Origem */}
                                        <td className="py-3.5 px-4 font-semibold uppercase text-[10px] text-zinc-500">
                                            {opp.sourceType}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(opp.status)}
                                        </td>

                                        {/* Ações */}
                                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                {opp.status === 'qualified' && (
                                                    <button
                                                        onClick={() => openSendToCrm(opp)}
                                                        className="px-2.5 py-1 rounded-lg bg-[#0412dd] text-white text-[11px] font-bold hover:bg-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                                                        title="Enviar ao CRM"
                                                    >
                                                        <Send size={12} /> CRM
                                                    </button>
                                                )}
                                                {opp.status === 'review' && (
                                                    <button
                                                        onClick={() => openDiscard(opp)}
                                                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                        title="Descartar"
                                                    >
                                                        <AlertOctagon size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openDetails(opp)}
                                                    onFocus={() => prefetchOpportunitySummary(opp.id, organizationId)}
                                                    className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => void handleDeleteOpportunity(opp)}
                                                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                    title="Excluir Permanentemente"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                        Página <strong className="text-zinc-900 dark:text-white">{page}</strong> de <strong className="text-zinc-900 dark:text-white">{totalPages}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modais */}
            <AsteryskoNewOpportunityModal
                isOpen={isNewModalOpen}
                organizationId={organizationId}
                onClose={() => setIsNewModalOpen(false)}
                onCreated={() => void loadData(true)}
            />

            <AsteryskoOpportunityDetailsModal
                key={selectedOppId || 'closed-opportunity'}
                isOpen={isDetailsOpen}
                opportunityId={selectedOppId}
                organizationId={organizationId}
                initialOpportunity={selectedOpportunity}
                onClose={() => setIsDetailsOpen(false)}
                onUpdate={() => void loadData(true)}
                onOpenSendToCrm={(opp) => { setIsDetailsOpen(false); openSendToCrm(opp); }}
                onOpenDiscard={(opp) => { setIsDetailsOpen(false); openDiscard(opp); }}
            />

            <AsteryskoDiscardModal
                isOpen={isDiscardOpen}
                opportunityId={actionTargetOpp?.id || null}
                organizationId={organizationId}
                brandName={actionTargetOpp?.brandName}
                onClose={() => setIsDiscardOpen(false)}
                onDiscarded={() => void loadData(true)}
            />

            <AsteryskoSendToCrmModal
                isOpen={isSendToCrmOpen}
                opportunity={actionTargetOpp}
                organizationId={organizationId}
                onClose={() => setIsSendToCrmOpen(false)}
                onSentToCrm={() => void loadData(true)}
            />

            <AsteryskoEngineModal
                isOpen={isEngineModalOpen}
                onClose={() => setIsEngineModalOpen(false)}
                organizationId={organizationId}
            />
        </div>
    );
};
