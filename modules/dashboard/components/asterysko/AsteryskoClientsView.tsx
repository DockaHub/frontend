import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    Plus, 
    User, 
    Building2, 
    MapPin, 
    Mail, 
    Phone, 
    MoreHorizontal, 
    Scale, 
    FileText, 
    CreditCard, 
    AlertTriangle, 
    ChevronRight, 
    FolderOpen, 
    Trash2, 
    ExternalLink,
    Activity,
    CheckCircle2,
    Users,
    Briefcase,
    Shield,
    Download
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import DashboardPage from '../../../../components/DashboardPage';

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
    organizationId?: string;
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

import { Organization } from '../../../../types';

interface AsteryskoClientsViewProps {
    organization?: Organization;
}

const AsteryskoClientsView: React.FC<AsteryskoClientsViewProps> = ({ organization }) => {
    const { addToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'financial' | 'docs'>('overview');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Client>>({});
    const [activeMenuClientId, setActiveMenuClientId] = useState<string | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const [newClient, setNewClient] = useState({
        company: '',
        name: '',
        email: '',
        phone: '',
        cnpj: '',
        sendWelcomeEmail: true
    });

    const fetchClients = async () => {
        try {
            const orgId = organization?.id || 'org_1';
            const response = await api.get(`/asterysko/clients?organizationId=${orgId}`);
            setClients(response.data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [organization?.id]);

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
            setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...response.data } : c));
            setSelectedClient({ ...selectedClient, ...response.data });
            setIsEditing(false);
            addToast({ type: 'success', title: 'Sucesso', message: 'Cliente atualizado com sucesso!' });
        } catch (error: any) {
            console.error('Failed to update client', error);
            addToast({ type: 'error', title: 'Erro', message: error.response?.data?.error || 'Erro ao atualizar cliente' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClient = async () => {
        if (!newClient.name || !newClient.email) {
            addToast({ type: 'error', title: 'Erro', message: 'Nome e email sÃ£o obrigatÃ³rios.' });
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
                organizationId: organization?.id || 'org_1'
            });
            await fetchClients();
            setIsCreateModalOpen(false);
            setNewClient({ company: '', name: '', email: '', phone: '', cnpj: '', sendWelcomeEmail: true });
            addToast({ type: 'success', title: 'Sucesso', message: 'Cliente cadastrado com sucesso!' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Erro', message: error.response?.data?.error || 'Erro ao cadastrar cliente' });
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        setIsLoading(true);
        try {
            await api.delete(`/asterysko/clients/${clientToDelete.id}`);
            setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
            if (selectedClient?.id === clientToDelete.id) setSelectedClient(null);
            setClientToDelete(null);
            addToast({ type: 'success', title: 'Sucesso', message: 'Cliente excluÃ­do permanentemente.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Erro', message: 'NÃ£o foi possÃ­vel excluir o cliente.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImpersonate = async (clientId: string) => {
        try {
            const response = await api.post(`/asterysko/impersonate/${clientId}`);
            const { token, user } = response.data;
            addToast({ type: 'success', title: 'Acesso Autorizado', message: `Abrindo portal de ${user.name}...` });
            const isProd = !window.location.hostname.includes('localhost');
            const portalBase = isProd ? 'https://cliente.asterysko.com/portal' : '/portal';
            window.open(`${portalBase}?token=${token}`, '_blank');
        } catch (error: any) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao autenticar no portal do cliente.' });
        }
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
        <DashboardPage
            title="Carteira de Clientes"
            subtitle={organization?.id === 'org_1' || organization?.slug === 'docka' 
                ? 'Visualizando todos os clientes da Holding (Docka Group).' 
                : `GestÃ£o de clientes e contratos da ${organization?.name}.`}
            actions={
                <div className="flex gap-2">
                    <button 
                         onClick={() => addToast({ type: 'info', title: 'Exportar', message: 'Gerando CSV da carteira...' })}
                        className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-50 dark:border-zinc-700 rounded-xl text-docka-400 hover:text-docka-900 transition-all shadow-sm"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> Novo Cliente
                    </button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-4">
                
                {/* TOP METRICS DS 3.0 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Clientes', value: clients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Processos Ativos', value: clients.reduce((acc, c) => acc + c.processesCount, 0), icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Financeiro Pendente', value: 'R$ 12.450', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'Health Score', value: '98%', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-docka-50 dark:border-zinc-800 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <m.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-docka-300">{m.label}</p>
                                <p className="text-xl font-black text-docka-900 dark:text-zinc-100">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SEARCH & FILTERS */}
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white dark:border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-docka-50 dark:border-zinc-800 flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-docka-300" size={18} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 h-12 bg-docka-50 dark:bg-zinc-800 border-none rounded-[1.2rem] text-sm font-medium outline-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-300 transition-all dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700"
                                placeholder="Buscar por cliente, CNPJ ou email..."
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-docka-300 uppercase tracking-widest">Filtrar por:</span>
                            <button className="px-4 py-2 bg-docka-50 dark:bg-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-docka-500 border border-transparent hover:border-docka-100 transition-all">Ativos</button>
                            <button className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest text-docka-300 border border-docka-50 dark:border-zinc-800 hover:text-docka-500 transition-all">PJs</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/50 dark:bg-zinc-900/50 text-docka-300 font-black text-[9px] uppercase tracking-[0.2em] border-b border-docka-50 dark:border-zinc-800">
                                <tr>
                                    <th className="px-8 py-5">Titular / Empresa</th>
                                    <th className="px-8 py-5">Contato</th>
                                    <th className="px-8 py-5 text-center">Ativos</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {filteredClients.map((client) => (
                                    <tr
                                        key={client.id}
                                        onClick={() => { setSelectedClient(client); setActiveTab('overview'); }}
                                        className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-all group cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/10">
                                                    {client.company.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-black text-docka-900 dark:text-zinc-100 text-sm tracking-tight">{client.company}</div>
                                                    <div className="text-[10px] font-bold text-docka-300 uppercase tracking-widest mt-0.5">{client.cnpj}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-docka-700 dark:text-zinc-300 text-xs">{client.name}</div>
                                            <div className="text-[10px] font-medium text-docka-400 dark:text-zinc-500">{client.email}</div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-docka-50 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 rounded-xl text-xs font-black border border-docka-100 dark:border-zinc-700">
                                                {client.processesCount}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                                                client.status === 'active' ? 'bg-emerald-500 text-white border-emerald-500' :
                                                client.status === 'inactive' ? 'bg-rose-500 text-white border-rose-500' :
                                                'bg-amber-500 text-white border-amber-500'
                                            }`}>
                                                {client.status === 'active' ? 'Ativo' : client.status === 'inactive' ? 'Inativo' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleImpersonate(client.id); }}
                                                    className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                    title="Acessar Portal"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                                <button className="p-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 text-docka-400 rounded-xl hover:text-docka-900 transition-all shadow-sm">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL DETALHES 3.0 */}
                {selectedClient && (
                    <Modal
                        isOpen={!!selectedClient}
                        onClose={() => { setSelectedClient(null); setIsEditing(false); }}
                        title=""
                        size="xl"
                    >
                        <div className="flex flex-col -m-2">
                             {/* HEADER DOSSIER CLIENTE */}
                             <div className="relative p-8 pb-0 shrink-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20">
                                            {selectedClient.company.substring(0, 1)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-3xl font-black text-docka-900 dark:text-zinc-100 tracking-tight">
                                                    {selectedClient.company}
                                                </h2>
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    selectedClient.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                                }`}>
                                                    {selectedClient.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-[10px] font-black text-docka-300 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Building2 size={12} /> {selectedClient.cnpj}
                                                </p>
                                                <p className="text-[10px] font-black text-docka-300 uppercase tracking-widest flex items-center gap-1.5">
                                                    <User size={12} /> {selectedClient.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleImpersonate(selectedClient.id)} 
                                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100 dark:border-blue-800"
                                        >
                                            Portal do Cliente
                                        </button>
                                        <button 
                                            onClick={() => setClientToDelete(selectedClient)}
                                            className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* TABS PREMIUM */}
                                <div className="flex gap-8 border-b border-docka-50 dark:border-zinc-800">
                                    {[
                                        { id: 'overview', label: 'Dashboard', icon: Activity },
                                        { id: 'processes', label: 'PortfÃ³lio', icon: Shield },
                                        { id: 'financial', label: 'Billing', icon: CreditCard },
                                        { id: 'docs', label: 'Arquivo', icon: FolderOpen },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                                activeTab === tab.id ? 'text-docka-900 dark:text-white' : 'text-docka-300 hover:text-docka-500'
                                            }`}
                                        >
                                            <tab.icon size={14} />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-docka-900 dark:bg-white rounded-t-full shadow-lg shadow-docka-900/20" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             {/* CONTEÃšDO DINÃ‚MICO */}
                             <div className="p-8 h-[500px] overflow-y-auto custom-scrollbar">
                                 {activeTab === 'overview' && (
                                     <div className="space-y-8">
                                         <div className="grid grid-cols-2 gap-6">
                                             <div className="p-6 bg-docka-50 dark:bg-zinc-800/50 rounded-[1.5rem] border border-docka-50 dark:border-zinc-700/50">
                                                 <h4 className="text-[10px] font-black text-docka-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                     <Building2 size={14} /> Dados Corporativos
                                                 </h4>
                                                 <div className="space-y-6">
                                                     <div>
                                                         <label className="text-[9px] font-black text-docka-400 uppercase tracking-widest mb-1.5 block">EndereÃ§o Comercial</label>
                                                         <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-start gap-2">
                                                             <MapPin size={14} className="mt-0.5 text-blue-500" />
                                                             {selectedClient.address ? `${selectedClient.address}, ${selectedClient.city}/${selectedClient.state}` : 'NÃ£o cadastrado'}
                                                         </p>
                                                     </div>
                                                     <div className="grid grid-cols-2 gap-4">
                                                         <div>
                                                             <label className="text-[9px] font-black text-docka-400 uppercase tracking-widest mb-1.5 block">CNPJ / Identificador</label>
                                                             <p className="text-xs font-black text-docka-900 dark:text-zinc-100 font-mono">{selectedClient.cnpj}</p>
                                                         </div>
                                                         <div>
                                                             <label className="text-[9px] font-black text-docka-400 uppercase tracking-widest mb-1.5 block">Status CRM</label>
                                                             <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{selectedClient.status}</p>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className="p-6 bg-docka-50 dark:bg-zinc-800/50 rounded-[1.5rem] border border-docka-50 dark:border-zinc-700/50">
                                                 <h4 className="text-[10px] font-black text-docka-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                     <User size={14} /> Contato Principal
                                                 </h4>
                                                 <div className="space-y-6">
                                                     <div>
                                                         <label className="text-[9px] font-black text-docka-400 uppercase tracking-widest mb-1.5 block">Nome Direto</label>
                                                         <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{selectedClient.name}</p>
                                                     </div>
                                                     <div>
                                                         <label className="text-[9px] font-black text-docka-400 uppercase tracking-widest mb-1.5 block">Canais de ComunicaÃ§Ã£o</label>
                                                         <div className="flex flex-col gap-2">
                                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                                                <Mail size={14} className="text-blue-500" /> {selectedClient.email}
                                                            </p>
                                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                                                <Phone size={14} className="text-emerald-500" /> {selectedClient.phone}
                                                            </p>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                         <div>
                                            <h4 className="text-[10px] font-black text-docka-300 uppercase tracking-widest mb-4">Notas EstratÃ©gicas</h4>
                                            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/30 dark:border-amber-800/20 rounded-2xl">
                                                <p className="text-xs text-amber-800 dark:text-amber-300 italic leading-relaxed">
                                                    "Cliente focado em expansÃ£o internacional (EUA e Europa). Priorizar monitoramento de marcas similares nestas jurisdiÃ§Ãµes."
                                                </p>
                                            </div>
                                         </div>
                                     </div>
                                 )}

                                 {activeTab === 'processes' && (
                                     <div className="grid grid-cols-1 gap-4">
                                         {selectedClient.processes?.map((proc, idx) => (
                                             <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-[1.5rem] border border-docka-50 dark:border-zinc-800 flex justify-between items-center group hover:border-blue-400 transition-all cursor-pointer">
                                                 <div className="flex items-center gap-4">
                                                     <div className="w-12 h-12 bg-docka-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-docka-300 group-hover:text-blue-500 transition-colors">
                                                         <Shield size={24} />
                                                     </div>
                                                     <div>
                                                         <h5 className="text-sm font-black text-docka-900 dark:text-zinc-100 tracking-tight">{proc.brand}</h5>
                                                         <p className="text-[10px] font-black text-docka-300 uppercase tracking-widest mt-0.5">Proc: {proc.id} â€¢ {proc.class}</p>
                                                     </div>
                                                 </div>
                                                 <span className="px-4 py-1.5 bg-docka-50 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest text-docka-400 rounded-full border border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-900">
                                                     {proc.status}
                                                 </span>
                                             </div>
                                         ))}
                                     </div>
                                 )}

                                 {activeTab === 'financial' && (
                                     <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-docka-50 dark:border-zinc-800 overflow-hidden shadow-sm">
                                         <table className="w-full text-left">
                                             <thead className="bg-docka-50/50 dark:bg-zinc-800/50 text-docka-300 font-black text-[9px] uppercase tracking-widest border-b border-docka-50 dark:border-zinc-800">
                                                 <tr>
                                                     <th className="px-6 py-4">Fatura</th>
                                                     <th className="px-6 py-4">Valor</th>
                                                     <th className="px-6 py-4">Vencimento</th>
                                                     <th className="px-6 py-4 text-right">Status</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                                 {selectedClient.invoices?.map((inv, idx) => (
                                                     <tr key={idx} className="hover:bg-docka-50/30 dark:hover:bg-zinc-800/30">
                                                         <td className="px-6 py-4">
                                                             <p className="text-xs font-black text-docka-900 dark:text-zinc-100">{inv.desc}</p>
                                                             <p className="text-[9px] font-bold text-docka-300 uppercase tracking-widest">ID: {inv.id}</p>
                                                         </td>
                                                         <td className="px-6 py-4 text-sm font-black text-docka-900 dark:text-zinc-100">{inv.value}</td>
                                                         <td className="px-6 py-4 text-[10px] font-black text-docka-300 uppercase">{inv.date}</td>
                                                         <td className="px-6 py-4 text-right">
                                                             <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                 inv.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                                             }`}>
                                                                 {inv.status}
                                                             </span>
                                                         </td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                 )}

                                 {activeTab === 'docs' && (
                                     <div className="grid grid-cols-2 gap-4">
                                         {selectedClient.documents?.map((doc, idx) => (
                                             <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-docka-50 dark:border-zinc-800 rounded-2xl flex items-center justify-between group hover:shadow-lg transition-all">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl flex items-center justify-center">
                                                         <FileText size={20} />
                                                     </div>
                                                     <div>
                                                         <p className="text-xs font-black text-docka-900 dark:text-zinc-100 truncate w-32">{doc.name}</p>
                                                         <p className="text-[9px] font-black text-docka-300 uppercase">{doc.type}</p>
                                                     </div>
                                                 </div>
                                                 <button className="text-docka-300 hover:text-blue-500 transition-colors">
                                                     <Download size={18} />
                                                 </button>
                                             </div>
                                         ))}
                                     </div>
                                 )}
                             </div>
                        </div>
                    </Modal>
                )}

                {/* MODAL NOVO CLIENTE 3.0 */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Cadastrar Elite"
                    size="lg"
                    footer={
                        <div className="flex gap-3 justify-end w-full">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-docka-300 hover:text-docka-500 transition-colors">Descartar</button>
                            <button onClick={handleCreateClient} disabled={isLoading} className="px-8 py-2.5 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-docka-900/20 disabled:opacity-50">
                                {isLoading ? 'Processando...' : 'Confirmar Registro'}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-6 pt-2">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-docka-300 uppercase tracking-[0.2em] mb-2">RazÃ£o Social / Nome</label>
                                <input
                                    value={newClient.company}
                                    onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                                    className="w-full h-12 px-4 bg-docka-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-docka-100 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-docka-300 uppercase tracking-[0.2em] mb-2">ResponsÃ¡vel</label>
                                <input
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                    className="w-full h-12 px-4 bg-docka-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-docka-100 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-docka-300 uppercase tracking-[0.2em] mb-2">Email Corporativo</label>
                                <input
                                    type="email"
                                    value={newClient.email}
                                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                                    className="w-full h-12 px-4 bg-docka-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-docka-100 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-docka-300 uppercase tracking-[0.2em] mb-2">Identificador TributÃ¡rio</label>
                                <input
                                    value={newClient.cnpj}
                                    onChange={e => setNewClient({ ...newClient, cnpj: e.target.value })}
                                    className="w-full h-12 px-4 bg-docka-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-docka-100 transition-all outline-none"
                                    placeholder="CPF ou CNPJ"
                                />
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* MODAL EXCLUSÃƒO 3.0 */}
                <Modal
                    isOpen={!!clientToDelete}
                    onClose={() => setClientToDelete(null)}
                    title=""
                    size="sm"
                >
                    <div className="p-4 text-center">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h4 className="text-xl font-black text-docka-900 dark:text-zinc-100 tracking-tight mb-2">Encerrar Relacionamento?</h4>
                        <p className="text-xs font-bold text-docka-300 uppercase tracking-widest leading-relaxed mb-8 px-4">
                            Esta aÃ§Ã£o removerÃ¡ {clientToDelete?.company} permanentemente do ecossistema.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDelete} className="w-full py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-[1.02] transition-all">Confirmar ExclusÃ£o</button>
                            <button onClick={() => setClientToDelete(null)} className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-docka-300 hover:text-docka-500">Manter Cliente</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </DashboardPage>
    );
};

export default AsteryskoClientsView;
