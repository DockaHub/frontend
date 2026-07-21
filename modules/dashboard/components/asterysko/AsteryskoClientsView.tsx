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
    processes?: any[];
}

interface Props {
    organization?: Organization;
}

const getProcessInitialsColor = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const colors = [
        'bg-blue-600 text-white',
        'bg-indigo-600 text-white',
        'bg-purple-600 text-white',
        'bg-emerald-600 text-white',
        'bg-orange-600 text-white',
        'bg-cyan-600 text-white',
        'bg-rose-600 text-white'
    ];
    return colors[charCode % colors.length];
};

const AsteryskoClientsView: React.FC<Props> = ({ organization }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdownClientId, setActiveDropdownClientId] = useState<string | null>(null);

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

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdownClientId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleResendAccess = async (client: Client) => {
        try {
            await api.post(`/asterysko/clients/${client.id}/resend-access`);
            alert(`Acesso reenviado via WhatsApp/E-mail com sucesso para ${client.name}!`);
        } catch (error) {
            console.error('Failed to resend access', error);
            alert('Falha ao reenviar acesso.');
        }
    };

    const handleDeleteClient = async (client: Client) => {
        if (!window.confirm(`Tem certeza de que deseja excluir o cliente ${client.name}?`)) {
            return;
        }
        try {
            await api.delete(`/asterysko/clients/${client.id}`);
            fetchClients();
            alert('Cliente excluído com sucesso!');
        } catch (error) {
            console.error('Failed to delete client', error);
            alert('Falha ao excluir cliente.');
        }
    };

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
                        clients.map((client) => {
                            const displayedProcesses = client.processes || [];
                            const limit = 5;
                            const extraCount = displayedProcesses.length - limit;

                            return (
                                <div key={client.id} className="grid grid-cols-12 px-10 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors items-center relative group">
                                    <div className="col-span-3 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                        {client.company || client.name}
                                    </div>
                                    <div className="col-span-3 text-[13px] font-medium text-black dark:text-white pr-4 truncate">
                                        {client.email}
                                    </div>
                                    
                                    {/* Processes Overlapping Avatars */}
                                    <div className="col-span-2 flex items-center pr-4">
                                        {displayedProcesses.length === 0 ? (
                                            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">Nenhum</span>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="flex items-center -space-x-1.5 overflow-hidden mr-2">
                                                    {displayedProcesses.slice(0, limit).map((proc: any, idx: number) => {
                                                        const initials = proc.brand ? proc.brand.substring(0, 1).toUpperCase() : '?';
                                                        const colorClass = getProcessInitialsColor(proc.brand || '');
                                                        return (
                                                            <div 
                                                                key={proc.id || idx}
                                                                title={`${proc.brand} (${proc.status})`}
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-zinc-950 shrink-0 select-none ${colorClass}`}
                                                            >
                                                                {initials}
                                                            </div>
                                                        );
                                                    })}
                                                    {extraCount > 0 && (
                                                        <div 
                                                            title={`${extraCount} processo(s) adicional(ais)`}
                                                            className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-zinc-950 shrink-0 select-none"
                                                        >
                                                            +{extraCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 select-none">
                                                    ({displayedProcesses.length})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2 text-[13px] font-medium text-black dark:text-white pr-4">
                                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '12/12/2022'}
                                    </div>
                                    <div className="col-span-2 text-[13px] font-medium text-black dark:text-white pr-8 truncate">
                                        {client.owner || 'Levy Câmara'}
                                    </div>
                                    
                                    {/* Action Dropdown Menu */}
                                    <div className="absolute right-10 z-20">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdownClientId(activeDropdownClientId === client.id ? null : client.id);
                                            }}
                                            className="p-1 text-black dark:text-white opacity-50 hover:opacity-100 transition-opacity rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeDropdownClientId === client.id && (
                                            <>
                                                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                                    <button 
                                                        onClick={() => handleResendAccess(client)}
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                                    >
                                                        Reenviar Acesso
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClient(client)}
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                                                    >
                                                        Excluir Cliente
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
