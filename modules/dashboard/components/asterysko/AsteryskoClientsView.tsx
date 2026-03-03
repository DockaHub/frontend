import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, User, Building2, MapPin, Mail, Phone, MoreHorizontal, Scale, FileText, CreditCard, AlertTriangle, ChevronRight, FolderOpen, Trash2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';

// Types
interface Document {
    id: string;
    name: string;
    type: string;
    date: string;
    isSigned: boolean;
    url: string | null;
}

interface Client {
    id: string;
    name: string; // Contact Person
    company: string; // Legal Name
    email: string;
    phone: string;
    cnpj: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    status: 'active' | 'pending' | 'inactive';
    processesCount: number;
    lastAction: string;
    processes: { id: string, brand: string, class: string, status: string }[];
    invoices: { id: string, dealId: string, desc: string, value: string, status: 'paid' | 'pending' | 'overdue', date: string }[];
    documents: Document[];
}

// Mock Data

const AsteryskoClientsView: React.FC = () => {
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'financial' | 'docs'>('overview');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    const fetchClients = async () => {
        try {
            const response = await api.get('/asterysko/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Client>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [newClient, setNewClient] = useState({
        company: '',
        name: '',
        email: '',
        phone: '',
        cnpj: '',
        sendWelcomeEmail: true
    });

    useEffect(() => {
        if (selectedClient) {
            setEditForm(selectedClient);
            setIsEditing(false);
        }
    }, [selectedClient]);

    const handleSaveClient = async () => {
        if (!selectedClient || !editForm) return;
        setIsLoading(true);
        try {
            const response = await api.put(`/asterysko/clients/${selectedClient.id}`, editForm);

            // Update local list
            setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...response.data } : c));
            setSelectedClient({ ...selectedClient, ...response.data });
            setIsEditing(false);
        } catch (error: any) {
            console.error('Failed to update client', error);
            alert(error.response?.data?.error || 'Erro ao atualizar cliente');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClient = async () => {
        if (!newClient.name || !newClient.email) {
            addToast({ type: 'error', title: 'Erro', message: 'Nome e email são obrigatórios.' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/asterysko/clients', {
                type: newClient.cnpj.length > 14 ? 'PJ' : 'PF',
                cpfCnpj: newClient.cnpj,
                name: newClient.name,
                email: newClient.email,
                phone: newClient.phone,
                organizationId: 'org_1' // Temporary fallback
            });

            await fetchClients();
            setIsCreateModalOpen(false);
            setNewClient({ company: '', name: '', email: '', phone: '', cnpj: '', sendWelcomeEmail: true });
            addToast({ type: 'success', title: 'Sucesso', message: 'Cliente cadastrado com sucesso!' });
        } catch (error: any) {
            console.error('Failed to create client', error);
            addToast({ type: 'error', title: 'Erro', message: error.response?.data?.error || 'Erro ao cadastrar cliente' });
        } finally {
            setIsLoading(false);
        }
    };

    const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuClientId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleDelete = (client: Client) => {
        setClientToDelete(client);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;

        setIsLoading(true);
        try {
            await api.delete(`/asterysko/clients/${clientToDelete.id}`);

            // Remove from local list
            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            if (selectedClient?.id === clientToDelete.id) {
                setSelectedClient(null);
            }
            setActiveMenuClientId(null);
            setClientToDelete(null);
        } catch (error: any) {
            console.error('Failed to delete client', error);
            alert(error.response?.data?.error || 'Erro ao excluir cliente');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClient = () => {
        if (selectedClient) handleDelete(selectedClient);
    };

    const filteredClients = clients.filter(c =>
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDeleteDeal = async (dealId: string) => {
        if (!confirm('Tem certeza que deseja excluir? Esta ação é irreversível e removerá o contrato e a fatura associados.')) return;

        try {
            await api.delete(`/asterysko/crm/deals/${dealId}`);

            // Update local state by filtering out the deleted deal from invoices and documents
            if (selectedClient) {
                const updatedClient = {
                    ...selectedClient,
                    invoices: selectedClient.invoices.filter(inv => inv.id !== dealId && inv.id !== dealId.substring(0, 8).toUpperCase() && inv.dealId !== dealId),
                    documents: selectedClient.documents.filter(doc => doc.id !== dealId)
                };
                setSelectedClient(updatedClient);

                // Also update the main list
                setClients(clients.map(c => c.id === selectedClient.id ? updatedClient : c));

                addToast({ type: 'success', title: 'Sucesso', message: 'Contrato/Fatura excluído com sucesso!' });
            }
        } catch (error) {
            console.error('Error deleting deal:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Erro ao excluir contrato.' });
        }
    };



    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Carteira de Clientes</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie empresas, titulares e histórico de relacionamento.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Novo Cliente
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col mb-8">
                    <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                placeholder="Buscar cliente, empresa ou CNPJ..."
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50">
                            <Filter size={14} /> Filtros
                        </button>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Empresa / Titular</th>
                                <th className="px-6 py-4">Contato Principal</th>
                                <th className="px-6 py-4">Processos</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Última Ação</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {filteredClients.map((client, index) => {
                                const isLastItems = index >= filteredClients.length - 2;
                                return (
                                    <tr
                                        key={client.id}
                                        onClick={() => { setSelectedClient(client); setActiveTab('overview'); }}
                                        className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                                                    {client.company.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-docka-900 dark:text-zinc-100">{client.company}</div>
                                                    <div className="text-xs text-docka-500 dark:text-zinc-400 font-mono">{client.cnpj}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-docka-700 dark:text-zinc-300">{client.name}</div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-500">{client.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-docka-100 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 px-2 py-1 rounded-md text-xs font-bold border border-docka-200 dark:border-zinc-700">
                                                {client.processesCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${client.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                client.status === 'inactive' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' :
                                                    'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                                }`}>
                                                {client.status === 'active' ? 'Ativo' : client.status === 'inactive' ? 'Inativo' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">
                                            {client.lastAction}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuClientId(activeMenuClientId === client.id ? null : client.id);
                                                }}
                                                className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 rounded hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {activeMenuClientId === client.id && (
                                                <div className={`absolute right-8 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-docka-200 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 text-left ${isLastItems ? 'bottom-0 origin-bottom-right mb-2' : 'top-8 origin-top-right'}`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuClientId(null);
                                                            setIsCreateModalOpen(true);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <Plus size={14} /> Novo Processo
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuClientId(null);
                                                            setSelectedClient(client);
                                                            setIsEditing(true);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium border-t border-docka-100 dark:border-zinc-800"
                                                    >
                                                        <FileText size={14} /> Editar Cliente
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenuClientId(null);
                                                            handleDelete(client);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium border-t border-docka-100 dark:border-zinc-800"
                                                    >
                                                        <AlertTriangle size={14} /> Excluir Cliente
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* CLIENT DETAIL MODAL */}
                {selectedClient && (
                    <Modal
                        isOpen={!!selectedClient}
                        onClose={() => { setSelectedClient(null); setIsMenuOpen(false); }}
                        title=""
                        size="xl"
                    >
                        <div className="flex flex-col h-[650px] -mt-2">
                            {/* Header Profile */}
                            <div className="flex justify-between items-start pb-6 border-b border-docka-100 dark:border-zinc-800 mb-6 shrink-0 relative">
                                <div className="flex gap-4 w-full">
                                    <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0">
                                        {selectedClient.company.substring(0, 1)}
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                value={editForm.company || ''}
                                                onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                                                className="text-xl font-bold text-docka-900 w-full mb-1 border-b border-docka-300 focus:border-blue-500 outline-none bg-transparent"
                                                placeholder="Razão Social"
                                            />
                                        ) : (
                                            <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedClient.company}</h2>
                                        )}

                                        <div className="flex items-center gap-3 mt-1 text-sm text-docka-500 dark:text-zinc-400">
                                            <span className="flex items-center gap-1"><User size={12} /> {selectedClient.name}</span>
                                            <span>•</span>
                                            <span className="font-mono">{selectedClient.id}</span>
                                        </div>
                                        <div className="mt-2 text-docka-600">
                                            {isEditing ? (
                                                <select
                                                    value={editForm.status || 'active'}
                                                    onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border bg-white border-docka-300 outline-none"
                                                >
                                                    <option value="active">Ativo</option>
                                                    <option value="pending">Pendente</option>
                                                    <option value="inactive">Inativo</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${selectedClient.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                                    }`}>
                                                    {selectedClient.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[140px] items-end">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSaveClient}
                                                disabled={isLoading}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm flex items-center justify-center gap-2 w-full transition-colors disabled:opacity-50"
                                            >
                                                {isLoading ? 'Salvando...' : 'Salvar'}
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 shadow-sm flex items-center justify-center gap-2 w-full transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                className="text-docka-500 hover:text-docka-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-2 rounded-lg hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {isMenuOpen && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-docka-200 dark:border-zinc-800 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                                                    <button
                                                        onClick={() => { setIsMenuOpen(false); setIsCreateModalOpen(true); }}
                                                        className="w-full text-left px-4 py-3 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium"
                                                    >
                                                        <Plus size={14} /> Novo Processo
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsMenuOpen(false); setIsEditing(true); }}
                                                        className="w-full text-left px-4 py-3 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 font-medium border-t border-docka-100 dark:border-zinc-800"
                                                    >
                                                        <FileText size={14} /> Editar Cliente
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsMenuOpen(false); handleDeleteClient(); }}
                                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium border-t border-docka-100 dark:border-zinc-800"
                                                    >
                                                        <AlertTriangle size={14} /> Excluir Cliente
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-6 border-b border-docka-200 dark:border-zinc-800 mb-6 shrink-0">
                                {[
                                    { id: 'overview', label: 'Visão Geral' },
                                    { id: 'processes', label: 'Processos INPI' },
                                    { id: 'financial', label: 'Financeiro' },
                                    { id: 'docs', label: 'Documentos' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">

                                {/* OVERVIEW */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-5 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-4 flex items-center gap-2"><Building2 size={14} /> Dados Cadastrais</h4>
                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <label className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 block">Razão Social</label>
                                                        {isEditing ? (
                                                            <input
                                                                value={editForm.company || ''}
                                                                onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                placeholder="Razão Social"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-docka-900 dark:text-zinc-100">{selectedClient.company}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 block">CNPJ / CPF</label>
                                                        {isEditing ? (
                                                            <input
                                                                value={editForm.cnpj || ''}
                                                                onChange={e => setEditForm({ ...editForm, cnpj: e.target.value })}
                                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                placeholder="00.000.000/0000-00"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-docka-900 dark:text-zinc-100 font-mono">{selectedClient.cnpj}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 block">Endereço</label>
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    value={editForm.address || ''}
                                                                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                    placeholder="Rua, Número, Bairro"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        value={editForm.city || ''}
                                                                        onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                                                        className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                        placeholder="Cidade"
                                                                    />
                                                                    <input
                                                                        value={editForm.state || ''}
                                                                        onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                                                                        className="w-16 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                        placeholder="UF"
                                                                        maxLength={2}
                                                                    />
                                                                </div>
                                                                <input
                                                                    value={editForm.postalCode || ''}
                                                                    onChange={e => setEditForm({ ...editForm, postalCode: e.target.value })}
                                                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                    placeholder="CEP"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="font-medium text-docka-900 dark:text-zinc-100 flex items-center gap-1">
                                                                <MapPin size={12} />
                                                                {selectedClient.address ? `${selectedClient.address}${selectedClient.city ? ` - ${selectedClient.city}` : ''}${selectedClient.state ? `/${selectedClient.state}` : ''}` : 'Endereço não cadastrado'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-4 flex items-center gap-2"><User size={14} /> Contato Principal</h4>
                                                <div className="space-y-4 text-sm">
                                                    <div>
                                                        <label className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 block">Nome</label>
                                                        {isEditing ? (
                                                            <input
                                                                value={editForm.name || ''}
                                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                placeholder="Nome do contato"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-docka-900 dark:text-zinc-100">{selectedClient.name}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 block">E-mail</label>
                                                        {isEditing ? (
                                                            <input
                                                                value={editForm.email || ''}
                                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                placeholder="email@empresa.com"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-docka-900 dark:text-zinc-100 flex items-center gap-1"><Mail size={12} /> {selectedClient.email}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1 block">Telefone</label>
                                                        {isEditing ? (
                                                            <input
                                                                value={editForm.phone || ''}
                                                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 transition-all"
                                                                placeholder="(00) 00000-0000"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-docka-900 dark:text-zinc-100 flex items-center gap-1"><Phone size={12} /> {selectedClient.phone}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-3">Notas Internas</h4>
                                            <textarea
                                                className="w-full p-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-700 dark:text-zinc-300 outline-none focus:border-docka-300 dark:focus:border-zinc-600 min-h-[100px] placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                                placeholder="Observações sobre o cliente..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* PROCESSES */}
                                {activeTab === 'processes' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        {selectedClient.processes && selectedClient.processes.length > 0 ? selectedClient.processes.map((proc, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                                        <Scale size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{proc.brand}</h4>
                                                        <div className="flex gap-2 text-xs text-docka-500 dark:text-zinc-500 mt-0.5">
                                                            <span className="font-mono bg-docka-100 dark:bg-zinc-700 px-1.5 rounded">{proc.id}</span>
                                                            <span>•</span>
                                                            <span>{proc.class}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${proc.status === 'Concedido' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                                        proc.status === 'Oposição' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                        }`}>
                                                        {proc.status}
                                                    </span>
                                                    <ChevronRight size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-900 dark:group-hover:text-zinc-100" />
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 border-2 border-dashed border-docka-200 dark:border-zinc-700 rounded-xl">
                                                <FolderOpen size={32} className="mx-auto text-docka-300 dark:text-zinc-600 mb-2" />
                                                <p className="text-sm text-docka-500 dark:text-zinc-500">Nenhum processo cadastrado para este cliente.</p>
                                                <button className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Cadastrar Processo</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* FINANCIAL */}
                                {activeTab === 'financial' && (
                                    <div className="animate-in fade-in duration-300">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-docka-50 dark:bg-zinc-800 text-docka-500 dark:text-zinc-500 font-medium text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-2 rounded-l-lg">ID</th>
                                                    <th className="px-4 py-2">Descrição</th>
                                                    <th className="px-4 py-2">Data</th>
                                                    <th className="px-4 py-2">Valor</th>
                                                    <th className="px-4 py-2">Status</th>
                                                    <th className="px-4 py-2 rounded-r-lg text-right">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                                {selectedClient.invoices && selectedClient.invoices.length > 0 ? (
                                                    selectedClient.invoices.map((inv, i) => (
                                                        <tr key={i} className="hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                                            <td className="px-4 py-3 font-mono text-xs text-docka-600 dark:text-zinc-400">{inv.id}</td>
                                                            <td className="px-4 py-3 text-docka-700 dark:text-zinc-300">{inv.desc}</td>
                                                            <td className="px-4 py-3 text-docka-500 dark:text-zinc-500 text-xs">{inv.date}</td>
                                                            <td className="px-4 py-3 font-bold text-docka-900 dark:text-zinc-100">{inv.value}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                                                    inv.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                                    }`}>
                                                                    {inv.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                                                <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"><CreditCard size={16} /></button>
                                                                {inv.dealId && (
                                                                    <button
                                                                        onClick={() => handleDeleteDeal(inv.dealId)}
                                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                                        title="Excluir Contrato e Fatura"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))) : (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-8 text-center text-docka-400 dark:text-zinc-600 text-sm">
                                                            Nenhuma fatura encontrada.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* DOCS */}
                                {activeTab === 'docs' && (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        {selectedClient.documents && selectedClient.documents.length > 0 ? (
                                            selectedClient.documents.map((doc, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 border border-docka-200 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={18} className="text-docka-400 dark:text-zinc-500" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">{doc.name}</span>
                                                            <span className="text-[10px] text-docka-400 dark:text-zinc-500">{doc.type} • {doc.date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {doc.url ? (
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                {doc.isSigned ? 'Ver Assinado' : 'Assinar/Ver'}
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-docka-400 dark:text-zinc-600 italic">Indisponível</span>
                                                        )}
                                                        {doc.type === 'Contrato' && (
                                                            <button
                                                                onClick={() => handleDeleteDeal(doc.id)}
                                                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                                title="Excluir Contrato e Fatura"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-docka-400 dark:text-zinc-600 text-sm">
                                                Nenhum documento disponível.
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </Modal>
                )}

                {/* CREATE MODAL */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Cadastrar Novo Cliente"
                    size="lg"
                    footer={
                        <>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                            <button onClick={handleCreateClient} disabled={isLoading} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm disabled:opacity-50">
                                {isLoading ? 'Salvando...' : 'Salvar Cliente'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Empresa / Razão Social</label>
                                <input
                                    value={newClient.company}
                                    onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100"
                                    placeholder="Ex: Minha Empresa LTDA"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome do Contato</label>
                                <input
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100"
                                    placeholder="Nome completo"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">E-mail Principal</label>
                                <input
                                    type="email"
                                    value={newClient.email}
                                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100"
                                    placeholder="cliente@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Telefone / WhatsApp</label>
                                <input
                                    value={newClient.phone}
                                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">CNPJ / CPF</label>
                            <input
                                value={newClient.cnpj}
                                onChange={e => setNewClient({ ...newClient, cnpj: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100"
                            />
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newClient.sendWelcomeEmail}
                                    onChange={e => setNewClient({ ...newClient, sendWelcomeEmail: e.target.checked })}
                                    className="accent-docka-900 dark:accent-zinc-100"
                                />
                                <span className="text-sm text-docka-600 dark:text-zinc-400">Enviar e-mail de boas-vindas com acesso ao portal</span>
                            </label>
                        </div>
                    </div>
                </Modal>

                {/* DELETE CONFIRMATION MODAL */}
                <Modal
                    isOpen={!!clientToDelete}
                    onClose={() => setClientToDelete(null)}
                    title="Confirmar Exclusão"
                    size="sm"
                    footer={
                        <>
                            <button
                                onClick={() => setClientToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-docka-700 dark:text-zinc-300 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? 'Excluindo...' : 'Sim, excluir'}
                            </button>
                        </>
                    }
                >
                    <div className="p-1">
                        <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                            <AlertTriangle size={20} className="shrink-0" />
                            <p className="text-xs font-medium">Atenção: Esta ação é irreversível.</p>
                        </div>
                        <p className="text-sm text-docka-600 dark:text-zinc-400 leading-relaxed">
                            Tem certeza que deseja excluir o cliente <strong className="text-docka-900 dark:text-zinc-100">{clientToDelete?.company}</strong>?
                            <br /><br />
                            Todos os dados associados, incluindo processos e histórico financeiro, serão removidos permanentemente.
                        </p>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default AsteryskoClientsView;
