import React, { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, RefreshCw, Globe, Settings, Edit, ShieldCheck } from 'lucide-react';
import { Organization } from '../../types';
import { mailService } from '../../services/mailService';
import { domainService, Domain } from '../../services/domainService';
import { useToast } from '../../context/ToastContext';
import { organizationService } from '../../services/organizationService';

interface MailboxManagerProps {
    organizations?: Organization[]; // Kept for consistency
}

// Extended Domain interface to include organization details from backend
interface ExtendedDomain extends Domain {
    organization?: {
        id: string;
        name: string;
        slug: string;
    },
    organizationId: string;
}

const MailboxManager: React.FC<MailboxManagerProps> = () => {
    // Data State
    const [allDomains, setAllDomains] = useState<ExtendedDomain[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [selectedDomainName, setSelectedDomainName] = useState<string>('');
    const [mailboxes, setMailboxes] = useState<any[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdatingDomain, setIsUpdatingDomain] = useState(false);
    const { addToast } = useToast();

    // -- Modals State --

    // New Mailbox Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMailboxName, setNewMailboxName] = useState('');
    const [newMailboxEmail, setNewMailboxEmail] = useState('');
    const [newMailboxType, setNewMailboxType] = useState('SHARED');

    // Edit Mailbox Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMailbox, setEditingMailbox] = useState<any>(null);
    const [editMailboxName, setEditMailboxName] = useState('');
    const [editMailboxEmailUser, setEditMailboxEmailUser] = useState('');
    const [editMailboxType, setEditMailboxType] = useState('SHARED');

    // Domain Config Modal
    const [isDomainConfigOpen, setIsDomainConfigOpen] = useState(false);
    const [selectedOrgForDomain, setSelectedOrgForDomain] = useState('');

    // Access Control Modal
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [selectedMailboxForAccess, setSelectedMailboxForAccess] = useState<any>(null);
    const [orgMembers, setOrgMembers] = useState<any[]>([]);


    // -- Effects --

    useEffect(() => {
        loadGlobalDomains();
        loadAllOrganizations();
    }, []);

    useEffect(() => {
        if (selectedDomainName) {
            loadMailboxes();
            loadOrgMembers();
        }
    }, [selectedDomainName]);

    // -- Loaders --

    const loadGlobalDomains = async () => {
        try {
            const domains = await domainService.listAllGlobal();
            setAllDomains(domains as ExtendedDomain[]); // Cast as our extended interface

            // Auto-select first verified or any domain if none selected
            if (!selectedDomainName && domains.length > 0) {
                const verified = domains.find(d => d.status === 'VERIFIED');
                setSelectedDomainName(verified ? verified.name : domains[0].name);
            }
        } catch (error) {
            console.error("Failed to load global domains", error);
            addToast({ type: 'error', title: 'Erro ao carregar domínios', duration: 4000 });
        }
    };

    const loadAllOrganizations = async () => {
        try {
            const orgs = await organizationService.listAllGlobal();
            setAllOrgs(orgs);
        } catch (error) {
            console.error("Failed to load organizations", error);
        }
    };

    const loadMailboxes = async () => {
        setIsLoading(true);
        try {
            const data = await mailService.getMailboxesByDomain(selectedDomainName);
            setMailboxes(data);
        } catch (error) {
            console.error("Failed to load mailboxes", error);
            addToast({ type: 'error', title: 'Erro ao carregar mailboxes', duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const loadOrgMembers = async () => {
        const domainObj = allDomains.find(d => d.name === selectedDomainName);
        if (domainObj && domainObj.organizationId) {
            try {
                const members = await organizationService.getMembers(domainObj.organizationId);
                setOrgMembers(members);
            } catch (error) {
                console.error("Failed to load org members", error);
            }
        }
    };

    // -- Handlers --

    const handleCreateMailbox = async (e: React.FormEvent) => {
        e.preventDefault();

        const domainObj = allDomains.find(d => d.name === selectedDomainName);
        if (!domainObj) {
            addToast({ type: 'error', title: 'Domínio inválido selecionado', duration: 3000 });
            return;
        }

        const fullEmail = `${newMailboxEmail}@${selectedDomainName}`;

        setIsCreating(true);
        try {
            await mailService.createMailbox(domainObj.organizationId, {
                name: newMailboxName,
                email: fullEmail,
                type: newMailboxType
            });

            addToast({ type: 'success', title: 'Mailbox criada com sucesso!', duration: 3000 });
            setIsModalOpen(false);
            setNewMailboxName('');
            setNewMailboxEmail('');
            loadMailboxes();
        } catch (error: any) {
            console.error("Failed to create mailbox", error);
            addToast({ type: 'error', title: 'Erro ao criar mailbox', duration: 3000 });
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditMailbox = (mailbox: any) => {
        setEditingMailbox(mailbox);
        setEditMailboxName(mailbox.name);
        // Extract username from email (user@domain.com)
        const [user] = mailbox.email.split('@');
        setEditMailboxEmailUser(user);
        setEditMailboxType(mailbox.type);
        setIsEditModalOpen(true);
    };

    const handleUpdateMailbox = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMailbox) return;

        const fullEmail = `${editMailboxEmailUser}@${selectedDomainName}`; // Assume domain doesn't change here

        setIsCreating(true); // Reuse loading state
        try {
            await mailService.updateMailbox(editingMailbox.id, {
                name: editMailboxName,
                email: fullEmail,
                type: editMailboxType
            });

            addToast({ type: 'success', title: 'Mailbox atualizada!', duration: 3000 });
            setIsEditModalOpen(false);
            loadMailboxes();
        } catch (error: any) {
            console.error("Failed to update mailbox", error);
            addToast({ type: 'error', title: 'Erro ao atualizar mailbox', duration: 3000 });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteMailbox = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta mailbox? Todos os emails serão perdidos.')) return;

        try {
            await mailService.deleteMailbox(id);
            addToast({ type: 'success', title: 'Mailbox excluída', duration: 3000 });
            loadMailboxes();
        } catch (error) {
            console.error("Failed to delete mailbox", error);
            addToast({ type: 'error', title: 'Erro ao excluir mailbox', duration: 3000 });
        }
    };

    const openDomainConfig = () => {
        const domainObj = allDomains.find(d => d.name === selectedDomainName);
        if (domainObj) {
            setSelectedOrgForDomain(domainObj.organizationId || (domainObj.organization?.id || ''));
            setIsDomainConfigOpen(true);
        }
    };

    const handleUpdateDomainOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        const domainObj = allDomains.find(d => d.name === selectedDomainName);
        if (!domainObj) return;

        setIsUpdatingDomain(true);
        try {
            await domainService.updateDomain(domainObj.id, {
                organizationId: selectedOrgForDomain
            });

            addToast({ type: 'success', title: 'Organização do domínio atualizada!', duration: 3000 });
            setIsDomainConfigOpen(false);
            // Reload global domains to reflect change
            await loadGlobalDomains();
            // Current mailboxes might still display old org name until re-fetched
            if (selectedDomainName) loadMailboxes();
        } catch (error: any) {
            console.error("Failed to update domain org", error);
            addToast({ type: 'error', title: 'Erro ao transferir domínio', duration: 3000 });
        } finally {
            setIsUpdatingDomain(false);
        }
    };

    // Access Control
    const handleOpenAccessModal = (mailbox: any) => {
        setSelectedMailboxForAccess(mailbox);
        setIsAccessModalOpen(true);
    };

    const handleToggleUserAccess = async (userId: string, hasAccess: boolean) => {
        if (!selectedMailboxForAccess) return;

        try {
            if (hasAccess) {
                await mailService.removeUser(selectedMailboxForAccess.id, userId);
            } else {
                await mailService.addUser(selectedMailboxForAccess.id, userId);
            }

            // Optimistic update
            const updatedMailboxes = mailboxes.map(mb => {
                if (mb.id === selectedMailboxForAccess.id) {
                    const currentUsers = mb.users || [];
                    if (hasAccess) {
                        return { ...mb, users: currentUsers.filter((u: any) => u.id !== userId) };
                    } else {
                        const userToAdd = orgMembers.find(m => m.user.id === userId)?.user;
                        return { ...mb, users: [...currentUsers, userToAdd] };
                    }
                }
                return mb;
            });
            setMailboxes(updatedMailboxes);

            // Update selected mailbox reference for modal
            const updatedSelected = updatedMailboxes.find(mb => mb.id === selectedMailboxForAccess.id);
            setSelectedMailboxForAccess(updatedSelected);

        } catch (error) {
            console.error("Failed to toggle access", error);
            addToast({ type: 'error', title: 'Erro ao alterar acesso', duration: 3000 });
        }
    };

    const selectedDomainObj = allDomains.find(d => d.name === selectedDomainName);

    return (
        <div className="bg-white rounded-xl border border-docka-200 shadow-sm overflow-hidden min-h-[500px]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-docka-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white gap-4">
                <div>
                    <h2 className="text-lg font-bold text-docka-900 flex items-center gap-2">
                        Gerenciamento de Mailboxes
                    </h2>
                    <p className="text-xs text-docka-500">Filtrado por domínio.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-end sm:items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={16} />
                            <select
                                className="pl-9 pr-8 py-2 text-sm bg-docka-50 border border-docka-200 rounded-lg outline-none focus:border-docka-400 transition-colors w-full sm:w-64 appearance-none cursor-pointer font-medium text-docka-700 hover:bg-docka-100"
                                value={selectedDomainName}
                                onChange={(e) => setSelectedDomainName(e.target.value)}
                            >
                                {allDomains.map(d => (
                                    <option key={d.id} value={d.name}>
                                        {d.name} {d.organization ? `(${d.organization.name})` : ''}
                                        {d.status !== 'VERIFIED' ? ' [Não Verificado]' : ''}
                                    </option>
                                ))}
                                {allDomains.length === 0 && <option value="">Nenhum domínio encontrado</option>}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-docka-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        <button
                            onClick={openDomainConfig}
                            className="p-2 text-docka-500 hover:text-docka-900 bg-docka-50 hover:bg-docka-100 border border-docka-200 rounded-lg transition-colors"
                            title="Configurações do Domínio (Ex: Alterar Organização)"
                            disabled={!selectedDomainName}
                        >
                            <Settings size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${selectedDomainObj?.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {selectedDomainObj?.status === 'VERIFIED' ? 'Verificado' : 'Pendente'}
                        </span>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!selectedDomainName || selectedDomainObj?.status !== 'VERIFIED'}
                            className="flex items-center px-3 py-2 text-sm bg-docka-900 text-white rounded-lg hover:bg-docka-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Plus size={16} className="mr-2" /> Nova Mailbox
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="p-12 text-center text-docka-400">
                    <RefreshCw className="animate-spin mx-auto mb-3" size={24} />
                    <p>Carregando mailboxes do domínio <strong>{selectedDomainName}</strong>...</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 text-docka-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3 border-b border-docka-100">Nome</th>
                            <th className="px-6 py-3 border-b border-docka-100">Email</th>
                            <th className="px-6 py-3 border-b border-docka-100">Tipo</th>
                            <th className="px-6 py-3 border-b border-docka-100">Org</th>
                            <th className="px-6 py-3 border-b border-docka-100">Acesso</th>
                            <th className="px-6 py-3 border-b border-docka-100 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-100">
                        {mailboxes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-docka-400">
                                    <div className="bg-docka-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Mail className="h-8 w-8 opacity-40" />
                                    </div>
                                    <p className="text-base font-medium text-docka-600">Nenhuma mailbox encontrada</p>
                                    <p className="text-sm">Não há contas de email criadas para @{selectedDomainName}</p>
                                </td>
                            </tr>
                        ) : (
                            mailboxes.map((mb) => (
                                <tr key={mb.id} className="hover:bg-docka-50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-docka-900">
                                        {mb.name}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-docka-600">
                                        {mb.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${mb.type === 'PERSONAL'
                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            : 'bg-docka-100 text-docka-600 border-docka-200'
                                            }`}>
                                            {mb.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-docka-500">
                                        {mb.organization?.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2 overflow-hidden hover:space-x-1 hover:overflow-visible transition-all cursor-pointer" onClick={() => handleOpenAccessModal(mb)}>
                                            {mb.users && mb.users.length > 0 ? mb.users.map((u: any) => (
                                                <img
                                                    key={u.id}
                                                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
                                                    alt={u.name}
                                                    title={u.name}
                                                />
                                            )) : (
                                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-stone-100 text-[10px] text-stone-500 font-medium ring-2 ring-white">0</span>
                                            )}
                                            <button className="h-6 w-6 rounded-full bg-stone-100 ring-2 ring-white flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-colors">
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-1">
                                        <button
                                            onClick={() => handleEditMailbox(mb)}
                                            className="text-docka-400 hover:text-docka-700 transition-colors p-1.5 hover:bg-docka-100 rounded"
                                            title="Editar Mailbox"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMailbox(mb.id)}
                                            className="text-docka-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
                                            title="Excluir Mailbox"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Access Modal */}
            {isAccessModalOpen && selectedMailboxForAccess && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-docka-900">Gerenciar Acesso</h3>
                            <button onClick={() => setIsAccessModalOpen(false)} className="text-docka-400 hover:text-docka-600">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-docka-500 mb-4">
                            Membros da organização <strong>{selectedDomainObj?.organization?.name}</strong> que podem acessar <strong>{selectedMailboxForAccess.email}</strong>.
                        </p>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {orgMembers.length === 0 ? (
                                <div className="text-center py-6 text-docka-500">
                                    <ShieldCheck className="mx-auto mb-2 text-docka-300" size={24} />
                                    <p>Nenhum membro encontrado na organização.</p>
                                </div>
                            ) : (
                                orgMembers.map(member => {
                                    const hasAccess = selectedMailboxForAccess.users?.some((u: any) => u.id === member.user.id);
                                    return (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-docka-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.name}&background=random`}
                                                    alt={member.user.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-docka-900">{member.user.name}</p>
                                                    <p className="text-xs text-docka-500">{member.role}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleUserAccess(member.user.id, hasAccess)}
                                                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${hasAccess
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-red-100 hover:text-red-700'
                                                    : 'bg-white border border-docka-300 text-docka-600 hover:bg-docka-100'
                                                    }`}
                                            >
                                                {hasAccess ? 'Remover' : 'Adicionar'}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-docka-900 mb-4">Nova Mailbox</h3>
                        <form onSubmit={handleCreateMailbox}>
                            <div className="space-y-4">
                                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 mb-4">
                                    <p className="text-xs text-indigo-800">
                                        Criando mailbox para: <strong>@{selectedDomainName}</strong>
                                        <br />
                                        Organização: {selectedDomainObj?.organization?.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Nome de Exibição / Alias</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        placeholder="Ex: Suporte, Vendas"
                                        value={newMailboxName}
                                        onChange={e => setNewMailboxName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Endereço de Email</label>
                                    <div className="flex shadow-sm rounded-md">
                                        <input
                                            type="text"
                                            required
                                            className="flex-1 px-3 py-2 border border-docka-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-docka-500 text-right"
                                            placeholder="usuario"
                                            value={newMailboxEmail}
                                            onChange={e => setNewMailboxEmail(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                                        />
                                        <div className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-docka-300 bg-docka-50 text-docka-500 text-sm font-mono">
                                            @{selectedDomainName}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        value={newMailboxType}
                                        onChange={e => setNewMailboxType(e.target.value)}
                                    >
                                        <option value="SHARED">Compartilhada (Equipe)</option>
                                        <option value="PERSONAL">Pessoal</option>
                                        <option value="SYSTEM">Sistema / Automática</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-docka-700 hover:bg-docka-100 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isCreating ? 'Criando...' : 'Criar Mailbox'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Mailbox Modal */}
            {isEditModalOpen && editingMailbox && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-docka-900 mb-4">Editar Mailbox</h3>
                        <form onSubmit={handleUpdateMailbox}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Nome de Exibição</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        value={editMailboxName}
                                        onChange={e => setEditMailboxName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Endereço de Email</label>
                                    <div className="flex shadow-sm rounded-md">
                                        <input
                                            type="text"
                                            required
                                            className="flex-1 px-3 py-2 border border-docka-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-docka-500 text-right"
                                            value={editMailboxEmailUser}
                                            onChange={e => setEditMailboxEmailUser(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                                        />
                                        <div className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-docka-300 bg-docka-50 text-docka-500 text-sm font-mono">
                                            @{selectedDomainName}
                                        </div>
                                    </div>
                                    <p className="text-xs text-red-500 mt-1">Cuidado: Alterar o email pode desconectar clientes de email configurados.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        value={editMailboxType}
                                        onChange={e => setEditMailboxType(e.target.value)}
                                    >
                                        <option value="SHARED">Compartilhada (Equipe)</option>
                                        <option value="PERSONAL">Pessoal</option>
                                        <option value="SYSTEM">Sistema</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-docka-700 hover:bg-docka-100 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 text-sm font-medium text-white bg-docka-900 hover:bg-docka-800 rounded-md transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isCreating ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Domain Config Modal */}
            {isDomainConfigOpen && selectedDomainName && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-docka-900">Configurações do Domínio</h3>
                            <button onClick={() => setIsDomainConfigOpen(false)} className="text-docka-400 hover:text-docka-600">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 mb-6 text-center">
                            <h4 className="text-xl font-bold text-docka-800">{selectedDomainName}</h4>
                            <p className="text-sm text-docka-500 uppercase tracking-wider font-semibold mt-1">
                                {selectedDomainObj?.status}
                            </p>
                        </div>

                        <form onSubmit={handleUpdateDomainOrg}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Organização Proprietária</label>
                                    <p className="text-xs text-docka-500 mb-2">
                                        Defina qual organização é dona deste domínio. Isso afeta onde as mailboxes são criadas e quem tem acesso.
                                    </p>
                                    <select
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        value={selectedOrgForDomain}
                                        onChange={e => setSelectedOrgForDomain(e.target.value)}
                                    >
                                        <option value="" disabled>Selecione uma organização</option>
                                        {allOrgs.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsDomainConfigOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-docka-700 hover:bg-docka-100 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingDomain}
                                    className="px-4 py-2 text-sm font-medium text-white bg-docka-900 hover:bg-docka-800 rounded-md transition-colors disabled:opacity-50 shadow-sm"
                                >
                                    {isUpdatingDomain ? 'Salvando...' : 'Salvar e Transferir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MailboxManager;
