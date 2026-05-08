import React, { useState, useEffect, useRef } from 'react';
import { Tag, User, DollarSign, CheckCircle, ArrowRight, Clock, Send, AlignLeft, Trash2 } from 'lucide-react';
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
    const [comments, setComments] = useState<DealComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [showConfirmConvert, setShowConfirmConvert] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permissions logic
    const isAdmin = user?.role === 'admin' || organization?.memberRole === 'OWNER' || organization?.memberRole === 'ADMIN';

    // Tag creation state
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [customTagName, setCustomTagName] = useState('');
    const tagInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState<any>({});
    const [plans, setPlans] = useState<any[]>([]);
    const [organizationMembers, setOrganizationMembers] = useState<any[]>([]);

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
                    cnpj: info.cnpj || '',
                    razaoSocial: info.razaoSocial || '',
                    address: info.address || ''
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
        try {
            await api.put(`/asterysko/crm/deals/${deal.id}`, { [field]: value });
        } catch (error) {
            console.error('Failed to auto-save', error);
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
        } catch (error) {
            console.error('Error moving status', error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar status.' });
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
            <div className="flex flex-col md:flex-row gap-8 -mt-2 min-h-[60vh] relative">
                {/* LEFT COLUMN: MAIN CONTENT */}
                <div className="flex-1 space-y-8">
                    {/* Header: Title */}
                    <div className="group">
                        <div className="flex items-center gap-2 mb-2 text-xs text-docka-500 dark:text-zinc-500 uppercase tracking-wider font-medium">
                            <span className="bg-docka-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg text-docka-600 dark:text-zinc-400">
                                {deal.id.split('-')[0]}
                            </span>
                            <span>/</span>
                            <span>{formData.status}</span>
                        </div>
                        <input
                            className="text-3xl font-bold text-docka-900 dark:text-zinc-100 bg-transparent border border-transparent hover:border-docka-200 dark:hover:border-zinc-700 rounded-xl px-2 -ml-2 w-full outline-none focus:border-docka-500 transition-all placeholder:text-docka-300"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            onBlur={e => handleBlur('title', e.target.value)}
                            placeholder="Sem título"
                        />
                    </div>

                    {/* Description Area */}
                    <div className="space-y-3 group">
                        <div className="flex items-center gap-2 text-sm font-bold text-docka-700 dark:text-zinc-300">
                            <AlignLeft size={16} /> Descrição
                        </div>
                        {renderDescription()}
                    </div>

                    {/* Activity Feed / Comments */}
                    <div className="pt-8 border-t border-docka-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-sm font-bold text-docka-700 dark:text-zinc-300 mb-6">
                            <Clock size={16} /> Atividade
                        </div>

                        {/* New Comment Input */}
                        <div className="flex gap-4 mb-8">
                            <div className="w-10 h-10 rounded-full bg-docka-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-docka-600 dark:text-zinc-300 shrink-0">
                                {user ? getInitials(user.name) : '?'}
                            </div>
                            <div className="flex-1 relative">
                                <div className="relative">
                                    <textarea
                                        className="w-full px-4 py-3 text-sm text-docka-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl outline-none focus:border-docka-400 dark:focus:border-zinc-500 focus:ring-4 focus:ring-docka-100 dark:focus:ring-zinc-800/50 placeholder:text-docka-400 dark:placeholder:text-zinc-600 min-h-[80px] resize-none transition-all"
                                        placeholder="Escreva um comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        className="absolute bottom-3 right-3 p-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-6 pl-4 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-9 top-0 bottom-0 w-px bg-docka-100 dark:bg-zinc-800" />

                            {loadingComments ? (
                                <div className="text-center py-4 text-docka-400">Carregando atividade...</div>
                            ) : comments.length === 0 ? (
                                <div className="ml-14 text-sm text-docka-400 italic">
                                    Nenhuma atividade registrada ainda.
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 relative group">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 z-10 shrink-0 flex items-center justify-center">
                                            <UserAvatar src={comment.user.avatar} name={comment.user.name} size="sm" />
                                        </div>

                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-docka-900 dark:text-zinc-100">{comment.user.name}</span>
                                                <span className="text-xs text-docka-400 dark:text-zinc-500">
                                                    {new Date(comment.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-docka-700 dark:text-zinc-300">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: SIDEBAR */}
                <div className="w-full md:w-80 space-y-8 md:pl-2 shrink-0">

                    {/* Status & Actions */}
                    <div className="bg-docka-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-docka-100 dark:border-zinc-800 space-y-4">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider">
                            Fase Atual
                        </label>

                        {/* Current Status Badge */}
                        <div className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold mb-4 border ${formData.status === 'leads' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                            formData.status === 'viability' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' :
                                formData.status === 'contract' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                                    formData.status === 'preparation' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                                        formData.status === 'payment' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
                                            formData.status === 'protocol' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                formData.status === 'won' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                    'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                            }`}>
                            {formData.status === 'leads' && 'Novo Lead'}
                            {formData.status === 'viability' && 'Viabilidade'}
                            {formData.status === 'contract' && 'Contrato Enviado'}
                            {formData.status === 'preparation' && 'Em Preparação'}
                            {formData.status === 'payment' && 'Aguardando Pagamento'}
                            {formData.status === 'protocol' && 'A Protocolar'}
                            {formData.status === 'won' && 'Fechado/Ganho'}
                            {!['leads', 'viability', 'contract', 'preparation', 'payment', 'protocol', 'won'].includes(formData.status) && (formData.status || 'Sem Status')}
                        </div>

                        <div className="h-px bg-docka-200 dark:bg-zinc-700 w-full mb-4" />

                        <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">
                            Próximos Passos
                        </label>

                        {formData.status === 'leads' && (
                            <button onClick={() => moveStatus('viability')} className="w-full px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
                                Iniciar Viabilidade <ArrowRight size={14} />
                            </button>
                        )}
                        {formData.status === 'viability' && (
                            <button
                                onClick={handleGenerateContract}
                                disabled={loading}
                                className={`w-full px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Gerando...' : 'Gerar e Enviar Contrato'} <ArrowRight size={14} />
                            </button>
                        )}
                        {formData.status === 'contract' && (
                            <div className="space-y-3">
                                <button
                                    disabled
                                    className="w-full px-4 py-2.5 text-xs font-bold text-docka-400 bg-docka-100 dark:text-zinc-500 dark:bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                Clone>
                                    <Clock size={14} />
                                    Aguardando Assinatura...
                                </button>

                                {/* Manual Override */}
                                <button
                                    onClick={handleConvert}
                                    className="w-full text-xs text-docka-400 hover:text-docka-600 dark:text-zinc-500 dark:hover:text-zinc-300 underline transition-colors"
                                >
                                    Forçar conversão manualmente
                                </button>
                            </div>
                        )}
                        {formData.status === 'preparation' && (
                            <div className="space-y-2">
                                <button
                                    onClick={handleConvert}
                                    disabled={loading}
                                    className={`w-full px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <User size={14} />
                                    {loading ? 'Criando...' : 'Criar Conta do Cliente'}
                                </button>
                                <button
                                    onClick={() => moveStatus('payment')}
                                    className="w-full px-4 py-2.5 text-xs font-bold text-docka-700 bg-rose-100 hover:bg-rose-200 dark:text-rose-300 dark:bg-rose-900/50 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    Enviar para Pagamento <ArrowRight size={14} />
                                </button>
                            </div>
                        )}
                        {formData.status === 'payment' && (
                            <button
                                onClick={() => moveStatus('protocol')}
                                className="w-full px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                Pagamento Confirmado → Protocolar <ArrowRight size={14} />
                            </button>
                        )}
                        {formData.status === 'protocol' && (
                            <button onClick={() => moveStatus('won')} className="w-full px-4 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
                                <CheckCircle size={14} /> Marcar como Fechado
                            </button>
                        )}
                        {formData.status === 'won' && (
                            <div className="text-center text-xs text-docka-500 italic">
                                Processo concluído em {formData.closedAt ? new Date(formData.closedAt).toLocaleDateString() : 'N/A'}.
                            </div>
                        )}
                    </div>

                    {/* COMMISSION AREA - NEW */}
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <label className="text-xs font-semibold text-docka-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign size={14} className="text-emerald-500" /> Configuração de Vendas
                        </label>

                        <div className="space-y-3">
                            <div className="group">
                                <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">Responsável (Vendas)</label>
                                <select
                                    className={`w-full text-xs font-semibold bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl px-3 py-2 outline-none transition-all text-docka-900 dark:text-zinc-100 ${!isAdmin ? 'opacity-70 cursor-not-allowed select-none pointer-events-none' : 'focus:ring-2 focus:ring-blue-500'}`}
                                    value={formData.assignedUserId || ''}
                                    onChange={e => handleAutoSave('assignedUserId', e.target.value)}
                                    disabled={!isAdmin}
                                >
                                    <option value="">-- Não Atribuído --</option>
                                    {organizationMembers.map(m => (
                                        <option key={m.id} value={m.userId || m.id}>
                                            {m.user?.name || m.name || m.user?.email || m.email || "Usuário"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="group">
                                <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">Tipo de Plano</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['ESSENCIAL', 'PREMIUM', 'BLINDADO'].map(plan => (
                                        <button
                                            key={plan}
                                            onClick={() => {
                                                handleAutoSave('planType', plan);
                                                // Auto-update price based on plan
                                                let newValue = '';
                                                let numericValue = 0;
                                                const foundPlan = plans.find(p => p.name.toUpperCase().includes(plan));

                                                if (plan === 'ESSENCIAL') { newValue = '997,00'; numericValue = 997; }
                                                else if (plan === 'PREMIUM') { newValue = '2.197,00'; numericValue = 2197; }
                                                else if (plan === 'BLINDADO') { newValue = '3.697,00'; numericValue = 3697; }
                                                
                                                if (newValue) {
                                                    setFormData((prev: any) => ({ ...prev, value: newValue }));
                                                    updateDealPartial('value', numericValue);
                                                }
                                                
                                                if (foundPlan) {
                                                    updateDealPartial('planId', foundPlan.id);
                                                }
                                            }}
                                            className={`py-2 text-xs font-semibold rounded-xl border transition-all ${formData.planType === plan
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                                                : 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            {plan}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* COMMISSIONS DISPLAY */}
                            {formData.planType && (
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-docka-100 dark:border-zinc-800">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase">Comissão Vendas</span>
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            R$ {plans.find(p => p.name.toUpperCase().includes(formData.planType))?.commissionSales?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase">Comissão Ops</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                            R$ {plans.find(p => p.name.toUpperCase().includes(formData.planType))?.commissionOps?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CONTACT INFO */}
                    <div className="space-y-4 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <label className="text-xs font-semibold text-docka-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <User size={14} className="text-blue-500" /> Dados do Contrato (Principal)
                        </label>
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">Nome do Contato / Decisor</label>
                                <input
                                    className="w-full text-xs font-semibold bg-white dark:bg-zinc-850 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-docka-900 dark:text-zinc-100 shadow-sm placeholder:text-docka-300"
                                    placeholder="Nome completo"
                                    value={formData.subtitle || ''}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    onBlur={e => handleBlur('contactName', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="group">
                                    <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">E-mail</label>
                                    <input
                                        className="w-full text-xs font-semibold bg-white dark:bg-zinc-850 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-docka-900 dark:text-zinc-100 shadow-sm placeholder:text-docka-300"
                                        placeholder="email@empresa.com"
                                        value={formData.contactEmail || ''}
                                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        onBlur={e => handleBlur('contactEmail', e.target.value)}
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">Telefone / WhatsApp</label>
                                    <input
                                        className="w-full text-xs font-semibold bg-white dark:bg-zinc-850 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-docka-900 dark:text-zinc-100 shadow-sm placeholder:text-docka-300"
                                        placeholder="(00) 00000-0000"
                                        value={formData.contactPhone || ''}
                                        onChange={e => setFormData({ ...formData, contactPhone: maskPhone(e.target.value) })}
                                        onBlur={e => handleBlur('contactPhone', e.target.value)}
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VALUE SECTION */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-docka-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign size={14} /> Valor Estimado
                            </label>
                            <div className="relative group">
                                <span className="absolute left-0 top-1.5 text-sm text-docka-400">R$</span>
                                <input
                                    className={`w-full text-lg font-bold text-docka-900 dark:text-zinc-100 bg-transparent border-b border-docka-200 dark:border-zinc-700 py-1 outline-none transition-colors placeholder:text-docka-300 ${!isAdmin ? 'opacity-70 cursor-not-allowed select-none pointer-events-none' : 'hover:border-blue-500 focus:border-blue-600'}`}
                                    value={formData.value || ''}
                                    onChange={e => setFormData({ ...formData, value: maskCurrency(e.target.value) })}
                                    onBlur={e => handleBlur('value', e.target.value)}
                                    placeholder="0,00"
                                    disabled={!isAdmin}
                                />
                            </div>
                        </div>
                    </div>

                    {/* COMPANY INFO (FOR PROCURACAO) */}
                    <div className="space-y-4 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={14} /> Dados para Procuração (Empresa)
                        </label>
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">Razão Social</label>
                                <input
                                    className="w-full text-xs font-semibold bg-white dark:bg-zinc-850 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-docka-900 dark:text-zinc-100 shadow-sm placeholder:text-docka-300"
                                    placeholder="Razão Social completa"
                                    value={formData.razaoSocial || ''}
                                    onChange={e => setFormData({ ...formData, razaoSocial: e.target.value })}
                                    onBlur={e => updateTagValue('razaoSocial', e.target.value)}
                                />
                            </div>
                            <div className="group">
                                <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">CNPJ / CPF</label>
                                <input
                                    className="w-full text-xs font-semibold bg-white dark:bg-zinc-850 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-docka-900 dark:text-zinc-100 shadow-sm placeholder:text-docka-300"
                                    placeholder="00.000.000/0001-00"
                                    value={formData.cnpj || ''}
                                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                    onBlur={e => updateTagValue('cnpj', e.target.value)}
                                />
                            </div>
                            <div className="group">
                                <label className="text-xs font-semibold text-docka-400 dark:text-zinc-500 uppercase mb-1 block">Endereço Completo</label>
                                <textarea
                                    className="w-full text-xs font-semibold bg-white dark:bg-zinc-850 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-docka-900 dark:text-zinc-100 shadow-sm placeholder:text-docka-300 min-h-[60px] resize-none"
                                    placeholder="Rua, Número, Bairro, Cidade/UF - CEP"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    onBlur={e => updateTagValue('address', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* TAGS */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={14} /> Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags?.map((tag: any, idx: number) => {
                                if (tag.label?.startsWith('CNPJ:') || tag.label?.startsWith('Razão Social:') || tag.label?.startsWith('Endereço:')) return null;
                                return (
                                    <span key={idx} className={`px-2 py-1 rounded text-xs font-bold uppercase ${tag.color} flex items-center gap-1`}>
                                        {tag.label}
                                        <button className="hover:opacity-75" onClick={() => {
                                            const newTags = formData.tags.filter((_: any, i: number) => i !== idx);
                                            handleAutoSave('tags', newTags);
                                        }}>
                                            ×
                                        </button>
                                    </span>
                                );
                            })}

                            {isAddingTag ? (
                                <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                                    <input
                                        ref={tagInputRef}
                                        autoFocus
                                        className="px-2 py-1 text-xs border border-docka-400 rounded-md outline-none focus:ring-2 focus:ring-docka-200 min-w-[80px]"
                                        placeholder="Nome da tag..."
                                        value={customTagName}
                                        onChange={e => setCustomTagName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                if (customTagName.trim()) {
                                                    const newTag = { label: customTagName.trim(), color: 'bg-indigo-100 text-indigo-700' };
                                                    handleAutoSave('tags', [...(formData.tags || []), newTag]);
                                                }
                                                setIsAddingTag(false);
                                                setCustomTagName('');
                                            } else if (e.key === 'Escape') {
                                                setIsAddingTag(false);
                                                setCustomTagName('');
                                            }
                                        }}
                                        onBlur={() => {
                                            if (customTagName.trim()) {
                                                const newTag = { label: customTagName.trim(), color: 'bg-indigo-100 text-indigo-700' };
                                                handleAutoSave('tags', [...(formData.tags || []), newTag]);
                                            }
                                            setIsAddingTag(false);
                                            setCustomTagName('');
                                        }}
                                    />
                                </div>
                            ) : (
                                <button
                                    className="px-2 py-1 rounded text-xs border border-dashed border-docka-300 text-docka-500 hover:bg-docka-50 transition-colors"
                                    onClick={() => setIsAddingTag(true)}
                                >
                                    + Tag
                                </button>
                            )}
                        </div>
                    </div>

                    {/* DELETE ZONE */}
                    <div className="pt-4 border-t border-docka-100 dark:border-zinc-800">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} />
                            {isDeleting ? 'Excluindo...' : 'Excluir Lead'}
                        </button>
                    </div>
                </div>

                {/* CONFIRMATION OVERLAY */}
                {showConfirmConvert && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl p-8 animate-in fade-in duration-200">
                        <div className="max-w-sm text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <User size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-docka-900 dark:text-zinc-100 mb-3">Confirmar Conversão?</h3>
                            <p className="text-sm text-docka-500 dark:text-zinc-400 mb-8 leading-relaxed">
                                Você está prestes a transformar este lead em um cliente.
                                <br /><br />
                                Isso criará automaticamente:
                                <ul className="mt-2 space-y-1 text-left bg-docka-50 dark:bg-zinc-800 p-3 rounded-lg border border-docka-100 dark:border-zinc-700">
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Acesso ao Portal do Cliente</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Processo Jurídico Inicial</li>
                                </ul>
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowConfirmConvert(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-docka-500 hover:text-docka-700 hover:bg-docka-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executeConvert}
                                    disabled={loading}
                                    className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-600/20 flex items-center gap-2 transform active:scale-95 transition-all"
                                >
                                    {loading ? 'Criando...' : 'Sim, Converter'}
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
