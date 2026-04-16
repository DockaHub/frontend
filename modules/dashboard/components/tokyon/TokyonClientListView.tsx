
import React, { useState } from 'react';
import { 
    Search, Filter, MoreHorizontal, Download, 
    Mail, MessageSquare, Calendar,
    ChevronLeft, ChevronRight, UserPlus
} from 'lucide-react';

interface ClientEntry {
    id: string;
    name: string;
    project: string;
    status: 'active' | 'churn' | 'lead' | 'inactive';
    totalLTV: string;
    lastContact: string;
    category: string;
    email: string;
}

const ALL_CLIENTS: ClientEntry[] = [
    { id: '1', name: 'XP Inc.', project: 'Retenção Criativa', status: 'active', totalLTV: 'R$ 450k', lastContact: 'Hoje', category: 'Finanças', email: 'contato@xp.com.br' },
    { id: '2', name: 'Taurus', project: 'Rebranding', status: 'active', totalLTV: 'R$ 120k', lastContact: 'Ontem', category: 'Indústria', email: 'mkt@taurus.com.br' },
    { id: '3', name: 'Gerdau', project: 'Portal RI', status: 'active', totalLTV: 'R$ 80k', lastContact: '2 dias atrás', category: 'Siderurgia', email: 'ri@gerdau.com' },
    { id: '4', name: 'Grupo Soma', project: '-', status: 'lead', totalLTV: 'R$ 0', lastContact: '1 semana atrás', category: 'Varejo', email: 'expansao@soma.com.br' },
    { id: '5', name: 'TechStart', project: 'Design System', status: 'inactive', totalLTV: 'R$ 45k', lastContact: '1 mês atrás', category: 'Tech', email: 'dev@techstart.io' },
    { id: '6', name: 'Ambev', project: 'Innovation Hub', status: 'churn', totalLTV: 'R$ 280k', lastContact: '3 meses atrás', category: 'Bebidas', email: 'marketing@ambev.com.br' },
    { id: '7', name: 'Coca-Cola', project: 'Campanha Latam', status: 'active', totalLTV: 'R$ 1.2M', lastContact: 'Hoje', category: 'Bebidas', email: 'global.mkt@coca-cola.com' },
    { id: '8', name: 'Rede D’Or', project: 'Diagnóstico', status: 'lead', totalLTV: 'R$ 0', lastContact: 'Hoje', category: 'Saúde', email: 'doc@rededor.com.br' },
];

const TokyonClientListView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const filteredClients = ALL_CLIENTS.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20';
            case 'churn': return 'bg-red-50 text-red-600 dark:bg-red-900/20';
            case 'lead': return 'bg-blue-50 text-blue-600 dark:bg-blue-900/20';
            default: return 'bg-zinc-50 text-zinc-500 dark:bg-zinc-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'churn': return 'Perdido (Churn)';
            case 'lead': return 'Lead';
            case 'inactive': return 'Inativo';
            default: return status;
        }
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-docka-900 dark:text-zinc-100 tracking-tight">Base de Clientes</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão centralizada e histórico de relacionamento Tokyon.</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 text-docka-600 dark:text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-docka-50 transition-all flex items-center gap-2 shadow-sm">
                            <Download size={16} /> Exportar CSV
                        </button>
                        <button className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-docka-900/20">
                            <UserPlus size={16} /> Novo Cliente
                        </button>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2">
                            {['all', 'active', 'lead', 'churn', 'inactive'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        selectedStatus === status 
                                        ? 'bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900' 
                                        : 'text-docka-400 dark:text-zinc-500 hover:bg-docka-50 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    {getStatusLabel(status)}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={16} />
                            <input 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-docka-100 transition-all w-64" 
                                placeholder="Pesquisar por nome..."
                            />
                        </div>
                    </div>
                </div>

                {/* Table Component */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-docka-100 dark:border-zinc-800 bg-docka-50/50 dark:bg-zinc-800/20">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-docka-400 tracking-widest">Cliente</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-docka-400 tracking-widest">Projeto / Categoria</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-docka-400 tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-docka-400 tracking-widest text-right">LTV Total</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-docka-400 tracking-widest">Último Contato</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-docka-400 tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-docka-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-docka-400 text-xs">
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-orange-600 transition-colors">{client.name}</p>
                                                    <p className="text-[10px] text-docka-400 font-medium">{client.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-docka-700 dark:text-zinc-300">{client.project}</p>
                                            <p className="text-[10px] text-docka-400 uppercase font-bold tracking-tighter mt-0.5">{client.category}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusStyle(client.status)}`}>
                                                {getStatusLabel(client.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className="text-sm font-black text-docka-900 dark:text-zinc-100">{client.totalLTV}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-docka-500 dark:text-zinc-500">
                                                <Calendar size={14} />
                                                <span className="text-xs font-medium">{client.lastContact}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-docka-400 hover:text-orange-600 transition-colors" title="E-mail"><Mail size={16} /></button>
                                                <button className="p-2 text-docka-400 hover:text-emerald-500 transition-colors" title="WhatsApp"><MessageSquare size={16} /></button>
                                                <button className="p-2 text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-colors"><MoreHorizontal size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-docka-50/50 dark:bg-zinc-800/20 border-t border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                        <p className="text-xs text-docka-400">Mostrando {filteredClients.length} de {ALL_CLIENTS.length} clientes</p>
                        <div className="flex gap-2">
                             <button className="p-2 border border-docka-200 dark:border-zinc-800 rounded-lg text-docka-400 hover:bg-white transition-colors cursor-not-allowed"><ChevronLeft size={16} /></button>
                             <button className="px-4 py-2 border border-docka-200 dark:border-zinc-800 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900">1</button>
                             <button className="p-2 border border-docka-200 dark:border-zinc-800 rounded-lg text-docka-400 hover:bg-white transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Remarketing Banner */}
                <div className="mt-8 bg-gradient-to-r from-docka-900 to-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-white mb-2">Pronto para o Remarketing?</h2>
                        <p className="text-zinc-400 text-sm mb-6 max-w-lg">Identificamos 3 clientes inativos com alto potencial de retorno para novas campanhas sazonais.</p>
                        <button className="bg-orange-600 text-white px-8 py-3 rounded-xl text-xs font-black shadow-xl shadow-orange-900/40 hover:scale-105 active:scale-95 transition-all">
                            Iniciar Campanha de Retenção
                        </button>
                    </div>
                    <Filter size={180} className="absolute -right-20 -bottom-20 text-white opacity-5 rotate-12" />
                </div>
            </div>
        </div>
    );
};

export default TokyonClientListView;
