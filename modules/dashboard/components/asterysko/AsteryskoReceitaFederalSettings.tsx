import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowUpRight,
    Building2,
    CalendarClock,
    CheckCircle2,
    Clock3,
    Database,
    Download,
    Eye,
    Filter,
    HelpCircle,
    Info,
    Layers,
    ListFilter,
    Loader2,
    Play,
    Plus,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Upload,
    Users,
    X,
    Zap,
} from 'lucide-react';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';

interface RfStats {
    pending: number;
    enriched: number;
    skipped: number;
    total: number;
    lastImportAt?: string | null;
    source?: {
        id: string;
        enabled: boolean;
        status: string;
        schedule?: string | null;
        batchSize?: number | null;
        maxItemsPerRun?: number | null;
        lastRunAt?: string | null;
        nextRunAt?: string | null;
    } | null;
}

interface ProspectingDashboardStats {
    totalEmpresasImportadas: number;
    novasEmpresasHoje: number;
    novasEmpresas7d: number;
    totalLeads: number;
    leadsPendentes: number;
    leadsAprovadosHoje: number;
    leadsRejeitadosHoje: number;
    leadsProntosOutreach: number;
    leadsEmContato: number;
}

function formatDateTime(value?: string | Date | null): string {
    if (!value) return 'Nunca';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    const maybeAxios = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
    };
    return maybeAxios?.response?.data?.error
        || maybeAxios?.response?.data?.message
        || maybeAxios?.message
        || fallback;
}

export const AsteryskoReceitaFederalSettings: React.FC<{ organizationId?: string }> = ({
    organizationId,
}) => {
    const { addToast } = useToast();

    // Estados de dados
    const [rfStats, setRfStats] = useState<RfStats | null>(null);
    const [prospectingStats, setProspectingStats] = useState<ProspectingDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados de ações
    const [syncingRf, setSyncingRf] = useState(false);
    const [runningRfBatch, setRunningRfBatch] = useState(false);
    const [rfBatchSize, setRfBatchSize] = useState<number>(20);
    const [rfSchedule, setRfSchedule] = useState('0 */2 * * *');
    const [savingRfSource, setSavingRfSource] = useState(false);

    // Modal / painel de importação manual de CNPJs
    const [showImportModal, setShowImportModal] = useState(false);
    const [customCnpjsInput, setCustomCnpjsInput] = useState('');
    const [recentSyncLog, setRecentSyncLog] = useState<{
        timestamp: Date;
        companies: number;
        leads: number;
        durationMs: number;
        type: 'sync' | 'manual' | 'batch';
    } | null>(null);

    const reqHeaders = useMemo(() => {
        return organizationId ? { headers: { 'x-organization-id': organizationId } } : {};
    }, [organizationId]);

    // Carrega estatísticas
    const loadStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [rfRes, dashRes] = await Promise.all([
                api.get('/asterysko/scout-rf/stats', reqHeaders).catch(() => null),
                api.get('/asterysko/prospecting/stats', reqHeaders).catch(() => null),
            ]);

            if (rfRes?.data) {
                setRfStats(rfRes.data);
                if (rfRes.data.source) {
                    if (rfRes.data.source.batchSize) setRfBatchSize(rfRes.data.source.batchSize);
                    if (rfRes.data.source.schedule) setRfSchedule(rfRes.data.source.schedule);
                }
            }

            if (dashRes?.data) {
                setProspectingStats(dashRes.data);
            }
        } catch (err) {
            setError(getApiErrorMessage(err, 'Não foi possível carregar as métricas da Receita Federal.'));
        } finally {
            setLoading(false);
        }
    }, [reqHeaders]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    // Dispara Sincronização da Base da Receita Federal
    const handleSyncRf = async (customCnpjs?: string) => {
        setSyncingRf(true);
        const startTime = Date.now();
        try {
            const payload: any = {
                useFeedSeed: true,
                targetUfs: ['CE'],
            };
            if (customCnpjs && customCnpjs.trim()) {
                payload.cnpjs = customCnpjs.trim();
            }

            // Chama endpoint determinístico de prospecção
            const res = await api.post('/asterysko/prospecting/sync-rf', payload, reqHeaders);
            const duration = Date.now() - startTime;

            if (res.data?.status === 'success') {
                const inserted = res.data.companiesInserted ?? res.data.linesInserted ?? 0;
                const leads = res.data.leadsGenerated ?? 0;

                setRecentSyncLog({
                    timestamp: new Date(),
                    companies: inserted,
                    leads,
                    durationMs: duration,
                    type: customCnpjs ? 'manual' : 'sync',
                });

                addToast({
                    type: 'success',
                    title: 'Receita Federal Sincronizada',
                    message: `${inserted} empresas processadas e ${leads} leads gerados no Inbox!`,
                });

                if (customCnpjs) {
                    setShowImportModal(false);
                    setCustomCnpjsInput('');
                }

                await loadStats();
            } else {
                addToast({
                    type: 'warning',
                    title: 'Sincronização RF',
                    message: res.data?.message || 'A sincronização foi executada.',
                });
            }
        } catch (requestError: unknown) {
            const message = getApiErrorMessage(requestError, 'Falha ao sincronizar dados da Receita Federal.');
            addToast({ type: 'error', title: 'Erro na Sincronização', message });
        } finally {
            setSyncingRf(false);
        }
    };

    // Processa Lote RF
    const handleRunRfBatch = async (batchSize = rfBatchSize) => {
        setRunningRfBatch(true);
        try {
            const res = await api.post('/asterysko/scout-rf/run-batch', { batchSize }, reqHeaders);
            addToast({
                type: 'success',
                title: 'Lote RF Iniciado',
                message: res.data?.message || `Processamento do lote de ${batchSize} CNPJs iniciado com sucesso.`,
            });
            await loadStats();
        } catch (requestError: unknown) {
            const message = getApiErrorMessage(requestError, 'Falha ao iniciar processamento do lote.');
            addToast({ type: 'error', title: 'Erro no Processamento', message });
        } finally {
            setRunningRfBatch(false);
        }
    };

    // Toggle Piloto Automático 24/7
    const handleToggleRfAuto = async (enabled: boolean) => {
        setSavingRfSource(true);
        try {
            const res = await api.post(
                '/asterysko/scout-rf/ensure-source',
                { enabled, schedule: rfSchedule, batchSize: rfBatchSize },
                reqHeaders
            );
            if (res.data?.source) {
                setRfStats(prev => prev ? { ...prev, source: res.data.source } : null);
            }
            addToast({
                type: 'success',
                title: 'Piloto Automático RF',
                message: enabled
                    ? 'Piloto automático de CNPJs ativado (24/7 em background).'
                    : 'Piloto automático pausado (modo manual ativado).',
            });
        } catch (requestError: unknown) {
            const message = getApiErrorMessage(requestError, 'Falha ao configurar piloto automático.');
            addToast({ type: 'error', title: 'Erro de Configuração', message });
        } finally {
            setSavingRfSource(false);
        }
    };

    // Altera Agendamento do Piloto Automático
    const handleScheduleChange = async (schedule: string) => {
        setRfSchedule(schedule);
        if (!rfStats?.source?.enabled) return;
        setSavingRfSource(true);
        try {
            await api.post(
                '/asterysko/scout-rf/ensure-source',
                { enabled: true, schedule, batchSize: rfBatchSize },
                reqHeaders
            );
            addToast({
                type: 'success',
                title: 'Ciclo Atualizado',
                message: 'Frequência do piloto automático atualizada com sucesso.',
            });
            await loadStats();
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Erro',
                message: getApiErrorMessage(err, 'Falha ao atualizar frequência.'),
            });
        } finally {
            setSavingRfSource(false);
        }
    };

    // Altera Tamanho do Lote
    const handleBatchSizeChange = async (size: number) => {
        setRfBatchSize(size);
        if (!rfStats?.source?.enabled) return;
        try {
            await api.post(
                '/asterysko/scout-rf/ensure-source',
                { enabled: true, schedule: rfSchedule, batchSize: size },
                reqHeaders
            );
        } catch {
            // falha silenciosa em background
        }
    };

    // Contadores combinados
    const totalCompanies = Math.max(
        prospectingStats?.totalEmpresasImportadas ?? 0,
        rfStats?.total ?? 0
    );
    const pendingLeads = prospectingStats?.leadsPendentes ?? rfStats?.pending ?? 0;
    const readyLeads = prospectingStats?.leadsProntosOutreach ?? 0;
    const enrichedCompanies = rfStats?.enriched ?? 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold">Aviso do sistema</p>
                        <p className="mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Banner Principal — Receita Federal Determinística */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 via-white to-white p-6 shadow-sm dark:border-blue-900/40 dark:from-blue-950/20 dark:via-zinc-900 dark:to-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-100 pb-5 dark:border-blue-900/30">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0412dd] text-white shadow-sm">
                                <Building2 size={18} />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                Captação por CNPJ — Receita Federal & BrasilAPI
                            </h3>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                100% Determinístico & Gratuito
                            </span>
                            {rfStats?.source?.enabled && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                                    <Zap size={10} className="text-blue-600 fill-blue-600" />
                                    Piloto Automático 24/7 Ativo
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                            Pipeline determinístico estruturado para o Ceará. Ingere novos CNPJs da Receita Federal com CNAEs estratégicos, cruza com regras de exclusão cadastral, descarta holdings e condomínios, e gera leads qualificados diretamente na fila de revisão do CRM.
                        </p>
                    </div>

                    {/* Botões de Ação Principais */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Seletor de tamanho de lote */}
                        <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
                            <span className="px-2 text-[11px] font-semibold text-zinc-400">Lote:</span>
                            {[20, 50, 100].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => void handleBatchSizeChange(size)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                                        rfBatchSize === size
                                            ? 'bg-[#0412dd] text-white shadow-xs'
                                            : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>

                        {/* Botão Sincronizar Base RF */}
                        <button
                            type="button"
                            onClick={() => void handleSyncRf()}
                            disabled={syncingRf || runningRfBatch}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0412dd] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer transition-colors shadow-xs"
                            title="Sincronizar base da Receita Federal e abastecer a fila de revisão do CRM"
                        >
                            {syncingRf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            {syncingRf ? 'Puxando dados da RF...' : 'Puxar Dados da RF'}
                        </button>

                        {/* Botão Importar CNPJs */}
                        <button
                            type="button"
                            onClick={() => setShowImportModal(prev => !prev)}
                            disabled={syncingRf || runningRfBatch}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer transition-colors shadow-xs"
                            title="Colar ou importar lista personalizada de CNPJs"
                        >
                            <Upload size={14} />
                            Importar CNPJs
                        </button>

                        {/* Botão Atualizar Métricas */}
                        <button
                            type="button"
                            onClick={() => void loadStats()}
                            disabled={loading}
                            className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer shadow-xs"
                            title="Atualizar métricas"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Painel expansível de importação manual de CNPJs */}
                {showImportModal && (
                    <div className="mt-5 rounded-xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/60 dark:bg-zinc-900/90 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                <Plus size={15} className="text-[#0412dd]" />
                                Inserir ou Colar Lista de CNPJs para Captura
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowImportModal(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 mb-3">
                            Cole um ou mais CNPJs (formatados ou apenas números, separados por linha ou vírgula). O sistema buscará os dados oficiais cadastrais e qualificará o lead automaticamente para a fila de prospecção.
                        </p>
                        <textarea
                            rows={3}
                            value={customCnpjsInput}
                            onChange={(e) => setCustomCnpjsInput(e.target.value)}
                            placeholder="Exemplo:&#10;64.809.299/0001-02&#10;62.523.908/0001-37, 59.590.221/0001-00"
                            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-900 focus:border-[#0412dd] focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400">
                                {customCnpjsInput.trim()
                                    ? `${(customCnpjsInput.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}|\d{14}/g) || []).length} CNPJs detectados`
                                    : 'Nenhum CNPJ digitado'}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImportModal(false)}
                                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleSyncRf(customCnpjsInput)}
                                    disabled={syncingRf || !customCnpjsInput.trim()}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0412dd] px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                    {syncingRf ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                    {syncingRf ? 'Importando...' : 'Confirmar Importação'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Métricas e Resumo da Base RF */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Importados</span>
                            <Building2 size={14} className="text-blue-500" />
                        </div>
                        <span className="mt-1.5 block text-xl font-black text-zinc-900 dark:text-white">
                            {totalCompanies}
                        </span>
                        <span className="text-[10px] text-zinc-400">CNPJs da Receita Federal</span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Fila de Revisão</span>
                            <ListFilter size={14} className="text-amber-500" />
                        </div>
                        <span className="mt-1.5 block text-xl font-black text-amber-600 dark:text-amber-400">
                            {pendingLeads}
                        </span>
                        <span className="text-[10px] text-zinc-400">aguardando validação no Inbox</span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Prontos para Outreach</span>
                            <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                        <span className="mt-1.5 block text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {readyLeads > 0 ? readyLeads : enrichedCompanies}
                        </span>
                        <span className="text-[10px] text-zinc-400">leads aprovados para contato</span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Última Sincronização</span>
                            <Clock3 size={14} className="text-zinc-400" />
                        </div>
                        <span className="mt-1.5 block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {formatDateTime(rfStats?.lastImportAt)}
                        </span>
                        <span className="text-[10px] text-zinc-400">base oficial Receita Federal</span>
                    </div>
                </div>

                {/* Feedback da última sincronização realizada na sessão */}
                {recentSyncLog && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                            <span>
                                <strong>Última execução:</strong> {recentSyncLog.companies} empresas inseridas e {recentSyncLog.leads} novos leads gerados ({recentSyncLog.durationMs}ms).
                            </span>
                        </div>
                        <span className="text-[10px] opacity-75">{formatDateTime(recentSyncLog.timestamp)}</span>
                    </div>
                )}

                {/* Piloto Automático 24/7 & Configuração Contínua */}
                <div className="mt-5 rounded-xl border border-blue-100 bg-white/90 p-4 dark:border-blue-900/30 dark:bg-zinc-900/80 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                                rfStats?.source?.enabled
                                    ? 'bg-blue-100 text-[#0412dd] dark:bg-blue-950/60 dark:text-blue-400'
                                    : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                            }`}>
                                <Zap size={22} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                                        Piloto Automático em Segundo Plano (24/7)
                                    </h4>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                        rfStats?.source?.enabled
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${rfStats?.source?.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
                                        {rfStats?.source?.enabled ? 'Ativo (Autônomo)' : 'Inativo (Modo Manual)'}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-zinc-500">
                                    Executa periodicamente sem precisar de intervenção manual: processa lotes de {rfBatchSize} CNPJs e reabastece o Inbox automaticamente.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Seletor de Frequência */}
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-[11px] font-semibold text-zinc-400">Frequência:</span>
                                <select
                                    value={rfSchedule}
                                    onChange={(e) => void handleScheduleChange(e.target.value)}
                                    disabled={savingRfSource}
                                    className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-xs focus:border-[#0412dd] focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 cursor-pointer"
                                >
                                    <option value="0 * * * *">A cada 1 hora</option>
                                    <option value="0 */2 * * *">A cada 2 horas (Recomendado)</option>
                                    <option value="0 */4 * * *">A cada 4 horas</option>
                                    <option value="0 */6 * * *">A cada 6 horas</option>
                                    <option value="0 8,14,20 * * *">3x ao dia (08h, 14h, 20h)</option>
                                </select>
                            </div>

                            {/* Botão de Toggle */}
                            <button
                                type="button"
                                onClick={() => void handleToggleRfAuto(!rfStats?.source?.enabled)}
                                disabled={savingRfSource}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                    rfStats?.source?.enabled
                                        ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
                                        : 'bg-[#0412dd] text-white hover:bg-blue-800'
                                }`}
                            >
                                {savingRfSource ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                                {rfStats?.source?.enabled ? 'Pausar Piloto' : 'Ativar Piloto Automático'}
                            </button>
                        </div>
                    </div>

                    {/* Status da Próxima Execução */}
                    {rfStats?.source?.enabled && (
                        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-blue-100/60 pt-2.5 text-[11px] text-zinc-500 dark:border-blue-900/20">
                            <span>
                                <strong>Próxima execução:</strong> {formatDateTime(rfStats?.source?.nextRunAt)}
                            </span>
                            <span>
                                <strong>Última execução:</strong> {formatDateTime(rfStats?.source?.lastRunAt)}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ Auto-refill ativado: reabastece novos CNPJs automaticamente
                            </span>
                        </div>
                    )}
                </div>

                {/* Badges de CNAEs monitorados expandidos */}
                <div className="mt-5 pt-4 border-t border-blue-100/80 dark:border-blue-900/30">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                        Setores & CNAEs Estratégicos Monitorados (Ceará):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            'Marketing & Publicidade (7311-4/00)',
                            'Tecnologia & Software (6201-5/01)',
                            'Design & Audiovisual (7410-2/02)',
                            'Varejo, Moda & Vestuário (4781-4/00)',
                            'Gastronomia & Restaurantes (5611-2/01)',
                            'Clínicas Médicas & Odontologia (8630-5/03)',
                            'Estética & Salões (9602-5/01)',
                            'Cursos & Treinamentos (8599-6/04)',
                            'Arquitetura & Engenharia (7111-1/00)',
                            'Consultorias & Serviços (7020-4/00)',
                        ].map((badge) => (
                            <span
                                key={badge}
                                className="inline-flex items-center rounded-lg bg-blue-100/70 px-2.5 py-1 text-[10px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Regras Determinísticas de Qualificação (Sem IA) */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
                    <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                            Critérios de Qualificação & Regras Determinísticas
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Sem custo de tokens ou IA. Filtros executados via joins analíticos e regras rígidas de validação.
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            1. Filtro Cadastral RFB
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                            Aceita apenas empresas ativas (situação cadastral &apos;02&apos;). Empresas inativas ou suspensas são excluídas imediatamente.
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                            <ShieldAlert size={14} className="text-amber-500" />
                            2. Exclusão Estrutural
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                            Descarta automaticamente órgãos públicos, condomínios, cartórios, associações sem fins lucrativos e holdings puras.
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                            <Filter size={14} className="text-blue-500" />
                            3. Filtro de Franquias
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                            Cruza a razão social e nome fantasia com a Blacklist de marcas de terceiros, impedindo empresas que já usam marcas registradas.
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
                            <TrendingUp size={14} className="text-indigo-500" />
                            4. Lead Scoring (0 a 100)
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                            Calcula pontuação com base em recência de abertura (até 90 dias / até 365 dias), matriz comercial, sócio PF e canais de contato.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export para compatibilidade retroativa com locais que importavam AsteryskoScoutAutomationSettings
export const AsteryskoScoutAutomationSettings = AsteryskoReceitaFederalSettings;
