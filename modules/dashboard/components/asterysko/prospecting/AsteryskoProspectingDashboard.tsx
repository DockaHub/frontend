import React, { useState, useEffect } from 'react';
import {
    Building2, TrendingUp, CheckCircle2, XCircle,
    Clock, Send, RefreshCw,
    ShieldCheck, ArrowRight, MapPin, Award, AlertTriangle
} from 'lucide-react';
import api from '../../../../../services/api';

interface DashboardStats {
    metricas: {
        totalEmpresasImportadas: number;
        novasEmpresasHoje: number;
        novasEmpresas7d: number;
        totalLeads: number;
        leadsPendentes: number;
        leadsAprovadosHoje: number;
        leadsRejeitadosHoje: number;
        leadsProntosOutreach: number;
        leadsEmContato: number;
        taxaAprovacaoHoje: number;
        taxaRejeicaoHoje: number;
    };
    principaisMotivosRejeicao: Array<{ motivo: string; total: number }>;
    distribuicaoScore: Array<{ faixa: string; count: number }>;
    distribuicaoUf: Array<{ uf: string; count: number }>;
}

interface Props {
    organizationId?: string;
    onNavigateToQueue?: () => void;
}

export const AsteryskoProspectingDashboard: React.FC<Props> = ({
    organizationId,
    onNavigateToQueue,
}) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadStats = async (manual = false) => {
        try {
            if (manual) setIsRefreshing(true);
            else setLoading(true);

            const res = await api.get('/asterysko/prospecting/stats', {
                headers: organizationId ? { 'x-organization-id': organizationId } : undefined,
            });

            if (res.data?.success) {
                setStats(res.data.stats);
            }
        } catch (err) {
            console.error('Falha ao carregar métricas de prospecção:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [organizationId]);

    const formatNumber = (num?: number) => {
        return (num || 0).toLocaleString('pt-BR');
    };

    const getReasonLabel = (reason: string) => {
        const labels: Record<string, string> = {
            franquia: 'Franquia ou Rede Conhecida',
            marca_terceiro: 'Marca de Terceiro / Revenda',
            lead_ruim: 'Lead sem Perfil Comercial',
            segmento_inadequado: 'Segmento Inadequado / Fora de Foco',
            sem_estrutura: 'Empresa sem Estrutura / Porte Muito Baixo',
            duplicado: 'Unidade ou CNPJ Duplicado',
            sem_contato: 'Sem Dados de Contato Válidos',
            ja_possui_marca: 'Já Possui Marca Registrada no INPI',
            marca_bloqueada: 'Marca Adicionada à Blacklist',
            outro: 'Outro Motivo',
        };
        return labels[reason] || reason;
    };

    const totalRejeicoes = stats?.principaisMotivosRejeicao?.reduce((acc, curr) => acc + curr.total, 0) || 1;
    const maxUfCount = Math.max(...(stats?.distribuicaoUf?.map(u => u.count) || [1]), 1);

    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck size={12} /> Motor Determinístico Ativo
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">• Sem IA / 100% Regras Auditáveis</span>
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                        Painel de Prospecção Asterysko
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Inteligência de dados oficiais da Receita Federal e pipeline de qualificação de marcas.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => void loadStats(true)}
                        disabled={loading || isRefreshing}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        title="Recarregar dados"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Atualizar</span>
                    </button>

                    {onNavigateToQueue && (
                        <button
                            onClick={onNavigateToQueue}
                            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0412dd] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-800 dark:bg-[#3b48ff]"
                        >
                            <span>Fila de Aprovação</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                                {stats?.metricas.leadsPendentes || 0}
                            </span>
                            <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* High-level KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Base Importada</span>
                        <Building2 size={16} />
                    </div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">
                        {formatNumber(stats?.metricas.totalEmpresasImportadas)}
                    </p>
                    <span className="text-[10px] text-zinc-400">Empresas e filiais</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between text-blue-500 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Novas (7 dias)</span>
                        <TrendingUp size={16} />
                    </div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">
                        +{formatNumber(stats?.metricas.novasEmpresas7d)}
                    </p>
                    <span className="text-[10px] text-zinc-400">{formatNumber(stats?.metricas.novasEmpresasHoje)} abertas hoje</span>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Fila Pendente</span>
                        <Clock size={16} />
                    </div>
                    <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
                        {formatNumber(stats?.metricas.leadsPendentes)}
                    </p>
                    <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80">Aguardando decisão</span>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Aprovados Hoje</span>
                        <CheckCircle2 size={16} />
                    </div>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                        {formatNumber(stats?.metricas.leadsAprovadosHoje)}
                    </p>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                        {stats?.metricas.taxaAprovacaoHoje || 0}% de aprovação
                    </span>
                </div>

                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20">
                    <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Rejeitados Hoje</span>
                        <XCircle size={16} />
                    </div>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300">
                        {formatNumber(stats?.metricas.leadsRejeitadosHoje)}
                    </p>
                    <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80">
                        {stats?.metricas.taxaRejeicaoHoje || 0}% de rejeição
                    </span>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                    <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Prontos Comercial</span>
                        <Send size={16} />
                    </div>
                    <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                        {formatNumber(stats?.metricas.leadsProntosOutreach)}
                    </p>
                    <span className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">
                        {formatNumber(stats?.metricas.leadsEmContato)} já em contato
                    </span>
                </div>
            </div>

            {/* Middle Section: Rejections Analysis & Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rejection Reasons Breakdown */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle size={18} className="text-rose-500" />
                                Motivos de Descarte e Rejeição
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Heurísticas automáticas e decisões manuais para calibrar regras
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {(!stats?.principaisMotivosRejeicao || stats.principaisMotivosRejeicao.length === 0) ? (
                            <p className="text-xs text-zinc-400 py-6 text-center italic">Nenhuma rejeição registrada ainda.</p>
                        ) : (
                            stats.principaisMotivosRejeicao.map((item) => {
                                const percentage = Math.round((item.total / totalRejeicoes) * 100);
                                return (
                                    <div key={item.motivo} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                {getReasonLabel(item.motivo)}
                                            </span>
                                            <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                                                {item.total} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-rose-500 dark:bg-rose-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, percentage)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Score Distribution Breakdown */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Award size={18} className="text-amber-500" />
                                Distribuição de Lead Score
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Concentração da qualidade das empresas na base ativa
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {(stats?.distribuicaoScore || []).map((scoreItem) => {
                            const isHigh = scoreItem.faixa === '85-100' || scoreItem.faixa === '70-84';
                            return (
                                <div
                                    key={scoreItem.faixa}
                                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                                        isHigh
                                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                                    }`}
                                >
                                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                                        Faixa {scoreItem.faixa}
                                    </span>
                                    <p className={`text-2xl font-black mt-2 ${
                                        isHigh ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-800 dark:text-zinc-200'
                                    }`}>
                                        {formatNumber(scoreItem.count)}
                                    </p>
                                    <span className="text-[10px] text-zinc-400 mt-1">
                                        {isHigh ? 'Alta Propensão Marca' : 'Necessita Validação'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                        <span className="font-bold">Regra de Ouro da Asterysko:</span> Leads com pontuação ≥ 70 possuem nome fantasia próprio, CNAE de alto valor comercial, telefone/e-mail verificados e abertura recente.
                    </div>
                </div>
            </div>

            {/* Bottom Section: Geographic Concentration (Top UFs) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <MapPin size={18} className="text-[#0412dd] dark:text-[#3b48ff]" />
                            Distribuição Geográfica (Top Estados)
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Concentração territorial dos leads qualificados para prospecção
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                    {(!stats?.distribuicaoUf || stats.distribuicaoUf.length === 0) ? (
                        <p className="text-xs text-zinc-400 col-span-full py-4 text-center">Nenhum dado geográfico disponível.</p>
                    ) : (
                        stats.distribuicaoUf.map((item) => {
                            const barHeightPercent = Math.max(15, Math.round((item.count / maxUfCount) * 100));
                            return (
                                <div
                                    key={item.uf}
                                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col items-center justify-between text-center min-h-[90px]"
                                >
                                    <span className="text-xs font-black text-zinc-900 dark:text-white tracking-wider">
                                        {item.uf}
                                    </span>
                                    <div className="w-8 bg-zinc-200 dark:bg-zinc-800 rounded-t-sm h-12 flex items-end overflow-hidden my-1">
                                        <div
                                            className="w-full bg-[#0412dd] dark:bg-[#3b48ff] rounded-t-sm transition-all duration-500"
                                            style={{ height: `${barHeightPercent}%` }}
                                        />
                                    </div>
                                    <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                                        {item.count}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
