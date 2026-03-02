import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Camera, Shield,
    Bell, Globe, Lock, LogOut, LayoutDashboard,
    CheckCircle2, AlertCircle
} from 'lucide-react';
import Modal from '../common/Modal';
import { User as UserType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserType;
    initialTab?: 'profile' | 'preferences' | 'security';
    onNavigateToAdmin: () => void;
    onLogout: () => void;
    theme?: 'light' | 'dark';
    onThemeChange?: (theme: 'light' | 'dark') => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
    isOpen,
    onClose,
    user,
    initialTab = 'profile',
    onNavigateToAdmin,
    onLogout,
    theme = 'light',
    onThemeChange
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const { addToast } = useToast();

    // Mock Form State
    // Form State
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.jobTitle ?? 'Membro da Organização',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        notifications: true
    });

    const isAdmin = user.role === 'admin';

    const { refreshUser } = useAuth(); // Get refreshUser from context
    const [isLoading, setIsLoading] = useState(false);

    // Function to apply phone mask
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits

        // Apply mask: (XX) XXXXX-XXXX
        let formattedValue = value;
        if (value.length > 2) {
            formattedValue = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 7) {
            formattedValue = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        }

        setFormData({ ...formData, phone: formattedValue });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await userService.updateUser(user.id, {
                name: formData.name,
                jobTitle: formData.role, // Mapping role input to jobTitle
                phone: formData.phone,
                location: formData.location,
                bio: formData.bio,
            });

            await refreshUser(); // Refresh global user state

            addToast({
                type: 'success',
                title: 'Configurações Salvas',
                message: 'Suas alterações de perfil foram atualizadas com sucesso.'
            });
            onClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
            addToast({
                type: 'error',
                title: 'Erro ao Salvar',
                message: 'Não foi possível atualizar o perfil. Tente novamente.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Configurações da Conta"
            size="xl"
            footer={
                <div className="flex justify-between w-full items-center">
                    <button
                        onClick={onLogout}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={16} /> Sair da conta
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={`px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col md:flex-row h-[500px] -mt-2 -mx-2">

                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-docka-200 dark:border-zinc-800 pr-0 md:pr-4 mb-4 md:mb-0 space-y-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:bg-docka-50 dark:hover:bg-zinc-800/50 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                    >
                        <User size={18} /> Meu Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'preferences' ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:bg-docka-50 dark:hover:bg-zinc-800/50 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                    >
                        <Bell size={18} /> Preferências
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:bg-docka-50 dark:hover:bg-zinc-800/50 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                    >
                        <Shield size={18} /> Segurança
                    </button>

                    {/* Admin Access Button (Conditional) */}
                    {isAdmin && (
                        <div className="pt-4 mt-4 border-t border-docka-100 dark:border-zinc-800">
                            <p className="px-3 text-[10px] font-bold text-docka-400 dark:text-zinc-600 uppercase tracking-wider mb-2">Administração</p>
                            <button
                                onClick={() => { onClose(); onNavigateToAdmin(); }}
                                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-colors bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                            >
                                <LayoutDashboard size={18} /> Admin Console
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex-1 pl-0 md:pl-6 overflow-y-auto custom-scrollbar">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* Avatar & Header */}
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-md object-cover" alt="Profile" />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-docka-900 dark:text-zinc-100">{formData.name}</h3>
                                    <p className="text-sm text-docka-500 dark:text-zinc-400">{formData.role}</p>
                                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                        <CheckCircle2 size={10} /> Ativo
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome Completo</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cargo / Função</label>
                                    <input
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800 pb-2">Informações de Contato</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                        <input
                                            value={formData.email}
                                            className="w-full pl-9 pr-3 py-2 bg-docka-50 dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-500 dark:text-zinc-500 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                        <input
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            maxLength={15} // (11) 91234-5678
                                            placeholder="(11) 99999-9999"
                                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div className="relative md:col-span-2">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                        <input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Sobre Mim</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 resize-none h-20 text-docka-900 dark:text-zinc-100"
                                />
                            </div>
                        </div>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-4">Aparência & Interface</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        className={`p-4 border rounded-xl flex flex-col items-center gap-3 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-all ${theme === 'light' ? 'border-docka-900 bg-docka-50 ring-1 ring-docka-900 dark:ring-zinc-100 dark:border-zinc-100' : 'border-docka-200 dark:border-zinc-700'}`}
                                        onClick={() => onThemeChange?.('light')}
                                    >
                                        <div className="w-full h-24 bg-white border border-docka-200 rounded-lg shadow-sm flex items-center justify-center">
                                            <div className="w-16 h-12 bg-docka-50 rounded"></div>
                                        </div>
                                        <span className="text-sm font-medium text-docka-900 dark:text-zinc-200">Modo Claro</span>
                                    </button>
                                    <button
                                        className={`p-4 border rounded-xl flex flex-col items-center gap-3 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-all ${theme === 'dark' ? 'border-docka-900 bg-docka-50 dark:bg-zinc-800 dark:border-zinc-100 ring-1 ring-docka-900 dark:ring-zinc-100' : 'border-docka-200 dark:border-zinc-700'}`}
                                        onClick={() => onThemeChange?.('dark')}
                                    >
                                        <div className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm flex items-center justify-center">
                                            <div className="w-16 h-12 bg-zinc-800 rounded"></div>
                                        </div>
                                        <span className="text-sm font-medium text-docka-900 dark:text-zinc-200">Modo Escuro</span>
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-docka-100 dark:bg-zinc-800" />

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Configurações Regionais</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase mb-1">Idioma</label>
                                        <div className="relative">
                                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                            <select className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100">
                                                <option>Português (Brasil)</option>
                                                <option>English (US)</option>
                                                <option>Español</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase mb-1">Fuso Horário</label>
                                        <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100">
                                            <option>(GMT-03:00) Brasília</option>
                                            <option>(GMT-04:00) Manaus</option>
                                            <option>(GMT+00:00) UTC</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB (Simplified) */}
                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                                <AlertCircle size={20} className="text-amber-600 dark:text-amber-500 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400">Autenticação de Dois Fatores (2FA)</h4>
                                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Recomendamos ativar o 2FA para aumentar a segurança da sua conta.</p>
                                    <button className="mt-3 text-xs font-bold text-amber-800 dark:text-amber-300 bg-white dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/60">
                                        Configurar 2FA
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-4">Alterar Senha</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase mb-1">Senha Atual</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                            <input type="password" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase mb-1">Nova Senha</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                            <input type="password" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Modal>
    );
};

export default UserSettingsModal;
