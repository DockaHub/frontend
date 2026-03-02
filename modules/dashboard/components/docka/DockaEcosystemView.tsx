
import React, { useState } from 'react';
import { Search, Plus, ExternalLink, Settings, MoreHorizontal, HardDrive, Users, Edit, Trash, PauseCircle, Palette, Building2 } from 'lucide-react';
import { ORGANIZATIONS } from '../../../../constants';
import { Organization } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import TrackerSetupView from '../../../asterysko/crm/components/TrackerSetupView';

import { api } from '../../../../services/api';
import { fauvesService } from '../../../../services/fauvesService';

const DockaEcosystemView: React.FC = () => {
    const childOrgs = ORGANIZATIONS.filter(o => o.slug !== 'docka');

    // State for configuration modal
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'tracking'>('details');

    // State for dropdown menu
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Data states
    const [stats, setStats] = useState<any>(null);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [fauvesData, setFauvesData] = useState<any>(null);
    const [fauvesUserCount, setFauvesUserCount] = useState<number>(0);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [dockaResponse, fauvesResponse, fauvesUsers] = await Promise.allSettled([
                    api.get('/dashboard/stats'),
                    fauvesService.getStats(),
                    fauvesService.getManagementData('users', 1, 1) // Fetch just 1 to get total count
                ]);

                if (dockaResponse.status === 'fulfilled') {
                    setStats(dockaResponse.value.data.stats);
                    setPortfolio(dockaResponse.value.data.portfolio);
                }

                if (fauvesResponse.status === 'fulfilled') {
                    setFauvesData(fauvesResponse.value);
                }

                if (fauvesUsers.status === 'fulfilled') {
                    // getManagementData returns { items: [], total: number } or array
                    const total = (fauvesUsers.value as any).total || (Array.isArray(fauvesUsers.value) ? fauvesUsers.value.length : 0);
                    setFauvesUserCount(total);
                }
            } catch (error) {
                console.error('Failed to fetch ecosystem data', error);
            }
        };
        fetchData();
    }, []);

    const handleConfigureClick = (org: Organization) => {
        setSelectedOrg(org);
        setActiveTab('details');
        setIsEditModalOpen(true);
        setOpenMenuId(null);
    };

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // Close menus when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Ecossistema</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie os workspaces conectados ao grupo Docka.</p>
                    </div>
                    <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Nova Empresa
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {childOrgs.map(org => {
                        let userCount = 0;
                        let storage = '0%';
                        let status = 'Desconhecido';

                        if (org.slug === 'asterysko') {
                            userCount = stats?.users || 0;
                            status = stats?.health === 'Critical' ? 'Crítico' : stats?.health === 'Unstable' ? 'Instável' : 'Operacional';
                        } else if (org.slug === 'fauves') {
                            // Fauves data from dynamic service
                            userCount = fauvesUserCount || fauvesData?.totalOrders || 0; // Use real user count, fallback to orders
                            status = 'Operacional';
                        } else {
                            // Others
                            userCount = 0;
                            status = 'Em Breve';
                        }

                        const isOperational = status === 'Operacional' || status === 'Stable' || status === 'Estável';

                        return (
                            <div key={org.id} className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all group relative">

                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${org.logoColor} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                                        {org.name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                            {org.name}
                                        </h3>
                                        <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1">
                                            {org.slug}.docka.io <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>

                                <div className="flex-1 w-full md:w-auto flex items-center gap-8 text-sm">
                                    <div className="flex items-center gap-2 text-docka-600 dark:text-zinc-400">
                                        <Users size={16} className="text-docka-400 dark:text-zinc-500" />
                                        <span><strong className="text-docka-900 dark:text-zinc-100">{userCount}</strong> Usuários</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-docka-600 dark:text-zinc-400">
                                        <div className={`w-2 h-2 rounded-full ${isOperational ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span>{status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto justify-end relative">
                                    <button
                                        onClick={() => handleConfigureClick(org)}
                                        className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 border border-docka-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                                    >
                                        <Settings size={14} /> Configurar
                                    </button>

                                    {/* 3 Dots Menu Button */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => toggleMenu(org.id, e)}
                                            className={`p-2 rounded-lg transition-colors ${openMenuId === org.id ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-800'}`}
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === org.id && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                                                <button className="w-full text-left px-4 py-2.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2 transition-colors">
                                                    <PauseCircle size={16} className="text-docka-400 dark:text-zinc-500" /> Suspender Acesso
                                                </button>
                                                <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors border-t border-docka-100 dark:border-zinc-700">
                                                    <Trash size={16} /> Arquivar Empresa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

                {/* EDIT ORG MODAL */}
                {selectedOrg && (
                    <Modal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        title={`Configurar ${selectedOrg.name}`}
                        footer={
                            <>
                                <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                                <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors">Salvar Alterações</button>
                            </>
                        }
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-docka-50 dark:bg-zinc-800 rounded-lg border border-docka-200 dark:border-zinc-700">
                                <div className={`w-12 h-12 ${selectedOrg.logoColor} rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                                    {selectedOrg.name.substring(0, 1)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100">{selectedOrg.name}</h3>
                                    <p className="text-xs text-docka-500 dark:text-zinc-400">ID: {selectedOrg.id}</p>
                                </div>
                            </div>

                            {/* TABS */}
                            <div className="flex border-b border-docka-200 dark:border-zinc-700">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-400 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                                >
                                    Detalhes
                                </button>
                                <button
                                    onClick={() => setActiveTab('tracking')}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tracking' ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-400 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                                >
                                    Monitoramento
                                </button>
                            </div>

                            {activeTab === 'details' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Organização</label>
                                        <div className="relative">
                                            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                            <input
                                                defaultValue={selectedOrg.name}
                                                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Slug (Domínio)</label>
                                            <div className="flex items-center">
                                                <span className="bg-docka-50 dark:bg-zinc-800 border border-r-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-xs py-2 px-2 rounded-l-lg">docka.io/</span>
                                                <input
                                                    defaultValue={selectedOrg.slug}
                                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Tipo</label>
                                            <select
                                                defaultValue={selectedOrg.type}
                                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 capitalize text-docka-900 dark:text-zinc-100"
                                            >
                                                <option value="saas">SaaS</option>
                                                <option value="agency">Agência</option>
                                                <option value="event-tech">Event Tech</option>
                                                <option value="infrastructure">Infraestrutura</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 flex items-center gap-2"><Palette size={14} /> Cor da Marca</label>
                                        <div className="flex gap-3">
                                            {['bg-slate-900', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-500', 'bg-red-600', 'bg-amber-700'].map((color) => (
                                                <button
                                                    key={color}
                                                    className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 dark:ring-offset-zinc-900 ${selectedOrg.logoColor === color ? 'ring-docka-900 dark:ring-zinc-100' : 'ring-transparent'} hover:ring-docka-300 dark:hover:ring-zinc-600 transition-all focus:ring-docka-900`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <TrackerSetupView organizationId={selectedOrg.id} />
                            )}
                        </div>
                    </Modal>
                )}

            </div>
        </div >
    );
};

export default DockaEcosystemView;
