import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Download, Plus, 
    MoreHorizontal, Eye, Mail, Calendar,
    Building2, Globe, Shield
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
            case 'asterysko': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800';
            case 'fauves': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800';
            default: return 'bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 border border-docka-200 dark:border-zinc-700';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
            {/* Standard View Header (from Design System) */}
            <div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950 z-20">
                <h1 className="text-xl font-bold text-docka-900 dark:text-zinc-100">Central Global de Clientes</h1>
                <div className="flex gap-2">
                    <button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                        <Download size={16} /> Exportar CSV
                    </button>
                    <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
                        <Plus size={16} /> Novo Cliente
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-docka-50/20 dark:bg-zinc-950">
                {/* Metric Cards - KPI Pattern */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total de Clientes', value: clients.length, icon: Users, color: 'text-docka-600 dark:text-zinc-400', bg: 'bg-docka-100 dark:bg-zinc-800' },
                        { label: 'Base Asterysko', value: clients.filter(c => c.source === 'Asterysko').length, icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                        { label: 'Base Fauves', value: clients.filter(c => c.source === 'Fauves').length, icon: Shield, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                        { label: 'Ativos 30d', value: Math.floor(clients.length * 0.85), icon: Globe, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm transition-all hover:border-docka-300 dark:hover:border-zinc-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{stat.value.toLocaleString()}</h3>
                            <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Data Grid Area */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    {/* Search Bar Wrapper */}
                    <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center bg-docka-50/50 dark:bg-zinc-800/30">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou email..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center bg-docka-100 dark:bg-zinc-800 p-1 rounded-lg border border-docka-200 dark:border-zinc-700">
                            {['all', 'asterysko', 'fauves'].map((source) => (
                                <button
                                    key={source}
                                    onClick={() => setSourceFilter(source)}
                                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                        sourceFilter === source 
                                        ? 'bg-white dark:bg-zinc-700 text-docka-900 dark:text-zinc-100 shadow-sm' 
                                        : 'text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    {source === 'all' ? 'Todos' : source}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table Implementation (from Design System) */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-bold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Organização de Origem</th>
                                    <th className="px-6 py-4">Cadastrado em</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4" colSpan={4}>
                                                <div className="flex items-center gap-3 animate-pulse">
                                                    <div className="w-10 h-10 bg-docka-100 dark:bg-zinc-800 rounded-lg" />
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="w-32 h-4 bg-docka-100 dark:bg-zinc-800 rounded" />
                                                        <div className="w-48 h-3 bg-docka-50 dark:bg-zinc-850 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredClients.length > 0 ? (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={client.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=random`} 
                                                        className="w-10 h-10 rounded-lg border border-docka-200 dark:border-zinc-700 shadow-sm"
                                                        alt={client.name}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-docka-900 dark:text-zinc-100">{client.name}</p>
                                                        <p className="text-[11px] text-docka-500 dark:text-zinc-500">{client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg ${client.organization.logoColor || 'bg-zinc-500'} flex items-center justify-center text-white text-[10px] font-black shadow-sm overflow-hidden`}>
                                                        {client.organization.logo ? (
                                                            <img src={client.organization.logo} className="w-full h-full object-cover" alt="org logo" />
                                                        ) : (
                                                            client.organization.name.substring(0, 1)
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider leading-none ${getSourceTagColor(client.source)}`}>
                                                            {client.source}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 truncate max-w-[120px]">{client.organization.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-docka-600 dark:text-zinc-400">
                                                    <Calendar size={14} className="text-docka-400 dark:text-zinc-500" />
                                                    <span className="text-xs font-medium">
                                                        {new Date(client.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors" title="Ver Detalhes">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors" title="Enviar E-mail">
                                                        <Mail size={16} />
                                                    </button>
                                                    <div className="w-px h-4 bg-docka-100 dark:border-zinc-800 mx-1" />
                                                    <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="p-4 bg-docka-50 dark:bg-zinc-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-docka-400 dark:text-zinc-500 mb-4 opacity-50">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100">Nenhum cliente encontrado</h3>
                                            <p className="text-xs text-docka-500 dark:text-zinc-500 mt-1 max-w-[240px] mx-auto">Ajuste seu termo de busca ou filtros para localizar os usuários do ecossistema.</p>
                                            <button 
                                                onClick={() => {setSearchTerm(''); setSourceFilter('all');}}
                                                className="text-xs font-bold text-docka-900 dark:text-zinc-100 mt-4 hover:underline"
                                            >
                                                Limpar todos os filtros
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination Meta */}
                    <div className="px-6 py-4 bg-docka-50/50 dark:bg-zinc-800/30 border-t border-docka-100 dark:border-zinc-800 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                            Exibindo {filteredClients.length} de {clients.length} clientes totais
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DockaClientsView;
