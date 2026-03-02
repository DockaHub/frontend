
import React, { useState, useEffect } from 'react';
import { Search, Globe, RotateCw, AlertTriangle, MoreHorizontal, User, Plus, Filter, CheckCircle2, X, RefreshCw, Server, ExternalLink } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

interface Domain {
    id: string;
    name: string;
    client: string;
    expires: string;
    autoRenew: boolean;
    status: 'active' | 'expired' | 'transfer_pending';
    profit: string;
    provider: string; // e.g. ResellerClub, Enom
}

const INITIAL_DOMAINS: Domain[] = [
    { id: 'dom_01', name: 'tokyon.jp', client: 'Tokyon Systems', expires: '20/12/2026', autoRenew: true, status: 'active', profit: 'R$ 20,00', provider: 'ResellerClub' },
    { id: 'dom_02', name: 'padariajoao.com.br', client: 'Padaria do João', expires: '15/03/2026', autoRenew: false, status: 'active', profit: 'R$ 15,00', provider: 'Registro.br' },
    { id: 'dom_03', name: 'superloja.store', client: 'Carlos Vendas', expires: 'Ontem', autoRenew: false, status: 'expired', profit: 'R$ 0,00', provider: 'Namecheap' },
];

const HostiziDomainsView: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>(INITIAL_DOMAINS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Close menus on outside click
  useEffect(() => {
      const handleClickOutside = () => {
          setActiveMenuId(null);
          setIsFilterOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRegisterDomain = () => {
      // Mock creation
      const newDomain: Domain = {
          id: `dom_${Date.now()}`,
          name: 'novodominio.com',
          client: 'Cliente Selecionado',
          expires: '24/02/2027',
          autoRenew: true,
          status: 'active',
          profit: 'R$ 18,50',
          provider: 'ResellerClub'
      };
      setDomains([newDomain, ...domains]);
      setIsRegisterModalOpen(false);
  };

  const toggleAutoRenew = (id: string) => {
      setDomains(prev => prev.map(d => d.id === id ? { ...d, autoRenew: !d.autoRenew } : d));
  };

  const filteredDomains = domains.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
        <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Registro de Domínios</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie TLDs, renovações e DNS de clientes.</p>
                </div>
                <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 shadow-sm flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> Registrar Domínio
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-docka-50/30 dark:bg-zinc-800/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar domínio ou cliente..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                                className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-docka-100 dark:bg-zinc-700 border-docka-300 dark:border-zinc-600 text-docka-900 dark:text-zinc-100' : 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700'}`}
                            >
                                <Filter size={14} /> Filtros
                            </button>
                            {isFilterOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95">
                                    <button onClick={() => setStatusFilter('all')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-700 dark:text-zinc-300">Todos</button>
                                    <button onClick={() => setStatusFilter('active')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-emerald-600 dark:text-emerald-400">Ativos</button>
                                    <button onClick={() => setStatusFilter('expired')} className="w-full text-left px-4 py-2 text-sm hover:bg-docka-50 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400">Expirados</button>
                                </div>
                            )}
                        </div>
                        <button className="text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 px-3 py-2 rounded-lg border border-transparent hover:bg-docka-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-sm font-medium transition-colors ml-auto md:ml-0">
                            <RotateCw size={14} /> <span className="hidden md:inline">Sincronizar</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Domínio</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Vencimento</th>
                                <th className="px-6 py-4">Auto-Renovação</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {filteredDomains.map((dom) => (
                                <tr key={dom.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded flex items-center justify-center font-bold text-xs shrink-0">
                                                <Globe size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{dom.name}</div>
                                                <div className="text-[10px] text-docka-400 dark:text-zinc-500">{dom.provider}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-docka-600 dark:text-zinc-400">
                                            <User size={14} className="text-docka-400 dark:text-zinc-500" /> {dom.client}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 ${dom.status === 'expired' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-docka-700 dark:text-zinc-300'}`}>
                                            {dom.expires}
                                            {dom.status === 'expired' && <AlertTriangle size={14} />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleAutoRenew(dom.id)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${dom.autoRenew ? 'bg-emerald-500' : 'bg-docka-300 dark:bg-zinc-600'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${dom.autoRenew ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            dom.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                            dom.status === 'expired' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' :
                                            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                        }`}>
                                            {dom.status === 'active' ? 'Ativo' : dom.status === 'expired' ? 'Expirado' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === dom.id ? null : dom.id); }}
                                                className={`p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 rounded hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors ${activeMenuId === dom.id ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : ''}`}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            
                                            {activeMenuId === dom.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                    <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                        <Server size={14} /> Gerenciar DNS
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                        <RefreshCw size={14} /> Renovar Agora
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700 flex items-center gap-2">
                                                        <ExternalLink size={14} /> Dados Whois
                                                    </button>
                                                    <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        Bloquear Transferência
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

            {/* REGISTER MODAL */}
            <Modal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                title="Registrar Novo Domínio"
                size="lg"
                footer={
                    <>
                        <button onClick={() => setIsRegisterModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={handleRegisterDomain} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm transition-colors">Registrar</button>
                    </>
                }
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Domínio Desejado</label>
                        <div className="flex">
                            <input 
                                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-l-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" 
                                placeholder="minhamarca"
                                autoFocus
                            />
                            <select className="px-3 py-2 bg-docka-50 dark:bg-zinc-900 border border-l-0 border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-docka-700 dark:text-zinc-300">
                                <option>.com (R$ 59,90)</option>
                                <option>.com.br (R$ 49,90)</option>
                                <option>.net (R$ 69,90)</option>
                                <option>.io (R$ 189,90)</option>
                            </select>
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Disponível para registro</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente Titular</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-docka-900 dark:text-zinc-100">
                                <option>Selecione um cliente...</option>
                                <option>Tokyon Systems</option>
                                <option>Fauves Events</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Período</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-docka-900 dark:text-zinc-100">
                                <option>1 Ano</option>
                                <option>2 Anos (5% off)</option>
                                <option>5 Anos (10% off)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg p-4">
                        <h4 className="text-xs font-bold text-docka-700 dark:text-zinc-300 uppercase mb-3">Configurações Adicionais</h4>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" defaultChecked />
                                <span className="text-sm text-docka-700 dark:text-zinc-300">Ativar Proteção de Privacidade (WhoisGuard)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" defaultChecked />
                                <span className="text-sm text-docka-700 dark:text-zinc-300">Renovação Automática</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" />
                                <span className="text-sm text-docka-700 dark:text-zinc-300">Usar DNS Padrão da Hostizi</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-docka-100 dark:border-zinc-700">
                        <span className="text-sm font-medium text-docka-600 dark:text-zinc-400">Total a pagar:</span>
                        <span className="text-xl font-bold text-docka-900 dark:text-zinc-100">R$ 59,90</span>
                    </div>
                </div>
            </Modal>

        </div>
    </div>
  );
};

export default HostiziDomainsView;
