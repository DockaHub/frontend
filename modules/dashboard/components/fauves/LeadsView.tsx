
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Trash2, 
  Download, 
  Search,
  Calendar,
  Layers,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { fauvesService } from '../../../../services/fauvesService';

interface Lead {
  id: string;
  contact: string;
  source: string;
  createdAt: string;
}

const LeadsView: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await fauvesService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      // In a real app we'd use a toast here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
    
    try {
      await fauvesService.deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Contato', 'Fonte', 'Data'];
    const rows = leads.map(l => [
      l.id,
      l.contact,
      l.source,
      new Date(l.createdAt).toLocaleString('pt-BR')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fauves_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => 
    l.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isEmail = (contact: string) => contact.includes('@');

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Newsletter & Leads</h1>
          <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie os contatos capturados no site da Fauves.</p>
        </div>
        <div className="flex gap-2">
           <button
            onClick={fetchLeads}
            disabled={loading}
            className="p-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-lg text-docka-500 hover:text-docka-900 dark:hover:text-zinc-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white shadow-sm transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total de Leads', value: leads.length, icon: Users, color: 'blue' },
          { label: 'Contatos por E-mail', value: leads.filter(l => isEmail(l.contact)).length, icon: Mail, color: 'indigo' },
          { label: 'Contatos WhatsApp', value: leads.filter(l => !isEmail(l.contact)).length, icon: Phone, color: 'emerald' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">
                {loading ? <Loader2 size={20} className="animate-spin text-docka-300" /> : stat.value}
              </div>
              <p className="text-xs font-medium text-docka-500 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden text-sm">
        <div className="p-4 border-b border-docka-200 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={16} />
            <input
              placeholder="Buscar por contato ou fonte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-docka-50/50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Fonte / Origem</th>
                <th className="px-6 py-4">Data de Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-docka-100 dark:divide-zinc-800">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-docka-200 mb-2" />
                    <span className="text-docka-400">Carregando leads...</span>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-docka-400">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEmail(lead.contact) ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}>
                          {isEmail(lead.contact) ? <Mail size={14} /> : <Phone size={14} />}
                        </div>
                        <span className="font-bold text-docka-900 dark:text-zinc-100">{lead.contact}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-docka-600 dark:text-zinc-400 font-medium">
                        <Layers size={14} className="text-docka-400" />
                        <span className="capitalize">{lead.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-docka-500 dark:text-zinc-500">
                        <Calendar size={14} />
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 text-docka-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsView;
