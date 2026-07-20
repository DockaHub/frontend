import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';
import AsteryskoNewProcessModal from './AsteryskoNewProcessModal';

interface Process {
    id: string;
    inpiProcessNumber?: string;
    status: string;
    brand?: {
        name: string;
        nclClasses?: string[];
        client?: {
            user?: {
                name: string;
            }
        }
    };
}

interface Props {
    organization?: Organization;
}

const AsteryskoProcessesView: React.FC<Props> = ({ organization }) => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProcesses = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/asterysko/processes');
            setProcesses(response.data);
        } catch (error) {
            console.error('Failed to fetch processes', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
    }, [organization?.id]);

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col relative z-0">
            {/* Modal */}
            <AsteryskoNewProcessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchProcesses} 
                organizationId={organization?.id}
            />

            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">Processos</span>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-700 text-black dark:text-white font-sans text-xs font-semibold px-4 h-[32px] rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                    <div className="bg-[#0412dd] dark:bg-[#3b48ff] rounded-full p-0.5 mr-2">
                        <Plus size={10} className="text-white" strokeWidth={3} />
                    </div>
                    Novo processo
                </button>
            </div>

            {/* Table */}
            <div className="w-full flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-10 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/50">
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Marca</div>
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Número INPI</div>
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Titular</div>
                    <div className="col-span-1 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Classe</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200 pl-4">Status</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <Loader2 className="animate-spin text-black dark:text-white mr-2" size={16} />
                            <span className="text-sm font-semibold text-black dark:text-white">Carregando...</span>
                        </div>
                    ) : processes.length === 0 ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <span className="text-sm font-semibold text-black dark:text-white">Nenhum processo encontrado.</span>
                        </div>
                    ) : (
                        processes.map((process) => {
                            const brandName = process.brand?.name || 'Sem Marca';
                            const clientName = process.brand?.client?.user?.name || 'N/A';
                            const nclClass = process.brand?.nclClasses?.[0] ? `NCL ${process.brand.nclClasses[0]}` : '-';
                            const status = process.status || 'N/A';

                            // Format status for pill color mapping (optional fallback to standard color)
                            let statusColor = 'bg-[#fff8eb] dark:bg-amber-900/20 text-[#c07f00] dark:text-amber-400';
                            if (status.includes('Concedido') || status === 'GRANTED' || status === 'PAID') {
                                statusColor = 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
                            } else if (status === 'NEW' || status === 'PROTOCOL') {
                                statusColor = 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
                            }

                            return (
                                <div key={process.id} className="grid grid-cols-12 px-10 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors items-center relative group">
                                    
                                    <div className="col-span-3 flex items-center gap-3 pr-4">
                                        <div className="w-8 h-8 rounded-lg bg-[#e5e5e5] dark:bg-zinc-800 shrink-0" />
                                        <span className="text-[13px] font-medium text-black dark:text-white truncate">
                                            {brandName}
                                        </span>
                                    </div>
                                    
                                    <div className="col-span-3 text-[13px] font-medium font-mono text-black dark:text-white pr-4 truncate">
                                        {process.inpiProcessNumber || 'N/A'}
                                    </div>
                                    
                                    <div className="col-span-3 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                        {clientName}
                                    </div>
                                    
                                    <div className="col-span-1 text-[13px] font-medium font-mono text-black dark:text-white pr-4 truncate">
                                        {nclClass}
                                    </div>
                                    
                                    <div className="col-span-2 pl-4 pr-8">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusColor}`}>
                                            {status}
                                        </span>
                                    </div>
                                    
                                    {/* Action Menu - Floating right */}
                                    <div className="absolute right-10">
                                        <button className="p-1 text-black dark:text-white opacity-50 hover:opacity-100 transition-opacity">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {processes.length > 0 && (
                    <div className="mt-6 pb-12 flex justify-center">
                        <button className="text-[10px] font-semibold text-[#0412dd] dark:text-[#3b48ff] uppercase tracking-wider hover:opacity-80 transition-opacity">
                            CARREGAR MAIS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsteryskoProcessesView;
