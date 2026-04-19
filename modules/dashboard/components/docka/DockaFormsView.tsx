import React, { useState, useEffect } from 'react';
import {
    FileInput, Plus, Search, Filter, MoreHorizontal,
    Workflow, Copy, Code, CheckCircle2, Eye,
    ArrowRight, Building2, Layers
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ORGANIZATIONS } from '../../../../constants';
import api from '../../../../services/api';

const DockaFormsView: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any | null>(null); // For embed view
    const [forms, setForms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/forms');
            setForms(response.data);
        } catch (error) {
            console.error('Error fetching forms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (!formData.name || !formData.targetOrgId) {
                alert('Preencha o nome e a organização de destino');
                return;
            }
            await api.post('/forms', formData);

            setIsCreateModalOpen(false);
            // Reset
            setFormData({
                name: '',
                targetOrgId: '',
                targetStage: 'leads',
                fields: { name: true, email: true, phone: false, company: false, message: false }
            });

            fetchForms();
        } catch (error) {
            console.error('Error creating form:', error);
            alert('Erro ao criar formulário');
        }
    };

    const getEmbedCode = (formId: string) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        return `<script src="${apiUrl}/forms/${formId}/script.js"></script>\n<form data-docka-form="${formId}">\n  <!-- Seus inputs normais aqui -->\n</form>`;
    };

    return (
import DashboardPage from '../../../../components/DashboardPage';

const DockaFormsView: React.FC = () => {
    // ... (mantenha estados e lógicas iguais)

    return (
        <DashboardPage 
            title="Formulários & Captura" 
            icon={FileInput}
            actions={
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-docka-800 dark:hover:bg-white/90 transition-all shadow-sm flex items-center gap-2"
                >
                    <Plus size={16} /> Criar Formulário
                </button>
            }
        >
            <div className="animate-in fade-in duration-500">
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-8 -mt-2">Crie formulários e roteie leads automaticamente para os Kanbans das empresas.</p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-5 border-l-4 border-l-blue-500">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner"><FileInput size={24} /></div>
                        <div>
                            <div className="text-xs text-docka-400 dark:text-zinc-500 uppercase font-bold tracking-widest mb-1">Leads Capturados</div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">1.297</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-5 border-l-4 border-l-emerald-500">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-inner"><CheckCircle2 size={24} /></div>
                        <div>
                            <div className="text-xs text-docka-400 dark:text-zinc-500 uppercase font-bold tracking-widest mb-1">Taxa de Conversão</div>
                            <div className="text-2xl font-bold text-docka-900 dark:text-zinc-100 font-mono tracking-tight">14.5%</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-center gap-5 border-l-4 border-l-purple-500">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl shadow-inner"><Workflow size={24} /></div>
                        <div>
                            <div className="text-xs text-docka-400 dark:text-zinc-500 uppercase font-bold tracking-widest mb-1">Status Automação</div>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Conectado</div>
                        </div>
                    </div>
                </div>

                {/* Forms List */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 font-sans shadow-sm"
                                placeholder="Buscar formulários..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50 transition-all">
                                <Filter size={14} /> Filtrar Status
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-bold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Nome do Formulário</th>
                                <th className="px-6 py-4">Destino (Automação)</th>
                                <th className="px-6 py-4 text-center">Visualizações</th>
                                <th className="px-6 py-4 text-center">Leads</th>
                                <th className="px-6 py-4 text-center">Conv.</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-100 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-6 h-6 border-2 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-bold uppercase text-docka-400 tracking-widest">Carregando formulários...</span>
                                    </div>
                                </td></tr>
                            ) : forms.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Eye size={32} className="text-docka-200 dark:text-zinc-800 mb-2" />
                                        <p className="text-[10px] font-bold uppercase text-docka-400 tracking-widest">Nenhum formulário ativo no momento.</p>
                                    </div>
                                </td></tr>
                            ) : forms.map((form) => (
                                <tr key={form.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm tracking-tight">{form.name}</div>
                                        <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono uppercase mt-0.5 tracking-tighter">{form.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border shadow-sm ${form.org === 'Tokyon' ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10' :
                                                    form.org === 'Fauves' ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/10' :
                                                        'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10'
                                                }`}>
                                                {form.org}
                                            </span>
                                            <ArrowRight size={10} className="text-docka-400 dark:text-zinc-500 shrink-0" />
                                            <span className="text-[10px] font-bold text-docka-600 dark:text-zinc-400 uppercase tracking-tighter truncate max-w-[100px]">{form.target}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-xs text-docka-600 dark:text-zinc-400">{form.views}</td>
                                    <td className="px-6 py-4 text-center font-mono text-sm font-bold text-docka-900 dark:text-zinc-100">{form.leads}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-tighter">{form.conversion}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className={`w-2 h-2 rounded-full mx-auto shadow-sm ${form.status === 'active' ? 'bg-emerald-500 ring-4 ring-emerald-500/10 dark:ring-emerald-500/5' : 'bg-docka-300 dark:bg-zinc-800'}`} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setSelectedForm(form)}
                                                className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                title="Ver Código / Embed"
                                            >
                                                <Code size={14} />
                                            </button>
                                            <button className="p-1.5 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-all">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </td>
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
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-xs font-bold uppercase text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={handleCreate} className="px-6 py-2 text-xs font-bold uppercase text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors tracking-widest leading-none">Criar & Gerar Código</button>
                    </>
                }
            >
                <div className="space-y-6 p-2">
                    <div>
                        <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 tracking-wider">Nome Interno</label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100"
                            placeholder="Ex: Newsletter Site Tokyon"
                        />
                    </div>

                    <div className="h-px bg-docka-100 dark:bg-zinc-800" />

                    <div>
                        <h3 className="text-xs font-bold text-docka-900 dark:text-zinc-100 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Workflow size={16} className="text-blue-600 dark:text-blue-400" /> Automação de Destino
                        </h3>
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-5 rounded-xl space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-blue-900 dark:text-blue-300 uppercase mb-2 tracking-wider">Empresa Destino</label>
                                    <div className="relative">
                                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" />
                                        <select
                                            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-docka-900 dark:text-zinc-100 uppercase transition-all focus:ring-2 focus:ring-blue-100"
                                            value={formData.targetOrgId}
                                            onChange={(e) => setFormData({ ...formData, targetOrgId: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            {ORGANIZATIONS.filter(o => o.slug !== 'docka').map(org => (
                                                <option key={org.id} value={org.id}>{org.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-blue-900 dark:text-blue-300 uppercase mb-2 tracking-wider">Etapa do Kanban</label>
                                    <div className="relative">
                                        <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" />
                                        <select
                                            className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold text-docka-900 dark:text-zinc-100 uppercase transition-all focus:ring-2 focus:ring-blue-100"
                                            value={formData.targetStage}
                                            onChange={(e) => setFormData({ ...formData, targetStage: e.target.value })}
                                        >
                                            <option value="leads">Novos Leads</option>
                                            <option value="contacts">Contatos Gerais</option>
                                            <option value="support">Suporte</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-blue-700/80 dark:text-blue-300 font-medium uppercase tracking-tight leading-relaxed">
                                * Cada submissão criará automaticamente um card na coluna de entrada do workspace selecionado.
                            </p>
                        </div>
                    </div>

                    <div className="h-px bg-docka-100 dark:bg-zinc-800" />

                    <div>
                        <h3 className="text-xs font-bold text-docka-900 dark:text-zinc-100 mb-4 uppercase tracking-widest">Campos Solicitados</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'name', label: 'Nome Completo' },
                                { key: 'email', label: 'E-mail Corporativo' },
                                { key: 'phone', label: 'Telefone / WhatsApp' },
                                { key: 'company', label: 'Empresa / Cargo' },
                                { key: 'message', label: 'Mensagem Livre' },
                            ].map((field) => (
                                <label key={field.key} className="flex items-center gap-3 p-3 border border-docka-100 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={formData.fields[field.key as keyof typeof formData.fields]}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            fields: { ...formData.fields, [field.key]: e.target.checked }
                                        })}
                                        className="h-4 w-4 rounded border-docka-300 text-docka-900 focus:ring-docka-900 accent-docka-900"
                                    />
                                    <span className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase tracking-tight">{field.label}</span>
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
                title="Integrar ao Site"
                size="md"
            >
                <div className="space-y-6">
                    <p className="text-xs font-medium text-docka-500 dark:text-zinc-400 uppercase tracking-wider">Copie o script abaixo e cole antes do fechamento da tag &lt;/body&gt; do seu site.</p>

                    <div className="bg-docka-900 dark:bg-black border border-docka-800 dark:border-zinc-800 rounded-xl p-5 relative group shadow-2xl">
                        <pre className="text-[11px] text-docka-300 dark:text-zinc-400 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                            {selectedForm ? getEmbedCode(selectedForm.id) : ''}
                        </pre>
                        <button
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all active:scale-95"
                            title="Copiar Código"
                            onClick={() => { navigator.clipboard.writeText(getEmbedCode(selectedForm.id)); }}
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-xl flex gap-4 items-start">
                        <Eye size={20} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-black text-amber-800 dark:text-amber-200 uppercase tracking-widest">Aviso de Estilização</h4>
                            <p className="text-[10px] text-amber-700 dark:text-amber-400/80 mt-1 uppercase font-bold leading-normal">
                                O formulário herdará as fontes e cores básicas do seu site para manter a integração invisível e nativa.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardPage>
    );
};

export default DockaFormsView;

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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                            onChange={(e) => setFormData({ ...formData, targetOrgId: e.target.value })}
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
                                            onChange={(e) => setFormData({ ...formData, targetStage: e.target.value })}
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
