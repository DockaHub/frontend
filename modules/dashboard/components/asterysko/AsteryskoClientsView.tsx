import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Loader2, Edit2, X, Save, User, Phone, Mail, FileText, MapPin } from 'lucide-react';
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
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch clients', error);
            setClients([]);
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

    const [editingClient, setEditingClient] = useState<any | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editCpfCnpj, setEditCpfCnpj] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editState, setEditState] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const handleOpenEdit = (client: any) => {
        setEditingClient(client);
        setEditName(client.name || client.company || '');
        setEditEmail(client.email || '');
        setEditPhone(client.phone || '');
        setEditCpfCnpj(client.cpfCnpj || client.cnpj || '');
        setEditAddress(client.address || '');
        setEditCity(client.city || '');
        setEditState(client.state || '');
        setActiveDropdownClientId(null);
    };

    const handleSaveClient = async () => {
        if (!editingClient?.id) return;
        try {
            setIsSavingEdit(true);
            await api.put(`/asterysko/clients/${editingClient.id}`, {
                name: editName,
                email: editEmail,
                phone: editPhone,
                cnpj: editCpfCnpj,
                address: editAddress,
                city: editCity,
                state: editState
            });
            alert('Dados do cliente atualizados com sucesso!');
            setEditingClient(null);
            fetchClients();
        } catch (err: any) {
            console.error('Failed to update client', err);
            alert(err.response?.data?.error || 'Falha ao atualizar dados do cliente.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col relative z-0">
            {/* Modal Novo Cliente */}
            <AsteryskoNewClientModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchClients} 
                organizationId={organization?.id}
            />

            {/* Modal Editar Cliente */}
            {editingClient && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-season text-[22px] font-bold text-black dark:text-white flex items-center gap-2">
                                <Edit2 size={18} className="text-[#0412dd] dark:text-[#3b48ff]" /> Editar Cliente
                            </h3>
                            <button onClick={() => setEditingClient(null)} className="text-zinc-400 hover:text-zinc-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome Completo / Razão Social</label>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                    <User size={16} className="text-zinc-400 mr-2 shrink-0" />
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">E-mail</label>
                                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                        <Mail size={16} className="text-zinc-400 mr-2 shrink-0" />
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={e => setEditEmail(e.target.value)}
                                            className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Telefone / WhatsApp</label>
                                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                        <Phone size={16} className="text-zinc-400 mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={editPhone}
                                            onChange={e => setEditPhone(e.target.value)}
                                            placeholder="(98) 99110-2121"
                                            className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-1">* Formatado automaticamente com DDI Brasil (+55)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">CPF / CNPJ</label>
                                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                        <FileText size={16} className="text-zinc-400 mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={editCpfCnpj}
                                            onChange={e => setEditCpfCnpj(e.target.value)}
                                            className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Cidade / Estado</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Cidade"
                                            value={editCity}
                                            onChange={e => setEditCity(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-black dark:text-white outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="UF"
                                            maxLength={2}
                                            value={editState}
                                            onChange={e => setEditState(e.target.value)}
                                            className="w-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-black dark:text-white outline-none text-center font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Endereço Completo</label>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                    <MapPin size={16} className="text-zinc-400 mr-2 shrink-0" />
                                    <input
                                        type="text"
                                        value={editAddress}
                                        onChange={e => setEditAddress(e.target.value)}
                                        className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={() => setEditingClient(null)}
                                className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveClient}
                                disabled={isSavingEdit}
                                className="px-5 py-2.5 bg-[#0412dd] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                                {isSavingEdit ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                                        onClick={() => handleOpenEdit(client)}
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Edit2 size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                        Editar Cliente
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResendAccess(client)}
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        Reenviar Acesso
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClient(client)}
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer"
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
