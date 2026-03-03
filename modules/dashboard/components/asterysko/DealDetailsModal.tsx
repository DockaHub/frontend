import React, { useState, useEffect, useRef } from 'react';
import { Tag, User, DollarSign, CheckCircle, ArrowRight, Clock, Send, AlignLeft, Trash2 } from 'lucide-react';
import { KanbanCardData } from '../../../../types';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';

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
}

const DealDetailsModal: React.FC<DealDetailsModalProps> = ({ isOpen, onClose, deal, onConvertSuccess }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<DealComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);
    const [showConfirmConvert, setShowConfirmConvert] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<any>({});
    const [fees, setFees] = useState<any[]>([]);

    useEffect(() => {
        api.get('/asterysko/fees').then(res => setFees(res.data)).catch(err => console.error('Error loading fees:', err));
    }, []);

    const handleFeeSelect = (feeId: string) => {
        const fee = fees.find(f => f.id === feeId);
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
            setFormData({
                title: deal.title,
                subtitle: deal.subtitle,
                value: deal.value?.toString().replace('R$ ', '').trim() || '',
                contactPhone: deal.contactPhone || '',
                contactEmail: deal.contactEmail || '',
                status: deal.status || '',
                description: (deal as any).description || '',
                signedAt: (deal as any).signedAt || null,
                tags: (deal as any).tags || []
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
                setFormData((prev: any) => ({
                    ...prev,
                    description: response.data.description || '',
                    // Ensure we have the latest of everything else too
                    title: response.data.title,
                    subtitle: response.data.subtitle,
                    status: response.data.status, // Ensure status is synced
                    value: response.data.value,
                    contactPhone: response.data.contactPhone,
                    contactEmail: response.data.contactEmail,
                    signedAt: response.data.signedAt,
                    tags: response.data.tags || []
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
                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Dados do Formulário</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {Object.entries(parsed).map(([key, value]) => {
                                    if (!value || value === '') return null;
                                    const label = labels[key] || key;
                                    const displayVal = value === 'pf' ? 'Pessoa Física' : value === 'pj' ? 'Pessoa Jurídica' : value === 'yes' ? 'Sim' : value === 'no' ? 'Não' : String(value);

                                    return (
                                        <div key={key} className="flex flex-col border-b border-docka-100 dark:border-zinc-700/50 pb-2 last:border-0 md:last:border-b md:last:pb-2">
                                            <span className="text-[10px] font-bold text-docka-400 uppercase tracking-wider mb-1">{label}</span>
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
                            <span className="bg-docka-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-docka-600 dark:text-zinc-400">
                                {deal.id.split('-')[0]}
                            </span>
                            <span>/</span>
                            <span>{formData.status}</span>
                        </div>
                        <input
                            className="text-3xl font-bold text-docka-900 dark:text-zinc-100 bg-transparent border border-transparent hover:border-docka-200 dark:hover:border-zinc-700 rounded px-2 -ml-2 w-full outline-none focus:border-docka-500 transition-all placeholder:text-docka-300"
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
                                            {comment.user.avatar ? (
                                                <img src={comment.user.avatar} className="w-8 h-8 rounded-full object-cover" alt={comment.user.name} />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                    {getInitials(comment.user.name)}
                                                </div>
                                            )}
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
                        <div className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-bold mb-4 border ${formData.status === 'leads' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
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

                        <label className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2 block">
                            Próximos Passos
                        </label>

                        {formData.status === 'leads' && (
                            <button onClick={() => moveStatus('viability')} className="w-full px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors">
                                Iniciar Viabilidade <ArrowRight size={16} />
                            </button>
                        )}
                        {formData.status === 'viability' && (
                            <button
                                onClick={handleGenerateContract}
                                disabled={loading}
                                className={`w-full px-4 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Gerando...' : 'Gerar e Enviar Contrato'} <ArrowRight size={16} />
                            </button>
                        )}
                        {formData.status === 'contract' && (
                            <div className="space-y-3">
                                <button
                                    disabled
                                    className="w-full px-4 py-2.5 text-sm font-bold text-docka-400 bg-docka-100 dark:text-zinc-500 dark:bg-zinc-800 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <Clock size={16} />
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
                                    className={`w-full px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <User size={16} />
                                    {loading ? 'Criando...' : 'Criar Conta do Cliente'}
                                </button>
                                <button
                                    onClick={() => moveStatus('payment')}
                                    className="w-full px-4 py-2.5 text-sm font-bold text-docka-700 bg-rose-100 hover:bg-rose-200 dark:text-rose-300 dark:bg-rose-900/50 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    Enviar para Pagamento <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                        {formData.status === 'payment' && (
                            <button
                                onClick={() => moveStatus('protocol')}
                                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                Pagamento Confirmado → Protocolar <ArrowRight size={16} />
                            </button>
                        )}
                        {formData.status === 'protocol' && (
                            <button onClick={() => moveStatus('won')} className="w-full px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors">
                                <CheckCircle size={16} /> Marcar como Fechado
                            </button>
                        )}
                        {formData.status === 'won' && (
                            <div className="text-center text-xs text-docka-500 italic">
                                Processo concluído. Nenhuma ação pendente.
                            </div>
                        )}
                    </div>

                    {/* CONTACT INFO */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User size={14} /> Contato Principal
                        </label>
                        <div className="space-y-3">
                            <div className="group">
                                <label className="text-[10px] text-docka-400 uppercase font-semibold mb-1 block">Nome</label>
                                <input
                                    className="w-full text-sm bg-transparent border-b border-docka-200 dark:border-zinc-700 hover:border-docka-400 focus:border-docka-600 dark:focus:border-zinc-500 py-1 outline-none transition-colors placeholder:text-docka-300"
                                    placeholder="Adicionar nome"
                                    value={formData.subtitle || ''}
                                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                    onBlur={e => handleBlur('contactName', e.target.value)}
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] text-docka-400 uppercase font-semibold mb-1 block">Email</label>
                                <input
                                    className="w-full text-sm bg-transparent border-b border-docka-200 dark:border-zinc-700 hover:border-docka-400 focus:border-docka-600 dark:focus:border-zinc-500 py-1 outline-none transition-colors placeholder:text-docka-300"
                                    placeholder="Adicionar email"
                                    value={formData.contactEmail || ''}
                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                    onBlur={e => handleBlur('contactEmail', e.target.value)}
                                />
                            </div>
                            <div className="group">
                                <label className="text-[10px] text-docka-400 uppercase font-semibold mb-1 block">Telefone</label>
                                <input
                                    className="w-full text-sm bg-transparent border-b border-docka-200 dark:border-zinc-700 hover:border-docka-400 focus:border-docka-600 dark:focus:border-zinc-500 py-1 outline-none transition-colors placeholder:text-docka-300"
                                    placeholder="Adicionar telefone"
                                    value={formData.contactPhone || ''}
                                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                    onBlur={e => handleBlur('contactPhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* VALUE & FEE SELECTOR */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag size={14} /> Selecionar Honorário Padrão
                            </label>
                            <select
                                onChange={(e) => handleFeeSelect(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                            >
                                <option value="">-- Personalizado / Outro --</option>
                                {fees.map(f => (
                                    <option key={f.id} value={f.id}>{f.name} (R$ {Number(f.value).toLocaleString('pt-BR')})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <DollarSign size={14} /> Valor Estimado
                            </label>
                            <div className="relative group">
                                <span className="absolute left-0 top-1.5 text-sm text-docka-400">R$</span>
                                <input
                                    className="w-full text-lg font-bold text-docka-900 dark:text-zinc-100 bg-transparent border-b border-docka-200 dark:border-zinc-700 hover:border-green-500 focus:border-green-600 pl-7 py-1 outline-none transition-colors placeholder:text-docka-300"
                                    value={formData.value || ''}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    onBlur={e => handleBlur('value', e.target.value)}
                                    placeholder="0,00"
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
                            {formData.tags?.map((tag: any, idx: number) => (
                                <span key={idx} className={`px-2 py-1 rounded text-xs font-bold uppercase ${tag.color} flex items-center gap-1`}>
                                    {tag.label}
                                    <button className="hover:opacity-75" onClick={() => {
                                        const newTags = formData.tags.filter((_: any, i: number) => i !== idx);
                                        handleAutoSave('tags', newTags);
                                    }}>
                                        ×
                                    </button>
                                </span>
                            ))}
                            <button
                                className="px-2 py-1 rounded text-xs border border-dashed border-docka-300 text-docka-500 hover:bg-docka-50 transition-colors"
                                onClick={() => {
                                    // Simple generic tag for now, can be improved to a tag selector later
                                    const newTag = { label: 'Nova Tag', color: 'bg-gray-100 text-gray-700' };
                                    handleAutoSave('tags', [...(formData.tags || []), newTag]);
                                }}
                            >
                                + Tag
                            </button>
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
        </Modal >
    );
};

export default DealDetailsModal;
