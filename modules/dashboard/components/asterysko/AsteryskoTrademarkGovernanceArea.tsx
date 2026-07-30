import React, { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, Database, RefreshCw } from 'lucide-react';
import api from '../../../../services/api';
import { getApiErrorMessage } from './opportunities/asteryskoApiTypes';

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
        if (!confirm('Deseja realmente efetuar o ROLLBACK atômico para o snapshot anterior?')) return;
        try {
            await api.post(`/asterysko/trademark-governance/snapshots/${snapshotId}/rollback`, { reason: 'Rollback manual via painel' });
            setActionMsg('Rollback executado com sucesso!');
            fetchData();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Falha no rollback.'));
        }
    };

    const handleActivate = async (snapshotId: string) => {
        try {
            await api.post(`/asterysko/trademark-governance/snapshots/${snapshotId}/activate`);
            setActionMsg('Snapshot ativado com sucesso!');
            fetchData();
        } catch (error: unknown) {
            alert(getApiErrorMessage(error, 'Falha na ativação.'));
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 p-6 bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 rounded-2xl shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e5e5e5] dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                    <Database className="text-[#0412dd] dark:text-[#3b48ff]" size={24} />
                    <div>
                        <h3 className="text-lg font-bold text-black dark:text-white">Governança e Frescor da Base Marcária</h3>
                        <p className="text-xs text-[#666] dark:text-[#aaa]">Controle de versão por snapshots imutáveis e verificação de defasagem RPI</p>
                    </div>
                </div>
                <button 
                    onClick={fetchData} 
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors"
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
                        <span className="text-[11px] font-bold text-[#888] uppercase">Snapshot Ativo</span>
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
                        <span className="text-[11px] font-bold text-[#888] uppercase">Nível de Frescor</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                freshness.level === 'current' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                freshness.level === 'attention' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                                freshness.level === 'stale' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            }`}>
                                {freshness.level}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-[#888] uppercase">Risco Low Conclusivo</span>
                        <span className={`text-sm font-bold mt-1 ${freshness.isLowRiskAllowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {freshness.isLowRiskAllowed ? 'Permitido' : 'Bloqueado (Inconclusivo)'}
                        </span>
                        <span className="text-xs text-[#666] dark:text-[#aaa]">Penalidade: -{freshness.confidencePenalty}% confiança</span>
                    </div>
                </div>
            )}

            {/* Snapshots Table */}
            <div className="mt-2 flex flex-col gap-3">
                <h4 className="text-sm font-bold text-black dark:text-white">Histórico de Snapshots</h4>
                <div className="overflow-x-auto border border-[#e5e5e5] dark:border-zinc-800 rounded-xl">
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
                                            {snap.status}
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
                                                <RotateCcw size={12} /> Rollback
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
