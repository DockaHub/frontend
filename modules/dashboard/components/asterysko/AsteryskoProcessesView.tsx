import React, { useState, useEffect, useRef } from 'react';
import { Plus, MoreVertical, Loader2, X, Mail, Phone, MapPin, Calendar, FileText, Edit3, Archive, Trash2, RotateCcw } from 'lucide-react';
import api, { getBackendUrl } from '../../../../services/api';
import { Organization } from '../../../../types';
import AsteryskoNewProcessModal from './AsteryskoNewProcessModal';
import AsteryskoEditProcessModal from './AsteryskoEditProcessModal';

const ProcessBrandLogo: React.FC<{ logoUrl?: string; brandName: string }> = ({ logoUrl, brandName }) => {
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [logoUrl]);

    const resolveUrl = (rawUrl?: string): string => {
        if (!rawUrl) return '';
        if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
            return rawUrl;
        }
        const base = getBackendUrl();
        return `${base}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    };

    const resolved = logoUrl ? resolveUrl(logoUrl) : '';

    if (!resolved || imgError) {
        return (
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 select-none">
                {(brandName || 'M').substring(0, 1).toUpperCase()}
            </div>
        );
    }

    return (
        <img 
            src={resolved} 
            alt={brandName}
            className="w-8 h-8 rounded-lg object-contain border border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900"
            onError={() => setImgError(true)}
        />
    );
};

interface Process {
    id: string;
    inpiProcessNumber?: string;
    status: string;
    procurator?: string;
    filingDate?: string;
    concessionDate?: string;
    expirationDate?: string;
    certificateDate?: string;
    brand?: {
        name: string;
        type?: string;
        presentation?: string;
        nature?: string;
        brandType?: string;
        holders?: string;
        logoUrl?: string;
        nclClasses?: string[];
        nclSpecification?: string;
        client?: {
            id: string;
            type: string;
            cpfCnpj: string;
            rg?: string;
            address: string;
            city: string;
            state: string;
            postalCode: string;
            createdAt?: string;
            user?: {
                name: string;
                email: string;
                phone: string;
                avatar?: string;
            }
        }
    };
}

interface Props {
    organization?: Organization;
}

const getStatusLabelAndColor = (status: string) => {
    const st = status?.toUpperCase() || '';
    switch (st) {
        case 'NEW':
        case 'NOVO':
            return { label: 'Novo', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' };
        case 'WAITING_PAYMENT':
        case 'AGUARDANDO_PAGAMENTO':
            return { label: 'Aguardando Pagamento', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' };
        case 'PAID':
        case 'PAGO':
            return { label: 'Pago', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' };
        case 'FILED':
        case 'PROTOCOLADO':
            return { label: 'Protocolado (RPI)', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400' };
        case 'EXAMINATION':
        case 'EXAME':
            return { label: 'Exame de Mérito', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' };
        case 'GRANTED':
        case 'CONCEDIDO':
        case 'DEFERIDO':
            return { label: 'Deferido', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-green-750 dark:text-green-400' };
        case 'OPPOSITION':
        case 'OPOSICAO':
        case 'OPOSIÇÃO':
            return { label: 'Oposição / Exigência', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' };
        case 'ARCHIVED':
        case 'ARQUIVADO':
            return { label: 'Arquivado', color: 'bg-zinc-150 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400' };
        case 'CANCELLED':
        case 'CANCELADO':
            return { label: 'Cancelado', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' };
        default:
            const l = status?.toLowerCase() || '';
            if (l === 'leads') return { label: 'Novo Lead', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' };
            if (l === 'preparation') return { label: 'Preparação', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400' };
            if (l === 'viability') return { label: 'Viabilidade', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' };
            if (l === 'contract') return { label: 'Contrato', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' };
            if (l === 'service_payment') return { label: 'Pagamento Serviço', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-green-750 dark:text-green-400' };
            if (l === 'documentation') return { label: 'Procuração/Docs', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' };
            if (l === 'federal_fee') return { label: 'Taxa Federal (GRU)', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' };
            if (l === 'ready_to_file') return { label: 'A Protocolar', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' };
            if (l === 'filed') return { label: 'Protocolado (RPI)', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400' };
            if (l === 'examination') return { label: 'Exame de Mérito', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' };
            if (l === 'opposition') return { label: 'Oposição / Exigência', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' };
            if (l === 'granted') return { label: 'Deferido', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-green-750 dark:text-green-400' };
            if (l === 'won') return { label: 'Concluído', color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' };
            
            return { label: status, color: 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300' };
    }
};

const AsteryskoProcessesView: React.FC<Props> = ({ organization }) => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<Process | null>(null);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const menuRef = useRef<HTMLDivElement | null>(null);

    const fetchProcesses = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/asterysko/processes');
            setProcesses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch processes', error);
            setProcesses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
    }, [organization?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleArchive = async (process: Process) => {
        setOpenMenuId(null);
        const isArchived = ['ARCHIVED', 'ARQUIVADO', 'CANCELLED', 'CANCELADO'].includes(process.status?.toUpperCase() || '');
        const newStatus = isArchived ? 'NEW' : 'ARCHIVED';
        try {
            await api.put(`/asterysko/processes/${process.id}`, { status: newStatus });
            fetchProcesses();
        } catch (error) {
            console.error('Error toggling archive status', error);
            alert('Erro ao alterar status do processo.');
        }
    };

    const handleDeleteProcess = async (process: Process) => {
        setOpenMenuId(null);
        const brandName = process.brand?.name || 'este processo';
        const confirmed = window.confirm(
            `Tem certeza que deseja excluir DEFINITIVAMENTE a marca/processo "${brandName}"?\n\nEsta ação apagará todas as faturas, documentos, histórico RPI e dados do CRM associados tanto no painel admin quanto no Portal do Cliente.`
        );
        if (!confirmed) return;

        try {
            await api.delete(`/asterysko/processes/${process.id}`);
            fetchProcesses();
        } catch (error) {
            console.error('Error deleting process', error);
            alert('Erro ao excluir processo.');
        }
    };

    const filteredProcesses = processes.filter((p) => {
        const st = p.status?.toUpperCase() || '';
        const isArchivedOrCancelled = st === 'ARCHIVED' || st === 'ARQUIVADO' || st === 'CANCELLED' || st === 'CANCELADO';
        if (activeTab === 'ACTIVE') return !isArchivedOrCancelled;
        if (activeTab === 'ARCHIVED') return isArchivedOrCancelled;
        return true;
    });

    const activeCount = processes.filter(p => !['ARCHIVED', 'ARQUIVADO', 'CANCELLED', 'CANCELADO'].includes(p.status?.toUpperCase() || '')).length;
    const archivedCount = processes.filter(p => ['ARCHIVED', 'ARQUIVADO', 'CANCELLED', 'CANCELADO'].includes(p.status?.toUpperCase() || '')).length;

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full font-sans transition-colors duration-300 flex flex-col relative z-0">
            {/* Modal Novo Processo */}
            <AsteryskoNewProcessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchProcesses} 
                organizationId={organization?.id}
            />

            {/* Modal Editar Processo */}
            <AsteryskoEditProcessModal
                isOpen={Boolean(editingProcess)}
                process={editingProcess}
                onClose={() => setEditingProcess(null)}
                onSuccess={fetchProcesses}
            />

            {/* Header */}
            <div className="flex items-center justify-between pt-8 px-10 pb-6 border-b border-[#e5e5e5] dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-6">
                    <span className="font-season text-[22px] font-[420] text-black dark:text-white">Processos</span>
                    
                    {/* Status Tabs */}
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab('ACTIVE')}
                            className={`px-3 py-1 rounded-full transition-colors ${
                                activeTab === 'ACTIVE'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            Ativos ({activeCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('ARCHIVED')}
                            className={`px-3 py-1 rounded-full transition-colors ${
                                activeTab === 'ARCHIVED'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            Arquivados ({archivedCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('ALL')}
                            className={`px-3 py-1 rounded-full transition-colors ${
                                activeTab === 'ALL'
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            Todos ({processes.length})
                        </button>
                    </div>
                </div>
                
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
                    ) : filteredProcesses.length === 0 ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <span className="text-sm font-semibold text-black dark:text-white">Nenhum processo encontrado.</span>
                        </div>
                    ) : (
                        filteredProcesses.map((process) => {
                            const brandName = process.brand?.name || 'Sem Marca';
                            const clientName = process.brand?.client?.user?.name || 'N/A';
                            const nclClasses = process.brand?.nclClasses || [];
                            const nclClass = nclClasses.length
                                ? `NCL ${nclClasses[0]}${nclClasses.length > 1 ? ` +${nclClasses.length - 1}` : ''}`
                                : '-';
                            const statusInfo = getStatusLabelAndColor(process.status);
                            const isArchived = ['ARCHIVED', 'ARQUIVADO', 'CANCELLED', 'CANCELADO'].includes(process.status?.toUpperCase() || '');

                            return (
                                <div key={process.id} className="grid grid-cols-12 px-10 py-5 border-b border-[#e5e5e5] dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors items-center relative group">
                                    
                                    <div className="col-span-3 flex items-center gap-3 pr-4">
                                        <ProcessBrandLogo logoUrl={process.brand?.logoUrl} brandName={brandName} />
                                        <span className="text-[13px] font-medium text-black dark:text-white truncate">
                                            {brandName}
                                        </span>
                                    </div>
                                    
                                    <div className="col-span-3 text-[13px] font-medium font-mono text-black dark:text-white pr-4 truncate">
                                        {process.inpiProcessNumber || 'N/A'}
                                    </div>
                                    
                                    <div 
                                        onClick={() => process.brand?.client && setSelectedClient(process.brand.client)}
                                        className={`col-span-3 text-[13px] font-medium text-black dark:text-white pr-4 truncate ${
                                            process.brand?.client ? 'cursor-pointer hover:underline hover:text-[#0412dd] dark:hover:text-blue-400 transition-colors' : ''
                                        }`}
                                    >
                                        {clientName}
                                    </div>
                                    
                                    <div className="col-span-1 text-[13px] font-medium font-mono text-black dark:text-white pr-4 truncate">
                                        {nclClass}
                                    </div>
                                    
                                    <div className="col-span-2 pl-4 pr-12">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    
                                    {/* Action Menu - Floating right */}
                                    <div className="absolute right-8 z-10" ref={openMenuId === process.id ? menuRef : null}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === process.id ? null : process.id);
                                            }}
                                            className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all opacity-80 group-hover:opacity-100"
                                            title="Opções do processo"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === process.id && (
                                            <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                                                <button
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setEditingProcess(process);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <Edit3 size={14} className="text-zinc-500" />
                                                    Editar Processo
                                                </button>

                                                <button
                                                    onClick={() => handleToggleArchive(process)}
                                                    className="w-full px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 flex items-center gap-2.5 transition-colors"
                                                >
                                                    {isArchived ? (
                                                        <>
                                                            <RotateCcw size={14} className="text-blue-500" />
                                                            Reativar Processo
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Archive size={14} className="text-amber-500" />
                                                            Arquivar Processo
                                                        </>
                                                    )}
                                                </button>

                                                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                                                <button
                                                    onClick={() => handleDeleteProcess(process)}
                                                    className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Excluir Definitivamente
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Sliding Side Panel (Drawer) for Client Details */}
            {selectedClient && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" 
                        onClick={() => setSelectedClient(null)} 
                    />
                    
                    {/* Drawer container */}
                    <div className="fixed inset-y-0 right-0 w-[450px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-8 flex flex-col justify-between animate-in slide-in-from-right duration-300">
                        <div className="flex flex-col gap-6 overflow-y-auto flex-1 pr-2">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="font-season text-lg font-medium text-black dark:text-white">Perfil do Titular</span>
                                <button 
                                    onClick={() => setSelectedClient(null)}
                                    className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Client Header Info */}
                            <div className="flex items-center gap-4 py-2">
                                {selectedClient.user?.avatar ? (
                                    <img 
                                        src={selectedClient.user.avatar} 
                                        alt={selectedClient.user.name} 
                                        className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-850"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-[#0412dd]/10 dark:bg-[#3b48ff]/10 border border-[#0412dd]/20 dark:border-[#3b48ff]/20 flex items-center justify-center text-xl font-bold text-[#0412dd] dark:text-[#3b48ff] select-none">
                                        {(selectedClient.user?.name || 'C').substring(0, 1).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h4 className="font-bold text-base text-zinc-900 dark:text-white truncate">
                                        {selectedClient.user?.name || 'Sem nome'}
                                    </h4>
                                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 px-2 py-0.5 rounded">
                                        {selectedClient.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                                    </span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="flex flex-col gap-5 mt-4">
                                {/* Contato */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Contato</span>
                                    
                                    <div className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                        <Mail size={14} className="text-zinc-400 shrink-0" />
                                        <span className="truncate">{selectedClient.user?.email || 'Nenhum e-mail cadastrado'}</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                        <Phone size={14} className="text-zinc-400 shrink-0" />
                                        <span>{selectedClient.user?.phone || 'Nenhum telefone cadastrado'}</span>
                                    </div>
                                </div>

                                {/* Dados Cadastrais */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Documentação</span>
                                    
                                    <div className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                        <FileText size={14} className="text-zinc-400 shrink-0" />
                                        <div>
                                            <span className="font-semibold">{selectedClient.type === 'PJ' ? 'CNPJ' : 'CPF'}: </span>
                                            <span>{selectedClient.cpfCnpj || 'Não preenchido'}</span>
                                        </div>
                                    </div>

                                    {selectedClient.rg && (
                                        <div className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                            <FileText size={14} className="text-zinc-400 shrink-0" />
                                            <div>
                                                <span className="font-semibold">RG: </span>
                                                <span>{selectedClient.rg}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Endereço */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Endereço</span>
                                    
                                    <div className="flex items-start gap-3 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                        <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-0.5 leading-relaxed">
                                            <span>{selectedClient.address || 'Nenhum endereço cadastrado'}</span>
                                            {(selectedClient.city || selectedClient.state) && (
                                                <span>{selectedClient.city} - {selectedClient.state}</span>
                                            )}
                                            {selectedClient.postalCode && (
                                                <span className="text-[10px] font-semibold text-zinc-400 mt-1">CEP: {selectedClient.postalCode}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Data de Criação */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Cadastro</span>
                                    
                                    <div className="flex items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                                        <Calendar size={14} className="text-zinc-400 shrink-0" />
                                        <span>Cliente ativo desde: {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString('pt-BR') : 'Sem data'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => setSelectedClient(null)}
                                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 font-sans text-xs font-semibold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AsteryskoProcessesView;
