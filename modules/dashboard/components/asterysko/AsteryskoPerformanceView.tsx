import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';

interface PerformanceMetrics {
    balance: number;
    closedDealsCount: number;
    closedDeals: any[];
}

interface Props {
    organization?: Organization;
}

const AsteryskoPerformanceView: React.FC<Props> = ({ organization }) => {
    const [period, setPeriod] = useState('Junho/2026');
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPerformance = async () => {
        try {
            setIsLoading(true);
            const orgId = organization?.id || 'org_1';
            const response = await api.get(`/asterysko/performance?organizationId=${orgId}&period=${period}`);
            setMetrics(response.data);
        } catch (error) {
            console.error('Failed to fetch performance metrics', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, [organization?.id, period]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const balance = metrics?.balance || 1652;
    const closedCount = metrics?.closedDealsCount || 0;

    return (
        <div className="bg-[#fafafa] dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-10">
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">Minhas Metas</span>
                
                <div className="flex items-center gap-2 relative">
                    <span className="text-[11px] font-semibold text-[#9f9f9f]">Filtrar por período:</span>
                    <button className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-700 px-3 py-1.5 rounded-full text-[11px] font-semibold text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                        {period}
                        <ChevronDown size={14} className="text-[#9f9f9f]" strokeWidth={3} />
                    </button>
                    {isLoading && (
                        <div className="absolute right-[-30px]">
                            <Loader2 className="animate-spin text-[#0412dd] dark:text-[#3b48ff]" size={16} />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full p-10 flex gap-8">
                
                {/* Left Column (Stats) */}
                <div className="w-[380px] flex flex-col shrink-0 gap-6">
                    
                    {/* Saldo Box */}
                    <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-8 shadow-sm transition-opacity" style={{ opacity: isLoading ? 0.5 : 1 }}>
                        <h3 className="text-sm font-medium text-black dark:text-white mb-8">Saldo</h3>
                        <div className="font-season text-[36px] font-[420] text-black dark:text-white leading-none mb-3">
                            {formatCurrency(balance)}
                        </div>
                        <div className="text-[10px] font-semibold text-[#9f9f9f]">
                            {closedCount} fechamentos no mês
                        </div>
                    </div>

                    {/* Receita Progressiva Box */}
                    <div className="bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 p-8 shadow-sm flex-1">
                        <h3 className="text-sm font-medium text-black dark:text-white mb-4">Receita progressiva</h3>
                        <p className="text-[10px] font-normal text-[#9f9f9f] mb-8 leading-relaxed max-w-[280px]">
                            O valor que você recebe por crédito é progressivo e dinâmico. Confira abaixo as recompensas relacionadas ao seu desempenho:
                        </p>
                        
                        <div className="flex flex-col gap-6">
                            {/* Row 1 */}
                            <div className="flex items-center justify-between">
                                <span className="h-6 px-3 rounded-full bg-[#f5f5f5] dark:bg-zinc-800 text-black dark:text-white text-[11px] font-medium flex items-center justify-center">
                                    {'<70 créditos aprovados'}
                                </span>
                                <span className="text-[13px] font-medium text-black dark:text-white">R$100,00</span>
                            </div>
                            
                            {/* Row 2 */}
                            <div className="flex items-center justify-between">
                                <span className="h-6 px-3 rounded-full bg-[#f5f5f5] dark:bg-zinc-800 text-black dark:text-white text-[11px] font-medium flex items-center justify-center">
                                    {'70-71 créditos aprovados'}
                                </span>
                                <span className="text-[13px] font-bold text-black dark:text-white">+ R$1.000,00</span>
                            </div>
                            
                            {/* Row 3 */}
                            <div className="flex items-center justify-between">
                                <span className="h-6 px-3 rounded-full bg-[#f5f5f5] dark:bg-zinc-800 text-black dark:text-white text-[11px] font-medium flex items-center justify-center">
                                    {'>71 créditos aprovados'}
                                </span>
                                <span className="text-[13px] font-medium text-black dark:text-white">R$150,00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (List) */}
                <div className="flex-1 bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-800 shadow-sm flex flex-col relative overflow-hidden transition-opacity" style={{ opacity: isLoading ? 0.5 : 1 }}>
                    <div className="p-8 border-b border-[#e5e5e5] dark:border-zinc-800">
                        <h3 className="text-sm font-medium text-black dark:text-white">Contratos fechados</h3>
                    </div>
                    
                    {!metrics?.closedDeals?.length ? (
                        <div className="flex-1 flex items-center justify-center text-[12px] text-[#9f9f9f] p-8">
                            Nenhum contrato fechado neste período.
                        </div>
                    ) : (
                        metrics.closedDeals.map((deal, idx) => (
                            <div key={idx} className="p-8 border-b border-[#e5e5e5] dark:border-zinc-800">
                                <h3 className="text-sm font-medium text-black dark:text-white">{deal.title || 'Contrato'}</h3>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default AsteryskoPerformanceView;
