
import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, DollarSign } from 'lucide-react';
import { Order } from '../../../../types';
import { fauvesService } from '../../../../services/fauvesService';
import OrderDetailView from './OrderDetailView';

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        approved: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        pago: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        aprovado: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
        pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
        pendente: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800',
        canceled: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800',
        cancelado: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
    };
    const s = (status || 'pending').toLowerCase();
    const style = styles[s as keyof typeof styles] || styles.pending;

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${style}`}>
            {status}
        </span>
    );
};

const RotateCw = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
);

const FinanceView: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Navigation state
    const [view, setView] = useState<'list' | 'details'>('list');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [itemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fauvesService.getOrders(currentPage, itemsPerPage);
            setOrders(data.items);
            setTotalItems(data.total);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            const status = err.response?.status;
            let msg = 'Erro ao carregar transações da plataforma remota.';
            if (status === 401) msg = '(401: Não autorizado - Token inválido)';
            else if (status === 404) msg = '(404: Não encontrado)';
            else if (status) msg = `(Erro ${status})`;

            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'list') {
            fetchOrders();
        }
    }, [currentPage, view]);

    const handleViewDetails = async (orderId: string) => {
        setIsLoading(true);
        try {
            const details = await fauvesService.getOrder(orderId);
            setSelectedOrder(details);
            setView('details');
        } catch (err) {
            console.error('Failed to fetch order details', err);
            // Fallback: use limited data from list if detail fetch fails
            const basicOrder = orders.find(o => o.id === orderId);
            if (basicOrder) {
                setSelectedOrder(basicOrder);
                setView('details');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (view === 'details' && selectedOrder) {
        return (
            <OrderDetailView
                order={selectedOrder}
                onBack={() => {
                    setView('list');
                    setSelectedOrder(null);
                }}
            />
        );
    }

    const totalRevenue = orders.reduce((acc, order) => order.status === 'approved' ? acc + order.amount : acc, 0);

    return (
        <div className="animate-in fade-in duration-300 pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Pedidos & Transações</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie todas as vendas e pagamentos.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{totalItems}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500">Total de Pedidos</p>
                    </div>
                    <div className="w-10 h-10 bg-docka-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-docka-400 dark:text-zinc-500">
                        <Filter size={20} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                            (Página) R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-500">Receita Aprovada (Visível)</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <DollarSign size={20} />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-t-xl border border-docka-200 dark:border-zinc-800 border-b-0 flex justify-between items-center">
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                    <input
                        placeholder="Buscar por código ou email..."
                        className="w-full pl-9 pr-4 py-1.5 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchOrders}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-md text-xs font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <RotateCw size={12} />} Atualizar
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-b-xl overflow-hidden shadow-sm">
                {isLoading && view === 'list' ? (
                    <div className="h-64 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500">
                        <Loader2 size={32} className="animate-spin mb-4" />
                        <p className="text-sm">Buscando transações da plataforma...</p>
                    </div>
                ) : error ? (
                    <div className="h-64 flex flex-col items-center justify-center text-red-500 p-8 text-center">
                        <p className="font-medium mb-2">{error}</p>
                        <button onClick={fetchOrders} className="text-xs underline text-red-600">Recarregar</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-500 italic">
                        Nenhum pedido encontrado.
                    </div>
                ) : (
                    <>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-medium text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800">Código</th>
                                    <th className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800">Cliente</th>
                                    <th className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800">Valor</th>
                                    <th className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800">Status</th>
                                    <th className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800">Data</th>
                                    <th className="px-6 py-3 border-b border-docka-100 dark:border-zinc-800 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-docka-600 dark:text-zinc-400">{order.code || order.id.substring(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-docka-900 dark:text-zinc-100">{order.customer.name}</div>
                                            <div className="text-xs text-docka-400 dark:text-zinc-500">{order.customer.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-docka-900 dark:text-zinc-100">
                                            R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">
                                            {order.date}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewDetails(order.id)}
                                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-all"
                                            >
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between border-t border-docka-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
                            <div className="text-sm text-docka-500 dark:text-zinc-400">
                                Mostrando {orders.length} de {totalItems} pedidos (Página {currentPage} de {Math.ceil(totalItems / itemsPerPage) || 1})
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm disabled:opacity-50 hover:bg-docka-50 dark:hover:bg-zinc-800"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                                    className="px-3 py-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm disabled:opacity-50 hover:bg-docka-50 dark:hover:bg-zinc-800"
                                >
                                    Próxima
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinanceView;
