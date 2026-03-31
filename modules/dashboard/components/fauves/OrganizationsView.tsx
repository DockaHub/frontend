
import React, { useState, useEffect } from 'react';
import {
    Building2, Users, DollarSign, Clock, Search,
    Globe, ArrowLeft, Pencil, Plus,
    LayoutGrid, CheckCircle2,
    ExternalLink, Ticket, Save, X, Trash2, UserPlus, Mail, Shield, Loader2,
    Crown, UserCheck
} from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';

interface OrganizationsViewProps {
    onNavigate?: (view: string, data?: any) => void;
}

const OrganizationsView: React.FC<OrganizationsViewProps> = () => {
    const [view, setView] = useState<'list' | 'details'>('list');
    const [loading, setLoading] = useState(true);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [orgStats, setOrgStats] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        events: 0
    });

    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [searchTimeout, setSearchTimeout] = useState<any>(null);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [showUserResults, setShowUserResults] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fauvesService.getOrganizations();
            console.log("[OrganizationsView] Fetched data:", data);

            if (data && data.items) {
                setOrganizations(data.items);

                // Basic global stats for the header
                const activeCount = data.items.filter((o: any) => o.status === 'active').length;
                const totalEvents = data.items.reduce((acc: number, o: any) => acc + (o.eventCount || 0), 0);

                setStats({
                    total: data.total || data.items.length,
                    active: activeCount,
                    events: totalEvents
                });
            } else {
                setOrganizations([]);
            }
        } catch (err: any) {
            console.error("Failed to fetch organizations", err);
            const status = err.response?.status;
            let msg = 'Erro ao carregar organizações.';
            
            if (status === 401) {
                msg = '(401: Não autorizado). Certifique-se de que o Token da Fauves (em Configurações) é de um administrador válido.';
            } else if (status === 404) {
                msg = '(404: Não encontrado). Os endpoints de organizadores/organizações não foram encontrados na API da Fauves.';
            } else if (status) {
                msg = `(Erro ${status}) ao carregar: ${err.response?.data?.message || err.message}`;
            } else {
                msg = `Erro: ${err.message}`;
            }
            
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (org: any) => {
        setLoading(true);
        setView('details');
        setIsEditing(false);
        try {
            const details = await fauvesService.getOrganization(org.id);
            const metrics = await fauvesService.getOrganizationStats(org.id);
            setSelectedOrg(details || org);
            setOrgStats(metrics);
            fetchMembers(org.id);
        } catch (error) {
            console.error("Failed to fetch org details", error);
            setSelectedOrg(org);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (orgId: string) => {
        setLoadingMembers(true);
        try {
            const data = await fauvesService.getOrganizationMembers(orgId);
            setMembers(data || []);
        } catch (err) {
            console.error("Failed to fetch members", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleEdit = () => {
        setEditData({
            name: selectedOrg.name,
            slug: selectedOrg.slug,
            logo: selectedOrg.logo,
            platformFee: 15 // Hardcoded as in UI for now
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editData.name || !editData.slug) return;
        setSaving(true);
        try {
            await fauvesService.updateOrganization(selectedOrg.id, editData);
            setSelectedOrg({ ...selectedOrg, ...editData });
            setIsEditing(false);
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Failed to update organization", err);
            alert("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail) return;
        setLoadingMembers(true);
        try {
            await fauvesService.addOrganizationMember(selectedOrg.id, { email: newMemberEmail, role: 'member' });
            setNewMemberEmail('');
            fetchMembers(selectedOrg.id);
        } catch (err) {
            console.error("Failed to add member", err);
            alert("Erro ao adicionar membro.");
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!window.confirm("Tem certeza que deseja remover este membro?")) return;
        setLoadingMembers(true);
        try {
            await fauvesService.removeOrganizationMember(selectedOrg.id, userId);
            fetchMembers(selectedOrg.id);
        } catch (err) {
            console.error("Failed to remove member", err);
            alert("Erro ao remover membro.");
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleSearchUsers = async (query: string) => {
        setNewMemberEmail(query);
        setShowUserResults(true);
        
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (!query.trim() || query.length < 2) {
            setUserSearchResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsSearchingUsers(true);
            try {
                const results = await fauvesService.searchUsers(query);
                setUserSearchResults(results || []);
            } catch (err) {
                console.error("User search failed", err);
            } finally {
                setIsSearchingUsers(false);
            }
        }, 500);
        
        setSearchTimeout(timeout);
    };

    const handleSelectUser = (user: any) => {
        setNewMemberEmail(user.email);
        setShowUserResults(false);
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        setLoadingMembers(true);
        try {
            await fauvesService.updateOrganizationMemberRole(selectedOrg.id, userId, newRole);
            fetchMembers(selectedOrg.id);
        } catch (err) {
            console.error("Failed to update role", err);
            alert("Erro ao atualizar cargo.");
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleTransferOwnership = async (newOwnerId: string) => {
        if (!window.confirm("ATENÇÃO: Você está prestes a transferir a propriedade desta organização. Esta ação não pode ser desfeita por você após confirmada. Deseja continuar?")) return;
        
        setLoadingMembers(true);
        try {
            await fauvesService.transferOrganizationOwnership(selectedOrg.id, newOwnerId);
            // Refresh details to update creatorId and roles
            handleViewDetails(selectedOrg);
        } catch (err) {
            console.error("Failed to transfer ownership", err);
            alert("Erro ao transferir propriedade.");
        } finally {
            setLoadingMembers(false);
        }
    };

    const formatCurrency = (val: number) => val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';

    if (view === 'details' && selectedOrg) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView('list')}
                            className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-100"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 overflow-hidden">
                                {selectedOrg.logo ? (
                                    <img src={selectedOrg.logo} alt={selectedOrg.name} className="w-full h-full object-cover" />
                                ) : (
                                    selectedOrg.name?.substring(0, 1) || 'F'
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedOrg.name}</h1>
                                <p className="text-sm text-docka-500 dark:text-zinc-400">/{selectedOrg.slug}</p>
                            </div>
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 rounded-lg font-bold text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 transition-all"
                            >
                                <X size={16} /> Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Salvar Alterações
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            <Pencil size={16} /> Editar Organização
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Info Card */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <Building2 size={20} className="text-indigo-600" /> Informações da Organização
                            </h3>
                            
                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Nome da Organização</label>
                                            <input
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-2">URL Slug</label>
                                            <input
                                                value={editData.slug}
                                                onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-2">URL do Logo</label>
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0 overflow-hidden">
                                                {editData.logo ? (
                                                    <img src={editData.logo} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    editData.name?.substring(0, 1) || 'F'
                                                )}
                                            </div>
                                            <input
                                                value={editData.logo || ''}
                                                onChange={(e) => setEditData({ ...editData, logo: e.target.value })}
                                                placeholder="https://sua-imagem.com/logo.png"
                                                className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-docka-100 dark:border-zinc-800">
                                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Taxa da Plataforma (%)</label>
                                        <input
                                            type="number"
                                            value={editData.platformFee}
                                            onChange={(e) => setEditData({ ...editData, platformFee: Number(e.target.value) })}
                                            className="w-32 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-docka-900 dark:text-zinc-100 font-bold"
                                        />
                                        <p className="text-xs text-docka-400 dark:text-zinc-500 mt-2">Esta taxa será aplicada a todas as vendas desta organização.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Nome</label>
                                            <p className="text-base font-medium text-docka-900 dark:text-zinc-100">{selectedOrg.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Slug</label>
                                            <p className="text-base font-medium text-docka-900 dark:text-zinc-100">{selectedOrg.slug}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-3">Logo</label>
                                        <div className="w-32 h-32 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-600/10 overflow-hidden">
                                            {selectedOrg.logo ? (
                                                <img
                                                    src={selectedOrg.logo}
                                                    alt={selectedOrg.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                selectedOrg.name?.substring(0, 1) || 'F'
                                            )}
                                        </div>
                                        {selectedOrg.logo && <p className="text-[10px] text-zinc-500 mt-2 break-all opacity-50">URL: {selectedOrg.logo}</p>}
                                    </div>
                                    <div className="pt-4 border-t border-docka-100 dark:border-zinc-800">
                                        <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Taxa da Plataforma</label>
                                        <p className="text-lg font-bold text-docka-900 dark:text-zinc-100">15%</p>
                                        <p className="text-xs text-docka-400 dark:text-zinc-500 mt-0.5">Aplicada em todos os eventos dessa organização</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team Management Section */}
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Users size={20} className="text-indigo-600" /> Equipe e Permissões
                                </h3>
                                <div className="flex gap-2 relative">
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" />
                                        <input
                                            type="email"
                                            placeholder="E-mail ou nome do usuário"
                                            value={newMemberEmail}
                                            onChange={(e) => handleSearchUsers(e.target.value)}
                                            onFocus={() => setShowUserResults(true)}
                                            className="pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-64"
                                        />
                                        
                                        {/* User Search Results Dropdown */}
                                        {showUserResults && (userSearchResults.length > 0 || isSearchingUsers) && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                                                {isSearchingUsers ? (
                                                    <div className="p-4 text-center text-[10px] text-docka-400">
                                                        <Loader2 size={12} className="animate-spin inline mr-2" /> Buscando...
                                                    </div>
                                                ) : (
                                                    userSearchResults.map((user: any) => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => handleSelectUser(user)}
                                                            className="w-full flex items-center gap-3 p-3 hover:bg-docka-50 dark:hover:bg-zinc-700/50 text-left transition-colors border-b border-docka-50 dark:border-zinc-800 last:border-0"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 overflow-hidden">
                                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name?.substring(0, 1)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-docka-900 dark:text-zinc-100 truncate">{user.name}</p>
                                                                <p className="text-[10px] text-docka-400 truncate">{user.email}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleAddMember}
                                        disabled={loadingMembers || !newMemberEmail}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-all disabled:opacity-50"
                                    >
                                        <UserPlus size={14} /> Convidar
                                    </button>
                                </div>
                            </div>

                            {loadingMembers ? (
                                <div className="py-10 flex flex-col items-center justify-center text-docka-400">
                                    <Loader2 size={24} className="animate-spin mb-2" />
                                    <p className="text-xs">Atualizando equipe...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {members.length === 0 ? (
                                        <div className="text-center py-10 bg-docka-50/50 dark:bg-zinc-800/20 rounded-xl border border-dashed border-docka-200 dark:border-zinc-800">
                                            <p className="text-xs text-docka-400">Nenhum membro na equipe além do proprietário.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Dedicated Owner Row/Card */}
                                            {members.find(m => m.id === selectedOrg.creatorId || m.role === 'OWNER') && (
                                                <div className="md:col-span-2 flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent border border-amber-100 dark:border-amber-900/20 rounded-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-1 bg-amber-500 text-white rounded-bl-lg">
                                                        <Crown size={12} />
                                                    </div>
                                                    {(() => {
                                                        const owner = members.find(m => m.id === selectedOrg.creatorId || m.role === 'OWNER');
                                                        return (
                                                            <>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 font-bold shadow-sm ring-2 ring-amber-500/20">
                                                                        {owner.name?.substring(0, 1) || owner.email?.substring(0, 1).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{owner.name || owner.email.split('@')[0]}</p>
                                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-tighter">Proprietário</span>
                                                                        </div>
                                                                        <p className="text-[10px] text-docka-500 dark:text-zinc-400 lowercase">{owner.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 opacity-60">
                                                                    Dono da Organização
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                            {/* Other Members */}
                                            {members
                                                .filter(m => m.id !== selectedOrg.creatorId && m.role !== 'OWNER')
                                                .map((member: any) => (
                                                <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {member.name?.substring(0, 1) || member.email?.substring(0, 1).toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 truncate max-w-[120px]">{member.name || member.email.split('@')[0]}</p>
                                                            <p className="text-[10px] text-docka-400 lowercase truncate max-w-[120px]">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex items-center gap-1 group/role opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleUpdateRole(member.id, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                                                className="p-1 text-docka-400 hover:text-indigo-600 rounded transition-colors"
                                                                title={`Mudar para ${member.role === 'ADMIN' ? 'Membro' : 'Admin'}`}
                                                            >
                                                                <UserCheck size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleTransferOwnership(member.id)}
                                                                className="p-1 text-docka-400 hover:text-amber-500 rounded transition-colors"
                                                                title="Transferir Propriedade"
                                                            >
                                                                <Crown size={14} />
                                                            </button>
                                                        </div>
                                                        
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${member.role === 'ADMIN' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30' : 'bg-docka-50 dark:bg-zinc-800 text-docka-400 dark:text-zinc-500 border border-docka-100 dark:border-zinc-800'}`}>
                                                            {member.role === 'ADMIN' ? 'Admin' : 'Membro'}
                                                        </span>
                                                        
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="p-1.5 text-docka-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                            title="Remover da equipe"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats Summary Grid */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100">Estatísticas Operacionais</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Eventos', value: orgStats?.eventsActive || 0, icon: LayoutGrid, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                                    { label: 'Receita', value: formatCurrency(orgStats?.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                                    { label: 'Ingressos', value: orgStats?.totalTickets || 0, icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                                    { label: 'Pedidos', value: orgStats?.totalOrders || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                        <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                                            <stat.icon size={18} />
                                        </div>
                                        <p className="text-xs font-medium text-docka-500 dark:text-zinc-500">{stat.label}</p>
                                        <h4 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mt-0.5">{stat.value}</h4>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed Revenue Table */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800">
                                    <h4 className="font-bold text-sm text-docka-900 dark:text-zinc-100">Performance Financeira</h4>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-docka-600 dark:text-zinc-400">Receita Bruta Total</span>
                                        <span className="font-bold text-docka-900 dark:text-zinc-100 whitespace-nowrap">{formatCurrency(orgStats?.totalRevenue || 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-docka-600 dark:text-zinc-400">Taxa Plataforma (15%)</span>
                                        <span className="font-bold text-red-500 whitespace-nowrap">- {formatCurrency((orgStats?.totalRevenue || 0) * 0.15)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                                        <span className="font-bold text-docka-900 dark:text-zinc-100">Saldo Disponível (Líquido)</span>
                                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency((orgStats?.totalRevenue || 0) * 0.85)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Cards */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <Shield size={16} className="text-indigo-600" /> Detalhes Técnicos
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ID Único</label>
                                    <p className="text-xs font-mono text-docka-600 dark:text-zinc-400 break-all bg-docka-50 dark:bg-zinc-800/50 p-2 rounded border border-docka-100 dark:border-zinc-800">{selectedOrg.id}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Data de Criação</label>
                                    <p className="text-xs text-docka-700 dark:text-zinc-300 flex items-center gap-2">
                                        <Clock size={12} className="text-docka-400" /> {selectedOrg.createdAt ? new Date(selectedOrg.createdAt).toLocaleString('pt-BR') : '03/01/2026 • 21:10'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Última Atualização</label>
                                    <p className="text-xs text-docka-700 dark:text-zinc-300 flex items-center gap-2">
                                        <Clock size={12} className="text-docka-400" /> {selectedOrg.updatedAt ? new Date(selectedOrg.updatedAt).toLocaleString('pt-BR') : '05/01/2026 • 14:15'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6 font-bold">Links Rápidos</h3>
                            <div className="space-y-4">
                                <button className="w-full flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    <ExternalLink size={14} /> Ver página pública
                                </button>
                                <button className="w-full flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    <Globe size={14} /> Ver todos os eventos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Organizações</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie todas as organizações da plataforma</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/10 transition-all">
                    <Plus size={18} /> Nova Organização
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total de Organizações', value: stats.total, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                    { label: 'Ativas', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Total de Eventos', value: stats.events, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' }
                ].map((metric, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <div className={`w-14 h-14 ${metric.bg} ${metric.color} rounded-xl flex items-center justify-center`}>
                            <metric.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{metric.value}</h3>
                            <p className="text-xs font-medium text-docka-400 dark:text-zinc-500 mt-0.5">{metric.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 relative min-w-[300px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-docka-400" />
                        <input
                            placeholder="Buscar por nome ou slug..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all text-docka-900 dark:text-zinc-100"
                        />
                    </div>
                    <select className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-docka-700 dark:text-zinc-300">
                        <option>20 por página</option>
                        <option>50 por página</option>
                        <option>100 por página</option>
                    </select>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-docka-50/50 dark:bg-zinc-800/50 border-b border-docka-100 dark:border-zinc-800 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Organização</th>
                                <th className="px-8 py-5">Slug</th>
                                <th className="px-8 py-5 text-center">Eventos</th>
                                <th className="px-8 py-5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-docka-400 animate-pulse">
                                        Carregando organizações...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/10">
                                        {error}
                                    </td>
                                </tr>
                            ) : organizations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-sm text-docka-400">
                                        Nenhuma organização encontrada.
                                    </td>
                                </tr>
                            ) : (
                                organizations
                                    .filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map((org) => (
                                        <tr 
                                            key={org.id} 
                                            onClick={() => handleViewDetails(org)}
                                            className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/10 overflow-hidden">
                                                        {org.logo ? (
                                                            <img
                                                                src={org.logo}
                                                                alt={org.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    console.error(`[OrganizationsView] List image load failed for: ${org.logo}`);
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            org.name.substring(0, 1)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {org.name}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-docka-400 mt-1 uppercase">ID: {org.id.substring(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-xs font-medium text-docka-600 dark:text-zinc-400 bg-docka-50/50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg w-fit">
                                                    <Globe size={14} className="text-docka-400" /> {org.slug}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                                                    {org.eventCount || 0} eventos
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(org);
                                                    }}
                                                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                                >
                                                    Gerenciar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OrganizationsView;
