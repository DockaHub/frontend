
import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Download, TrendingDown, TrendingUp, Wallet, Receipt, Users, Server, CreditCard } from 'lucide-react';
import { api } from '../../../../services/api';

interface FinancialEntry {
    id: string;
    description: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    date: string;
}

interface Summary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    count: number;
}

const DockaGroupFinanceView: React.FC = () => {
    const [entries, setEntries] = useState<FinancialEntry[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [category, setCategory] = useState('OTHER');

    const fetchData = async () => {
        try {
            const [entriesRes, summaryRes] = await Promise.all([
                api.get('/group-finance/entries'),
                api.get('/group-finance/summary')
            ]);
            setEntries(entriesRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/group-finance/entries', {
                description,
                amount: parseFloat(amount),
                type,
                category
            });
            setShowModal(false);
            setDescription('');
            setAmount('');
            fetchData();
        } catch (error) {
            alert('Erro ao salvar lançamento.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este lançamento?')) return;
        try {
            await api.delete(`/group-finance/entries/${id}`);
            fetchData();
        } catch (error) {
            alert('Erro ao excluir.');
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'PAYROLL': return <Users size={14} />;
            case 'CLOUD': return <Server size={14} />;
            case 'SAAS': return <Download size={14} />;
            case 'MARKETING': return <TrendingUp size={14} />;
            default: return <Receipt size={14} />;
        }
    };

import DashboardPage from '../../../../components/DashboardPage';

const DockaGroupFinanceView: React.FC = () => {
    // ... (mantenha estados e lógicas iguais até o return)

    return (
        <DashboardPage 
            title="Financeiro do Grupo" 
            icon={Wallet}
            actions={
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-docka-800 dark:hover:bg-white transition-all shadow-sm group"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Novo Lançamento
                </button>
            }
        >
            <div className="animate-in fade-in duration-500">
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-8 -mt-2">Gestão de custos, serviços e despesas consolidadas da holding.</p>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group border-l-4 border-l-emerald-500">
                        <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Entradas Totais</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">{formatCurrency(summary?.totalIncome || 0)}</h3>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform dark:text-zinc-100">
                            <Wallet size={80} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group border-l-4 border-l-red-500">
                        <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                            <TrendingDown size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Saídas do Grupo</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">{formatCurrency(summary?.totalExpenses || 0)}</h3>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform dark:text-zinc-100">
                            <Receipt size={80} />
                        </div>
                    </div>

                    <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                        <div className="flex items-center gap-2 mb-4 text-docka-400 dark:text-zinc-500">
                            <DollarSign size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Saldo em Caixa</span>
                        </div>
                        <h3 className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(summary?.balance || 0)}</h3>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <CreditCard size={80} />
                        </div>
                    </div>
                </div>

                {/* Entries Table */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-[10px] uppercase tracking-widest">Últimos Lançamentos</h3>
                        <button className="text-[10px] font-bold uppercase text-docka-400 hover:text-docka-600 transition-colors tracking-widest">Ver Todos</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-bold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-5">Descrição</th>
                                    <th className="px-6 py-5">Categoria</th>
                                    <th className="px-6 py-5">Data</th>
                                    <th className="px-6 py-5 text-right">Valor</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm tracking-tight">{entry.description}</div>
                                            <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono uppercase mt-0.5">{entry.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[10px]">
                                            <div className="flex items-center gap-2 px-2.5 py-1 bg-docka-50 dark:bg-zinc-950 border border-docka-100 dark:border-zinc-800 rounded-lg font-bold text-docka-600 dark:text-zinc-400 uppercase tracking-tighter w-fit">
                                                {getCategoryIcon(entry.category)}
                                                {entry.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs font-medium">
                                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold text-sm ${entry.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {entry.type === 'INCOME' ? '+' : '-'} {formatCurrency(entry.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-2 text-docka-200 dark:text-zinc-800 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {entries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Wallet size={40} className="text-docka-100 dark:text-zinc-800" />
                                                <p className="text-[10px] font-bold uppercase text-docka-400 dark:text-zinc-500 tracking-widest">Nenhum lançamento financeiro registrado.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Lançamento */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <form onSubmit={handleAddEntry}>
                                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Novo Lançamento</h3>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1 uppercase font-bold tracking-tight">Registre uma nova entrada ou saída do grupo.</p>
                                </div>
                                
                                <div className="p-8 space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2 tracking-wider">Descrição</label>
                                        <input 
                                            required
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Ex: Assinatura AWS, Salário Equipe..."
                                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 transition-all dark:text-white text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2 tracking-wider">Valor (R$)</label>
                                            <input 
                                                required
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 transition-all dark:text-white text-right font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2 tracking-wider">Tipo</label>
                                            <select 
                                                value={type}
                                                onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 transition-all dark:text-white text-xs font-bold uppercase tracking-widest"
                                            >
                                                <option value="EXPENSE">Saída / Gasto</option>
                                                <option value="INCOME">Entrada / Receita</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2 tracking-wider">Categoria</label>
                                        <select 
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 transition-all dark:text-white text-xs font-bold uppercase tracking-widest"
                                        >
                                            <option value="OTHER">Outros</option>
                                            <option value="PAYROLL">Folha de Pagamento</option>
                                            <option value="CLOUD">Serviços Cloud</option>
                                            <option value="SAAS">Assinaturas SaaS</option>
                                            <option value="RENT">Aluguel / Escritório</option>
                                            <option value="MARKETING">Marketing / Ads</option>
                                            <option value="TAXES">Impostos</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-8 bg-zinc-50 dark:bg-zinc-950/50 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-black dark:hover:bg-white transition-all active:scale-95"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
export default DockaGroupFinanceView;
