
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

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
            <div className="max-w-6xl mx-auto">
                
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Financeiro do Grupo</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão de custos, serviços e despesas da holding.</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm hover:scale-105 transition-transform shadow-lg"
                    >
                        <Plus size={18} /> Novo Lançamento
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Entradas Totais</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(summary?.totalIncome || 0)}</h3>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform dark:text-zinc-100">
                            <Wallet size={80} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                            <TrendingDown size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Saídas do Grupo</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{formatCurrency(summary?.totalExpenses || 0)}</h3>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform dark:text-zinc-100">
                            <Receipt size={80} />
                        </div>
                    </div>

                    <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                        <div className="flex items-center gap-2 mb-4 text-docka-200 dark:text-zinc-500">
                            <DollarSign size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Saldo em Caixa</span>
                        </div>
                        <h3 className="text-3xl font-bold">{formatCurrency(summary?.balance || 0)}</h3>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                            <CreditCard size={80} />
                        </div>
                    </div>
                </div>

                {/* Entries Table */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Últimos Lançamentos</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Descrição</th>
                                    <th className="px-6 py-3">Categoria</th>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-docka-900 dark:text-zinc-100">{entry.description}</div>
                                            <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono">{entry.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 px-2 py-1 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-docka-600 dark:text-zinc-400 uppercase w-fit">
                                                {getCategoryIcon(entry.category)}
                                                {entry.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-docka-500 dark:text-zinc-500 text-xs">
                                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${entry.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {entry.type === 'INCOME' ? '+' : '-'} {formatCurrency(entry.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(entry.id)}
                                                className="p-2 text-docka-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {entries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-docka-400 dark:text-zinc-600">
                                            Nenhum lançamento financeiro encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Lançamento */}
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <form onSubmit={handleAddEntry}>
                                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Novo Lançamento</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Registre uma nova entrada ou saída do grupo.</p>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Descrição</label>
                                        <input 
                                            required
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Ex: Assinatura AWS, Salário Equipe..."
                                            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-docka-500 transition-colors dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Valor (R$)</label>
                                            <input 
                                                required
                                                type="number"
                                                step="0.01"
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-docka-500 transition-colors dark:text-white text-right font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Tipo</label>
                                            <select 
                                                value={type}
                                                onChange={e => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-docka-500 transition-colors dark:text-white font-medium"
                                            >
                                                <option value="EXPENSE">Saída / Gasto</option>
                                                <option value="INCOME">Entrada / Receita</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1.5">Categoria</label>
                                        <select 
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-docka-500 transition-colors dark:text-white font-medium"
                                        >
                                            <option value="OTHER">Outros</option>
                                            <option value="PAYROLL">Folha de Pagamento</option>
                                            <option value="CLOUD">Serviços Cloud (AWS/Google)</option>
                                            <option value="SAAS">Assinaturas SaaS</option>
                                            <option value="RENT">Aluguel / Escritório</option>
                                            <option value="MARKETING">Marketing / Ads</option>
                                            <option value="TAXES">Impostos</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Confirmar Lançamento
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DockaGroupFinanceView;
