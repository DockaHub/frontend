
import React, { useState } from 'react';
import { Headphones, Filter, Search, User, Clock, MessageSquare, CheckCircle, Plus, Send, AlertCircle, Trash2, Tag, Paperclip } from 'lucide-react';
import Modal from '../../../../components/common/Modal';


// Types
interface Ticket {
    id: string;
    client: string;
    subject: string;
    status: 'open' | 'pending' | 'resolved' | 'urgent';
    priority: 'low' | 'medium' | 'high';
    agent: string;
    time: string;
    messages: {
        id: string;
        sender: string;
        role: 'agent' | 'client';
        text: string;
        timestamp: string;
    }[];
}

// Mock Data
const INITIAL_TICKETS: Ticket[] = [
    {
        id: '#4921',
        client: 'Tokyon Systems',
        subject: 'Upgrade de Memória VPS',
        status: 'open',
        priority: 'medium',
        agent: 'Você',
        time: 'Há 10 min',
        messages: [
            { id: '1', sender: 'Tokyon Admin', role: 'client', text: 'Olá, precisamos aumentar a RAM do nosso VPS "tokyon-app-01" para 16GB. O tráfego aumentou.', timestamp: '10:00' }
        ]
    },
    {
        id: '#4920',
        client: 'Padaria do João',
        subject: 'Site fora do ar (Erro 500)',
        status: 'urgent',
        priority: 'high',
        agent: 'Ninguém',
        time: 'Há 45 min',
        messages: [
            { id: '1', sender: 'João Silva', role: 'client', text: 'MEU SITE CAIU! SOCORRO! Aparece um erro 500.', timestamp: '09:15' },
            { id: '2', sender: 'Você', role: 'agent', text: 'Olá João, estou verificando os logs do servidor agora mesmo.', timestamp: '09:20' }
        ]
    },
    {
        id: '#4918',
        client: 'E-commerce Shoes',
        subject: 'Instalação SSL Falhou',
        status: 'pending',
        priority: 'low',
        agent: 'Carlos (N1)',
        time: 'Ontem',
        messages: [
            { id: '1', sender: 'Ana Shoes', role: 'client', text: 'Tentei instalar o SSL grátis e deu erro.', timestamp: 'Ontem 14:00' },
            { id: '2', sender: 'Carlos', role: 'agent', text: 'Ana, parece que o DNS ainda não propagou. Vamos aguardar 24h.', timestamp: 'Ontem 14:15' }
        ]
    },
];

const HostiziSupportView: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    // Status Styles Helper
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'urgent': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800';
            case 'open': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
            case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
            case 'resolved': return 'bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 border-docka-200 dark:border-zinc-700';
            default: return 'bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400';
        }
    };

    const handleSendReply = () => {
        if (!selectedTicket || !replyText.trim()) return;

        const newMessage = {
            id: `msg-${Date.now()}`,
            sender: 'Você',
            role: 'agent' as const,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedTicket = {
            ...selectedTicket,
            messages: [...selectedTicket.messages, newMessage]
        };

        setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        setReplyText('');
    };

    const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        if (selectedTicket && selectedTicket.id === ticketId) {
            setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Central de Suporte</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie os chamados e atendimento ao cliente.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Novo Ticket
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4 text-sm font-medium text-docka-600 dark:text-zinc-400 mb-6">
                    <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>3 Abertos</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>5 Pendentes</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>12 Resolvidos (Hoje)</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                placeholder="Buscar ticket, cliente ou assunto..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700">
                                <Filter size={14} /> Filtros
                            </button>
                        </div>
                    </div>

                    {/* Ticket List */}
                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">ID / Assunto</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Status / Prioridade</th>
                                <th className="px-6 py-4">Agente</th>
                                <th className="px-6 py-4 text-right">Tempo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {tickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-docka-900 dark:text-zinc-100">{ticket.subject}</div>
                                        <div className="text-xs text-docka-400 dark:text-zinc-500 font-mono">{ticket.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-docka-700 dark:text-zinc-300 font-medium">
                                            <User size={14} className="text-docka-400 dark:text-zinc-500" /> {ticket.client}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            {ticket.priority === 'high' && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 border border-docka-200 dark:border-zinc-700">
                                                    Alta
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-docka-600 dark:text-zinc-400 text-xs">
                                        {ticket.agent}
                                    </td>
                                    <td className="px-6 py-4 text-right text-docka-500 dark:text-zinc-500 text-xs flex items-center justify-end gap-2">
                                        <Clock size={12} /> {ticket.time}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* DETAIL MODAL */}
                {selectedTicket && (
                    <Modal
                        isOpen={!!selectedTicket}
                        onClose={() => setSelectedTicket(null)}
                        title=""
                        size="lg"
                    >
                        <div className="flex flex-col h-[600px] -mt-2">
                            {/* Header */}
                            <div className="pb-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-start shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono font-bold bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 px-2 py-0.5 rounded">{selectedTicket.id}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${getStatusStyle(selectedTicket.status)}`}>{selectedTicket.status}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-docka-900 dark:text-zinc-100">{selectedTicket.subject}</h2>
                                    <p className="text-sm text-docka-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                                        <User size={14} /> {selectedTicket.client}
                                        <span className="text-docka-300 dark:text-zinc-600">|</span>
                                        <Clock size={14} /> Aberto: {selectedTicket.time}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 border border-docka-200 dark:border-zinc-700 rounded-lg text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors" title="Deletar">
                                        <Trash2 size={18} />
                                    </button>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as any)}
                                        className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-700 dark:text-zinc-300 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-docka-400 dark:focus:border-zinc-600 cursor-pointer"
                                    >
                                        <option value="open">Aberto</option>
                                        <option value="pending">Pendente</option>
                                        <option value="resolved">Resolvido</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-docka-50/50 dark:bg-zinc-950/30 rounded-lg my-4 border border-docka-100 dark:border-zinc-800">
                                {selectedTicket.messages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'agent' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs font-bold text-docka-700 dark:text-zinc-300">{msg.sender}</span>
                                            <span className="text-[10px] text-docka-400 dark:text-zinc-500">{msg.timestamp}</span>
                                        </div>
                                        <div className={`p-3 rounded-xl max-w-[80%] text-sm leading-relaxed shadow-sm ${msg.role === 'agent'
                                            ? 'bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-tr-none'
                                            : 'bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-800 dark:text-zinc-200 rounded-tl-none'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="mt-auto pt-2 shrink-0">
                                <div className="border border-docka-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 shadow-sm focus-within:ring-2 focus-within:ring-docka-100 dark:focus-within:ring-zinc-700 focus-within:border-docka-300 dark:focus-within:border-zinc-600 transition-all">
                                    <textarea
                                        className="w-full p-3 bg-transparent text-sm outline-none resize-none max-h-32 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                        placeholder="Escreva uma resposta..."
                                        rows={3}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                                    />
                                    <div className="flex justify-between items-center px-3 pb-3 pt-1">
                                        <div className="flex gap-2">
                                            <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded transition-colors"><Paperclip size={16} /></button>
                                            <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded transition-colors"><Tag size={16} /></button>
                                        </div>
                                        <button
                                            onClick={handleSendReply}
                                            disabled={!replyText.trim()}
                                            className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-docka-800 dark:hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            Enviar <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* CREATE TICKET MODAL */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Novo Ticket de Suporte"
                    size="lg"
                    footer={
                        <>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors">Criar Ticket</button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente</label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100">
                                    <option>Selecione um cliente...</option>
                                    <option>Tokyon Systems</option>
                                    <option>Padaria do João</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Prioridade</label>
                                <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100">
                                    <option>Baixa</option>
                                    <option>Média</option>
                                    <option>Alta</option>
                                    <option>Urgente</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Assunto</label>
                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Resumo do problema" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Descrição Detalhada</label>
                            <textarea className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 min-h-[100px] resize-none text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Descreva o problema em detalhes..." />
                        </div>
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default HostiziSupportView;
