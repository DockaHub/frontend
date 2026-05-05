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
    Download,
    Clock
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api, { getBackendUrl } from '../../../../services/api';
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
    processes: { id: string, brand: string, class: string, status: string, contractSignDate?: string, contractSignStatus?: string, paymentStatus?: string, proxySignStatus?: string, filingDate?: string, dispatches?: any[] }[];
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
    const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'financial' | 'docs' | 'timeline'>('overview');
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

    // Timeline logic helper
    const getTimelineEvents = (process: any, invoices: any[] = []) => {
        const events: any[] = [];
        
        // 1. Contrato
        events.push({
            id: 'contract',
            type: 'contract',
            title: 'Contrato Assinado',
            date: process.contractSignDate ? new Date(process.contractSignDate).toLocaleDateString('pt-BR') : (process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : ''),
            desc: process.contractSignStatus === 'SIGNED' ? 'Contrato eletrônico assinado com sucesso.' : 'Aguardando assinatura do contrato.',
            status: process.contractSignStatus,
            url: process.contractSignStatus === 'SIGNED' ? `${getBackendUrl()}/api/asterysko/public/deals/${process.dealId}/contract?token=${localStorage.getItem('token')}` : undefined,
            createdAt: process.contractSignDate || process.createdAt
        });

        // 2. Honorários
        const serviceInvoice = invoices.find(i => i.type === 'SERVICE' && (i.id === process.invoiceId || i.desc?.includes(process.brand)));
        events.push({
            id: 'service-payment',
            type: 'invoice',
            title: 'Honorários Profissionais',
            date: serviceInvoice?.date || '',
            desc: (serviceInvoice?.status === 'paid' || process.paymentStatus === 'PAID') ? 'Pagamento dos honorários confirmado.' : 'Aguardando pagamento dos honorários iniciais.',
            status: serviceInvoice?.status || process.paymentStatus,
            url: serviceInvoice?.url || undefined,
            createdAt: serviceInvoice?.date || process.createdAt
        });

        // 3. Confirmação de Pagamento
        if (serviceInvoice?.status === 'paid' || process.paymentStatus === 'PAID') {
            events.push({
                id: 'payment-confirmation',
                type: 'dispatch',
                title: 'Pagamento Recebido',
                date: serviceInvoice?.date || '',
                desc: 'Identificamos o pagamento dos honorários iniciais com sucesso.',
                status: 'PAID',
                createdAt: serviceInvoice?.date || process.createdAt
            });
        }

        // 4. Procuração
        const token = localStorage.getItem('token');
        events.push({
            id: 'proxy',
            type: 'proxy',
            title: 'Procuração INPI',
            date: process.updatedAt ? new Date(process.updatedAt).toLocaleDateString('pt-BR') : '',
            desc: process.proxySignStatus === 'VALIDATED' ? 'Procuração validada pela equipe' : (process.proxySignStatus === 'SIGNED' ? 'Procuração enviada e assinada' : 'Aguardando download e assinatura da Procuração'),
            status: process.proxySignStatus,
            url: process.proxySignedUrl 
                ? (process.proxySignedUrl.startsWith('http') ? process.proxySignedUrl : `${getBackendUrl()}${process.proxySignedUrl}`)
                : (process.proxyUrl ? `${getBackendUrl()}/api/asterysko/processes/${process.id}/proxy/download-pdf?token=${token}` : undefined),
            createdAt: process.updatedAt || process.createdAt
        });

        // 5. Taxa Federal (GRU)
        if (process.gruUrl || process.gruStatus) {
            const rawUrl = process.gruReceiptUrl || process.gruUrl;
            events.push({
                id: 'gru-stage',
                type: 'gru',
                title: 'Taxa Federal (GRU)',
                date: process.updatedAt ? new Date(process.updatedAt).toLocaleDateString('pt-BR') : '',
                desc: process.gruStatus === 'PAID' ? 'Taxa Federal paga e validada.' : (process.gruUrl ? 'Boleto GRU disponível para pagamento.' : 'Aguardando emissão da taxa federal.'),
                status: process.gruStatus,
                url: process.gruUrl ? `${getBackendUrl()}/api/asterysko/processes/${process.id}/gru/download?token=${token}` : (rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `${getBackendUrl()}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}?token=${token}`) : undefined),
                createdAt: process.updatedAt || process.createdAt
            });
        }

        // 6. Depósito
        if (process.inpiProcessNumber || (process.status !== 'NEW' && process.status !== 'WAITING_PAYMENT')) {
            events.push({
                id: 'deposito',
                type: 'dispatch',
                title: 'Depósito do Pedido',
                date: process.filingDate ? new Date(process.filingDate).toLocaleDateString('pt-BR') : '',
                desc: `Protocolo gerado no INPI: ${process.inpiProcessNumber || 'Processando'}`,
                createdAt: process.filingDate || process.createdAt
            });
        }

        // 7. Despachos
        if (process.dispatches && process.dispatches.length > 0) {
            process.dispatches.forEach((d: any) => {
                events.push({
                    id: d.id,
                    type: 'dispatch',
                    title: d.description,
                    date: new Date(d.createdAt).toLocaleDateString('pt-BR'),
                    desc: d.details || `Publicado na RPI ${d.rpiNumber || '-'}`,
                    createdAt: d.createdAt
                });
            });
        }

        return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

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
                : `Gestão de clientes e contratos da ${organization?.name}.`}
            actions={
                <div className="flex gap-2">
                    <button 
                         onClick={() => addToast({ type: 'info', title: 'Exportar', message: 'Gerando CSV da carteira...' })}
                        className="p-2 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-docka-400 hover:text-docka-900 transition-all shadow-sm"
                    >
                        <Download size={16} />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-docka-800 dark:hover:bg-white/90 transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus size={14} /> Novo Cliente
                    </button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-4">
                
                {/* TOP METRICS DS 3.0 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Clientes', value: clients.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                        { label: 'Ativos em PI', value: clients.reduce((acc, c) => acc + (c.processesCount || 0), 0), icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                        { label: 'Pendente', value: 'R$ 12.450', icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                        { label: 'Health Score', value: '98%', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' },
                    ].map((m, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-all">
                            <div className={`w-10 h-10 ${m.bg} ${m.color} rounded-lg flex items-center justify-center`}>
                                <m.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500">{m.label}</p>
                                <p className="text-lg font-bold text-docka-900 dark:text-zinc-100">{m.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SEARCH & FILTERS */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden mb-8 transition-all">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={14} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 font-sans shadow-sm"
                                placeholder="Buscar por cliente, CNPJ ou email..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-docka-500 border border-docka-200 dark:border-zinc-700 hover:bg-docka-50/50 transition-all">Ativos</button>
                            <button className="px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-docka-400 border border-docka-200 dark:border-zinc-700 hover:text-docka-900 transition-all">PJs</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-bold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Titular / Empresa</th>
                                    <th className="px-6 py-4">Contato</th>
                                    <th className="px-6 py-4 text-center">Ativos</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {filteredClients.map((client) => (
                                    <tr
                                        key={client.id}
                                        onClick={() => { setSelectedClient(client); setActiveTab('overview'); }}
                                        className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-docka-700 to-indigo-800 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
                                                    {client.company.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm tracking-tight">{client.company}</div>
                                                    <div className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">{client.cnpj}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-docka-700 dark:text-zinc-300 text-xs">{client.name}</div>
                                            <div className="text-[10px] font-medium text-docka-400 dark:text-zinc-500">{client.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-docka-50 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 rounded-lg text-xs font-bold border border-docka-100 dark:border-zinc-700">
                                                {client.processesCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border shadow-sm ${
                                                client.status === 'active' ? 'bg-emerald-500 text-white border-emerald-500' :
                                                client.status === 'inactive' ? 'bg-rose-500 text-white border-rose-500' :
                                                'bg-amber-500 text-white border-amber-500'
                                            }`}>
                                                {client.status === 'active' ? 'Ativo' : client.status === 'inactive' ? 'Inativo' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleImpersonate(client.id); }}
                                                    className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
                                                    title="Acessar Portal"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-400 rounded-lg hover:text-docka-900 transition-all shadow-sm">
                                                    <ChevronRight size={14} />
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
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-docka-700 to-indigo-800 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                                            {selectedClient.company.substring(0, 1)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">
                                                    {selectedClient.company}
                                                </h2>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                                                    selectedClient.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                                }`}>
                                                    {selectedClient.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5">
                                                <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Building2 size={12} /> {selectedClient.cnpj}
                                                </p>
                                                <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <User size={12} /> {selectedClient.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleImpersonate(selectedClient.id)} 
                                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100 dark:border-blue-800/50"
                                        >
                                            Portal do Cliente
                                        </button>
                                        <button 
                                            onClick={() => setClientToDelete(selectedClient)}
                                            className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-800/50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* TABS PREMIUM */}
                                <div className="flex gap-8 border-b border-docka-100 dark:border-zinc-800">
                                    {[
                                        { id: 'overview', label: 'Dashboard', icon: Activity },
                                        { id: 'processes', label: 'Portfólio', icon: Shield },
                                        { id: 'timeline', label: 'Timeline', icon: Clock },
                                        { id: 'financial', label: 'Billing', icon: CreditCard },
                                        { id: 'docs', label: 'Arquivo', icon: FolderOpen },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`pb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                                                activeTab === tab.id ? 'text-docka-900 dark:text-white' : 'text-docka-400 hover:text-docka-600'
                                            }`}
                                        >
                                            <tab.icon size={14} />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-docka-900 dark:bg-white rounded-t-full shadow-sm" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             {/* CONTEÚDO DINÂMICO */}
                             <div className="p-8 h-[500px] overflow-y-auto custom-scrollbar bg-docka-50/20 dark:bg-zinc-900/20">
                                 {activeTab === 'overview' && (
                                     <div className="space-y-8">
                                         <div className="grid grid-cols-2 gap-6">
                                             <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-700/50 shadow-sm">
                                                 <h4 className="text-[10px] font-bold text-docka-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                     <Building2 size={14} /> Dados Corporativos
                                                 </h4>
                                                 <div className="space-y-6">
                                                     <div>
                                                         <label className="text-[9px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">Endereço Comercial</label>
                                                         <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-start gap-2">
                                                             <MapPin size={14} className="mt-0.5 text-blue-500" />
                                                             {selectedClient.address ? `${selectedClient.address}, ${selectedClient.city}/${selectedClient.state}` : 'Não cadastrado'}
                                                         </p>
                                                     </div>
                                                     <div className="grid grid-cols-2 gap-4">
                                                         <div>
                                                             <label className="text-[9px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">CNPJ / Identificador</label>
                                                             <p className="text-xs font-bold text-docka-900 dark:text-zinc-100 font-mono">{selectedClient.cnpj}</p>
                                                         </div>
                                                         <div>
                                                             <label className="text-[9px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">Status CRM</label>
                                                             <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{selectedClient.status}</p>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className="p-6 bg-white dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-700/50 shadow-sm">
                                                 <h4 className="text-[10px] font-bold text-docka-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                     <User size={14} /> Contato Principal
                                                 </h4>
                                                 <div className="space-y-6">
                                                     <div>
                                                         <label className="text-[9px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">Nome Direto</label>
                                                         <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{selectedClient.name}</p>
                                                     </div>
                                                     <div>
                                                         <label className="text-[9px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">Canais de Comunicação</label>
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
                                            <h4 className="text-[10px] font-bold text-docka-400 uppercase tracking-widest mb-4">Notas Estratégicas</h4>
                                            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-800/20 rounded-xl shadow-inner">
                                                <p className="text-xs text-amber-800 dark:text-amber-300 italic leading-relaxed">
                                                    "Cliente focado em expansão internacional (EUA e Europa). Priorizar monitoramento de marcas similares nestas jurisdições."
                                                </p>
                                            </div>
                                         </div>
                                     </div>
                                 )}

                                 {activeTab === 'processes' && (
                                     <div className="grid grid-cols-1 gap-3">
                                         {selectedClient.processes?.map((proc, idx) => (
                                             <div 
                                                key={idx} 
                                                onClick={() => {
                                                    addToast({ type: 'info', title: 'Processo', message: `Visualizando detalhes de ${proc.brand}...` });
                                                }}
                                                className="bg-white dark:bg-zinc-800/50 p-4 rounded-xl border border-docka-100 dark:border-zinc-700/50 flex justify-between items-center group hover:border-blue-300 dark:hover:border-blue-900 transition-all cursor-pointer shadow-sm"
                                             >
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 bg-docka-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-docka-400 group-hover:text-blue-500 transition-colors">
                                                         <Shield size={20} />
                                                     </div>
                                                     <div>
                                                         <h5 className="text-sm font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{proc.brand}</h5>
                                                         <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Proc: {proc.id} • {proc.class}</p>
                                                     </div>
                                                 </div>
                                                 <span className="px-3 py-1 bg-docka-50 dark:bg-zinc-800 text-[9px] font-bold uppercase tracking-widest text-docka-500 rounded-lg border border-docka-100 dark:border-zinc-700 group-hover:border-blue-200">
                                                     {proc.status}
                                                 </span>
                                             </div>
                                         ))}
                                     </div>
                                 )}

                                 {activeTab === 'timeline' && (
                                     <div className="space-y-6">
                                         {selectedClient.processes?.map((proc, pIdx) => (
                                             <div key={pIdx} className="space-y-4">
                                                 <h4 className="text-xs font-bold text-docka-900 dark:text-zinc-100 border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/30 dark:bg-blue-900/10 rounded-r-lg">
                                                     Timeline: {proc.brand}
                                                 </h4>
                                                 <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-docka-200 dark:before:bg-zinc-800">
                                                     {getTimelineEvents(proc, selectedClient.invoices || []).map((event, eIdx) => (
                                                         <div key={eIdx} className="relative">
                                                             <div className={`absolute -left-8 top-0 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center z-10 ${
                                                                 event.status === 'PAID' || event.status === 'SIGNED' || event.status === 'VALIDATED' ? 'bg-emerald-500 text-white' : 'bg-docka-100 dark:bg-zinc-800 text-docka-400'
                                                             }`}>
                                                                 <CheckCircle2 size={10} />
                                                             </div>
                                                             <div className="flex-1">
                                                                 <div className="flex justify-between items-start">
                                                                     <h5 className="text-sm font-bold text-docka-900 dark:text-zinc-100">{event.title}</h5>
                                                                     <span className="text-[10px] font-bold text-docka-400 uppercase">{event.date}</span>
                                                                 </div>
                                                                 <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1">{event.desc}</p>
                                                                 {event.url && (
                                                                     <button 
                                                                        onClick={() => window.open(event.url, '_blank')}
                                                                        className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-600 transition-colors"
                                                                     >
                                                                         <Download size={12} />
                                                                         Visualizar Documento
                                                                     </button>
                                                                 )}
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                         ))}
                                         {(!selectedClient.processes || selectedClient.processes.length === 0) && (
                                             <div className="text-center py-12">
                                                 <Clock size={32} className="mx-auto text-docka-200 mb-4 opacity-50" />
                                                 <p className="text-sm font-bold text-docka-400 uppercase tracking-widest">Nenhuma timeline disponível</p>
                                             </div>
                                         )}
                                     </div>
                                 )}

                                 {activeTab === 'financial' && (
                                     <div className="bg-white dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-700/50 overflow-hidden shadow-sm">
                                         <table className="w-full text-left">
                                             <thead className="bg-docka-50/50 dark:bg-zinc-800/80 text-docka-400 font-bold text-[9px] uppercase tracking-wider border-b border-docka-100 dark:border-zinc-700">
                                                 <tr>
                                                     <th className="px-6 py-4">Fatura</th>
                                                     <th className="px-6 py-4">Valor</th>
                                                     <th className="px-6 py-4">Vencimento</th>
                                                     <th className="px-6 py-4 text-right">Status</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-docka-50 dark:divide-zinc-700/50">
                                                 {selectedClient.invoices?.map((inv, idx) => (
                                                     <tr key={idx} className="hover:bg-docka-50/30 dark:hover:bg-zinc-800/50">
                                                         <td className="px-6 py-4">
                                                             <p className="text-xs font-bold text-docka-900 dark:text-zinc-100">{inv.desc}</p>
                                                             <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">ID: {inv.id}</p>
                                                         </td>
                                                         <td className="px-6 py-4 text-sm font-bold text-docka-900 dark:text-zinc-100">{inv.value}</td>
                                                         <td className="px-6 py-4 text-[10px] font-bold text-docka-400 uppercase">{inv.date}</td>
                                                         <td className="px-6 py-4 text-right">
                                                             <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
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
                                                 <button 
                                                    onClick={() => {
                                                        if (doc.url) {
                                                            const token = localStorage.getItem('token'); const fullUrl = doc.url.startsWith('http') ? doc.url : `${getBackendUrl()}${doc.url.startsWith('/') ? '' : '/'}${doc.url}${doc.url.includes('?') ? '&' : '?'}token=${token}`; window.open(fullUrl, '_blank');
                                                        } else {
                                                            addToast({ type: 'error', title: 'Erro', message: 'URL do documento não encontrada.' });
                                                        }
                                                    }}
                                                    className="text-docka-300 hover:text-blue-500 transition-colors"
                                                 >
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Razão Social / Nome</label>
                                <input
                                    value={newClient.company}
                                    onChange={e => setNewClient({ ...newClient, company: e.target.value })}
                                    className="w-full h-11 px-4 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-sm font-bold text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-docka-100 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Responsável</label>
                                <input
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                    className="w-full h-11 px-4 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-sm font-bold text-docka-900 dark:text-zinc-100 focus:ring-2 focus:ring-docka-100 transition-all outline-none"
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
                                <label className="block text-[10px] font-black text-docka-300 uppercase tracking-[0.2em] mb-2">Identificador Tributário</label>
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

                {/* MODAL EXCLUSÃO 3.0 */}
                <Modal
                    isOpen={!!clientToDelete}
                    onClose={() => setClientToDelete(null)}
                    title=""
                    size="sm"
                >
                    <div className="p-4 text-center">
                        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight mb-2">Encerrar Relacionamento?</h4>
                        <p className="text-xs font-bold text-docka-400 dark:text-zinc-400 uppercase tracking-widest leading-relaxed mb-8 px-4">
                            Esta ação removerá {clientToDelete?.company} permanentemente do ecossistema.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDelete} className="w-full py-3.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-rose-600 transition-all">Confirmar Exclusão</button>
                            <button onClick={() => setClientToDelete(null)} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-docka-300 hover:text-docka-500">Manter Cliente</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </DashboardPage>
    );
};

export default AsteryskoClientsView;


