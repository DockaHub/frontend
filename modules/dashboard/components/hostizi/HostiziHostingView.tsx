
import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Server, Power, LogIn, Globe, Cpu, CheckCircle2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { hostiziService } from '../../../../services/hostiziService';

interface Account {
    id: string;
    domain: string;
    serverIp: string;
    username: string;
    plan: string;
    status: string;
    instanceType: string;
    organization?: {
        name: string;
    }
}

const HostiziHostingView: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter States
    const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'SUSPENDED'>('all');
    const [serverFilter, setServerFilter] = useState<string>('all');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);

    // Modal States
    const [isVPSModalOpen, setIsVPSModalOpen] = useState(false);
    const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);

    // Action Menu State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setIsLoading(true);
        try {
            const data = await hostiziService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Falha ao carregar contas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenuId(null);
            setIsStatusDropdownOpen(false);
            setIsServerDropdownOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleStatus = (_id: string) => {
        // Logic to toggle status in backend would go here
        alert('Funcionalidade de suspensão em desenvolvimento.');
    };

    const handleCreateVPS = () => {
        setIsVPSModalOpen(false);
    };

    const handleCreateShared = () => {
        setIsSharedModalOpen(false);
    };

    // Filter Logic
    const filteredAccounts = accounts.filter(acc => {
        const matchesSearch = acc.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (acc.organization?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (acc.serverIp || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
        const matchesServer = serverFilter === 'all' || acc.serverIp === serverFilter;

        return matchesSearch && matchesStatus && matchesServer;
    });

    const uniqueServers = Array.from(new Set(accounts.map(a => a.serverIp).filter(Boolean)));

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Gestão de Contas de Hospedagem</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Administre as contas CloudPanel, VPS e Dedicados dos seus clientes.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsVPSModalOpen(true)}
                            className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <Cpu size={16} /> Provisionar VPS
                        </button>
                        <button
                            onClick={() => setIsSharedModalOpen(true)}
                            className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <Server size={16} /> Nova Conta Compartilhada
                        </button>
                    </div>
                </div>

                {/* Toolbar / Filters */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-t-xl p-4 flex justify-between items-center z-20 relative">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por cliente, domínio ou IP..."
                            className="w-full pl-9 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsServerDropdownOpen(false); }}
                                className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${statusFilter !== 'all' ? 'bg-docka-100 dark:bg-zinc-800 border-docka-300 dark:border-zinc-600 text-docka-900 dark:text-zinc-100' : 'bg-white dark:bg-zinc-900 border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'}`}
                            >
                                <Filter size={14} />
                                {statusFilter === 'all' ? 'Status' : statusFilter === 'ACTIVE' ? 'Ativos' : 'Suspensos'}
                            </button>
                            {isStatusDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-30 animate-in fade-in zoom-in-95">
                                    <button onClick={() => setStatusFilter('all')} className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700">Todos</button>
                                    <button onClick={() => setStatusFilter('ACTIVE')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400">Ativos</button>
                                    <button onClick={() => setStatusFilter('SUSPENDED')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400">Suspensos</button>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsServerDropdownOpen(!isServerDropdownOpen); setIsStatusDropdownOpen(false); }}
                                className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${serverFilter !== 'all' ? 'bg-docka-100 dark:bg-zinc-800 border-docka-300 dark:border-zinc-600 text-docka-900 dark:text-zinc-100' : 'bg-white dark:bg-zinc-900 border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'}`}
                            >
                                <Server size={14} /> Servidor
                            </button>
                            {isServerDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-30 animate-in fade-in zoom-in-95">
                                    <button onClick={() => setServerFilter('all')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 font-medium text-docka-700 dark:text-zinc-300">Todos os Nodes</button>
                                    <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                    {uniqueServers.map((srv: any) => (
                                        <button key={srv} onClick={() => setServerFilter(srv)} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-400 truncate">
                                            {srv}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 border-t-0 rounded-b-xl overflow-visible shadow-sm">
                    {isLoading ? (
                        <div className="p-12 text-center text-docka-400">Carregando contas de hospedagem...</div>
                    ) : filteredAccounts.length === 0 ? (
                        <div className="p-12 text-center text-docka-400">Nenhuma conta encontrada.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Cliente / Domínio</th>
                                    <th className="px-6 py-4">Plano</th>
                                    <th className="px-6 py-4">Servidor / IP</th>
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {filteredAccounts.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-docka-900 dark:text-zinc-100">{acc.organization?.name || 'Sistema'}</div>
                                                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                                    <Globe size={10} /> {acc.domain}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-docka-700 dark:text-zinc-300 font-medium">
                                            <div className="flex flex-col">
                                                <span>{acc.plan}</span>
                                                <span className="text-[10px] text-docka-400 uppercase">{acc.instanceType}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-docka-500 dark:text-zinc-400 font-mono text-xs bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded w-fit">
                                                <Server size={12} /> {acc.serverIp}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-docka-600 dark:text-zinc-400 italic">
                                            {acc.username}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${acc.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                                }`}>
                                                {acc.status === 'ACTIVE' ? 'Ativo' : 'Suspenso'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 text-docka-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded transition-colors"
                                                    title="Logar no Painel"
                                                    onClick={() => window.open(`http://${acc.serverIp}:8443`, '_blank')}
                                                >
                                                    <LogIn size={16} />
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(acc.id)}
                                                    className={`p-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded transition-colors ${acc.status === 'ACTIVE' ? 'text-docka-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400' : 'text-red-600 dark:text-red-400 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                                                    title={acc.status === 'ACTIVE' ? 'Suspender Conta' : 'Reativar Conta'}
                                                >
                                                    {acc.status === 'ACTIVE' ? <Power size={16} /> : <CheckCircle2 size={16} />}
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === acc.id ? null : acc.id); }}
                                                        className={`p-1.5 text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded transition-colors ${activeMenuId === acc.id ? 'bg-docka-100 dark:bg-zinc-700 border-docka-300 dark:border-zinc-600 text-docka-900 dark:text-zinc-100' : ''}`}
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                    {activeMenuId === acc.id && (
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                            <div className="px-4 py-2 border-b border-docka-50 dark:border-zinc-700 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase">Ações de Admin</div>
                                                            <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700">Ver Detalhes</button>
                                                            <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700">Resetar Senha</button>
                                                            <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Excluir Conta</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* MODALS remain the same for now, just updated with current styling if needed */}
                <Modal isOpen={isVPSModalOpen} onClose={() => setIsVPSModalOpen(false)} title="Provisionar Servidor VPS" size="lg">
                    <div className="p-8 text-center text-docka-500">Módulo de provisionamento em migração.</div>
                </Modal>
                <Modal isOpen={isSharedModalOpen} onClose={() => setIsSharedModalOpen(false)} title="Nova Hospedagem Compartilhada" size="lg">
                    <div className="p-8 text-center text-docka-500">Módulo de provisionamento em migração.</div>
                </Modal>
            </div>
        </div>
    );
};

export default HostiziHostingView;
