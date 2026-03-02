
import React from 'react';
import {
    ArrowLeft, User, Mail, Phone, Hash,
    Ticket, Calendar, MapPin, ExternalLink,
    CreditCard, DollarSign, Clock, Trash2,
    CheckCircle2, XCircle, Copy
} from 'lucide-react';
import { Order } from '../../../../types';

interface OrderDetailViewProps {
    order: Order;
    onBack: () => void;
    onDelete?: (id: string) => void;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onBack, onDelete }) => {

    const formatCurrency = (val: number) =>
        val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'pago':
            case 'aprovado':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    border: 'border-emerald-100 dark:border-emerald-800',
                    icon: <CheckCircle2 size={16} />,
                    label: 'Aprovado'
                };
            case 'canceled':
            case 'cancelado':
                return {
                    bg: 'bg-red-50 dark:bg-red-900/30',
                    text: 'text-red-700 dark:text-red-400',
                    border: 'border-red-100 dark:border-red-800',
                    icon: <XCircle size={16} />,
                    label: 'Cancelado'
                };
            default:
                return {
                    bg: 'bg-amber-50 dark:bg-amber-900/30',
                    text: 'text-amber-700 dark:text-amber-400',
                    border: 'border-amber-100 dark:border-amber-800',
                    icon: <Clock size={16} />,
                    label: 'Pendente'
                };
        }
    };

    const statusObj = getStatusStyle(order.status);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here if available
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-all hover:shadow-md"
                    >
                        <div className="flex items-center gap-2">
                            <ArrowLeft size={18} />
                            <span className="text-sm font-bold pr-1">Voltar</span>
                        </div>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-3">
                            Pedido #{order.code || order.id.substring(0, 8).toUpperCase()}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-mono text-docka-400 dark:text-zinc-500 uppercase tracking-tight">ID: {order.id}</p>
                            <button onClick={() => copyToClipboard(order.id)} className="text-docka-300 hover:text-docka-500 transition-colors">
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500/20 text-docka-700 dark:text-zinc-300">
                        <option>Ações do Pedido</option>
                        <option>Enviar Email</option>
                        <option>Reenviar Ingressos</option>
                        <option>Estornar Pagamento</option>
                    </select>
                    <button
                        onClick={() => onDelete?.(order.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/10 transition-all"
                    >
                        <Trash2 size={16} /> Excluir Pedido
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Buyer Information */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <User size={20} className="text-amber-500" /> Informações do Comprador
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <p className="text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Nome</p>
                                <p className="text-zinc-900 dark:text-zinc-100 font-bold">{order.customer.name}</p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Telefone</label>
                                <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Phone size={14} className="text-docka-300" /> {order.customer.phone || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Email</label>
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-docka-300" />
                                    <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{order.customer.email}</span>
                                    <button onClick={() => copyToClipboard(order.customer.email)} className="text-docka-300 hover:text-docka-500 transition-colors ml-1">
                                        <Copy size={12} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">CPF/CNPJ</label>
                                <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Hash size={14} className="text-docka-300" /> {order.customer.document || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tickets List */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <Ticket size={20} className="text-amber-500" /> Ingressos ({order.tickets?.length || 0})
                        </h3>

                        <div className="space-y-4">
                            {order.tickets?.map((ticket, idx) => (
                                <div key={idx} className="group p-5 bg-docka-50/50 dark:bg-zinc-800/30 border border-docka-100 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:bg-docka-50 dark:hover:bg-zinc-800/50">
                                    <div>
                                        <h4 className="font-bold text-docka-900 dark:text-zinc-100">{order.event}</h4>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <span className="text-xs text-docka-500 dark:text-zinc-400">{ticket.name} • {ticket.userName}</span>
                                            <span className="text-[10px] font-mono text-docka-400 uppercase">Cód: {ticket.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 self-end md:self-center">
                                        <div className="text-right">
                                            <p className="font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(ticket.price)}</p>
                                            <span className="text-[10px] font-bold text-docka-400 uppercase tracking-wider">{ticket.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Event Info */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-amber-500" /> Informações do Evento
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Nome do Evento</label>
                                <p className="text-base font-bold text-docka-900 dark:text-zinc-100">{order.event}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Data</label>
                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                        <Calendar size={14} className="text-docka-300" /> {order.eventDate || order.date}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Local</label>
                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                        <MapPin size={14} className="text-docka-300" /> {order.eventLocation || 'Fortaleza'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                    <ExternalLink size={14} /> Ver Evento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Status Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6">Status do Pedido</h3>

                        <div className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl border ${statusObj.border} ${statusObj.bg}`}>
                            <div className={`${statusObj.text} mb-3 scale-125`}>{statusObj.icon}</div>
                            <span className={`text-sm font-bold ${statusObj.text} uppercase tracking-widest`}>
                                {statusObj.label}
                            </span>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <DollarSign size={18} className="text-emerald-500" /> Resumo Financeiro
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-docka-500 dark:text-zinc-500">Subtotal</span>
                                <span className="font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(order.subtotal || order.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-docka-500 dark:text-zinc-500">Taxa de Serviço</span>
                                <span className="font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(order.serviceFee || 0)}</span>
                            </div>
                            <div className="pt-4 border-t border-docka-100 dark:border-zinc-800">
                                <div className="bg-emerald-50 dark:bg-emerald-500/5 p-4 rounded-xl flex justify-between items-center">
                                    <span className="font-bold text-docka-900 dark:text-zinc-100">Total</span>
                                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(order.amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <CreditCard size={18} className="text-indigo-500" /> Informações de Pagamento
                        </h3>

                        <div>
                            <label className="block text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Método</label>
                            <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                <CreditCard size={14} className="text-docka-300" /> {order.paymentMethod || 'Cartão de Crédito'}
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-slate-500" /> Timeline
                        </h3>

                        <div className="space-y-6">
                            {order.timeline?.map((step, idx) => (
                                <div key={idx} className="flex gap-4 relative">
                                    {idx !== (order.timeline?.length || 0) - 1 && (
                                        <div className="absolute left-4 top-8 bottom-0 w-px bg-docka-100 dark:bg-zinc-800" />
                                    )}
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 z-10">
                                        <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 leading-tight">{step.status}</p>
                                        <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1">
                                            {new Date(step.date).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetailView;
