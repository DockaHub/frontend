import React, { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, Database, RefreshCw } from 'lucide-react';
import api from '../../../../services/api';
import { getApiErrorMessage } from './opportunities/asteryskoApiTypes';
import { formatStatusLabel } from './utils/statusPresentation';

export interface FreshnessInfo {
    snapshotId?: string;
    version: string;
    referenceDate?: string;
    importedAt?: string;
    recordCount: number;
    daysStale: number;
    level: 'current' | 'attention' | 'stale' | 'critical' | 'unknown';
    isLowRiskAllowed: boolean;
    isAutoProcessingAllowed: boolean;
    confidencePenalty: number;
    isWarningActive: boolean;
    warningNotice: string;
}

export interface SnapshotItem {
    id: string;
    version: string;
    source: string;
    referenceDate: string;
    importedAt: string;
    recordCount: number;
    status: string;
}

const freshnessLevelLabel: Record<FreshnessInfo['level'], string> = {
    current: 'Atualizada',
    attention: 'Requer atenção',
    stale: 'Desatualizada',
    critical: 'Crítica',
    unknown: 'Não verificada',
};

export const AsteryskoTrademarkGovernanceArea: React.FC = () => {
    const [freshness, setFreshness] = useState<FreshnessInfo | null>(null);
    const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [freshRes, snapRes] = await Promise.all([
                api.get('/asterysko/trademark-governance/freshness'),
                api.get('/asterysko/trademark-governance/snapshots')
            ]);
            setFreshness(freshRes.data);
            setSnapshots(snapRes.data);
        } catch (err) {
            console.error('Error loading governance data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRollback = async (snapshotId: string) => {
        if (!confirm('Deseja restaurar esta versão anterior da base de marcas?')) return;
        try {
            await api.post(`/asterysko/trademark-governance/snapshots/${snapshotId}/rollback`, { reason: 'Rollback manual via painel' });
            setActionMsg('Versão anterior restaurada com sucesso!');
            fetchData();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Não foi possível restaurar a versão anterior.'));
        }
    };

    const handleActivate = async (snapshotId: string) => {
        try {
            await api.post(`/asterysko/trademark-governance/snapshots/${snapshotId}/activate`);
            setActionMsg('Versão ativada com sucesso!');
            fetchData();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Falha na ativação.'));
        }
    };

    return (
        <div className="flex w-full flex-col gap-5 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:gap-6 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#e5e5e5] pb-4 dark:border-zinc-800">
                <div className="flex min-w-0 items-start gap-3">
                    <Database className="mt-0.5 shrink-0 text-[#0412dd] dark:text-[#3b48ff]" size={22} />
                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-black dark:text-white sm:text-lg">Controle da base de marcas</h3>
                        <p className="mt-1 text-xs leading-5 text-[#666] dark:text-[#aaa]">Acompanhe a atualização da base do Radar e restaure versões anteriores quando necessário.</p>
                    </div>
                </div>
                <button 
                    onClick={fetchData} 
                    className="shrink-0 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    aria-label="Atualizar informações da base"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {actionMsg && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800">
                    {actionMsg}
                </div>
            )}

            {/* Warning Banner if Stale/Critical */}
            {freshness?.isWarningActive && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl flex items-start gap-3 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
                    <div className="text-xs leading-relaxed">
                        <span className="font-bold block mb-1">Aviso de Segurança — Base Marcária Desatualizada</span>
                        {freshness.warningNotice}
                    </div>
                </div>
            )}

            {/* Active Snapshot Cards */}
            {freshness && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-[#888] uppercase">Versão ativa</span>
                        <span className="text-base font-bold text-black dark:text-white">{freshness.version}</span>
                        <span className="text-xs text-[#666] dark:text-[#aaa]">{freshness.recordCount.toLocaleString('pt-BR')} registros</span>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-[#888] uppercase">Data de Referência</span>
                        <span className="text-base font-bold text-black dark:text-white">
                            {freshness.referenceDate ? new Date(freshness.referenceDate).toLocaleDateString('pt-BR') : 'Sem data'}
                        </span>
                        <span className="text-xs text-[#666] dark:text-[#aaa]">Defasagem: {freshness.daysStale} dias</span>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-[#888] uppercase">Atualização da base</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                freshness.level === 'current' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                freshness.level === 'attention' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                                freshness.level === 'stale' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            }`}>
                                {freshnessLevelLabel[freshness.level]}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-[#888] uppercase">Resultado de baixo risco</span>
                        <span className={`text-sm font-bold mt-1 ${freshness.isLowRiskAllowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {freshness.isLowRiskAllowed ? 'Disponível' : 'Indisponível'}
                        </span>
                        <span className="text-xs text-[#666] dark:text-[#aaa]">Redução de confiança: {freshness.confidencePenalty}%</span>
                    </div>
                </div>
            )}

            {/* Snapshots Table */}
            <div className="mt-2 flex flex-col gap-3">
                <h4 className="text-sm font-bold text-black dark:text-white">Versões da base</h4>
                <div className="space-y-3 md:hidden">
                    {snapshots.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#e5e5e5] p-5 text-center text-xs text-zinc-500 dark:border-zinc-800">Nenhuma versão encontrada.</div>
                    ) : snapshots.map((snap) => (
                        <article key={snap.id} className="rounded-xl border border-[#e5e5e5] p-4 dark:border-zinc-800">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-black dark:text-white">{snap.version}</p>
                                    <p className="mt-1 text-[11px] text-zinc-500">Referência: {new Date(snap.referenceDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase ${
                                    snap.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' :
                                    snap.status === 'superseded' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                                    snap.status === 'rolled_back' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>{formatStatusLabel(snap.status)}</span>
                            </div>
                            <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300">{snap.recordCount.toLocaleString('pt-BR')} registros</p>
                            {(snap.status === 'ready' || (snap.status === 'active' && snap.id === freshness?.snapshotId)) && (
                                <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                                    {snap.status === 'ready' && <button onClick={() => handleActivate(snap.id)} className="min-h-10 flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white">Ativar versão</button>}
                                    {snap.status === 'active' && snap.id === freshness?.snapshotId && <button onClick={() => handleRollback(snap.id)} className="flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white"><RotateCcw size={13} /> Restaurar anterior</button>}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
                <div className="hidden overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-zinc-800 md:block">
                    <table className="w-full text-xs text-left text-zinc-600 dark:text-zinc-300">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase text-[10px] font-bold text-zinc-400 border-b border-[#e5e5e5] dark:border-zinc-800">
                            <tr>
                                <th className="px-4 py-3">Versão</th>
                                <th className="px-4 py-3">Data Referência</th>
                                <th className="px-4 py-3">Registros</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {snapshots.map((snap) => (
                                <tr key={snap.id} className="border-b border-[#e5e5e5] dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                    <td className="px-4 py-3 font-bold text-black dark:text-white">{snap.version}</td>
                                    <td className="px-4 py-3">{new Date(snap.referenceDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-3 font-mono">{snap.recordCount.toLocaleString('pt-BR')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            snap.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' :
                                            snap.status === 'superseded' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                                            snap.status === 'rolled_back' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                                            'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        }`}>
                                            {formatStatusLabel(snap.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        {snap.status === 'ready' && (
                                            <button 
                                                onClick={() => handleActivate(snap.id)}
                                                className="px-2.5 py-1 bg-green-600 text-white rounded text-[11px] font-semibold hover:bg-green-700"
                                            >
                                                Ativar
                                            </button>
                                        )}
                                        {snap.status === 'active' && snap.id === freshness?.snapshotId && (
                                            <button 
                                                onClick={() => handleRollback(snap.id)}
                                                className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700 flex items-center gap-1"
                                            >
                                                <RotateCcw size={12} /> Restaurar anterior
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
