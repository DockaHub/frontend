import React, { useState, useEffect } from 'react';
import {
    FileInput, Plus, Search, Filter, MoreHorizontal,
    Workflow, Copy, Code, CheckCircle2, Eye,
    ArrowRight, Building2, Layers
} from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ORGANIZATIONS } from '../../../../constants';
import api from '../../../../services/api';
import DashboardPage from '../../../../components/DashboardPage';

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

                    <div className="overflow-x-auto">
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
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-bold uppercase text-docka-400 tracking-widest">Carregando formulários...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {forms.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Eye size={32} className="text-docka-200 dark:text-zinc-800 mb-2" />
                                                        <p className="text-[10px] font-bold uppercase text-docka-400 tracking-widest">Nenhum formulário ativo no momento.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {forms.map((form) => (
                                                    <tr key={form.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm tracking-tight">{form.name}</div>
                                                            <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono uppercase mt-0.5 tracking-tighter">{form.id}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border shadow-sm ${
                                                                    form.org === 'Tokyon' ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10' :
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
                                                    </tr>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardPage>
    );
};

export default DockaFormsView;
