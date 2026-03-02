
import React, { useState, useEffect } from 'react';
import { Organization, Contact } from '../../types';
import { ORGANIZATIONS } from '../../constants';
import PeopleSidebar from './components/PeopleSidebar';
import PeopleHeader from './components/PeopleHeader';
import PeopleGrid from './components/PeopleGrid';
import ProfilePanel from './components/ProfilePanel';
import PlaceholderView from '../../components/PlaceholderView';
import Modal from '../../components/common/Modal';
import { Users, User, Mail, Briefcase, Building2, Shield } from 'lucide-react';
import { organizationService } from '../../services/organizationService';
import { useToast } from '../../context/ToastContext';

interface PeopleLayoutProps {
    currentOrg: Organization;
    hasAccess?: boolean;
}

const PeopleLayout: React.FC<PeopleLayoutProps> = ({ currentOrg, hasAccess = true }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const { addToast } = useToast();

    // Permission Gate
    const canAccess = hasAccess && (currentOrg.features?.contacts !== false);

    if (!canAccess) {
        return (
            <PlaceholderView
                title={`${currentOrg.name} Directory`}
                icon={Users}
                description={`People directory is not enabled for the ${currentOrg.name} workspace.`}
            />
        );
    }

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            setIsLoading(true);
            try {
                const members = await organizationService.getMembers(currentOrg.id);

                if (!Array.isArray(members)) {
                    throw new Error('Formato de dados inválido');
                }

                const mappedContacts: Contact[] = members.map((m: any) => ({
                    id: m.userId,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar || `https://ui-avatars.com/api/?name=${m.user.name}&background=random`,
                    role: m.user.jobTitle || 'Sem Cargo',
                    department: m.role === 'OWNER' ? 'Proprietário' : (m.role === 'ADMIN' ? 'Administrador' : 'Membro'),
                    organizationId: m.organizationId,
                    status: 'offline', // Placeholder
                    isStarred: false
                }));
                setContacts(mappedContacts);
            } catch (error: any) {
                console.error("Failed to fetch members", error);
                addToast({
                    type: 'error',
                    title: 'Erro ao carregar lista de pessoas',
                    message: error.response?.data?.error || error.message || 'Erro de conexão',
                    duration: 5000
                });
                setContacts([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (canAccess) {
            fetchMembers();
        }
    }, [currentOrg.id, canAccess]);

    // Extract Departments for Sidebar (Dynamic)
    const departments = Array.from(new Set(contacts.map(c => c.department))).sort();

    // Filter Logic
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.role.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = activeFilter === 'all' ||
            (activeFilter === 'favorites' && contact.isStarred) ||
            (activeFilter === 'admins' && (contact.role === 'OWNER' || contact.role === 'ADMIN')) ||
            contact.department === activeFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden flex-col relative transition-colors duration-300">
            <PeopleHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddMember={() => setIsAddMemberModalOpen(true)}
            />

            <div className="flex flex-1 overflow-hidden">
                <PeopleSidebar
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    departments={departments}
                />
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-docka-400">
                        Loading...
                    </div>
                ) : (
                    <PeopleGrid
                        contacts={filteredContacts}
                        viewMode={viewMode}
                        onContactClick={setSelectedContact}
                    />
                )}
            </div>

            {selectedContact && (
                <div className="absolute inset-0 bg-black/20 dark:bg-black/50 z-40 backdrop-blur-[1px]" onClick={() => setSelectedContact(null)}>
                    <div onClick={e => e.stopPropagation()} className="h-full w-full flex justify-end">
                        <ProfilePanel contact={selectedContact} onClose={() => setSelectedContact(null)} />
                    </div>
                </div>
            )}

            {/* ADD MEMBER MODAL */}
            <Modal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                title="Adicionar Novo Membro"
                footer={
                    <>
                        <button onClick={() => setIsAddMemberModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={() => setIsAddMemberModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors">Convidar Usuário</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome Completo</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                            <input className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Ex: Ana Souza" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">E-mail Corporativo</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                            <input type="email" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="ana@empresa.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Organização</label>
                            <div className="relative">
                                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <select className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 appearance-none">
                                    {ORGANIZATIONS.map(org => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Departamento</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <select className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 appearance-none">
                                    <option>Engenharia</option>
                                    <option>Design</option>
                                    <option>Vendas</option>
                                    <option>Marketing</option>
                                    <option>Financeiro</option>
                                    <option>RH</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cargo / Função</label>
                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Ex: Senior Designer" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Permissão</label>
                            <div className="relative">
                                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <select className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 appearance-none">
                                    <option>Membro (Padrão)</option>
                                    <option>Administrador</option>
                                    <option>Visualizador</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 p-3 border border-docka-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                            <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" defaultChecked />
                            <span className="text-sm text-docka-700 dark:text-zinc-300">Enviar e-mail de convite com instruções de acesso</span>
                        </label>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PeopleLayout;
