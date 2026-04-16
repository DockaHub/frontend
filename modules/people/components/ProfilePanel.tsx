
import React from 'react';
import { Contact } from '../../../types';
import { X, Mail, MessageSquare, Phone, MapPin, Calendar, Briefcase, Star, Trash2, Shield, Settings, CreditCard, Users, FolderOpen, Save } from 'lucide-react';
import OrgTag from '../../../components/common/OrgTag';

interface ProfilePanelProps {
    onRemoveMember: (contact: Contact) => Promise<void>;
    onUpdatePermissions: (contactId: string, permissions: any) => Promise<void>;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ contact, onClose, onRemoveMember, onUpdatePermissions }) => {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [localPermissions, setLocalPermissions] = React.useState(contact?.permissions || {
        canAccessFinance: false,
        canAccessSettings: false,
        canAccessPeople: true,
        canAccessContent: true
    });

    React.useEffect(() => {
        if (contact?.permissions) {
            setLocalPermissions(contact.permissions);
        }
    }, [contact]);

    if (!contact) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        await onRemoveMember(contact);
        setIsDeleting(false);
        setShowConfirmDelete(false);
    };

    const handleSavePermissions = async () => {
        setIsSaving(true);
        try {
            await onUpdatePermissions(contact.id, localPermissions);
        } finally {
            setIsSaving(false);
        }
    };

    const hasPermissionChanges = JSON.stringify(localPermissions) !== JSON.stringify(contact.permissions);

    return (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white dark:bg-zinc-900 shadow-2xl border-l border-docka-200 dark:border-zinc-800 transform transition-transform duration-300 z-50 flex flex-col animate-in slide-in-from-right">
            {/* Header with Background */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative shrink-0">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 -mt-12 relative custom-scrollbar">
                <img src={contact.avatar} className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 shadow-md mb-4 bg-white dark:bg-zinc-800" alt="" />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{contact.name}</h2>
                        <p className="text-docka-500 dark:text-zinc-400 font-medium mb-2">{contact.role}</p>
                        <OrgTag orgId={contact.organizationId} size="md" />
                    </div>
                    <button className="text-docka-300 dark:text-zinc-600 hover:text-amber-400 transition-colors">
                        <Star size={24} fill={contact.isStarred ? "#fbbf24" : "none"} className={contact.isStarred ? "text-amber-400" : ""} />
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-8">
                    <button className="flex-1 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white py-2 rounded-lg font-medium text-sm hover:bg-docka-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <MessageSquare size={16} /> Chat
                    </button>
                    <button className="flex-1 bg-white dark:bg-zinc-800 border border-docka-300 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 py-2 rounded-lg font-medium text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <Mail size={16} /> E-mail
                    </button>
                </div>

                {/* Details Grid */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Informações de Contato</h3>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-docka-50 dark:bg-zinc-800 flex items-center justify-center text-docka-500 dark:text-zinc-400"><Mail size={16} /></div>
                            <div className="flex-1">
                                <div className="text-docka-400 dark:text-zinc-500 text-xs">E-mail</div>
                                <div className="text-docka-900 dark:text-zinc-100 font-medium">{contact.email}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-docka-50 dark:bg-zinc-800 flex items-center justify-center text-docka-500 dark:text-zinc-400"><Phone size={16} /></div>
                            <div className="flex-1">
                                <div className="text-docka-400 dark:text-zinc-500 text-xs">Telefone</div>
                                <div className="text-docka-900 dark:text-zinc-100 font-medium">{contact.phone || '+55 (11) 99999-0000'}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-docka-50 dark:bg-zinc-800 flex items-center justify-center text-docka-500 dark:text-zinc-400"><MapPin size={16} /></div>
                            <div className="flex-1">
                                <div className="text-docka-400 dark:text-zinc-500 text-xs">Localização</div>
                                <div className="text-docka-900 dark:text-zinc-100 font-medium">{contact.location}</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-docka-100 dark:border-zinc-800 pt-6 space-y-4">
                        <h3 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Organização</h3>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-docka-50 dark:bg-zinc-800 flex items-center justify-center text-docka-500 dark:text-zinc-400"><Briefcase size={16} /></div>
                            <div className="flex-1">
                                <div className="text-docka-400 dark:text-zinc-500 text-xs">Departamento</div>
                                <div className="text-docka-900 dark:text-zinc-100 font-medium">{contact.department}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-docka-50 dark:bg-zinc-800 flex items-center justify-center text-docka-500 dark:text-zinc-400"><Calendar size={16} /></div>
                            <div className="flex-1">
                                <div className="text-docka-400 dark:text-zinc-500 text-xs">Data de Entrada</div>
                                <div className="text-docka-900 dark:text-zinc-100 font-medium">{contact.joinDate}</div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-docka-100 dark:border-zinc-800 pt-6 space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Acesso e Permissões</h3>
                            {hasPermissionChanges && (
                                <button 
                                    onClick={handleSavePermissions}
                                    disabled={isSaving}
                                    className="text-[10px] font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                    <Save size={10} /> {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'canAccessFinance', label: 'Financeiro', icon: CreditCard },
                                { id: 'canAccessSettings', label: 'Configurações', icon: Settings },
                                { id: 'canAccessPeople', label: 'Pessoas', icon: Users },
                                { id: 'canAccessContent', label: 'Conteúdo', icon: FolderOpen }
                            ].map((perm) => (
                                <label key={perm.id} className="flex items-center gap-3 p-3 bg-docka-50/50 dark:bg-zinc-800/30 border border-docka-100 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors group">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-docka-400 dark:text-zinc-500 group-hover:text-indigo-500 transition-colors">
                                        <perm.icon size={16} />
                                    </div>
                                    <div className="flex-1 text-sm font-medium text-docka-900 dark:text-zinc-100">{perm.label}</div>
                                    <input 
                                        type="checkbox" 
                                        checked={(localPermissions as any)[perm.id]}
                                        onChange={(e) => setLocalPermissions({
                                            ...localPermissions, 
                                            [perm.id]: e.target.checked
                                        })}
                                        className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" 
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-12 pt-6 border-t border-docka-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-4">Zona de Perigo</h3>
                    
                    {!showConfirmDelete ? (
                        <button 
                            onClick={() => setShowConfirmDelete(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Trash2 size={16} />
                            Remover da Organização
                        </button>
                    ) : (
                        <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">Tem certeza que deseja remover {contact.name} desta organização?</p>
                            <div className="flex gap-2">
                                <button 
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? 'Removendo...' : 'Sim, Remover'}
                                </button>
                                <button 
                                    disabled={isDeleting}
                                    onClick={() => setShowConfirmDelete(false)}
                                    className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePanel;
