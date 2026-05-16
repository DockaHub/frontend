import React, { useState, useEffect, useRef } from 'react';
import { Tag, User, DollarSign, CheckCircle, ArrowRight, Clock, Send, AlignLeft, Trash2, Link as LinkIcon, QrCode, FileText, Layout, Copy, ExternalLink, ShieldCheck, Briefcase, Upload, Check, AlertTriangle, Bell, BellOff, Search as SearchIcon } from 'lucide-react';
import { KanbanCardData, Organization } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';

const extractInfoFromTags = (tags: any[]) => {
    const info: { cnpj?: string, address?: string, razaoSocial?: string } = {};
    if (!tags || !Array.isArray(tags)) return info;

    tags.forEach(tag => {
        const tagName = typeof tag === 'string' ? tag : (tag.label || '');
        const lowerTag = tagName.toLowerCase();

        if (lowerTag.includes('cnpj:') || lowerTag.includes('cpf:')) {
            info.cnpj = tagName.split(':')[1]?.trim();
        } else if (lowerTag.includes('endereço:') || lowerTag.includes('endereco:')) {
            info.address = tagName.split(':')[1]?.trim();
        } else if (lowerTag.includes('razão social:') || lowerTag.includes('razao social:')) {
            info.razaoSocial = tagName.split(':')[1]?.trim();
        }
    });

    return info;
};

interface DealDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: KanbanCardData;
    onUpdate: () => void;
    organization: Organization | null;
    members: any[];
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    deal, 
    onUpdate,
    organization,
    members
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'details' | 'activities' | 'notes'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<any>({ ...deal });
    const [newActivity, setNewActivity] = useState({ title: '', description: '', type: 'TASK' });
    const [isAddingActivity, setIsAddingActivity] = useState(false);
    const [notes, setNotes] = useState('');
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        if (deal) {
            setFormData({ ...deal });
            fetchActivities();
        }
    }, [deal]);

    const fetchActivities = async () => {
        try {
            const response = await api.get(`/asterysko/crm/deals/${deal.id}/activities`);
            setActivities(response.data);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const handleAutoSave = async (field: string, value: any) => {
        try {
            setFormData(prev => ({ ...prev, [field]: value }));
            await api.patch(`/asterysko/crm/deals/${deal.id}`, { [field]: value });
            onUpdate();
        } catch (error) {
            console.error('Auto-save failed:', error);
            toast({
                title: 'Erro ao salvar',
                description: 'Não foi possível salvar as alterações automaticamente.',
                type: 'error'
            });
        }
    };

    const handleConvert = async () => {
        try {
            setIsLoading(true);
            await api.post(`/asterysko/crm/deals/${deal.id}/convert`);
            toast({
                title: 'Sucesso!',
                description: 'Processo convertido em cliente com sucesso.',
                type: 'success'
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Conversion failed:', error);
            toast({
                title: 'Erro na conversão',
                description: 'Ocorreu um erro ao converter o processo.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const moveStatus = async (newStatus: string) => {
        try {
            setIsLoading(true);
            await api.put(`/asterysko/crm/deals/${deal.id}/status`, { status: newStatus });
            setFormData(prev => ({ ...prev, status: newStatus }));
            toast({
                title: 'Status atualizado',
                description: `Processo movido para a etapa: ${newStatus}`,
                type: 'success'
            });
            onUpdate();
        } catch (error) {
            console.error('Move status failed:', error);
            toast({
                title: 'Erro ao mover',
                description: 'Não foi possível atualizar o status do processo.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddActivity = async () => {
        if (!newActivity.title.trim()) return;
        try {
            setIsLoading(true);
            await api.post(`/asterysko/crm/deals/${deal.id}/activities`, newActivity);
            setNewActivity({ title: '', description: '', type: 'TASK' });
            setIsAddingActivity(false);
            fetchActivities();
        } catch (error) {
            console.error('Failed to add activity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const tagsInfo = extractInfoFromTags(deal.tags || []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Processo" size="xl">
            <div className="flex flex-col h-[80vh]">
                {/* Header Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-docka-50 dark:bg-zinc-900 p-4 rounded-2xl border border-docka-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-widest block mb-1">Status Atual</span>
                        <span className="text-xs font-bold text-docka-900 dark:text-zinc-100 uppercase">{formData.status}</span>
                    </div>
                    <div className="bg-docka-50 dark:bg-zinc-900 p-4 rounded-2xl border border-docka-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-widest block mb-1">Valor Estimado</span>
                        <span className="text-xs font-bold text-docka-900 dark:text-zinc-100">{formData.value || 'R$ 0,00'}</span>
                    </div>
                    <div className="bg-docka-50 dark:bg-zinc-900 p-4 rounded-2xl border border-docka-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-widest block mb-1">Probabilidade</span>
                        <span className="text-xs font-bold text-docka-900 dark:text-zinc-100">{(formData as any).probability || 50}%</span>
                    </div>
                    <div className="bg-docka-50 dark:bg-zinc-900 p-4 rounded-2xl border border-docka-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-docka-400 uppercase tracking-widest block mb-1">Origem</span>
                        <span className="text-xs font-bold text-docka-900 dark:text-zinc-100">{(formData as any).source || 'Orgânico'}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-docka-100 dark:border-zinc-800 mb-6">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-300'}`}
                    >
                        Detalhes
                        {activeTab === 'details' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-docka-900 dark:bg-zinc-100" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('activities')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'activities' ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-300'}`}
                    >
                        Atividades
                        {activeTab === 'activities' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-docka-900 dark:bg-zinc-100" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('notes')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'notes' ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-300'}`}
                    >
                        Notas e Documentos
                        {activeTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-docka-900 dark:bg-zinc-100" />}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400 flex items-center gap-2">
                                        <User size={14} /> Informações do Contato
                                    </h4>
                                    <div className="space-y-4 bg-docka-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-docka-100 dark:border-zinc-800">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-docka-300 uppercase tracking-widest">Nome do Contato</label>
                                                <p className="text-xs font-bold text-docka-900 dark:text-zinc-100">{formData.contactName || 'Não informado'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-docka-300 uppercase tracking-widest">Telefone</label>
                                                <p className="text-xs font-bold text-docka-900 dark:text-zinc-100">{formData.contactPhone || 'Não informado'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-docka-300 uppercase tracking-widest">E-mail</label>
                                            <p className="text-xs font-bold text-docka-900 dark:text-zinc-100">{formData.contactEmail || 'Não informado'}</p>
                                        </div>
                                        {tagsInfo.razaoSocial && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-docka-300 uppercase tracking-widest">Empresa / Razão Social</label>
                                                <p className="text-xs font-bold text-docka-900 dark:text-zinc-100">{tagsInfo.razaoSocial}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400 flex items-center gap-2">
                                        <Tag size={14} /> Ações do Processo
                                    </h4>
                                    
                                    <div className="space-y-3">
                                        {!deal.clientId ? (
                                            <button 
                                                onClick={handleConvert}
                                                className="w-full py-3 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                            >
                                                Converter para Cliente <User size={18} />
                                            </button>
                                        ) : (
                                            <div className="py-2 px-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                                <CheckCircle size={14} /> Cliente Vinculado
                                            </div>
                                        )}

                                        {(() => {
                                            const nextSteps: Record<string, { label: string, next: string, color: string, icon: any }> = {
                                                leads: { label: 'Novos Leads', next: 'leads', color: 'text-blue-600', icon: ArrowRight },
                                                preparation: { label: 'Preparação', next: 'preparation', color: 'text-indigo-600', icon: ArrowRight },
                                                viability: { label: 'Viabilidade', next: 'viability', color: 'text-cyan-600', icon: SearchIcon },
                                                contract: { label: 'Contrato', next: 'contract', color: 'text-amber-600', icon: FileText },
                                                service_payment: { label: 'Pagamento Serviço', next: 'service_payment', color: 'text-emerald-600', icon: DollarSign },
                                                documentation: { label: 'Procuração/Docs', next: 'documentation', color: 'text-purple-600', icon: ShieldCheck },
                                                federal_fee: { label: 'Taxa Federal (GRU)', next: 'federal_fee', color: 'text-rose-600', icon: DollarSign },
                                                ready_to_file: { label: 'A Protocolar', next: 'ready_to_file', color: 'text-orange-600', icon: CheckCircle },
                                                filed: { label: 'Protocolado (RPI)', next: 'filed', color: 'text-sky-600', icon: ExternalLink },
                                                examination: { label: 'Exame de Mérito', next: 'examination', color: 'text-violet-600', icon: Clock },
                                                opposition: { label: 'Oposição / Exigência', next: 'opposition', color: 'text-amber-700', icon: AlertTriangle },
                                                granted: { label: 'Marca Deferida! 🎉', next: 'granted', color: 'text-emerald-600', icon: CheckCircle },
                                                won: { label: 'Concluído', next: 'won', color: 'text-green-600', icon: CheckCircle },
                                            };

                                            return (
                                                <div className="space-y-4">
                                                    <div className="text-[10px] font-bold text-docka-400 uppercase tracking-widest px-1">Mover para etapa:</div>
                                                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                                        {Object.entries(nextSteps).map(([status, step]) => (
                                                            formData.status !== status && (
                                                                <button 
                                                                    key={status}
                                                                    onClick={() => moveStatus(status)}
                                                                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-xl hover:border-docka-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-1.5 rounded-lg bg-docka-50 dark:bg-zinc-800 ${step.color}`}>
                                                                            <step.icon size={14} />
                                                                        </div>
                                                                        <span className="text-xs font-bold text-docka-700 dark:text-zinc-300">{step.label}</span>
                                                                    </div>
                                                                    <ArrowRight size={14} className="text-docka-200 group-hover:text-docka-900 dark:group-hover:text-zinc-100 transition-all -rotate-45 group-hover:rotate-0" />
                                                                </button>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400 flex items-center gap-2">
                                    <DollarSign size={14} /> Configuração de Vendas
                                </h4>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">Plano Selecionado</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['ESSENCIAL', 'PREMIUM', 'BLINDADO'].map(plan => (
                                                <button
                                                    key={plan}
                                                    onClick={() => handleAutoSave('planType', plan)}
                                                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${formData.planType === plan
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                        : 'bg-white dark:bg-zinc-800 border-docka-100 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50'
                                                    }`}
                                                >
                                                    {plan}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">Responsável</label>
                                        <select
                                            className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={formData.assignedUserId || ''}
                                            onChange={(e) => handleAutoSave('assignedUserId', e.target.value)}
                                        >
                                            <option value="">Sem responsável</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.userId}>{m.user?.name || m.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">Valor Final</label>
                                        <input
                                            type="text"
                                            className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={formData.value || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                                            onBlur={(e) => handleAutoSave('value', e.target.value)}
                                            placeholder="R$ 0,00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activities' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400">Histórico de Atividades</h4>
                                <button 
                                    onClick={() => setIsAddingActivity(true)}
                                    className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                                >
                                    Nova Atividade
                                </button>
                            </div>

                            {isAddingActivity && (
                                <div className="p-6 bg-docka-50 dark:bg-zinc-900 rounded-2xl border border-docka-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                        <input 
                                            autoFocus
                                            placeholder="Título da atividade..."
                                            className="w-full bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                            value={newActivity.title}
                                            onChange={e => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                                        />
                                        <textarea 
                                            placeholder="Descrição ou detalhes (opcional)..."
                                            className="w-full bg-white dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg px-4 py-3 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                                            value={newActivity.description}
                                            onChange={e => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setIsAddingActivity(false)} className="px-4 py-2 text-xs font-bold text-docka-400 hover:text-docka-600">Cancelar</button>
                                            <button onClick={handleAddActivity} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Salvar Atividade</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {activities.length === 0 ? (
                                    <div className="text-center py-12 bg-docka-50/30 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-docka-100 dark:border-zinc-800">
                                        <Clock size={32} className="mx-auto text-docka-200 mb-3" />
                                        <p className="text-xs font-medium text-docka-400">Nenhuma atividade registrada ainda.</p>
                                    </div>
                                ) : (
                                    activities.map((activity, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 hover:bg-docka-50/50 dark:hover:bg-zinc-900/50 rounded-xl transition-all group border border-transparent hover:border-docka-50 dark:hover:border-zinc-800">
                                            <div className="mt-1">
                                                <div className={`p-2 rounded-lg ${activity.type === 'NOTIFICATION' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {activity.type === 'NOTIFICATION' ? <Bell size={14} /> : <Check size={14} />}
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="text-xs font-bold text-docka-900 dark:text-zinc-100">{activity.title}</h5>
                                                    <span className="text-[10px] font-medium text-docka-300">{new Date(activity.createdAt).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <p className="text-xs text-docka-500 dark:text-zinc-400 leading-relaxed">{activity.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-6">
                            <div className="p-8 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-center">
                                <FileText size={48} className="mx-auto text-amber-500 mb-4 opacity-50" />
                                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-2">Área de Documentos</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-300 max-w-sm mx-auto">Em breve você poderá anexar contratos, procurações e comprovantes diretamente neste processo.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400">Observações Gerais</h4>
                                <textarea 
                                    className="w-full bg-docka-50/50 dark:bg-zinc-900 border border-docka-100 dark:border-zinc-800 rounded-2xl p-6 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[200px]"
                                    placeholder="Anote aqui informações importantes sobre este cliente ou processo..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    onBlur={() => handleAutoSave('notes', notes)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DealDetailsModal;
