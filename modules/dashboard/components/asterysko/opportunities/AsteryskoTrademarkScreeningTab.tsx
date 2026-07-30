import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Search, Eye } from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoTrademarkDetailsModal } from './AsteryskoTrademarkDetailsModal';
import {
    ItemsResponse,
    TrademarkCounts,
    TrademarkScreening
} from './asteryskoApiTypes';

interface AsteryskoTrademarkScreeningTabProps {
    onOpenRadar?: (brandName: string, nclClass: string) => void;
}

export const AsteryskoTrademarkScreeningTab: React.FC<AsteryskoTrademarkScreeningTabProps> = ({ onOpenRadar }) => {
    const [screenings, setScreenings] = useState<TrademarkScreening[]>([]);
    const [counts, setCounts] = useState<TrademarkCounts | null>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [selectedScreeningId, setSelectedScreeningId] = useState<string | null>(null);

    const [riskFilter, setRiskFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listRes, countRes] = await Promise.all([
                api.get<ItemsResponse<TrademarkScreening>>('/asterysko/trademark-screenings', {
                    params: {
                        page,
                        limit: 15,
                        risk: riskFilter || undefined,
                        search: searchTerm || undefined
                    }
                }),
                api.get<TrademarkCounts>('/asterysko/trademark-screenings/counts')
            ]);

            setScreenings(listRes.data.items || []);
            setCounts(countRes.data || null);
        } catch (err) {
            console.error('Failed to load trademark screening data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, riskFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const handleTriggerRun = async (dryRun: boolean) => {
        try {
            setRunning(true);
            const endpoint = dryRun ? '/asterysko/trademark-screenings/dry-run' : '/asterysko/trademark-screenings/run';
            await api.post(endpoint, {});
            fetchData();
        } catch (err) {
            console.error('Failed to trigger screening run', err);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* Header Metrics */}
            {counts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs font-semibold text-zinc-500 uppercase">Total de Análises</div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{counts.total}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs font-semibold text-emerald-600 uppercase">Sem Anterioridade (Low)</div>
                        <div className="text-2xl font-bold text-emerald-600 mt-1">{counts.lowRisk}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs font-semibold text-amber-600 uppercase">Atenção (Medium)</div>
                        <div className="text-2xl font-bold text-amber-600 mt-1">{counts.mediumRisk}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs font-semibold text-red-600 uppercase">Alto Conflito (High)</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">{counts.highRisk}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs font-semibold text-blue-600 uppercase">Revisão Pendente</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">{counts.reviewRequired}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs font-semibold text-zinc-500 uppercase">Base INPI Consultada</div>
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-2 truncate">{counts.baseVersion}</div>
                    </div>
                </div>
            )}

            {/* Action Bar & Filters */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar marca, empresa..."
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:border-[#0412dd]"
                        />
                    </div>
                    <select
                        value={riskFilter}
                        onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                        className="py-1.5 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none"
                    >
                        <option value="">Todos os Riscos</option>
                        <option value="low">Baixo Risco (Low)</option>
                        <option value="medium">Médio Risco (Medium)</option>
                        <option value="high">Alto Conflito (High)</option>
                    </select>
                </form>

                <div className="flex items-center gap-2">
                    <button
                        disabled={running}
                        onClick={() => handleTriggerRun(true)}
                        className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                        <Play size={14} /> Simular Dry-Run
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="p-3">Marca Identificada</th>
                                <th className="p-3">Empresa / CNPJ</th>
                                <th className="p-3">Resultado Técnico</th>
                                <th className="p-3">Risco Preliminar</th>
                                <th className="p-3">Matches Principal</th>
                                <th className="p-3">Confiança</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {screenings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-zinc-500">
                                        Nenhuma análise marcária encontrada com os filtros selecionados.
                                    </td>
                                </tr>
                            ) : (
                                screenings.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">
                                            {item.brandName}
                                        </td>
                                        <td className="p-3 text-zinc-600 dark:text-zinc-400">
                                            <div>{item.companyName || 'N/A'}</div>
                                            <div className="text-[10px] font-mono text-zinc-400">{item.cnpj || 'Sem CNPJ'}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                                {item.result || 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                item.finalRisk === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                                item.finalRisk === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                            }`}>
                                                {item.finalRisk || 'LOW'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-zinc-600 dark:text-zinc-400">
                                            {item.matches?.[0] ? (
                                                <div>
                                                    <span className="font-semibold">{item.matches[0].markName}</span>
                                                    <span className="text-[10px] text-zinc-400 ml-1">({item.matches[0].processStatus})</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 font-italic">Nenhum conflito</span>
                                            )}
                                        </td>
                                        <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">
                                            {item.finalConfidence || 90}%
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => setSelectedScreeningId(item.id)}
                                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-xs font-medium transition-colors flex items-center gap-1 ml-auto"
                                            >
                                                <Eye size={12} /> Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedScreeningId && (
                <AsteryskoTrademarkDetailsModal
                    screeningId={selectedScreeningId}
                    onClose={() => setSelectedScreeningId(null)}
                    onRefresh={fetchData}
                    onOpenRadar={onOpenRadar}
                />
            )}
        </div>
    );
};
