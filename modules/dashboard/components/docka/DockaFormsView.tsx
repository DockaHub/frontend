
import React, { useState } from 'react';
import { 
  FileInput, Plus, Search, Filter, MoreHorizontal, 
  Workflow, Copy, Code, CheckCircle2, Eye, 
  ArrowRight, Building2, Layers 
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ORGANIZATIONS } from '../../../../constants';

// Mock existing forms
const MOCK_FORMS = [
    { 
        id: 'frm_01', 
        name: 'Contato Site Institucional', 
        org: 'Tokyon', 
        target: 'Pipeline Vendas > Novos Leads', 
        views: 1240, 
        leads: 85, 
        conversion: '6.8%', 
        status: 'active' 
    },
    { 
        id: 'frm_02', 
        name: 'Landing Page - Summer Vibes', 
        org: 'Fauves', 
        target: 'Vendas Ingressos > Interessados', 
        views: 5400, 
        leads: 1200, 
        conversion: '22.2%', 
        status: 'active' 
    },
    { 
        id: 'frm_03', 
        name: 'Solicitação de Marca', 
        org: 'Asterysko', 
        target: 'CRM > Triagem', 
        views: 320, 
        leads: 12, 
        conversion: '3.7%', 
        status: 'paused' 
    },
];

const DockaFormsView: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any | null>(null); // For embed view
  
  // Form Builder State
  const [formData, setFormData] = useState({
      name: '',
      targetOrgId: '',
      targetStage: 'leads', // Default 'leads' column in mock Kanbans
      fields: {
          name: true,
          email: true,
          phone: false,
          company: false,
          message: false
      }
  });

  const handleCreate = () => {
      // In a real app, this would save to DB
      setIsCreateModalOpen(false);
      // Reset
      setFormData({
          name: '',
          targetOrgId: '',
          targetStage: 'leads',
          fields: { name: true, email: true, phone: false, company: false, message: false }
      });
  };

  const getEmbedCode = (formId: string) => {
      return `<script src="https://docka.io/forms.js" data-id="${formId}"></script>\n<div id="docka-form-${formId}"></div>`;
  };

  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
        <div className="max-w-6xl mx-auto">
            
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Formulários & Captura</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Crie formulários e roteie leads automaticamente para os Kanbans das empresas.</p>
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Criar Formulário
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileInput size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">1,297</div>
                        <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Leads Capturados (Mês)</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><CheckCircle2 size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">14.5%</div>
                        <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Taxa de Conversão Média</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Workflow size={24} /></div>
                    <div>
                        <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Active</div>
                        <div className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-bold">Automação de Roteamento</div>
                    </div>
                </div>
            </div>

            {/* Forms List */}
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" 
                            placeholder="Buscar formulários..." 
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50">
                            <Filter size={14} /> Status
                        </button>
                    </div>
                </div>
                
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Nome do Formulário</th>
                            <th className="px-6 py-4">Destino (Automação)</th>
                            <th className="px-6 py-4 text-center">Views</th>
                            <th className="px-6 py-4 text-center">Leads</th>
                            <th className="px-6 py-4 text-center">Conv.</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-100 dark:divide-zinc-800">
                        {MOCK_FORMS.map((form) => (
                            <tr key={form.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-docka-900 dark:text-zinc-100">{form.name}</div>
                                    <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono">{form.id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-white dark:bg-zinc-900 ${
                                            form.org === 'Tokyon' ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900' :
                                            form.org === 'Fauves' ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900' :
                                            'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
                                        }`}>
                                            {form.org}
                                        </span>
                                        <ArrowRight size={12} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="text-xs text-docka-600 dark:text-zinc-400">{form.target}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-docka-600 dark:text-zinc-400">{form.views}</td>
                                <td className="px-6 py-4 text-center font-bold text-docka-900 dark:text-zinc-100">{form.leads}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">{form.conversion}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`w-2 h-2 rounded-full mx-auto ${form.status === 'active' ? 'bg-emerald-500' : 'bg-docka-300 dark:bg-zinc-600'}`} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => setSelectedForm(form)}
                                            className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors" 
                                            title="Ver Código / Embed"
                                        >
                                            <Code size={16} />
                                        </button>
                                        <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* CREATE FORM MODAL */}
        <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Novo Formulário de Captura"
            size="lg"
            footer={
                <>
                    <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleCreate} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors">Criar & Gerar Código</button>
                </>
            }
        >
            <div className="space-y-6">
                
                {/* Step 1: Basic Info */}
                <div>
                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome Interno</label>
                    <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100" 
                        placeholder="Ex: Newsletter Site Tokyon" 
                    />
                </div>

                <div className="h-px bg-docka-100 dark:bg-zinc-800" />

                {/* Step 2: Automation Routing */}
                <div>
                    <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                        <Workflow size={16} className="text-indigo-600 dark:text-indigo-400" /> Automação de Destino
                    </h3>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-1">Organização</label>
                                <div className="relative">
                                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500" />
                                    <select 
                                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm outline-none focus:border-indigo-400 text-docka-900 dark:text-zinc-100"
                                        value={formData.targetOrgId}
                                        onChange={(e) => setFormData({...formData, targetOrgId: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        {ORGANIZATIONS.filter(o => o.slug !== 'docka').map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase mb-1">Funil / Kanban</label>
                                <div className="relative">
                                    <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 dark:text-indigo-500" />
                                    <select 
                                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm outline-none focus:border-indigo-400 text-docka-900 dark:text-zinc-100"
                                        value={formData.targetStage}
                                        onChange={(e) => setFormData({...formData, targetStage: e.target.value})}
                                    >
                                        <option value="leads">Novos Leads</option>
                                        <option value="contacts">Contatos Gerais</option>
                                        <option value="support">Suporte / Helpdesk</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300">
                            * Todo lead capturado será criado automaticamente como um card na coluna <strong>{formData.targetStage === 'leads' ? 'Novos Leads' : 'Entrada'}</strong> do workspace selecionado.
                        </p>
                    </div>
                </div>

                <div className="h-px bg-docka-100 dark:bg-zinc-800" />

                {/* Step 3: Fields */}
                <div>
                    <h3 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-3">Campos do Formulário</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { key: 'name', label: 'Nome Completo' },
                            { key: 'email', label: 'E-mail Corporativo' },
                            { key: 'phone', label: 'Telefone / WhatsApp' },
                            { key: 'company', label: 'Empresa' },
                            { key: 'message', label: 'Mensagem / Observação' },
                        ].map((field) => (
                            <label key={field.key} className="flex items-center gap-2 p-3 border border-docka-200 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={formData.fields[field.key as keyof typeof formData.fields]} 
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        fields: { ...formData.fields, [field.key]: e.target.checked }
                                    })}
                                    className="accent-docka-900 dark:accent-zinc-100"
                                />
                                <span className="text-sm text-docka-700 dark:text-zinc-300">{field.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

            </div>
        </Modal>

        {/* EMBED CODE MODAL */}
        <Modal
            isOpen={!!selectedForm}
            onClose={() => setSelectedForm(null)}
            title="Integrar Formulário"
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-docka-600 dark:text-zinc-400">Copie o código abaixo e cole no HTML do seu site (WordPress, Webflow, etc) onde deseja que o formulário apareça.</p>
                
                <div className="bg-docka-900 dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl p-4 relative group">
                    <pre className="text-xs text-docka-300 dark:text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                        {selectedForm ? getEmbedCode(selectedForm.id) : ''}
                    </pre>
                    <button 
                        className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                        title="Copiar"
                        onClick={() => { navigator.clipboard.writeText(getEmbedCode(selectedForm.id)); }}
                    >
                        <Copy size={14} />
                    </button>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-lg flex gap-3">
                    <Eye size={20} className="text-yellow-600 dark:text-yellow-500 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Preview</h4>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300/70 mt-1">
                            O formulário herdará automaticamente os estilos CSS do seu site para manter a consistência visual.
                        </p>
                    </div>
                </div>
            </div>
        </Modal>

    </div>
  );
};

export default DockaFormsView;
