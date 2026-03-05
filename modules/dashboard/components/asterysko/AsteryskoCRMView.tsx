
import React, { useState, useEffect } from 'react';
import KanbanBoard from '../kanban/KanbanBoard';
import { KanbanColumnData, KanbanCardData } from '../../../../types';
import { Plus, Users, Search, Filter, Kanban, List, ChevronDown } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import DealDetailsModal from './DealDetailsModal';
import api from '../../../../services/api';
import { DropResult } from '@hello-pangea/dnd';

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

const AsteryskoCRMView: React.FC = () => {
    return (
        <ErrorBoundary>
            <AsteryskoCRMViewContent />
        </ErrorBoundary>
    );
};

const AsteryskoCRMViewContent: React.FC = () => {
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
        clientId: '', // New field for linking
        feeId: '' // Field for standardized fee
    });

    const [fees, setFees] = useState<any[]>([]);

    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        // Fetch clients for the dropdown
        api.get('/asterysko/clients').then(res => setClients(res.data)).catch(err => console.error('Error loading clients:', err));
        // Fetch fees
        api.get('/asterysko/fees').then(res => setFees(res.data)).catch(err => console.error('Error loading fees:', err));
    }, []);

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
        const fee = fees.find(f => f.id === feeId);
        if (fee) {
            setNewLead(prev => ({
                ...prev,
                feeId: fee.id,
                value: Number(fee.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                service: fee.name
            }));
        } else {
            setNewLead(prev => ({ ...prev, feeId: '' }));
        }
    };

    useEffect(() => {
        console.log('AsteryskoCRMView MOUNTED');
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        console.log('Fetching deals...');
        try {
            const response = await api.get('/asterysko/crm/deals');
            console.log('Deals response:', response.data);
            if (Array.isArray(response.data)) {
                setColumns(response.data);
            } else {
                console.error('API returned non-array data for deals:', response.data);
                setColumns([]);
            }
        } catch (error) {
            console.error('Failed to fetch deals', error);
            setColumns([]);
        } finally {
            setLoading(false);
            console.log('Loading set to false');
        }
    };

    if (loading) {
        console.log('Rendering LOADING state');
        return <div className="p-8 text-center text-docka-500">Carregando CRM...</div>;
    }

    console.log('Rendering MAIN state. Columns:', columns.length, 'ViewMode:', viewMode);

    const handleCardClick = async (card: KanbanCardData) => {
        setSelectedCard(card);
        setIsDealDetailsModalOpen(true);

        if (card.unread) {
            try {
                await api.patch(`/asterysko/crm/deals/${card.id}/read`);

                // Atualiza o estado da UI para evitar clicks duplos
                setColumns(prev => prev.map(col => ({
                    ...col,
                    cards: col.cards.map(c => c.id === card.id ? { ...c, unread: false } : c)
                })));

                // Dispara o evento pro Sidebar Navigation descontar
                window.dispatchEvent(new CustomEvent('asterysko-lead-read'));
            } catch (error) {
                console.error('Falhou ao marcar o card como lido', error);
            }
        }
    };



    // Hooks must be before conditional returns
    if (loading) return <div className="p-8 text-center text-docka-500">Carregando CRM...</div>;

    const handleCreateLead = async () => {
        try {
            await api.post('/asterysko/crm/deals', {
                title: newLead.title,
                subtitle: newLead.contactName, // Using contact name as subtitle for now
                contactName: newLead.contactName,
                contactEmail: newLead.contactEmail,
                contactPhone: newLead.contactPhone,
                value: newLead.value ? parseFloat(newLead.value.replace('R$', '').replace('.', '').replace(',', '.')) : 0,
                priority: 'medium',
                status: newLead.status,
                clientId: newLead.clientId, // Pass clientId
                tags: [
                    { label: newLead.service, color: 'bg-blue-100 text-blue-700' },
                    { label: newLead.source, color: 'bg-gray-100 text-gray-700' }
                ]
            });
            setIsNewLeadModalOpen(false);
            setNewLead({ title: '', contactName: '', contactPhone: '', contactEmail: '', service: 'Registro de Marca (Mista)', source: 'Site (Orgânico)', value: '', status: 'leads', clientId: '', feeId: '' });
            fetchDeals(); // Refresh board
        } catch (error) {
            console.error('Error creating lead', error);
            alert('Erro ao criar lead. Tente novamente.');
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

        // Optimistic UI Update
        const newColumns = [...columns];
        const sourceColIdx = newColumns.findIndex(col => col.id === source.droppableId);
        const destColIdx = newColumns.findIndex(col => col.id === destination.droppableId);

        if (sourceColIdx === -1 || destColIdx === -1) return;

        const sourceCol = newColumns[sourceColIdx];
        const destCol = newColumns[destColIdx];

        const [movedCard] = sourceCol.cards.splice(source.index, 1);
        destCol.cards.splice(destination.index, 0, movedCard);

        setColumns(newColumns);

        // API Call
        try {
            await api.put(`/asterysko/crm/deals/${draggableId}/status`, { status: destination.droppableId });
        } catch (error) {
            console.error('Error moving card', error);
            fetchDeals(); // Revert on error
        }
    };

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        const floatValue = parseFloat(numericValue) / 100;
        return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="h-full flex flex-col bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 transition-colors">

            {/* Header similar to Tokyon */}
            <div className="bg-white dark:bg-zinc-900 border-b border-docka-200 dark:border-zinc-800 px-8 py-5 shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Pipeline de Vendas (PI)</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie os leads e o processo comercial de novos registros.</p>
                    </div>
                    <button
                        onClick={() => setIsNewLeadModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Novo Lead
                    </button>
                </div>

                <div className="flex justify-between items-end">
                    {/* View Tabs */}
                    <div className="flex space-x-6">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${viewMode === 'kanban' ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                        >
                            Funil de Vendas
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${viewMode === 'list' ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                        >
                            Todos os Leads
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 mb-1">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input className="pl-8 pr-3 py-1.5 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400 dark:focus:border-zinc-500 transition-colors w-40 text-docka-900 dark:text-zinc-100" placeholder="Filtrar..." />
                        </div>
                        <button className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200"><Filter size={14} /></button>
                        <button className="p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200"><Users size={14} /></button>
                        <div className="w-px h-6 bg-docka-200 dark:bg-zinc-800 mx-1" />
                        <button className="p-1.5 bg-docka-100 dark:bg-zinc-800 rounded text-docka-900 dark:text-zinc-100"><Kanban size={14} /></button>
                        <button className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"><List size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">
                {columns.length > 0 ? (
                    viewMode === 'kanban' ? (
                        <KanbanBoard
                            columns={columns}
                            onCardClick={handleCardClick}
                            onAddCard={handleAddCard}
                            onDragEnd={handleDragEnd}
                        />
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4">Título</th>
                                        <th className="px-6 py-4">Contato</th>
                                        <th className="px-6 py-4">Valor</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                    {columns.flatMap(col => col.cards).map(card => (
                                        <tr key={card.id} onClick={() => handleCardClick(card)} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                                            <td className="px-6 py-4 font-medium text-docka-900 dark:text-zinc-100">{card.title}</td>
                                            <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{card.subtitle || '-'}</td>
                                            <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">{card.value || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase bg-docka-100 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300`}>
                                                    {columns.find(c => c.cards.some(cd => cd.id === card.id))?.title}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-docka-500 dark:text-zinc-500">{card.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {columns.flatMap(col => col.cards).length === 0 && (
                                <div className="p-8 text-center text-docka-400 dark:text-zinc-500">Nenhum lead encontrado.</div>
                            )}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-docka-400 dark:text-zinc-500">
                        <Kanban size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">Não foi possível carregar o pipeline.</p>
                        <p className="text-sm">Verifique a conexão com o servidor ou tente recarregar.</p>
                        <button onClick={fetchDeals} className="mt-4 text-blue-500 hover:underline">Tentar novamente</button>
                    </div>
                )}
            </div>

            {/* MODAL: NEW LEAD (Asterysko Specific) */}
            <Modal
                isOpen={isNewLeadModalOpen}
                onClose={() => setIsNewLeadModalOpen(false)}
                title="Novo Lead de Registro"
                footer={
                    <>
                        <button onClick={() => setIsNewLeadModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button onClick={handleCreateLead} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm">Criar Lead</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente Existente (Opcional)</label>
                        <div className="relative mb-3">
                            <div
                                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100 cursor-pointer flex items-center justify-between"
                            >
                                <span className="truncate">
                                    {clients.find(c => c.id === newLead.clientId)?.name ?
                                        `${clients.find(c => c.id === newLead.clientId).name} (${clients.find(c => c.id === newLead.clientId).company || 'Sem Empresa'})` :
                                        '-- Novo Cliente / Não Selecionado --'}
                                </span>
                                <ChevronDown size={14} className={`text-docka-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isClientDropdownOpen && (
                                <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-2 border-b border-docka-100 dark:border-zinc-800">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400" />
                                            <input
                                                autoFocus
                                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400"
                                                placeholder="Pesquisar cliente..."
                                                value={clientSearch}
                                                onChange={(e) => setClientSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                                        <div
                                            onClick={() => {
                                                setNewLead(prev => ({ ...prev, clientId: '' }));
                                                setIsClientDropdownOpen(false);
                                                setClientSearch('');
                                            }}
                                            className="px-3 py-2 text-sm text-docka-500 italic hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                                        >
                                            -- Novo Cliente / Não Selecionado --
                                        </div>
                                        {(clients || []).filter(c =>
                                            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                            (c.company && c.company.toLowerCase().includes(clientSearch.toLowerCase()))
                                        ).map(c => (
                                            <div
                                                key={c.id}
                                                onClick={() => {
                                                    handleClientSelect(c.id);
                                                    setIsClientDropdownOpen(false);
                                                    setClientSearch('');
                                                }}
                                                className="px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                                            >
                                                <div className="font-medium">{c.name}</div>
                                                <div className="text-[10px] opacity-60">{c.company || 'Sem Empresa'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Marca / Empresa / Título do Lead</label>
                        <div className="relative">
                            <input
                                value={newLead.title}
                                onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                placeholder="Ex: Marca Exemplo"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Serviço de Interesse</label>
                            <select
                                value={newLead.service}
                                onChange={(e) => setNewLead({ ...newLead, service: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                            >
                                <option>Registro de Marca (Mista)</option>
                                <option>Registro de Marca (Nominativa)</option>
                                <option>Registro de Patente</option>
                                <option>Oposição</option>
                                <option>Outro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Origem do Lead</label>
                            <select
                                value={newLead.source}
                                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                            >
                                <option>Site (Orgânico)</option>
                                <option>Instagram Ads</option>
                                <option>Google Ads</option>
                                <option>Outro</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Honorário Padrão (Tabela)</label>
                            <select
                                value={newLead.feeId}
                                onChange={(e) => handleFeeSelect(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                            >
                                <option value="">-- Personalizado / Outro --</option>
                                {fees.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} (R$ {Number(f.value).toLocaleString('pt-BR')})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome do Contato</label>
                            <input
                                value={newLead.contactName}
                                onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                placeholder="Nome do decisor"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Telefone / WhatsApp</label>
                            <div className="relative">
                                <input
                                    value={newLead.contactPhone}
                                    onChange={(e) => setNewLead({ ...newLead, contactPhone: maskPhone(e.target.value) })}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">E-mail</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={newLead.contactEmail}
                                onChange={(e) => setNewLead({ ...newLead, contactEmail: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                placeholder="contato@empresa.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Valor Estimado</label>
                        <div className="relative">
                            <input
                                value={newLead.value}
                                onChange={(e) => setNewLead({ ...newLead, value: maskCurrency(e.target.value) })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                placeholder="R$ 0,00"
                            />
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
            />
        </div>
    );
};

export default AsteryskoCRMView;
