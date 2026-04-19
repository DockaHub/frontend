import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Filter, Download, Plus, 
    MoreHorizontal, Eye, Mail, Phone, Calendar,
    Building2, ExternalLink, Globe, Shield
} from 'lucide-react';
import api from '../../../../services/api';

interface Client {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    organization: {
        name: string;
        slug: string;
        logo?: string;
        logoColor?: string;
    };
    createdAt: string;
    source: string;
}

const DockaClientsView: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('all');

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard/clients');
                setClients(response.data.clients || []);
            } catch (error) {
                console.error('Failed to fetch global clients', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSource = sourceFilter === 'all' || c.source.toLowerCase() === sourceFilter.toLowerCase();
        return matchesSearch && matchesSource;
    });

    const getSourceTagColor = (source: string) => {
        switch (source.toLowerCase()) {
            case 'asterysko': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'fauves': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-zinc-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                            <Users size={24} />
                        </div>
                        Central Global de Clientes
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Gerencie todos os usuários do ecossistema Docka Hub em um único lugar.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors text-sm font-bold shadow-sm">
                        <Download size={18} />
                        Exportar CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-600/20">
                        <Plus size={18} />
                        Novo Cliente
                    </button>
                </div>
            </div>

            {/* Stats Summary (Mini) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total de Clientes', value: clients.length, icon: Users, color: 'text-indigo-600' },
                    { label: 'Base Asterysko', value: clients.filter(c => c.source === 'Asterysko').length, icon: Building2, color: 'text-blue-600' },
                    { label: 'Base Fauves', value: clients.filter(c => c.source === 'Fauves').length, icon: Shield, color: 'text-amber-600' },
                    { label: 'Ativos 30d', value: Math.floor(clients.length * 0.85), icon: Globe, color: 'text-emerald-600' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{stat.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content: Table & Filters */}
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/20 dark:border-zinc-800 shadow-xl overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por nome, email ou organização..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-zinc-900 dark:text-zinc-100 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-inner">
                            {['all', 'asterysko', 'fauves'].map((source) => (
                                <button
                                    key={source}
                                    onClick={() => setSourceFilter(source)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        sourceFilter === source 
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    {source === 'all' ? 'Todos' : (source.charAt(0).toUpperCase() + source.slice(1))}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Organização de Origem</th>
                                <th className="px-6 py-4">Cadastrado em</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading ? (
                                // Skeleton Loader
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4" colSpan={4}>
                                            <div className="flex items-center gap-3 animate-pulse">
                                                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                                                    <div className="w-48 h-3 bg-zinc-100 dark:bg-zinc-850 rounded" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    <img 
                                                        src={client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`} 
                                                        className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                                        alt={client.name}
                                                    />
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center ${client.source === 'Asterysko' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                                        <Globe size={8} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {client.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                                                        {client.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${client.organization.logoColor || 'bg-zinc-500'} flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                                                    {client.organization.logo ? (
                                                        <img src={client.organization.logo} className="w-full h-full rounded-lg object-cover" alt="org logo" />
                                                    ) : (
                                                        client.organization.name.substring(0, 1)
                                                    )}
                                                </div>
                                                <div>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getSourceTagColor(client.source)}`}>
                                                        {client.source}
                                                    </span>
                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1 uppercase">
                                                        {client.organization.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                <Calendar size={14} className="text-zinc-400" />
                                                <span className="text-xs font-medium">
                                                    {new Date(client.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Ver Detalhes">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Enviar E-mail">
                                                    <Mail size={18} />
                                                </button>
                                                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                                                <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="max-w-xs mx-auto space-y-3">
                                            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-zinc-400">
                                                <Search size={32} />
                                            </div>
                                            <p className="text-zinc-900 dark:text-zinc-100 font-bold">Nenhum cliente encontrado</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
                                            <button 
                                                onClick={() => {setSearchTerm(''); setSourceFilter('all');}}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                                            >
                                                Limpar todos os filtros
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Info */}
                <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        Exibindo {filteredClients.length} de {clients.length} clientes totais
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full" /> Asterysko
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-amber-500 rounded-full" /> Fauves
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DockaClientsView;
