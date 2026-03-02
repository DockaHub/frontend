
import React, { useState } from 'react';
import { Users, Search, Plus, Filter, MoreHorizontal, Mail, Phone, MapPin, Server, Globe, DollarSign, History, AlertTriangle, CheckCircle2, UserPlus, LogIn, Key, Receipt } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

// TYPES
interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    servicesCount: number;
    mrr: string;
    status: 'active' | 'suspended' | 'pending';
    joinDate: string;
    services: { type: string, name: string, status: 'active' | 'expired' | 'suspended' }[];
    invoices: { id: string, date: string, amount: string, status: 'paid' | 'overdue' | 'pending' }[];
    logs: { date: string, action: string, type: 'info' | 'warning' | 'success' }[];
}

// MOCK DATA
const CLIENTS: Client[] = [
    {
        id: 'CLI-001',
        name: 'Alex Arquiteto',
        company: 'Tokyon Systems',
        email: 'alex@tokyon.jp',
        phone: '+55 11 99999-0000',
        servicesCount: 3,
        mrr: 'R$ 1.250,00',
        status: 'active',
        joinDate: '10/01/2023',
        services: [
            { type: 'Dedicated Server', name: 'Dedicated XL (192.168.1.10)', status: 'active' },
            { type: 'Domain', name: 'tokyon.jp', status: 'active' },
            { type: 'Email', name: '5 Accounts', status: 'active' }
        ],
        invoices: [
            { id: 'INV-2024-001', date: '20/02/2026', amount: 'R$ 1.250,00', status: 'paid' },
            { id: 'INV-2024-002', date: '20/01/2026', amount: 'R$ 1.250,00', status: 'paid' },
        ],
        logs: [
            { date: 'Hoje, 10:42', action: 'Fatura INV-2024-001 paga via PIX', type: 'success' },
            { date: '20/02/2026', action: 'Fatura INV-2024-001 gerada', type: 'info' },
            { date: '15/01/2026', action: 'Upgrade de memória no servidor', type: 'info' },
        ]
    },
    {
        id: 'CLI-002',
        name: 'João Silva',
        company: 'Padaria do João',
        email: 'joao@padaria.com',
        phone: '+55 11 98888-1111',
        servicesCount: 2,
        mrr: 'R$ 29,90',
        status: 'active',
        joinDate: '15/06/2024',
        services: [
            { type: 'Shared Hosting', name: 'Starter Plan (Shared-04)', status: 'active' },
            { type: 'Domain', name: 'padariajoao.com.br', status: 'active' },
        ],
        invoices: [
            { id: 'INV-2024-080', date: '15/02/2026', amount: 'R$ 29,90', status: 'paid' },
        ],
        logs: [
            { date: '15/02/2026', action: 'Renovação automática de domínio', type: 'success' },
        ]
    },
    {
        id: 'CLI-003',
        name: 'Ana Costa',
        company: 'Blog Pessoal Ana',
        email: 'ana@blog.com',
        phone: '+55 21 97777-2222',
        servicesCount: 1,
        mrr: 'R$ 29,90',
        status: 'suspended',
        joinDate: '20/11/2025',
        services: [
            { type: 'Shared Hosting', name: 'Starter Plan', status: 'suspended' },
        ],
        invoices: [
            { id: 'INV-2024-021', date: '10/02/2026', amount: 'R$ 29,90', status: 'overdue' },
        ],
        logs: [
            { date: '16/02/2026', action: 'Serviço suspenso por falta de pagamento', type: 'warning' },
            { date: '10/02/2026', action: 'Fatura vencida', type: 'warning' },
        ]
    }
];

const HostiziClientsView: React.FC = () => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'financial' | 'timeline'>('overview');

    const filteredClients = CLIENTS.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-7xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Gestão de Clientes</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Base completa de clientes, histórico e serviços contratados.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <UserPlus size={16} /> Adicionar Cliente
                    </button>
                </div>

                {/* List Header / Filter */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col mb-8">
                    <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                placeholder="Buscar por nome, empresa ou email..."
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50">
                            <Filter size={14} /> Filtros
                        </button>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Cliente / Empresa</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Serviços</th>
                                <th className="px-6 py-4">Receita (MRR)</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {filteredClients.map((client) => (
                                <tr
                                    key={client.id}
                                    onClick={() => { setSelectedClient(client); setActiveTab('overview'); }}
                                    className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-docka-900 dark:text-zinc-100">{client.company}</div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-400">{client.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-docka-600 dark:text-zinc-400">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-docka-400 dark:text-zinc-500" /> {client.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-docka-400 dark:text-zinc-500" /> {client.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                            {client.servicesCount} ativos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-docka-900 dark:text-zinc-100">{client.mrr}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${client.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                            client.status === 'suspended' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' :
                                                'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                            }`}>
                                            {client.status === 'active' ? 'Ativo' : client.status === 'suspended' ? 'Suspenso' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 rounded hover:bg-docka-100 dark:hover:bg-zinc-800">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CLIENT DETAIL MODAL */}
                {selectedClient && (
                    <Modal
                        isOpen={!!selectedClient}
                        onClose={() => setSelectedClient(null)}
                        title=""
                        size="xl"
                    >
                        <div className="flex flex-col h-[650px] -mt-2">
                            {/* Header Profile */}
                            <div className="flex justify-between items-start pb-6 border-b border-docka-100 dark:border-zinc-800 mb-6 shrink-0">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-docka-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xl shadow-sm shrink-0">
                                        {selectedClient.company.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedClient.company}</h2>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-docka-500 dark:text-zinc-400">
                                            <span className="font-medium text-docka-900 dark:text-zinc-100">{selectedClient.name}</span>
                                            <span>•</span>
                                            <span>ID: {selectedClient.id}</span>
                                            <span>•</span>
                                            <span>Cliente desde: {selectedClient.joinDate}</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${selectedClient.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                                                }`}>
                                                {selectedClient.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm flex items-center gap-2 transition-colors">
                                        <LogIn size={14} /> Acessar como Cliente
                                    </button>
                                    <button className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center justify-center gap-2 transition-colors">
                                        <Key size={14} /> Resetar Senha
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-6 border-b border-docka-200 dark:border-zinc-800 mb-6 shrink-0">
                                {[
                                    { id: 'overview', label: 'Visão Geral' },
                                    { id: 'services', label: 'Serviços Contratados' },
                                    { id: 'financial', label: 'Financeiro' },
                                    { id: 'timeline', label: 'Histórico & Logs' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">

                                {/* OVERVIEW */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-3">Informações de Contato</h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <Mail size={16} className="text-docka-400 dark:text-zinc-500" />
                                                        <span className="text-docka-700 dark:text-zinc-300">{selectedClient.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Phone size={16} className="text-docka-400 dark:text-zinc-500" />
                                                        <span className="text-docka-700 dark:text-zinc-300">{selectedClient.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <MapPin size={16} className="text-docka-400 dark:text-zinc-500" />
                                                        <span className="text-docka-700 dark:text-zinc-300">São Paulo, SP - Brasil</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-docka-50 dark:bg-zinc-800 rounded-xl border border-docka-200 dark:border-zinc-700">
                                                <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-3">Métricas (LTV & MRR)</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedClient.mrr}</div>
                                                        <div className="text-xs text-docka-500 dark:text-zinc-500">Recorrente Mensal</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">R$ 15.2k</div>
                                                        <div className="text-xs text-docka-500 dark:text-zinc-500">Valor Vitalício (LTV)</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase mb-3">Notas Internas</h4>
                                            <textarea
                                                className="w-full p-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-700 dark:text-zinc-300 outline-none focus:border-docka-300 dark:focus:border-zinc-600 min-h-[100px] placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                                placeholder="Adicione notas sobre o cliente (visível apenas para admins)..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* SERVICES */}
                                {activeTab === 'services' && (
                                    <div className="space-y-3">
                                        {selectedClient.services.map((svc, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:border-docka-300 dark:hover:border-zinc-600 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${svc.type === 'Domain' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : svc.type === 'Email' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}`}>
                                                        {svc.type === 'Domain' ? <Globe size={20} /> : svc.type === 'Email' ? <Mail size={20} /> : <Server size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{svc.name}</h4>
                                                        <p className="text-xs text-docka-500 dark:text-zinc-500">{svc.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${svc.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                        {svc.status}
                                                    </span>
                                                    <button className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 border border-docka-200 dark:border-zinc-700 px-3 py-1.5 rounded hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors">
                                                        Gerenciar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-2 border border-dashed border-docka-300 dark:border-zinc-700 rounded-lg text-xs font-medium text-docka-500 dark:text-zinc-400 hover:border-docka-400 dark:hover:border-zinc-600 hover:text-docka-700 dark:hover:text-zinc-300 transition-colors">
                                            + Provisionar Novo Serviço
                                        </button>
                                    </div>
                                )}

                                {/* FINANCIAL */}
                                {activeTab === 'financial' && (
                                    <div>
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-docka-50 dark:bg-zinc-800 text-docka-500 dark:text-zinc-500 font-medium text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-2 rounded-l-lg">ID</th>
                                                    <th className="px-4 py-2">Data</th>
                                                    <th className="px-4 py-2">Valor</th>
                                                    <th className="px-4 py-2">Status</th>
                                                    <th className="px-4 py-2 rounded-r-lg text-right">PDF</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                                {selectedClient.invoices.map((inv, i) => (
                                                    <tr key={i} className="hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                                        <td className="px-4 py-3 font-mono text-xs text-docka-600 dark:text-zinc-400">{inv.id}</td>
                                                        <td className="px-4 py-3 text-docka-700 dark:text-zinc-300">{inv.date}</td>
                                                        <td className="px-4 py-3 font-bold text-docka-900 dark:text-zinc-100">{inv.amount}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inv.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : inv.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200"><Receipt size={16} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* TIMELINE */}
                                {activeTab === 'timeline' && (
                                    <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-docka-200 dark:before:bg-zinc-800">
                                        {selectedClient.logs.map((log, i) => (
                                            <div key={i} className="relative flex gap-4 group">
                                                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10 border-2 border-white dark:border-zinc-900 ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-docka-400 dark:bg-zinc-500'
                                                    }`} />
                                                <div>
                                                    <p className="text-sm text-docka-800 dark:text-zinc-200">{log.action}</p>
                                                    <p className="text-xs text-docka-400 dark:text-zinc-500 mt-0.5">{log.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    </Modal>
                )}

                {/* CREATE MODAL */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Cadastrar Novo Cliente"
                    size="lg"
                    footer={
                        <>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm">Salvar Cliente</button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Empresa / Razão Social</label>
                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="Ex: Minha Empresa LTDA" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome do Contato</label>
                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="Nome completo" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">E-mail Principal</label>
                                <input type="email" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="cliente@email.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Telefone / WhatsApp</label>
                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="(00) 00000-0000" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Documento (CPF/CNPJ)</label>
                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" />
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" defaultChecked />
                                <span className="text-sm text-docka-600 dark:text-zinc-400">Enviar e-mail de boas-vindas com acesso ao painel</span>
                            </label>
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default HostiziClientsView;
