import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    CheckCircle2, XCircle, ShieldAlert, Copy,
    ChevronLeft, ChevronRight, Phone, Mail,
    Calendar, MapPin, DollarSign, Users, AlertTriangle,
    RefreshCw, Search, Send, Zap
} from 'lucide-react';
import api from '../../../../../services/api';

export interface ProspectingLeadItem {
    id: string;
    organizationId: string;
    companyId: string;
    status: string;
    score: number;
    scoreBreakdown: Array<{ regra: string; pontos: number; descricao: string }>;
    rejectionReason?: string;
    rejectionNotes?: string;
    alerts: string[];
    trademarkChecked: boolean;
    trademarkStatus: string;
    trademarkMatchCount: number;
    trademarkRiskLevel: string;
    isClusterPrimary: boolean;
    sentToCrmAt?: string;
    dealId?: string;
    company: {
        id: string;
        cnpj: string;
        razaoSocial: string;
        nomeFantasia?: string | null;
        matrizFilial: string;
        dataAbertura: string;
        situacaoCadastral: string;
        cnaePrincipal: string;
        cnaePrincipalDescricao?: string | null;
        naturezaJuridica: string;
        naturezaJuridicaDescricao?: string | null;
        capitalSocial: number;
        uf: string;
        municipioNome?: string | null;
        bairro?: string | null;
        logradouro?: string | null;
        numero?: string | null;
        cep?: string | null;
        telefone1?: string | null;
        telefone2?: string | null;
        email?: string | null;
        sociosPfCount: number;
        sociosPjCount: number;
        sociosJson?: any;
    };
}

interface Props {
    organizationId?: string;
    onLeadSentToCrm?: (dealId: string) => void;
}

const REJECTION_MOTIVOS = [
    { id: 'franquia', label: 'Franquia / Rede Conhecida' },
    { id: 'marca_terceiro', label: 'Utiliza Marca de Terceiro' },
    { id: 'lead_ruim', label: 'Lead Ruim / Sem Potencial Comercial' },
    { id: 'segmento_inadequado', label: 'Segmento Inadequado / Não Atendido' },
    { id: 'empresa_sem_estrutura', label: 'Empresa Sem Estrutura / Porte Muito Baixo' },
    { id: 'duplicado', label: 'Duplicidade de Unidade / Já Atendido' },
    { id: 'sem_contato', label: 'Sem Contato Válido (Telefone/Email Inacessíveis)' },
    { id: 'ja_possui_marca_registrada', label: 'Já Possui Marca Registrada no INPI' },
    { id: 'outro', label: 'Outro Motivo' },
];

export const AsteryskoProspectingReviewQueue: React.FC<Props> = ({ organizationId, onLeadSentToCrm }) => {
    const [leads, setLeads] = useState<ProspectingLeadItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
    const [datePreset, setDatePreset] = useState<'all' | '7d' | '15d' | '30d' | '60d' | '90d' | 'historical'>('30d');
    const [selectedSegment, setSelectedSegment] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [minScore, setMinScore] = useState<number | undefined>(undefined);
    const [cnaePresets, setCnaePresets] = useState<Array<{ segmento: string; nomeExibicao: string }>>([]);

    // Modal de Rejeição
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedRejectReason, setSelectedRejectReason] = useState('franquia');
    const [rejectNotes, setRejectNotes] = useState('');

    // Modal de Bloqueio de Marca
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [blockReason, setBlockReason] = useState('Franquia / Rede de Terceiros');

    const reqHeaders = useMemo(() => (
        organizationId ? { headers: { 'x-organization-id': organizationId } } : undefined
    ), [organizationId]);

    // Carrega presets de CNAE
    useEffect(() => {
        api.get('/asterysko/prospecting/cnae-presets', reqHeaders)
            .then(res => setCnaePresets(res.data || []))
            .catch(() => setCnaePresets([]));
    }, [reqHeaders]);

    // Carrega a fila de leads
    const loadQueue = useCallback(async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const res = await api.get('/asterysko/prospecting/queue', {
                ...reqHeaders,
                params: {
                    status: statusFilter,
                    datePreset: datePreset === 'all' ? undefined : datePreset,
                    segmento: selectedSegment === 'all' ? undefined : selectedSegment,
                    search: searchQuery.trim() || undefined,
                    minScore: minScore !== undefined ? minScore : undefined,
                    limit: 50,
                }
            });
            const items = res.data.items || [];
            setLeads(items);
            setCurrentIndex(0);
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao carregar fila.' });
        } finally {
            setLoading(false);
        }
    }, [organizationId, statusFilter, datePreset, selectedSegment, searchQuery, minScore, reqHeaders]);

    useEffect(() => {
        void loadQueue();
    }, [loadQueue]);

    const activeLead = leads[currentIndex] || null;

    // Ações de Validação
    const handleApprove = async () => {
        if (!activeLead) return;
        setActionLoading(true);
        try {
            await api.post(`/asterysko/prospecting/leads/${activeLead.id}/approve`, {}, reqHeaders);
            setFeedback({ type: 'success', message: `Lead "${activeLead.company.nomeFantasia || activeLead.company.razaoSocial}" APROVADO! [Ready for Outreach]` });
            setLeads(prev => prev.filter(l => l.id !== activeLead.id));
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao aprovar lead.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!activeLead) return;
        setActionLoading(true);
        try {
            await api.post(`/asterysko/prospecting/leads/${activeLead.id}/reject`, {
                reason: selectedRejectReason,
                notes: rejectNotes.trim() || undefined,
            }, reqHeaders);
            setFeedback({ type: 'success', message: `Lead descartado (${selectedRejectReason}).` });
            setIsRejectModalOpen(false);
            setRejectNotes('');
            setLeads(prev => prev.filter(l => l.id !== activeLead.id));
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao rejeitar lead.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlockBrand = async () => {
        if (!activeLead) return;
        setActionLoading(true);
        try {
            await api.post(`/asterysko/prospecting/leads/${activeLead.id}/block-brand`, {
                motivo: blockReason,
            }, reqHeaders);
            const brandName = activeLead.company.nomeFantasia || activeLead.company.razaoSocial;
            setFeedback({ type: 'success', message: `Marca "${brandName}" bloqueada na blacklist permanente!` });
            setIsBlockModalOpen(false);
            setLeads(prev => prev.filter(l => l.id !== activeLead.id));
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao bloquear marca.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkDuplicate = async () => {
        if (!activeLead) return;
        setActionLoading(true);
        try {
            await api.post(`/asterysko/prospecting/leads/${activeLead.id}/mark-duplicate`, {}, reqHeaders);
            setFeedback({ type: 'success', message: 'Lead marcado como duplicidade.' });
            setLeads(prev => prev.filter(l => l.id !== activeLead.id));
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao marcar duplicado.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendToCrm = async () => {
        if (!activeLead) return;
        setActionLoading(true);
        try {
            const res = await api.post(`/asterysko/prospecting/leads/${activeLead.id}/send-to-crm`, {}, reqHeaders);
            setFeedback({ type: 'success', message: `Lead despachado com sucesso para o CRM Asterysko!` });
            if (res.data.deal?.id) {
                onLeadSentToCrm?.(res.data.deal.id);
            }
            setLeads(prev => prev.filter(l => l.id !== activeLead.id));
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao despachar para o CRM.' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckTrademark = async () => {
        if (!activeLead) return;
        setActionLoading(true);
        try {
            const res = await api.post(`/asterysko/prospecting/leads/${activeLead.id}/check-trademark`, {}, reqHeaders);
            const updated = res.data.lead;
            setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
            setFeedback({ type: 'success', message: `Consulta INPI concluída: ${updated.trademarkStatus} (${updated.trademarkMatchCount} anterioridades)` });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.error || 'Erro ao consultar INPI.' });
        } finally {
            setActionLoading(false);
        }
    };

    // Atalhos de Teclado Globais (A, R, B, D)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignora se estiver digitando em input ou textarea ou com modal aberto
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
                return;
            }
            if (isRejectModalOpen || isBlockModalOpen || !activeLead || actionLoading) {
                return;
            }

            const key = e.key.toLowerCase();
            if (key === 'a') {
                e.preventDefault();
                void handleApprove();
            } else if (key === 'r') {
                e.preventDefault();
                setIsRejectModalOpen(true);
            } else if (key === 'b') {
                e.preventDefault();
                setIsBlockModalOpen(true);
            } else if (key === 'd') {
                e.preventDefault();
                void handleMarkDuplicate();
            } else if (key === 'arrowright') {
                e.preventDefault();
                if (currentIndex < leads.length - 1) setCurrentIndex(prev => prev + 1);
            } else if (key === 'arrowleft') {
                e.preventDefault();
                if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeLead, isRejectModalOpen, isBlockModalOpen, actionLoading, currentIndex, leads.length]);

    // Formatadores
    const formatCnpj = (cnpj: string) => {
        const c = cnpj.replace(/\D/g, '');
        if (c.length !== 14) return cnpj;
        return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    const formatDaysOpen = (dateStr: string) => {
        const d = new Date(dateStr);
        const diffDays = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
        if (diffDays === 0) return 'Aberta hoje';
        if (diffDays === 1) return 'Aberta ontem';
        return `Aberta há ${diffDays} dias`;
    };

    return (
        <div className="space-y-6">
            {/* Barra de Filtros & Presets */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0412dd]/10 text-[#0412dd] dark:bg-[#3b48ff]/20 dark:text-[#3b48ff]">
                                <Zap size={16} />
                            </span>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Fila de Decisão Rápida
                            </h3>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {leads.length} na fila
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            Qualificação determinística por regras e dados oficiais da Receita Federal. Sem IA.
                        </p>
                    </div>

                    {/* Presets de Data */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {[
                            { id: '7d', label: '7 dias' },
                            { id: '15d', label: '15 dias' },
                            { id: '30d', label: '30 dias' },
                            { id: '60d', label: '60 dias' },
                            { id: '90d', label: '90 dias' },
                            { id: 'historical', label: 'Base Antiga (>1 ano)' },
                            { id: 'all', label: 'Todas' },
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setDatePreset(p.id as any)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                    datePreset === p.id
                                        ? 'bg-[#0412dd] text-white dark:bg-[#3b48ff]'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filtros Secundários: Segmentos CNAE e Busca */}
                <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setSelectedSegment('all')}
                            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                                selectedSegment === 'all'
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                                    : 'border border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400'
                            }`}
                        >
                            Todos os Segmentos
                        </button>
                        {cnaePresets.slice(0, 7).map(preset => (
                            <button
                                key={preset.segmento}
                                onClick={() => setSelectedSegment(preset.segmento)}
                                className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                                    selectedSegment === preset.segmento
                                        ? 'bg-[#0412dd] text-white dark:bg-[#3b48ff]'
                                        : 'border border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400'
                                }`}
                            >
                                {preset.nomeExibicao.split(',')[0]}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 font-semibold focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        >
                            <option value="PENDING_REVIEW">Para Validar (Pendentes)</option>
                            <option value="APPROVED">Aprovadas</option>
                            <option value="READY_FOR_OUTREACH">Prontas para Comercial</option>
                            <option value="REJECTED">Rejeitadas</option>
                        </select>

                        <select
                            value={minScore ?? ''}
                            onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : undefined)}
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 font-semibold focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        >
                            <option value="">Score: Todos</option>
                            <option value="50">Score ≥ 50</option>
                            <option value="70">Score ≥ 70 (Alta Propensão)</option>
                            <option value="85">Score ≥ 85 (Excelente)</option>
                        </select>

                        <div className="relative min-w-[180px]">
                            <Search className="absolute left-3 top-2.5 text-zinc-400" size={14} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filtrar por nome, CNPJ..."
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#0412dd] focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={() => void loadQueue()}
                            className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Recarregar"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notificação / Feedback */}
            {feedback && (
                <div className={`flex items-center justify-between rounded-xl p-3.5 text-xs font-semibold ${
                    feedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'
                }`}>
                    <div className="flex items-center gap-2">
                        {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        <span>{feedback.message}</span>
                    </div>
                    <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Conteúdo Principal: Lead Ativo ou Estado Vazio */}
            {loading ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-950">
                    <RefreshCw size={32} className="animate-spin text-[#0412dd] dark:text-[#3b48ff]" />
                    <p className="mt-3 text-xs font-semibold text-zinc-500">Buscando empresas qualificadas...</p>
                </div>
            ) : leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 size={32} />
                    </div>
                    <h4 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                        Fila Vazia — Parabéns!
                    </h4>
                    <p className="mt-1 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
                        Todos os leads pré-qualificados foram analisados. Altere os filtros de data, presets de CNAE ou importe novos dados abertos da Receita Federal.
                    </p>
                    <button
                        onClick={() => { setDatePreset('all'); setSelectedSegment('all'); }}
                        className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                    >
                        Ver todos os períodos
                    </button>
                </div>
            ) : activeLead && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Card Esquerdo: Dados Completos da Empresa */}
                    <div className="lg:col-span-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-6">
                        {/* Topo do Card: Nome e Navegação */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                        {activeLead.company.nomeFantasia || activeLead.company.razaoSocial}
                                    </h2>
                                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                                        {activeLead.company.matrizFilial === '1' ? 'Matriz' : 'Filial'}
                                    </span>
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        {formatDaysOpen(activeLead.company.dataAbertura)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                    Razão Social: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeLead.company.razaoSocial}</span>
                                </p>
                            </div>

                            {/* Navegador de Posição na Fila */}
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-bold text-zinc-500">
                                    {currentIndex + 1} de {leads.length}
                                </span>
                                <button
                                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0}
                                    className="rounded-lg border border-zinc-200 p-1 text-zinc-600 disabled:opacity-30 dark:border-zinc-800 dark:text-zinc-400"
                                    title="Anterior (Seta Esquerda)"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentIndex(prev => Math.min(leads.length - 1, prev + 1))}
                                    disabled={currentIndex === leads.length - 1}
                                    className="rounded-lg border border-zinc-200 p-1 text-zinc-600 disabled:opacity-30 dark:border-zinc-800 dark:text-zinc-400"
                                    title="Próximo (Seta Direita)"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Grid de Informações Cadastrais */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/50 text-xs">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">CNPJ (Receita Federal)</span>
                                <p className="font-mono font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                                    {formatCnpj(activeLead.company.cnpj)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Localização</span>
                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                    <MapPin size={13} className="text-zinc-400" />
                                    {activeLead.company.municipioNome || 'Município'} - {activeLead.company.uf} {activeLead.company.bairro ? `(${activeLead.company.bairro})` : ''}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Data de Abertura</span>
                                <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                    <Calendar size={13} className="text-zinc-400" />
                                    {new Date(activeLead.company.dataAbertura).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Capital Social Declarado</span>
                                <p className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                    <DollarSign size={13} className="text-emerald-600" />
                                    R$ {Number(activeLead.company.capitalSocial || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Segmento & CNAE */}
                        <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">CNAE Principal & Atividade</span>
                            <div className="flex items-start gap-2">
                                <span className="rounded-md bg-zinc-200 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 shrink-0">
                                    {activeLead.company.cnaePrincipal}
                                </span>
                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    {activeLead.company.cnaePrincipalDescricao || 'Descrição da atividade empresarial'}
                                </p>
                            </div>
                        </div>

                        {/* Contato Comercial & Sócios (Decisores) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Telefones & E-mail */}
                            <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Contatos Disponíveis</span>
                                {activeLead.company.telefone1 ? (
                                    <a
                                        href={`https://wa.me/55${activeLead.company.telefone1.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:underline"
                                    >
                                        <Phone size={14} />
                                        <span>{activeLead.company.telefone1} (WhatsApp / Fone)</span>
                                    </a>
                                ) : (
                                    <p className="text-xs text-zinc-400 italic">Telefone não informado</p>
                                )}
                                {activeLead.company.email ? (
                                    <a
                                        href={`mailto:${activeLead.company.email}`}
                                        className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline truncate"
                                    >
                                        <Mail size={14} className="shrink-0" />
                                        <span className="truncate">{activeLead.company.email}</span>
                                    </a>
                                ) : (
                                    <p className="text-xs text-zinc-400 italic">E-mail não informado</p>
                                )}
                            </div>

                            {/* Sócios (QSA) */}
                            <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 space-y-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Quadro de Sócios (Decisores)</span>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                    <Users size={14} className="text-zinc-400 shrink-0" />
                                    <span>{activeLead.company.sociosPfCount} Sócio(s) Pessoa Física identificado(s)</span>
                                </div>
                                <p className="text-[11px] text-zinc-500">
                                    Tomada de decisão pelo proprietário/sócio administrador registrado na Receita Federal.
                                </p>
                            </div>
                        </div>

                        {/* Status de Anterioridade no INPI */}
                        <div className="rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800 flex items-center justify-between gap-4">
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Verificação de Anterioridade INPI</span>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                                        activeLead.trademarkChecked
                                            ? activeLead.trademarkStatus === 'NO_MATCH' ? 'bg-emerald-500' : 'bg-amber-500'
                                            : 'bg-zinc-400'
                                    }`} />
                                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                        {activeLead.trademarkChecked
                                            ? `${activeLead.trademarkStatus} (${activeLead.trademarkMatchCount} anterioridades)`
                                            : 'Não consultado na base de marcas'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckTrademark}
                                disabled={actionLoading}
                                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                <Search size={13} />
                                <span>Consultar INPI</span>
                            </button>
                        </div>
                    </div>

                    {/* Card Direito: Lead Score Auditável & Ações de Teclado */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Bloco do Lead Score */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lead Score</span>
                                <span className={`text-2xl font-black ${
                                    activeLead.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                    activeLead.score >= 60 ? 'text-[#0412dd] dark:text-[#3b48ff]' :
                                    'text-amber-600'
                                }`}>
                                    {activeLead.score}/100
                                </span>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden dark:bg-zinc-800">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        activeLead.score >= 80 ? 'bg-emerald-500' :
                                        activeLead.score >= 60 ? 'bg-[#0412dd] dark:bg-[#3b48ff]' :
                                        'bg-amber-500'
                                    }`}
                                    style={{ width: `${activeLead.score}%` }}
                                />
                            </div>

                            {/* Memória de Cálculo Auditável (Transparência Total) */}
                            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-[11px] font-bold text-zinc-500 uppercase">Motivos da Pontuação:</span>
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {activeLead.scoreBreakdown && activeLead.scoreBreakdown.map((item, idx) => (
                                        <div key={idx} className="flex items-start justify-between text-xs gap-2">
                                            <span className="text-zinc-600 dark:text-zinc-400 leading-tight">
                                                {item.descricao}
                                            </span>
                                            <span className={`font-mono font-bold shrink-0 ${item.pontos >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.pontos >= 0 ? `+${item.pontos}` : item.pontos}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Alertas */}
                            {activeLead.alerts && activeLead.alerts.length > 0 && (
                                <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40 space-y-1">
                                    <div className="flex items-center gap-1 font-bold">
                                        <AlertTriangle size={13} />
                                        <span>Alertas do Motor:</span>
                                    </div>
                                    {activeLead.alerts.map((alert, i) => (
                                        <p key={i}>• {alert}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botões Grandes de Ação & Atalhos de Teclado */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                                Ações Rápidas (Atalhos Ativos)
                            </span>

                            {/* Botão A: Aprovar */}
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-[0.99] disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    <span>APROVAR LEAD</span>
                                </div>
                                <kbd className="rounded bg-emerald-800/60 px-2 py-0.5 text-[10px] font-mono">Tecla A</kbd>
                            </button>

                            {/* Botão R: Rejeitar com Motivo */}
                            <button
                                onClick={() => setIsRejectModalOpen(true)}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-all active:scale-[0.99] disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <XCircle size={16} />
                                    <span>REJEITAR LEAD</span>
                                </div>
                                <kbd className="rounded bg-rose-800/60 px-2 py-0.5 text-[10px] font-mono">Tecla R</kbd>
                            </button>

                            {/* Botão B: Bloquear Marca */}
                            <button
                                onClick={() => setIsBlockModalOpen(true)}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between rounded-xl bg-amber-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-all active:scale-[0.99] disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <ShieldAlert size={16} />
                                    <span>BLOQUEAR MARCA (Blacklist)</span>
                                </div>
                                <kbd className="rounded bg-amber-800/60 px-2 py-0.5 text-[10px] font-mono">Tecla B</kbd>
                            </button>

                            {/* Botão D: Marcar Duplicado */}
                            <button
                                onClick={handleMarkDuplicate}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition-all active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Copy size={16} />
                                    <span>MARCAR DUPLICADO</span>
                                </div>
                                <kbd className="rounded bg-zinc-300 px-2 py-0.5 text-[10px] font-mono dark:bg-zinc-800">Tecla D</kbd>
                            </button>

                            {/* Botão Direto de Despacho ao CRM Deals */}
                            <button
                                onClick={handleSendToCrm}
                                disabled={actionLoading}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0412dd] px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#030fb8] transition-all dark:bg-[#3b48ff] dark:hover:bg-[#2c39e8] disabled:opacity-50 mt-2"
                            >
                                <Send size={14} />
                                <span>ENVIAR DIRETO AO CRM (Novo Lead)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Rejeição com Motivos Estruturados */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Motivo do Descarte / Rejeição
                            </h3>
                            <button onClick={() => setIsRejectModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                        </div>

                        <p className="text-xs text-zinc-500">
                            Selecione o motivo pelo qual este lead não deve ser prospectado. Isso alimenta as métricas analíticas e calibra o score.
                        </p>

                        <div className="space-y-2">
                            {REJECTION_MOTIVOS.map(m => (
                                <label
                                    key={m.id}
                                    className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-semibold cursor-pointer transition-all ${
                                        selectedRejectReason === m.id
                                            ? 'border-rose-500 bg-rose-50/50 text-rose-900 dark:bg-rose-950/20 dark:text-rose-200'
                                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="rejectReason"
                                        value={m.id}
                                        checked={selectedRejectReason === m.id}
                                        onChange={() => setSelectedRejectReason(m.id)}
                                        className="accent-rose-600"
                                    />
                                    <span>{m.label}</span>
                                </label>
                            ))}
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-zinc-500 uppercase">Observações adicionais (opcional):</label>
                            <textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Detalhes adicionais sobre o descarte..."
                                className="mt-1 w-full rounded-xl border border-zinc-200 p-2.5 text-xs text-zinc-900 placeholder-zinc-400 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                                Confirmar Rejeição
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Bloqueio de Marca (Blacklist) */}
            {isBlockModalOpen && activeLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Bloquear Marca na Blacklist
                            </h3>
                            <button onClick={() => setIsBlockModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                            A marca <span className="font-bold text-zinc-900 dark:text-white">"{activeLead.company.nomeFantasia || activeLead.company.razaoSocial}"</span> será adicionada à blacklist permanente e todos os leads futuros com este nome serão excluídos automaticamente.
                        </p>

                        <div>
                            <label className="text-[11px] font-bold text-zinc-500 uppercase">Motivo do Bloqueio:</label>
                            <input
                                type="text"
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-zinc-200 p-2.5 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsBlockModalOpen(false)}
                                className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBlockBrand}
                                disabled={actionLoading}
                                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                                Confirmar Bloqueio
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
