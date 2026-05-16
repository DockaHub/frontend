import React, { useState, useEffect, useRef } from 'react';
import { Tag, User, DollarSign, CheckCircle, ArrowRight, Clock, Send, AlignLeft, Trash2, Link as LinkIcon, QrCode, FileText, Layout, Copy, ExternalLink, ShieldCheck, Briefcase, Upload, Check, AlertTriangle } from 'lucide-react';
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

interface DealComment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

interface DealDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: KanbanCardData | null;
    onConvertSuccess: () => void;
    organization?: Organization;
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({ isOpen, onClose, deal, onConvertSuccess, organization }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [comments, setComments] = useState<DealComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [showConfirmConvert, setShowConfirmConvert] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions logic
    const isAdmin = user?.role === 'admin' || organization?.memberRole === 'OWNER' || organization?.memberRole === 'ADMIN';

    // Status Translation Map
    const statusMap: Record<string, string> = {
        leads: 'Novo Lead',
        viability: 'Viabilidade',
        contract: 'Contrato',
        documentation: 'Procuração/Docs',
        federal_fee: 'Taxa Federal',
        ready_to_file: 'A Protocolar',
        filed: 'Protocolado (RPI)',
        examination: 'Exame de Mérito',
        opposition: 'Oposição / Exigência',
        granted: 'Marca Deferida',
        won: 'Concluído'
    };

    // Tag creation state
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [customTagName, setCustomTagName] = useState('');
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<any>({});
    const [plans, setPlans] = useState<any[]>([]);
    const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);
    
    // Linked Data State
    const [processData, setProcessData] = useState<any>(null);
    const [invoiceData, setInvoiceData] = useState<any>(null);
    const [clientData, setClientData] = useState<any>(null);

    useEffect(() => {
        api.get('/asterysko/plans').then(res => setPlans(res.data)).catch(err => console.error('Error loading plans:', err));
        
        // Fetch org members to assign to deals - Now restricted by Organization Context
        if (organization?.id) {
            api.get(`/organizations/${organization.id}/members`)
                .then(res => {
                    // Filter to exclude clients and keep only staff/admins
                    const staff = res.data.filter((m: any) => m.globalRole !== 'CLIENT');
                    setOrganizationMembers(staff);
                })
                .catch(err => console.error('Error loading members:', err));
        }
    }, [organization?.id]);

    const handleFeeSelect = (feeId: string) => {
        const fee = plans.find(f => f.id === feeId);
        if (fee) {
            const formattedValue = Number(fee.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
            setFormData({ ...formData, value: formattedValue });
            handleAutoSave('value', fee.value);
            // Optionally add a tag for the service
            const currentTags = formData.tags || [];
            if (!currentTags.some((t: any) => t.label === fee.name)) {
                handleAutoSave('tags', [...currentTags, { label: fee.name, color: 'bg-blue-100 text-blue-700' }]);
            }
        }
    };

    // Auto-save refs to avoid dependency loops in useEffect
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (deal && isOpen) {
            setShowConfirmConvert(false); // Reset confirmation state on open
            const tags = (deal as any).tags || [];
            const info = extractInfoFromTags(tags);
            setFormData({
                title: deal.title,
                subtitle: deal.subtitle,
                value: deal.value?.toString().replace('R$ ', '').trim() || '',
                contactPhone: deal.contactPhone || '',
                contactEmail: deal.contactEmail || '',
                status: deal.status || '',
                description: (deal as any).description || '',
                signedAt: (deal as any).signedAt || null,
                assignedUserId: (deal as any).assignedUserId || null,
                planType: (deal as any).planType || 'ESSENCIAL',
                tags,
                cnpj: info.cnpj || '',
                razaoSocial: info.razaoSocial || '',
                address: info.address || ''
            });
            fetchDealDetails();
        }
    }, [deal, isOpen]);

    const fetchDealDetails = async () => {
        if (!deal) return;
        setLoadingComments(true);
        try {
            const response = await api.get(`/asterysko/crm/deals/${deal.id}`);
            if (response.data) {
                setComments(response.data.comments || []);
                setProcessData(response.data.process);
                setInvoiceData(response.data.invoice);
                setClientData(response.data.client);

                const tags = response.data.tags || [];
                const info = extractInfoFromTags(tags);
                setFormData((prev: any) => ({
                    ...prev,
                    description: response.data.description || '',
                    title: response.data.title,
                    subtitle: response.data.subtitle,
                    status: response.data.status,
                    value: response.data.value,
                    contactPhone: response.data.contactPhone,
                    contactEmail: response.data.contactEmail,
                    signedAt: response.data.signedAt,
                    assignedUserId: response.data.assignedUserId,
                    planType: response.data.planType,
                    tags,
                    cnpj: info.cnpj || response.data.client?.cnpj || '',
                    razaoSocial: info.razaoSocial || response.data.client?.company || '',
                    address: info.address || response.data.client?.address || ''
                }));
            }
        } catch (error) {
            console.error('Failed to fetch deal details', error);
        } finally {
            setLoadingComments(false);
        }
    };

    if (!deal) return null;

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este lead? Essa ação não pode ser desfeita.')) return;

        setIsDeleting(true);
        try {
            await api.delete(`/asterysko/crm/deals/${deal.id}`);
            addToast({ type: 'success', title: 'Sucesso', message: 'Lead excluído com sucesso' });
            onClose();
            onConvertSuccess(); // Refresh Kanban
        } catch (error) {
            console.error('Failed to delete deal', error);
            addToast({ type: 'error', title: 'Erro', message: 'Erro ao excluir lead' });
        } finally {
            setIsDeleting(false);
        }
    };

    // --- GENERIC AUTO-SAVE FUNCTION ---
    const handleAutoSave = async (field: string, value: any) => {
        // Update local state first
        setFormData((prev: any) => ({ ...prev, [field]: value }));

        // Clear existing timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Debounce save (wait 500ms after last change) OR save immediately on blur
        // For inputs, we usually want onBlur to trigger immediate save, 
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            // Logic to save to backend (if we had a specific endpoint for partial updates)
            // For now, we rely on the implementation in specific handlers or just local state
            console.log(`Auto-saving ${field}: ${value}`);
            updateDealPartial(field, value);
        }, 500);
    };

    const handleBlur = (field: string, value: any) => {
        handleAutoSave(field, value);
    };

    const updateTagValue = (field: string, newValue: string) => {
        const prefix = field === 'cnpj' ? 'CNPJ:' : field === 'razaoSocial' ? 'Razão Social:' : 'Endereço:';
        const color = field === 'cnpj' ? 'bg-indigo-100 text-indigo-700' : field === 'razaoSocial' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700';

        const currentTags = [...(formData.tags || [])];
        const existingIdx = currentTags.findIndex((t: any) => t.label?.startsWith(prefix));

        if (newValue.trim()) {
            const newTag = { label: `${prefix} ${newValue}`, color };
            if (existingIdx > -1) {
                currentTags[existingIdx] = newTag;
            } else {
                currentTags.push(newTag);
            }
        } else if (existingIdx > -1) {
            currentTags.splice(existingIdx, 1);
        }

        setFormData((prev: any) => ({ ...prev, [field]: newValue, tags: currentTags }));
        updateDealPartial('tags', currentTags);
    };

    const maskPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        const floatValue = parseFloat(numericValue) / 100;
        return floatValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };

     const updateDealPartial = async (field: string, value: any) => {
         if (!deal) return;
         setSaveStatus('saving');
         try {
             await api.put(`/asterysko/crm/deals/${deal.id}`, { [field]: value });
             setSaveStatus('saved');
             // Reset to idle after 2 seconds
             setTimeout(() => setSaveStatus('idle'), 2000);
         } catch (error) {
             console.error('Failed to auto-save', error);
             setSaveStatus('idle');
         }
     };




    // 1. Initial trigger: Validates and shows custom modal
    const handleConvert = async () => {
        if (!formData.contactEmail || !formData.contactName && !formData.subtitle) {
            addToast({ type: 'warning', title: 'Atenção', message: 'Preencha o Nome e Email do contato para converter.' });
            return;
        }
        setShowConfirmConvert(true);
    };

    // 2. Actual execution after confirmation
    const executeConvert = async () => {
        setLoading(true);
        try {
            await api.post(`/asterysko/crm/deals/${deal.id}/convert`);
            addToast({ type: 'success', title: 'Sucesso', message: 'Lead convertido em cliente com sucesso! 🚀' });
            onConvertSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to convert deal', error);
            const errorMsg = error.response?.data?.error || 'Falha ao converter lead via API.';
            addToast({ type: 'error', title: 'Erro', message: errorMsg });
            setShowConfirmConvert(false);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await api.post(`/asterysko/crm/deals/${deal.id}/comments`, { content: newComment });
            setComments([response.data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível enviar o comentário.' });
        }
    };

    const moveStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            await api.put(`/asterysko/crm/deals/${deal.id}/status`, { status: newStatus });
            setFormData({ ...formData, status: newStatus });
            onConvertSuccess();
            addToast({ type: 'success', title: 'Movido', message: 'Status atualizado com sucesso.' });
        } catch (error: any) {
            console.error('Error moving status', error);
            const errorMsg = error.response?.data?.error || 'Falha ao atualizar status.';
            addToast({ type: 'error', title: 'Erro', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateContract = async () => {
        if (!formData.contactEmail || !formData.subtitle) {
            addToast({ type: 'warning', title: 'Atenção', message: 'Nome e Email são necessários para o contrato.' });
            return;
        }

        setLoading(true);
        try {
            await api.post(`/asterysko/crm/deals/${deal.id}/contract`);
            setFormData({ ...formData, status: 'contract' });
            onConvertSuccess();
            addToast({ type: 'success', title: 'Contrato Enviado', message: 'Contrato gerado e enviado por email! 📄' });
        } catch (error: any) {
            console.error('Error serving contract', error);
            const errorMsg = error.response?.data?.error || 'Falha ao gerar contrato.';
            addToast({ type: 'error', title: 'Erro', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        addToast({ type: 'success', title: 'Copiado', message: `${label} copiado para a área de transferência.` });
    };

    const renderDescription = () => {
        try {
            if (formData.description && formData.description.trim().startsWith('{')) {
                const parsed = JSON.parse(formData.description);
                if (typeof parsed === 'object' && parsed !== null) {
                    const labels: Record<string, string> = {
                        brandName: 'Marca',
                        activity: 'Atividades',
                        cpf: 'CPF',
                        cnpj: 'CNPJ',
                        address: 'Endereço',
                        city: 'Cidade',
                        state: 'Estado',
                        name: 'Nome Contato',
                        email: 'E-mail',
                        phone: 'Telefone',
                        entityType: 'Tipo',
                        cep: 'CEP',
                        number: 'Número',
                        complement: 'Complemento',
                        neighborhood: 'Bairro',
                        subject: 'Assunto',
                        message: 'Mensagem',
                        hasLogo: 'Possui Logo?'
                    };

                    return (
                        <div className="bg-docka-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-docka-200 dark:border-zinc-700 mt-2 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-docka-200 dark:border-zinc-700">
                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded uppercase">Dados do Formulário</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {Object.entries(parsed).map(([key, value]) => {
                                    if (!value || value === '') return null;
                                    const label = labels[key] || key;
                                    const displayVal = value === 'pf' ? 'Pessoa Física' : value === 'pj' ? 'Pessoa Jurídica' : value === 'yes' ? 'Sim' : value === 'no' ? 'Não' : String(value);

                                    return (
                                        <div key={key} className="flex flex-col border-b border-docka-100 dark:border-zinc-700/50 pb-2 last:border-0 md:last:border-b md:last:pb-2">
                                            <span className="text-xs font-semibold text-docka-400 uppercase tracking-wider mb-1">{label}</span>
                                            <span className="text-sm font-medium text-docka-900 dark:text-zinc-100 whitespace-pre-wrap">{displayVal}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }
            }
        } catch (e) {
            // Not a valid JSON, fallback to textarea
        }

        return (
            <textarea
                className="w-full text-sm text-docka-600 dark:text-zinc-300 bg-transparent border border-transparent hover:border-docka-200 dark:hover:border-zinc-700 rounded-lg p-3 -ml-3 min-h-[120px] outline-none focus:border-docka-400 focus:bg-white dark:focus:bg-zinc-800 transition-all resize-none placeholder:text-docka-400"
                placeholder="Adicione uma descrição mais detalhada sobre este lead..."
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                onBlur={e => handleBlur('description', e.target.value)}
            />
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="2xl"
        >
            <div className="flex flex-col gap-6 -mt-4 min-h-[70vh] relative">
                
                {/* 🚀 COMMAND HEADER (Fixed style) */}
                <div className="flex flex-col gap-4 p-5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-docka-400">
                                    <Layout size={12} /> Lead #{deal.id.split('-')[0]}
                                </div>
                                {/* Saving Indicator */}
                                {saveStatus !== 'idle' && (
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all duration-300 ${
                                        saveStatus === 'saving' ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {saveStatus === 'saving' ? (
                                            <>
                                                <div className="w-1 h-1 bg-amber-600 rounded-full animate-bounce" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={10} strokeWidth={3} />
                                                Salvo
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <input
                                className="text-2xl font-bold text-docka-900 dark:text-zinc-100 bg-transparent border-none w-full outline-none placeholder:text-docka-200"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                onBlur={e => handleBlur('title', e.target.value)}
                                placeholder="Sem título"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Visual Status Progress */}
                            <div className="flex items-center gap-1 p-2 bg-docka-50/50 dark:bg-zinc-800/50 rounded-lg border border-docka-100 dark:border-zinc-800">
                                {['leads', 'viability', 'contract', 'documentation', 'federal_fee', 'ready_to_file', 'filed', 'examination', 'opposition', 'granted', 'won'].map((s, idx) => {
                                    const isActive = formData.status === s;
                                    const stagesOrder = ['leads', 'viability', 'contract', 'documentation', 'federal_fee', 'ready_to_file', 'filed', 'examination', 'opposition', 'granted', 'won'];
                                    const isPast = stagesOrder.indexOf(formData.status) > idx;
                                    return (
                                        <div key={s} className="flex items-center">
                                            <div 
                                                className={`h-1.5 w-3.5 rounded-full transition-all duration-500 ${isActive ? 'bg-indigo-600 w-8' : isPast ? 'bg-emerald-500' : 'bg-docka-200 dark:bg-zinc-700'}`}
                                                title={statusMap[s] || s}
                                            />
                                            {idx < stagesOrder.length - 1 && <div className="mx-0.5 text-[8px] text-docka-300 opacity-30">/</div>}
                                        </div>
                                    );
                                })}
                                <span className="ml-3 text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider whitespace-nowrap">
                                    {statusMap[formData.status] || formData.status}
                                </span>
                            </div>

                             {/* Quick Actions Dropdown or Row */}
                             <div className="flex items-center gap-2 ml-4 pl-4 border-l border-docka-100 dark:border-zinc-800">
                                {clientData && (
                                    <button 
                                        onClick={() => copyToClipboard(`https://cliente.asterysko.com/portal/login?magic_token=${clientData.resetPasswordToken || ''}`, 'Link Mágico')}
                                        className="p-2 text-docka-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 rounded-lg transition-all"
                                        title="Copiar Link Mágico"
                                    >
                                        <LinkIcon size={18} />
                                    </button>
                                )}
                                <button 
                                    onClick={() => addToast({ type: 'info', title: 'WhatsApp', message: 'Reenviando WhatsApp...' })}
                                    className="p-2 text-docka-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg transition-all"
                                    title="Reenviar WhatsApp"
                                >
                                    <Send size={18} />
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="p-2 text-docka-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                    title="Excluir Lead"
                                >
                                    <Trash2 size={18} />
                                </button>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
                    {/* 📋 LEFT COLUMN: OPERATIONAL (7 Cols) */}
                    <div className="lg:col-span-7 space-y-8">
                        
                        {/* 🖼️ MARCA / LOGO SECTION */}
                        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm flex items-start gap-6">
                            <div className="w-32 h-32 bg-docka-50 dark:bg-zinc-800 rounded-xl border-2 border-dashed border-docka-100 dark:border-zinc-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-docka-100/50 transition-all relative overflow-hidden group">
                                {formData.brandLogo ? (
                                    <img src={formData.brandLogo} className="w-full h-full object-contain p-2" alt="Logo da Marca" />
                                ) : (
                                    <>
                                        <Upload size={24} className="text-docka-300" />
                                        <span className="text-[10px] font-bold text-docka-300 uppercase">Logo da Marca</span>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Alterar</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Visual da Marca</h4>
                                    <p className="text-xs text-docka-400">Insira o logo oficial para controle visual e geração de materiais.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-docka-50 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-docka-600 dark:text-zinc-400 hover:bg-docka-100">
                                        Substituir
                                    </button>
                                    <button className="px-3 py-1.5 bg-docka-50 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-docka-600 dark:text-zinc-400 hover:bg-docka-100">
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 📋 DESCRIPTION SECTION */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-docka-400 flex items-center gap-2">
                                    <FileText size={14} /> Detalhes do Lead
                                </h4>
                            </div>
                            {renderDescription()}
                        </div>

                        {/* 🏢 SECTION: PROCESSO INPI */}
                        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-indigo-500" /> Processo INPI
                                </h4>
                                {processData && (
                                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                                        ID: {processData.inpiProcessNumber || 'A Protocolar'}
                                    </span>
                                )}
                            </div>

                            {processData ? (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-docka-400 uppercase tracking-widest">Marca</span>
                                        <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{processData.brand?.name || 'Não definida'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-docka-400 uppercase tracking-widest">Classes (NCL)</span>
                                        <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{processData.brand?.nclClasses?.join(', ') || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-docka-400 uppercase tracking-widest">Status Protocolo</span>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{processData.status || 'PENDENTE'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-docka-400 uppercase tracking-widest">Vencimento Proxy</span>
                                        <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">-</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed border-docka-100 dark:border-zinc-800 rounded-xl">
                                    <p className="text-xs font-semibold text-docka-400 italic">O processo será criado automaticamente ao converter o lead.</p>
                                </div>
                            )}
                        </div>

                        {/* 💰 SECTION: FINANCEIRO */}
                        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <DollarSign size={18} className="text-emerald-500" /> Financeiro / Honorários
                                </h4>
                                {invoiceData && (
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                        invoiceData.status === 'PAID' 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                    }`}>
                                        {invoiceData.status === 'PAID' ? 'PAGO' : 'PENDENTE'}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-docka-50/50 dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-800">
                                    <span className="text-xs font-bold text-docka-400 uppercase tracking-widest mb-1 block">Valor do Plano</span>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">R$ {formData.value || '0,00'}</p>
                                </div>
                                
                                <div className="p-4 bg-docka-50/50 dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-800">
                                    <span className="text-xs font-bold text-docka-400 uppercase tracking-widest mb-1 block">Vencimento</span>
                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{invoiceData?.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString() : '-'}</p>
                                </div>

                                <div className="p-4 bg-docka-50/50 dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-800 flex items-center justify-center">
                                    {invoiceData ? (
                                        <button 
                                            onClick={() => window.open(invoiceData.officialBoletoUrl || '', '_blank')}
                                            className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
                                        >
                                            <FileText size={14} /> Abrir Fatura
                                        </button>
                                    ) : (
                                        <span className="text-xs font-bold text-docka-300 italic">Fatura não gerada</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 📝 SECTION: CONTRATO */}
                        <div className="bg-white dark:bg-zinc-900/40 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                <FileText size={18} className="text-amber-500" /> Contrato & Assinatura
                            </h4>
                            
                            <div className="flex items-center gap-4 p-4 bg-docka-50/50 dark:bg-zinc-800/50 rounded-xl border border-docka-100 dark:border-zinc-800">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${formData.signedAt ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {formData.signedAt ? <CheckCircle size={24} /> : <Clock size={24} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">
                                        {formData.signedAt ? 'Contrato Assinado Digitalmente' : 'Aguardando Assinatura do Cliente'}
                                    </p>
                                    <p className="text-xs font-bold text-docka-400 uppercase tracking-widest">
                                        {formData.signedAt ? `Em ${new Date(formData.signedAt).toLocaleString()}` : 'Enviado por e-mail'}
                                    </p>
                                </div>
                                {formData.signedAt && (
                                    <button className="p-2 bg-white dark:bg-zinc-700 rounded-lg border border-docka-100 dark:border-zinc-600 text-indigo-600 dark:text-indigo-400 hover:shadow-md transition-all">
                                        <QrCode size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Comments / Activity Feed (Simplified) */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-docka-400 flex items-center gap-2">
                                    <Clock size={14} /> Histórico de Ações
                                </h4>
                            </div>
                            
                            <div className="flex gap-3">
                                <textarea
                                    className="flex-1 px-4 py-3 text-sm text-docka-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-docka-300 min-h-[60px] resize-none"
                                    placeholder="Adicionar nota interna..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="px-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all"
                                >
                                    Enviar
                                </button>
                            </div>

                            <div className="space-y-4 mt-6">
                                {comments.slice(0, 5).map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-docka-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
                                            {getInitials(comment.user.name)}
                                        </div>
                                        <div className="flex-1 bg-docka-50/50 dark:bg-zinc-800/30 p-3 rounded-xl text-xs">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-bold text-docka-900 dark:text-zinc-100">{comment.user.name}</span>
                                                <span className="text-[10px] text-docka-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-docka-600 dark:text-zinc-400">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 👤 RIGHT COLUMN: DATA (5 Cols) */}
                    <div className="lg:col-span-5 space-y-8">
                        
                        {/* CURRENT STEP ACTION */}
                        <div className="bg-indigo-600 dark:bg-indigo-500 p-6 rounded-xl shadow-lg shadow-indigo-500/10 text-white space-y-4">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-80">Gatilho de Fluxo</span>
                            <h3 className="text-lg font-bold">Mover para próxima etapa?</h3>
                            
                            {/* GATILHOS DE FLUXO E CONVERSÃO */}
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
                                        leads: { label: 'Iniciar Viabilidade', next: 'viability', color: 'text-indigo-600', icon: ArrowRight },
                                        viability: { label: 'Avançar para Contrato', next: 'contract', color: 'text-amber-600', icon: FileText },
                                        contract: { label: 'Solicitar Documentos', next: 'documentation', color: 'text-purple-600', icon: ShieldCheck },
                                        documentation: { label: 'Gerar Taxa (GRU)', next: 'federal_fee', color: 'text-rose-600', icon: DollarSign },
                                        federal_fee: { label: 'Liberar p/ Protocolo', next: 'ready_to_file', color: 'text-orange-600', icon: CheckCircle },
                                        ready_to_file: { label: 'Confirmar Protocolo', next: 'filed', color: 'text-sky-600', icon: ExternalLink },
                                        filed: { label: 'Mover para Exame', next: 'examination', color: 'text-violet-600', icon: Clock },
                                        examination: { label: 'Teve Oposição?', next: 'opposition', color: 'text-amber-700', icon: AlertTriangle },
                                        opposition: { label: 'Marca Deferida! 🎉', next: 'granted', color: 'text-emerald-600', icon: CheckCircle },
                                        granted: { label: 'Concluir e Arquivar', next: 'won', color: 'text-green-600', icon: CheckCircle },
                                    };

                                    const currentStep = nextSteps[formData.status];
                                    if (!currentStep) return (
                                        <div className="py-3 text-center border border-white/20 rounded-lg text-xs font-bold opacity-50 italic">
                                            Processo finalizado
                                        </div>
                                    );

                                    return (
                                        <button 
                                            onClick={() => moveStatus(currentStep.next)}
                                            className={`w-full py-3 bg-white ${currentStep.color} rounded-lg font-bold text-sm hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 shadow-sm border border-docka-100 dark:border-zinc-800`}
                                        >
                                            {currentStep.label} <currentStep.icon size={18} />
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* 💰 VENDAS SECTION */}
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
                                        onChange={e => handleAutoSave('assignedUserId', e.target.value)}
                                    >
                                        <option value="">-- Não Atribuído --</option>
                                        {organizationMembers.map(m => (
                                            <option key={m.id} value={m.userId || m.id}>
                                                {m.user?.name || m.name || "Usuário"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 🏢 EMPRESA SECTION */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400 flex items-center gap-2">
                                <Briefcase size={14} /> Dados da Empresa
                            </h4>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">Razão Social</label>
                                    <input
                                        className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Razão Social"
                                        value={formData.razaoSocial || ''}
                                        onChange={e => setFormData({ ...formData, razaoSocial: e.target.value })}
                                        onBlur={e => updateTagValue('razaoSocial', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">CNPJ / CPF</label>
                                    <input
                                        className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="00.000.000/0000-00"
                                        value={formData.cnpj || ''}
                                        onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                        onBlur={e => updateTagValue('cnpj', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">Endereço Fiscal</label>
                                    <textarea
                                        className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[80px] resize-none"
                                        placeholder="Rua, Número, Bairro, Cidade/UF"
                                        value={formData.address || ''}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        onBlur={e => updateTagValue('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 👤 CONTATO SECTION */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-docka-400 flex items-center gap-2">
                                <User size={14} /> Dados de Contato
                            </h4>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.subtitle || ''}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        onBlur={e => handleBlur('contactName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                                    <input
                                        className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.contactEmail || ''}
                                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        onBlur={e => handleBlur('contactEmail', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-docka-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <input
                                        className="w-full text-xs font-bold bg-docka-50/50 dark:bg-zinc-800 border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={formData.contactPhone || ''}
                                        onChange={e => setFormData({ ...formData, contactPhone: maskPhone(e.target.value) })}
                                        onBlur={e => handleBlur('contactPhone', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 🏷️ TAGS & ACTIONS */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-docka-400 ml-1">Organização</h4>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags?.map((tag: any, idx: number) => {
                                    if (tag.label?.startsWith('CNPJ:') || tag.label?.startsWith('Razão Social:') || tag.label?.startsWith('Endereço:')) return null;
                                    return (
                                        <span key={idx} className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${tag.color} flex items-center gap-2 border border-black/5 shadow-sm`}>
                                            {tag.label}
                                            <button className="hover:scale-110 transition-transform" onClick={() => {
                                                const newTags = formData.tags.filter((_: any, i: number) => i !== idx);
                                                handleAutoSave('tags', newTags);
                                            }}>
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}

                                {isAddingTag ? (
                                    <input
                                        ref={tagInputRef}
                                        autoFocus
                                        className="px-3 py-1.5 text-xs font-bold uppercase bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Nova Tag..."
                                        value={customTagName}
                                        onChange={e => setCustomTagName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && customTagName.trim()) {
                                                handleAutoSave('tags', [...(formData.tags || []), { label: customTagName.trim(), color: 'bg-zinc-100 text-zinc-600' }]);
                                                setIsAddingTag(false);
                                                setCustomTagName('');
                                            } else if (e.key === 'Escape') setIsAddingTag(false);
                                        }}
                                    />
                                ) : (
                                    <button
                                        onClick={() => setIsAddingTag(true)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase border border-dashed border-docka-300 text-docka-400 hover:bg-docka-50 transition-all"
                                    >
                                        + Adicionar Tag
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 🗑️ DANGER ZONE */}
                        <div className="pt-8 mt-8 border-t border-docka-100 dark:border-zinc-800/50">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full py-4 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} />
                                {isDeleting ? 'Excluindo...' : 'Remover do Pipeline'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ✨ CONVERSION OVERLAY */}
                {showConfirmConvert && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-2xl shadow-2xl text-center space-y-6">
                            <div className="w-16 h-16 bg-amber-500 text-zinc-900 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                                <User size={32} strokeWidth={2.5} />
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-white">Converter Lead?</h3>
                                <p className="text-zinc-400 text-sm font-medium px-4">
                                    O cliente receberá acesso ao portal e um novo processo será inicializado.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowConfirmConvert(false)}
                                    className="py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executeConvert}
                                    disabled={loading}
                                    className="py-3 bg-white text-zinc-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all"
                                >
                                    {loading ? 'Criando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default DealDetailsModal;
