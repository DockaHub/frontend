import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Loader2 } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';
import AsteryskoNewClientModal from './AsteryskoNewClientModal';

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    processesCount: number;
    createdAt?: string;
    owner?: string;
}

interface Props {
    organization?: Organization;
}

const AsteryskoClientsView: React.FC<Props> = ({ organization }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const params = organization ? { organizationId: organization.id } : {};
            const response = await api.get('/asterysko/clients', { params });
            setClients(response.data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [organization?.id]);

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col relative z-0">
            {/* Modal */}
            <AsteryskoNewClientModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchClients} 
                organizationId={organization?.id}
            />

            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">Clientes</span>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center bg-white dark:bg-zinc-900 border border-[#e5e5e5] dark:border-zinc-700 text-black dark:text-white font-sans text-xs font-semibold px-4 h-[32px] rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                    <div className="bg-[#0412dd] dark:bg-[#3b48ff] rounded-full p-0.5 mr-2">
                        <Plus size={10} className="text-white" strokeWidth={3} />
                    </div>
                    Novo cliente
                </button>
            </div>

            {/* Table */}
            <div className="w-full flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-10 py-4 border-b border-[#e5e5e5] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/50">
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Cliente</div>
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Email</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Processos</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Cadastrado</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Responsável</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <Loader2 className="animate-spin text-black dark:text-white mr-2" size={16} />
                            <span className="text-sm font-semibold text-black dark:text-white">Carregando...</span>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <span className="text-sm font-semibold text-black dark:text-white">Nenhum cliente encontrado.</span>
                        </div>
                    ) : (
                        clients.map((client) => (
                            <div key={client.id} className="grid grid-cols-12 px-10 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors items-center relative group">
                                <div className="col-span-3 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                    {client.company || client.name}
                                </div>
                                <div className="col-span-3 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                    {client.email}
                                </div>
                                <div className="col-span-2 flex items-center pr-4">
                                    <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${client.processesCount > 0 ? 'bg-[#0412dd] dark:bg-[#3b48ff]' : 'bg-[#e5e5e5] dark:bg-zinc-700'}`}>
                                        <div className={`w-3 h-3 rounded-full shadow-sm transition-transform ${client.processesCount > 0 ? 'bg-white translate-x-4' : 'bg-white dark:bg-zinc-400 translate-x-0'}`} />
                                    </div>
                                    <span className="ml-3 text-[11px] font-semibold text-[#9f9f9f]">
                                        {client.processesCount > 0 ? client.processesCount : 'Nenhum'}
                                    </span>
                                </div>
                                <div className="col-span-2 text-[13px] font-medium text-black dark:text-white pr-4">
                                    {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '12/12/2022'}
                                </div>
                                <div className="col-span-2 text-[13px] font-medium text-black dark:text-white pr-8 truncate">
                                    {client.owner || 'Levy Câmara'}
                                </div>
                                
                                {/* Action Menu - Floating right */}
                                <div className="absolute right-10">
                                    <button className="p-1 text-black dark:text-white opacity-50 hover:opacity-100 transition-opacity">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {clients.length > 0 && (
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

export default AsteryskoClientsView;
