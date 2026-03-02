
import React from 'react';
import { Contact } from '../../../types';
import { X, Mail, MessageSquare, Phone, MapPin, Calendar, Briefcase, Star } from 'lucide-react';
import OrgTag from '../../../components/common/OrgTag';

interface ProfilePanelProps {
    contact: Contact | null;
    onClose: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ contact, onClose }) => {
    if (!contact) return null;

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
                </div>

            </div>
        </div>
    );
};

export default ProfilePanel;
