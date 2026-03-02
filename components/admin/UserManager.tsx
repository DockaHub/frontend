import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, RefreshCw, Settings, X, Building2, User as UserIcon, Lock, Save, MapPin, Phone, Briefcase } from 'lucide-react';
import { userService } from '../../services/userService';
import { Organization } from '../../types';
import { organizationService } from '../../services/organizationService';
import { useToast } from '../../context/ToastContext';

interface UserManagerProps {
    organizations: Organization[];
}

const UserManager: React.FC<UserManagerProps> = ({ organizations }) => {
    const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || '');
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('MEMBER');
    const [isInviting, setIsInviting] = useState(false);

    // User Detail Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
    const [isLoadingUserOrgs, setIsLoadingUserOrgs] = useState(false);
    const [orgToAdd, setOrgToAdd] = useState('');
    const [roleToAdd, setRoleToAdd] = useState('MEMBER');

    // Profile Edit State
    const [activeTab, setActiveTab] = useState<'profile' | 'organizations'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        jobTitle: '',
        phone: '',
        location: '',
        bio: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        if (selectedOrgId) {
            loadMembers();
        }
    }, [selectedOrgId]);

    const loadMembers = async () => {
        setIsLoading(true);
        try {
            const data = await organizationService.getMembers(selectedOrgId);
            setMembers(data);
        } catch (error) {
            console.error("Failed to load members", error);
            addToast({ type: 'error', title: 'Erro ao carregar membros', duration: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            await organizationService.addMember(selectedOrgId, newUserEmail, newUserRole);
            addToast({ type: 'success', title: 'Usuário convidado com sucesso!', duration: 3000 });
            setNewUserEmail('');
            setIsInviteModalOpen(false);
            loadMembers();
        } catch (error: any) {
            console.error("Failed to invite user", error);
            addToast({ type: 'error', title: error.response?.data?.error || 'Erro ao convidar usuário', duration: 4000 });
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário da organização?')) return;
        try {
            await organizationService.removeMember(selectedOrgId, userId);
            addToast({ type: 'success', title: 'Usuário removido', duration: 3000 });
            loadMembers();
        } catch (error) {
            console.error("Failed to remove member", error);
            addToast({ type: 'error', title: 'Erro ao remover usuário', duration: 3000 });
        }
    };

    const handleOpenUserModal = async (user: any) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            jobTitle: user.jobTitle || '',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || ''
        });
        setNewPassword('');
        setShowPasswordInput(false);
        setActiveTab('profile');

        setIsLoadingUserOrgs(true);
        setOrgToAdd(organizations[0]?.id || '');
        try {
            const orgs = await organizationService.getOrganizationsForUser(user.id);
            setUserOrgs(orgs);
        } catch (error) {
            console.error("Failed to load user orgs", error);
            addToast({ type: 'error', title: 'Erro ao carregar organizações do usuário', duration: 3000 });
        } finally {
            setIsLoadingUserOrgs(false);
        }
    };

    const handleAddUserToOrg = async () => {
        if (!orgToAdd) return;
        try {
            // Find org name
            const orgName = organizations.find(o => o.id === orgToAdd)?.name;

            // We need the user's email. selectedUser has it.
            await organizationService.addMember(orgToAdd, selectedUser.email, roleToAdd);

            addToast({ type: 'success', title: `Usuário adicionado a ${orgName}`, duration: 3000 });

            // Reload user orgs
            const orgs = await organizationService.getOrganizationsForUser(selectedUser.id);
            setUserOrgs(orgs);
        } catch (error) {
            console.error("Failed to add user to org", error);
            addToast({ type: 'error', title: 'Erro ao adicionar usuário à organização', duration: 3000 });
        }
    };

    const handleRemoveUserFromOrg = async (orgId: string) => {
        if (!confirm('Remover usuário desta organização?')) return;
        try {
            await organizationService.removeMember(orgId, selectedUser.id);
            addToast({ type: 'success', title: 'Usuário removido da organização', duration: 3000 });

            // Reload user orgs
            const orgs = await organizationService.getOrganizationsForUser(selectedUser.id);
            setUserOrgs(orgs);
        } catch (error) {
            console.error("Failed to remove user from org", error);
            addToast({ type: 'error', title: 'Erro ao remover usuário', duration: 3000 });
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSaving(true);
        try {
            await userService.updateUser(selectedUser.id, formData);
            setSelectedUser({ ...selectedUser, ...formData });

            // Update user in members list if present
            setMembers(members.map(m => m.userId === selectedUser.id ? { ...m, user: { ...m.user, ...formData } } : m));

            addToast({ type: 'success', title: 'Perfil atualizado com sucesso!', duration: 3000 });
        } catch (error) {
            console.error("Failed to update profile", error);
            addToast({ type: 'error', title: 'Erro ao atualizar perfil', duration: 3000 });
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!confirm('Enviar email de redefinição de senha para este usuário?')) return;
        try {
            await userService.resetPassword(selectedUser.id);
            addToast({ type: 'success', title: 'Email de redefinição enviado!', duration: 3000 });
        } catch (error) {
            console.error("Failed to reset password", error);
            addToast({ type: 'error', title: 'Erro ao enviar redefinição de senha', duration: 3000 });
        }
    };

    const handleSetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            addToast({ type: 'error', title: 'A senha deve ter pelo menos 6 caracteres', duration: 3000 });
            return;
        }

        try {
            await userService.setPassword(selectedUser.id, newPassword);
            addToast({ type: 'success', title: 'Senha atualizada com sucesso!', duration: 3000 });
            setNewPassword('');
            setShowPasswordInput(false);
        } catch (error: any) {
            console.error("Failed to set password", error);
            const errorMessage = error.response?.data?.error || 'Erro ao definir nova senha';
            addToast({ type: 'error', title: errorMessage, duration: 4000 });
        }
    };

    return (
        <div className="bg-white rounded-xl border border-docka-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-docka-200 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-lg font-bold text-docka-900">Gerenciamento de Usuários</h2>
                    <p className="text-xs text-docka-500">Gerencie quem tem acesso à organização.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="px-3 py-1.5 text-sm bg-docka-50 border border-docka-200 rounded-md outline-none focus:border-docka-400 transition-colors"
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                    >
                        {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center px-3 py-1.5 text-sm bg-docka-900 text-white rounded-md hover:bg-docka-800 transition-colors shadow-sm"
                    >
                        <Plus size={16} className="mr-2" /> Convidar Usuário
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-docka-400">
                    <RefreshCw className="animate-spin mx-auto mb-2" />
                    <p>Carregando membros...</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 text-docka-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3 border-b border-docka-100">Usuário</th>
                            <th className="px-6 py-3 border-b border-docka-100">Email</th>
                            <th className="px-6 py-3 border-b border-docka-100">Função</th>
                            <th className="px-6 py-3 border-b border-docka-100">Status</th>
                            <th className="px-6 py-3 border-b border-docka-100 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-100">
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-docka-400">
                                    <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                    <p>Nenhum membro encontrado nesta organização.</p>
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="hover:bg-docka-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.name}&background=random`}
                                                alt={member.user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="font-medium text-docka-900">{member.user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-docka-600">{member.user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${member.role === 'OWNER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                'bg-slate-50 text-slate-700 border-slate-200'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                            <span className="text-xs font-medium text-docka-600">Ativo</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenUserModal(member.user)}
                                            className="text-docka-400 hover:text-docka-900 transition-colors p-1 mr-2"
                                            title="Gerenciar Organizações"
                                        >
                                            <Settings size={16} />
                                        </button>
                                        {member.role !== 'OWNER' && (
                                            <button
                                                onClick={() => handleRemoveMember(member.user.id)}
                                                className="text-docka-400 hover:text-red-600 transition-colors p-1"
                                                title="Remover Membro"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}

            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-docka-900">Convidar Usuário</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-docka-400 hover:text-docka-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleInviteUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Email do Usuário</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        placeholder="colega@exemplo.com"
                                        value={newUserEmail}
                                        onChange={e => setNewUserEmail(e.target.value)}
                                    />
                                    <p className="text-xs text-docka-500 mt-1">
                                        O usuário deve ter uma conta existente no Docka Hub.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-docka-700 mb-1">Função</label>
                                    <select
                                        className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        value={newUserRole}
                                        onChange={e => setNewUserRole(e.target.value)}
                                    >
                                        <option value="MEMBER">Membro</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-docka-700 hover:bg-docka-100 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isInviting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-docka-900 hover:bg-docka-800 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isInviting ? 'Convidando...' : 'Enviar Convite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Detail / Manage Org Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}&background=random`}
                                    alt={selectedUser.name}
                                    className="w-12 h-12 rounded-full border border-docka-200"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-docka-900">{selectedUser.name}</h3>
                                    <p className="text-sm text-docka-500">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-docka-400 hover:text-docka-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-docka-200 mb-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'profile'
                                    ? 'border-docka-900 text-docka-900'
                                    : 'border-transparent text-docka-500 hover:text-docka-700'
                                    }`}
                            >
                                <UserIcon size={16} className="mr-2" /> Perfil
                            </button>
                            <button
                                onClick={() => setActiveTab('organizations')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'organizations'
                                    ? 'border-docka-900 text-docka-900'
                                    : 'border-transparent text-docka-500 hover:text-docka-700'
                                    }`}
                            >
                                <Building2 size={16} className="mr-2" /> Organizações
                            </button>
                        </div>

                        {activeTab === 'profile' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <form onSubmit={handleSaveProfile}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-docka-700 mb-1">Nome Completo</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-docka-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500 bg-docka-50"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-docka-700 mb-1 flex items-center">
                                                <Briefcase size={14} className="mr-1" /> Cargo / Função
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                                placeholder="Ex: Designer Sênior"
                                                value={formData.jobTitle}
                                                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-docka-700 mb-1 flex items-center">
                                                <Phone size={14} className="mr-1" /> Celular
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                                placeholder="(11) 99999-9999"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-docka-700 mb-1 flex items-center">
                                                <MapPin size={14} className="mr-1" /> Localização
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                                placeholder="São Paulo, SP"
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-docka-700 mb-1">Bio</label>
                                            <textarea
                                                className="w-full px-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                                rows={3}
                                                placeholder="Breve descrição sobre o usuário..."
                                                value={formData.bio}
                                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-docka-200 pt-4 mb-4">
                                        <h4 className="text-sm font-bold text-docka-900 mb-3 flex items-center">
                                            <Lock size={16} className="mr-2" /> Segurança
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                type="button"
                                                onClick={handleResetPassword}
                                                className="text-sm text-left text-docka-600 hover:text-docka-900 hover:underline"
                                            >
                                                Enviar email de redefinição de senha
                                            </button>

                                            {!showPasswordInput ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordInput(true)}
                                                    className="text-sm text-left text-docka-600 hover:text-docka-900 hover:underline"
                                                >
                                                    Definir nova senha manualmente
                                                </button>
                                            ) : (
                                                <div className="flex gap-2 items-center bg-docka-50 p-2 rounded-md">
                                                    <input
                                                        type="text"
                                                        placeholder="Nova senha"
                                                        className="flex-1 px-3 py-1 text-sm border border-docka-300 rounded outline-none focus:border-docka-500"
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSetPassword}
                                                        className="px-3 py-1 bg-docka-900 text-white text-xs font-medium rounded hover:bg-docka-800"
                                                    >
                                                        Salvar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswordInput(false)}
                                                        className="text-docka-400 hover:text-docka-600"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end items-center border-t border-docka-200 pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-docka-900 text-white text-sm font-medium rounded-md hover:bg-docka-800 disabled:opacity-50 flex items-center"
                                        >
                                            <Save size={16} className="mr-2" />
                                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'organizations' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-docka-900 uppercase tracking-wider mb-4 flex items-center">
                                        <Building2 size={16} className="mr-2" /> Organizações
                                    </h4>

                                    {isLoadingUserOrgs ? (
                                        <div className="text-center py-8">
                                            <RefreshCw className="animate-spin mx-auto text-docka-400" />
                                        </div>
                                    ) : (
                                        <div className="bg-docka-50 rounded-lg border border-docka-200 overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-docka-100 text-docka-500 uppercase text-xs font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-2">Organização</th>
                                                        <th className="px-4 py-2">Função</th>
                                                        <th className="px-4 py-2 text-right">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-docka-200">
                                                    {userOrgs.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-4 text-center text-docka-500 italic">
                                                                Este usuário não pertence a nenhuma organização.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        userOrgs.map((org: any) => (
                                                            <tr key={org.id} className="bg-white">
                                                                <td className="px-4 py-3 font-medium text-docka-900">{org.name}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-docka-100 text-docka-600 border border-docka-200">
                                                                        {org.memberRole || 'MEMBER'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <button
                                                                        onClick={() => handleRemoveUserFromOrg(org.id)}
                                                                        className="text-red-500 hover:text-red-700 text-xs font-medium hover:underline"
                                                                    >
                                                                        Remover
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-docka-50 rounded-lg p-4 border border-docka-200">
                                    <h4 className="text-sm font-bold text-docka-900 mb-2">Adicionar a Organização</h4>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 text-sm border border-docka-300 rounded-md outline-none focus:ring-2 focus:ring-docka-500"
                                            value={orgToAdd}
                                            onChange={(e) => setOrgToAdd(e.target.value)}
                                        >
                                            <option value="" disabled>Selecione uma organização</option>
                                            {organizations.filter(o => !userOrgs.find(uo => uo.id === o.id)).map(org => (
                                                <option key={org.id} value={org.id}>{org.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="w-32 px-3 py-2 text-sm border border-docka-300 rounded-md outline-none focus:ring-2 focus:ring-docka-500"
                                            value={roleToAdd}
                                            onChange={(e) => setRoleToAdd(e.target.value)}
                                        >
                                            <option value="MEMBER">Membro</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="OWNER">Owner</option>
                                        </select>
                                        <button
                                            onClick={handleAddUserToOrg}
                                            disabled={!orgToAdd}
                                            className="px-4 py-2 bg-docka-900 text-white text-sm font-medium rounded-md hover:bg-docka-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
