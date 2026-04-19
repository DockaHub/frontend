
import React, { useState, useEffect } from 'react';
import KanbanBoard from '../kanban/KanbanBoard';
import { KanbanColumnData, KanbanCardData } from '../../../../types';
import { Plus, Users, Search, Filter, Kanban, List, ChevronDown, Tag, DollarSign } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import DealDetailsModal from './DealDetailsModal';
import api from '../../../../services/api';
import { DropResult } from '@hello-pangea/dnd';
import { useAuth } from '../../../../context/AuthContext';
import { Organization } from '../../../../types';
import DashboardPage from '../../../../components/DashboardPage';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-full overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Algo deu errado no CRM 🚨</h1>
                    <p className="mb-4">Por favor, tire um print desta tela e me envie:</p>
                    <pre className="bg-red-100 p-4 rounded text-sm font-mono whitespace-pre-wrap border border-red-200">
                        {this.state.error?.toString()}
                        {'\n\nStack:\n' + this.state.error?.stack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}



const AsteryskoCRMView: React.FC<{ organization?: Organization }> = ({ organization }) => {
    return (
        <ErrorBoundary>
            <AsteryskoCRMViewContent organization={organization} />
        </ErrorBoundary>
    );
};

const AsteryskoCRMViewContent: React.FC<{ organization?: Organization }> = ({ organization }) => {
    const { user } = useAuth();
    const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);
    const [columns, setColumns] = useState<KanbanColumnData[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [isDealDetailsModalOpen, setIsDealDetailsModalOpen] = useState(false);

    // Client Selector State
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    const [newLead, setNewLead] = useState({
        title: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        service: 'Registro de Marca (Mista)',
        source: 'Site (Orgânico)',
        value: '',
        status: 'leads',
        clientId: '',
        cnpj: '',
        address: '',
        razaoSocial: '',
        planType: 'ESSENCIAL',
        assignedUserId: '',
        planId: ''
    });

    const [plans, setPlans] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);

    useEffect(() => {
        api.get('/asterysko/clients').then(res => setClients(res.data)).catch(err => console.error('Error loading clients:', err));
        api.get('/asterysko/plans').then(res => setPlans(res.data)).catch(err => console.error('Error loading plans:', err));

        if (organization?.id) {
            api.get(`/organizations/${organization.id}/members`)
                .then(res => {
                    const staff = res.data.filter((m: any) => m.globalRole !== 'CLIENT');
                    setOrganizationMembers(staff);
                })
                .catch(err => console.error('Error loading members:', err));
        }
    }, [organization?.id]);

    const handleClientSelect = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setNewLead(prev => ({
                ...prev,
                clientId: client.id,
                contactName: client.name,
                contactEmail: client.email,
                contactPhone: client.phone || '',
                title: client.company !== 'Sem Empresa' ? client.company : client.name
            }));
        } else {
            setNewLead(prev => ({ ...prev, clientId: '' }));
        }
    };

    const handleFeeSelect = (feeId: string) => {
        const fee = plans.find(f => f.id === feeId);
        if (fee) {
            setNewLead(prev => ({
                ...prev,
                planId: fee.id,
                value: Number(fee.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                service: fee.name
            }));
        } else {
            setNewLead(prev => ({ ...prev, planId: '' }));
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const response = await api.get('/asterysko/crm/deals');
            if (Array.isArray(response.data)) {
                setColumns(response.data);
            } else {
                setColumns([]);
            }
        } catch (error) {
            console.error('Failed to fetch deals', error);
            setColumns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = async (card: KanbanCardData) => {
        setSelectedCard(card);
        setIsDealDetailsModalOpen(true);

        if (card.unread) {
            try {
                await api.patch(`/asterysko/crm/deals/${card.id}/read`);
                setColumns(prev => prev.map(col => ({
                    ...col,
                    cards: col.cards.map(c => c.id === card.id ? { ...c, unread: false } : c)
                })));
                window.dispatchEvent(new CustomEvent('asterysko-lead-read'));
            } catch (error) {
                console.error('Falhou ao marcar o card como lido', error);
            }
        }
    };

    const handleCreateLead = async () => {
        try {
            const tags = [
                { label: newLead.service, color: 'bg-blue-100 text-blue-700' },
                { label: newLead.source, color: 'bg-gray-100 text-gray-700' }
            ];

            if (newLead.cnpj) tags.push({ label: `CNPJ: ${newLead.cnpj}`, color: 'bg-indigo-100 text-indigo-700' });
            if (newLead.razaoSocial) tags.push({ label: `Razão Social: ${newLead.razaoSocial}`, color: 'bg-purple-100 text-purple-700' });
            if (newLead.address) tags.push({ label: `Endereço: ${newLead.address}`, color: 'bg-amber-100 text-amber-700' });

            const payload = {
                ...newLead,
                organizationId: organization?.id,
                assignedUserId: newLead.assignedUserId || user?.id,
                planId: newLead.planId,
                value: newLead.value ? parseFloat(newLead.value.replace('R$', '').replace('.', '').replace(',', '.')) : 0,
                tags
            };

            await api.post('/asterysko/crm/deals', payload);
            setIsNewLeadModalOpen(false);
            setNewLead({
                title: '', contactName: '', contactPhone: '', contactEmail: '',
                service: 'Registro de Marca (Mista)', source: 'Site (Orgânico)',
                value: '', status: 'leads', clientId: '', cnpj: '', address: '',
                razaoSocial: '', planType: 'ESSENCIAL', assignedUserId: '', planId: ''
            });
            fetchDeals();
        } catch (error) {
            console.error('Error creating lead', error);
            alert('Erro ao criar lead.');
        }
    };

    const handleAddCard = (columnId: string) => {
        setNewLead(prev => ({ ...prev, status: columnId }));
        setIsNewLeadModalOpen(true);
    };

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newColumns = [...columns];
        const sourceColIdx = newColumns.findIndex(col => col.id === source.droppableId);
        const destColIdx = newColumns.findIndex(col => col.id === destination.droppableId);

        if (sourceColIdx === -1 || destColIdx === -1) return;

        const sourceCol = newColumns[sourceColIdx];
        const destCol = newColumns[destColIdx];

        const [movedCard] = sourceCol.cards.splice(source.index, 1);
        destCol.cards.splice(destination.index, 0, movedCard);

        setColumns(newColumns);

        try {
            await api.put(`/asterysko/crm/deals/${draggableId}/status`, { status: destination.droppableId });
        } catch (error) {
            console.error('Error moving card', error);
            fetchDeals(); 
        }
    };

    const maskPhone = (value: string) => {
        return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        const floatValue = parseFloat(numericValue) / 100;
        return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <DashboardPage 
            title="Pipeline de Vendas (PI)" 
            icon={Kanban}
            actions={
                <div className="flex items-center gap-3">
                    <div className="flex bg-docka-50 dark:bg-zinc-800 p-1 rounded-lg border border-docka-100 dark:border-zinc-700 mr-2">
                        <button 
                            onClick={() => setViewMode('kanban')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 shadow-sm' : 'text-docka-400 hover:text-docka-600'}`}
                        >
                            Kanban
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 shadow-sm' : 'text-docka-400 hover:text-docka-600'}`}
                        >
                            Lista
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={14} />
                        <input className="pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-docka-100 w-48" placeholder="Filtrar leads..." />
                    </div>

                    <button
                        onClick={() => setIsNewLeadModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-docka-800 dark:hover:bg-white transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus size={14} /> Novo Lead
                    </button>
                </div>
            }
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 animate-in fade-in duration-500">
                    <div className="w-8 h-8 border-2 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold uppercase text-docka-400 tracking-widest">Sincronizando pipeline...</span>
                </div>
            ) : (
                <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden -mx-8 -my-6">
                    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                        {columns.length > 0 ? (
                            viewMode === 'kanban' ? (
                                <KanbanBoard
                                    columns={columns}
                                    onCardClick={handleCardClick}
                                    onAddCard={handleAddCard}
                                    onDragEnd={handleDragEnd}
                                    members={organizationMembers}
                                />
                            ) : (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-widest text-docka-500 dark:text-zinc-500 border-b border-docka-100 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-4">Título / Marca</th>
                                                <th className="px-6 py-4">Contato</th>
                                                <th className="px-6 py-4 text-right">Valor Estimado</th>
                                                <th className="px-6 py-4 text-center">Status Atual</th>
                                                <th className="px-6 py-4">Data de Entrada</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                            {columns.flatMap(col => col.cards).map(card => (
                                                <tr key={card.id} onClick={() => handleCardClick(card)} className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/20 cursor-pointer group transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">{card.title}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-docka-600 dark:text-zinc-400">{card.subtitle || '-'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{card.value || 'R$ 0,00'}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-docka-50 dark:bg-zinc-800 text-docka-500 dark:text-zinc-400 border border-docka-100 dark:border-zinc-700">
                                                            {columns.find(c => c.cards.some(cd => cd.id === card.id))?.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase">{card.date}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-docka-400 dark:text-zinc-500 p-20 border-2 border-dashed border-docka-100 dark:border-zinc-800 rounded-xl opacity-50">
                                <Kanban size={48} className="mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">O Pipeline estÃ¡ vazio no momento.</p>
                                <button onClick={fetchDeals} className="mt-4 text-[10px] font-bold uppercase text-indigo-600 hover:underline">Recarregar dados</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: NEW LEAD (Asterysko Specific) */}
            <Modal
                isOpen={isNewLeadModalOpen}
                onClose={() => setIsNewLeadModalOpen(false)}
                title="Novo Lead de Registro"
                footer={
                    <>
                        <button onClick={() => setIsNewLeadModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-docka-400 hover:bg-docka-50 rounded-lg transition-all">Cancelar</button>
                        <button onClick={handleCreateLead} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-all border border-transparent">Criar Lead no Funil</button>
                    </>
                }
            >
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    {/* Campos de formulÃ¡rio (mantendo lógica original com visual DS 3.0) */}
                    <div>
                        <label className="block text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Cliente Existente</label>
                        <div className="relative">
                            <div
                                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                className="w-full px-4 py-2.5 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-docka-200 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100 cursor-pointer flex items-center justify-between shadow-inner"
                            >
                                <span className="truncate">
                                    {clients.find(c => c.id === newLead.clientId)?.name ?
                                        `${clients.find(c => c.id === newLead.clientId).name}` :
                                        '-- Selecionar Cliente --'}
                                </span>
                                <ChevronDown size={14} className={`text-docka-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isClientDropdownOpen && (
                                <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-xl shadow-sm animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="p-3 border-b border-docka-50 dark:border-zinc-800">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-300" />
                                            <input
                                                autoFocus
                                                className="w-full pl-9 pr-3 py-2 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg outline-none focus:border-docka-400"
                                                placeholder="Filtrar por nome ou empresa..."
                                                value={clientSearch}
                                                onChange={(e) => setClientSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto p-2 custom-scrollbar">
                                        <div onClick={() => { setNewLead(prev => ({ ...prev, clientId: '' })); setIsClientDropdownOpen(false); }} className="px-4 py-2 text-xs text-docka-400 italic hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer">Desmarcar seleção</div>
                                        {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.company && c.company.toLowerCase().includes(clientSearch.toLowerCase()))).map(c => (
                                            <div key={c.id} onClick={() => { handleClientSelect(c.id); setIsClientDropdownOpen(false); }} className="px-4 py-2.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer flex flex-col">
                                                <span className="font-bold">{c.name}</span>
                                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">{c.company || 'Sem Empresa'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Marca / TÃ­tulo</label>
                            <input
                                value={newLead.title}
                                onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-docka-200 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100 shadow-sm"
                                placeholder="Ex: Asterysko Hub"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-widest mb-2">ResponsÃ¡vel Vendas</label>
                            <select
                                value={newLead.assignedUserId}
                                onChange={e => setNewLead({ ...newLead, assignedUserId: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-docka-200 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100 shadow-sm"
                            >
                                <option value="">-- Atribuir a Mim --</option>
                                {organizationMembers.map(m => (
                                    <option key={m.id} value={m.userId || m.id}>{m.user?.name || m.name || "Membro"}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-5 bg-blue-50/20 dark:bg-zinc-800/50 rounded-xl border border-blue-100/50 dark:border-zinc-700/50 space-y-4 shadow-inner">
                        <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                             <Tag size={12} /> ConfiguraÃ§Ãµes do Lead
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 uppercase mb-1.5 ml-1">ServiÃ§o</label>
                                <select value={newLead.service} onChange={(e) => setNewLead({ ...newLead, service: e.target.value })} className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 rounded-lg border border-blue-100 dark:border-zinc-700 outline-none">
                                    <option>Registro de Marca (Mista)</option>
                                    <option>Registro de Marca (Nominativa)</option>
                                    <option>Registro de Patente</option>
                                    <option>Oposição</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 uppercase mb-1.5 ml-1">Origem</label>
                                <select value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 rounded-lg border border-blue-100 dark:border-zinc-700 outline-none">
                                    <option>Site (Orgânico)</option>
                                    <option>Instagram Ads</option>
                                    <option>Google Ads</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Telefone / WhatsApp</label>
                            <input value={newLead.contactPhone} onChange={(e) => setNewLead({ ...newLead, contactPhone: maskPhone(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-docka-200 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100 shadow-sm" placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Valor Estimado</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input value={newLead.value} onChange={(e) => setNewLead({ ...newLead, value: maskCurrency(e.target.value) })} className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-xl text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-200 shadow-sm" placeholder="R$ 0,00" />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* MODAL: DEAL DETAILS */}
            <DealDetailsModal
                isOpen={isDealDetailsModalOpen}
                onClose={() => setIsDealDetailsModalOpen(false)}
                deal={selectedCard}
                onConvertSuccess={fetchDeals}
                organization={organization}
            />
        </DashboardPage>
    );
};

export default AsteryskoCRMView;
