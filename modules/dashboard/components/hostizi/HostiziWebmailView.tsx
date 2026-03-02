
import React, { useState, useEffect } from 'react';
import { Mail, Plus, Search, Filter, ExternalLink, Settings, Lock, Trash2, HardDrive, RefreshCw, MoreHorizontal, CheckCircle2, AlertTriangle, X, Shield } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

interface EmailAccount {
    id: string;
    email: string;
    domain: string;
    usage: number; // Percentage
    usageVal: string; // e.g. 1.2 GB
    quota: string; // e.g. 10 GB
    status: 'active' | 'suspended' | 'full';
}

const INITIAL_ACCOUNTS: EmailAccount[] = [
    { id: 'em_01', email: 'contato@tokyon.jp', domain: 'tokyon.jp', usage: 45, usageVal: '4.5 GB', quota: '10 GB', status: 'active' },
    { id: 'em_02', email: 'financeiro@tokyon.jp', domain: 'tokyon.jp', usage: 12, usageVal: '600 MB', quota: '5 GB', status: 'active' },
    { id: 'em_03', email: 'alex@docka.io', domain: 'docka.io', usage: 85, usageVal: '42.5 GB', quota: '50 GB', status: 'active' },
    { id: 'em_04', email: 'no-reply@fauves.com', domain: 'fauves.com', usage: 1, usageVal: '10 MB', quota: '1 GB', status: 'active' },
    { id: 'em_05', email: 'suporte@fauves.com', domain: 'fauves.com', usage: 98, usageVal: '4.9 GB', quota: '5 GB', status: 'full' },
];

const HostiziWebmailView: React.FC = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>(INITIAL_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [domainFilter, setDomainFilter] = useState('all');

  // Close menus on outside click
  useEffect(() => {
      const handleClickOutside = () => {
          setActiveMenuId(null);
          setIsFilterOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleCreateAccount = () => {
      // Mock creation
      const newAccount: EmailAccount = {
          id: `em_${Date.now()}`,
          email: 'novo.usuario@tokyon.jp',
          domain: 'tokyon.jp',
          usage: 0,
          usageVal: '0 KB',
          quota: '5 GB',
          status: 'active'
      };
      setAccounts([newAccount, ...accounts]);
      setIsCreateModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir esta conta de e-mail? Todos os dados serão perdidos.')) {
          setAccounts(prev => prev.filter(a => a.id !== id));
      }
  };

  const filteredAccounts = accounts.filter(acc => {
      const matchesSearch = acc.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDomain = domainFilter === 'all' || acc.domain === domainFilter;
      return matchesSearch && matchesDomain;
  });

  const uniqueDomains = Array.from(new Set(accounts.map(a => a.domain)));

  // Derived Stats
  const totalUsageGB = accounts.reduce((acc, curr) => {
      const val = parseFloat(curr.usageVal.split(' ')[0]);
      return acc + (curr.usageVal.includes('MB') ? val / 1024 : val);
  }, 0).toFixed(1);

  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Contas de E-mail</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie caixas postais, encaminhamentos e quotas.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Criar Conta
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider">Contas Ativas</p>
                        <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mt-1">{accounts.length}</h3>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                        <Mail size={20} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider">Espaço em Disco</p>
                        <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mt-1">{totalUsageGB} GB</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                        <HardDrive size={20} />
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase tracking-wider">Encaminhamentos</p>
                        <h3 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mt-1">8</h3>
                    </div>
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                        <RefreshCw size={20} />
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-docka-50/30 dark:bg-zinc-800/30">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 focus:border-emerald-400 dark:focus:border-emerald-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" 
                            placeholder="Buscar conta..." 
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                                className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-docka-100 dark:bg-zinc-700 border-docka-300 dark:border-zinc-600 text-docka-900 dark:text-zinc-100' : 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700'}`}
                            >
                                <Filter size={14} /> Domínio
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95">
                                    <button onClick={() => setDomainFilter('all')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-700 dark:text-zinc-300">Todos</button>
                                    <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                    {uniqueDomains.map(d => (
                                        <button key={d} onClick={() => setDomainFilter(d)} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-700 dark:text-zinc-300">{d}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Endereço de E-mail</th>
                                <th className="px-6 py-4">Uso / Quota</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Acesso Rápido</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {filteredAccounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-docka-900 dark:text-zinc-100">{acc.email}</div>
                                        {acc.usage > 90 && <div className="text-[10px] text-red-500 dark:text-red-400 font-bold mt-1">Quota Quase Cheia</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full max-w-[140px]">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={`font-medium ${acc.usage > 90 ? 'text-red-600 dark:text-red-400' : 'text-docka-700 dark:text-zinc-300'}`}>{acc.usage}%</span>
                                                <span className="text-docka-400 dark:text-zinc-500">{acc.quota}</span>
                                            </div>
                                            <div className="w-full bg-docka-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${acc.usage > 90 ? 'bg-red-500' : acc.usage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                    style={{ width: `${acc.usage}%` }} 
                                                />
                                            </div>
                                            <div className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1">{acc.usageVal} usados</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            acc.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                            acc.status === 'full' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' :
                                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                        }`}>
                                            {acc.status === 'active' ? 'Ativo' : acc.status === 'full' ? 'Cheio' : 'Suspenso'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => window.open(`https://webmail.${acc.domain}`, '_blank')}
                                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-1.5 rounded transition-colors flex items-center gap-1 ml-auto"
                                        >
                                            <ExternalLink size={12} /> Webmail
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === acc.id ? null : acc.id); }}
                                                className={`p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 rounded hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors ${activeMenuId === acc.id ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : ''}`}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenuId === acc.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                    <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                        <Lock size={14} /> Alterar Senha
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                        <Settings size={14} /> Configurar Cliente
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                        <RefreshCw size={14} /> Suspender Conta
                                                    </button>
                                                    <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                                    <button 
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> Excluir Conta
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE ACCOUNT MODAL */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Criar Conta de E-mail"
                size="md"
                footer={
                    <>
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={handleCreateAccount} className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-colors">Criar Conta</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Endereço de E-mail</label>
                        <div className="flex">
                            <input 
                                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-l-lg text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 focus:border-emerald-400 dark:focus:border-emerald-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" 
                                placeholder="usuario"
                                autoFocus
                            />
                            <div className="px-3 py-2 bg-docka-50 dark:bg-zinc-900 border border-l-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-sm font-medium">@</div>
                            <select className="px-3 py-2 bg-white dark:bg-zinc-800 border border-l-0 border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-docka-700 dark:text-zinc-300 w-40">
                                <option>tokyon.jp</option>
                                <option>fauves.com</option>
                                <option>docka.io</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Senha</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input type="password" className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-docka-900 dark:text-zinc-100" placeholder="••••••••" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Confirmar Senha</label>
                            <input type="password" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-docka-900 dark:text-zinc-100" placeholder="••••••••" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Quota de Disco</label>
                        <div className="flex gap-2">
                            <input type="number" className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-docka-900 dark:text-zinc-100" defaultValue="1024" />
                            <select className="px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100">
                                <option>MB</option>
                                <option>GB</option>
                            </select>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <input type="checkbox" id="unlimited" className="accent-emerald-600 dark:accent-emerald-500" />
                            <label htmlFor="unlimited" className="text-sm text-docka-600 dark:text-zinc-400">Ilimitado</label>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg flex gap-3">
                        <Shield size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="text-xs text-blue-800 dark:text-blue-300">
                            <strong>Dica de Segurança:</strong> Recomendamos senhas com pelo menos 12 caracteres, incluindo símbolos e números.
                        </div>
                    </div>
                </div>
            </Modal>

        </div>
    </div>
  );
};

export default HostiziWebmailView;
