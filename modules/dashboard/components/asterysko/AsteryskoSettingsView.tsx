import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, Users, Link, Copy, Eye, Plus, Edit2, Trash2, DollarSign, Info, AlertCircle, Upload, MessageSquare, RefreshCw, Smartphone, QrCode, Power, Send, Save, Check, X, Bell, Mail, CheckSquare, Clock, Bot } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';
import DashboardPage from '../../../../components/DashboardPage';
import { AsteryskoScoutAutomationSettings } from './AsteryskoScoutAutomationSettings';

interface AsteryskoSettingsViewProps {
    onOpenClientPortal?: () => void;
    organization?: Organization;
}

interface Plan {
    id: string;
    name: string;
    description: string | null;
    value: number | string;
    officialTax: number | string | null;
    commissionSales: number | string;
    commissionOps: number | string;
    category: string;
}

const AsteryskoSettingsView: React.FC<AsteryskoSettingsViewProps> = ({ onOpenClientPortal, organization }) => {
    const [activeSettingsTab, setActiveSettingsTab] = useState<'notifications' | 'crm_inpi' | 'scout_ai' | 'plans' | 'portal'>('notifications');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Partial<Plan> | null>(null);
    const [saving, setSaving] = useState(false);
    const [inpiHistory, setInpiHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { addToast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [clientPortalDomain, setClientPortalDomain] = useState(organization?.clientPortalDomain || '');

    useEffect(() => {
        if (organization?.clientPortalDomain !== undefined) {
            setClientPortalDomain(organization.clientPortalDomain || '');
        }
    }, [organization]);

    const handleUpdateDomain = async () => {
        if (!organization) return;
        try {
            await api.patch(`/organizations/${organization.id}`, { clientPortalDomain });
            addToast({ type: 'success', title: 'Salvo', message: 'Domínio atualizado com sucesso.' });
        } catch (error) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar o domínio.' });
        }
    };

    const categories = [
        { id: 'registration', label: 'Registro de Marca' },
        { id: 'monitoring', label: 'Acompanhamento' },
        { id: 'defense', label: 'Oposição / Defesa' },
        { id: 'certificate', label: 'Certificação' },
        { id: 'other', label: 'Outros Serviços' }
    ];

    useEffect(() => {
        if (activeSettingsTab === 'plans') {
            fetchPlans();
        } else if (activeSettingsTab === 'crm_inpi') {
            fetchInpiHistory();
        }
    }, [activeSettingsTab]);

    const fetchInpiHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await api.get('/asterysko/inpi/history');
            setInpiHistory(response.data);
        } catch (error) {
            console.error('Error fetching INPI history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await api.get('/asterysko/plans');
            setPlans(response.data);
        } catch (error) {
            console.error('Error fetching plans:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível carregar a tabela de planos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedPlan?.name || !selectedPlan?.value) {
            addToast({ type: 'error', title: 'Campos obrigatórios', message: 'Nome e valor são obrigatórios.' });
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...selectedPlan,
                value: Number(selectedPlan.value),
                officialTax: selectedPlan.officialTax ? Number(selectedPlan.officialPlan) : null,
                commissionSales: Number(selectedPlan.commissionSales || 0),
                commissionOps: Number(selectedPlan.commissionOps || 0)
            };

            if (selectedPlan.id) {
                await api.put(`/asterysko/plans/${selectedPlan.id}`, payload);
                addToast({ type: 'success', title: 'Sucesso', message: 'Plano atualizado com sucesso.' });
            } else {
                await api.post('/asterysko/plans', payload);
                addToast({ type: 'success', title: 'Sucesso', message: 'Plano criado com sucesso.' });
            }
            setIsModalOpen(false);
            fetchPlans();
        } catch (error: any) {
            console.error('Error saving plan:', error);
            const errorMsg = error.response?.data?.error || 'Erro ao salvar plano.';
            addToast({ type: 'error', title: 'Erro ao Salvar', message: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
        try {
            await api.delete(`/asterysko/plans/${id}`);
            addToast({ type: 'success', title: 'Excluído', message: 'Plano removido com sucesso.' });
            fetchPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível excluir o plano.' });
        }
    };

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !organization) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            await api.post(`/organizations/${organization.id}/logo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            addToast({
                type: 'success',
                title: 'Logo atualizada',
                message: 'A logo da organização foi atualizada com sucesso.',
            });
            window.location.reload();
        } catch (error) {
            console.error('Error uploading logo:', error);
            addToast({
                type: 'error',
                title: 'Erro no upload',
                message: 'Não foi possível atualizar a logo.',
            });
        }
    };

// Standalone NotificationTemplatesManager component outside parent render scope
const NotificationTemplatesManager: React.FC = () => {
    const { addToast } = useToast();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChannel, setActiveChannel] = useState<'WHATSAPP' | 'EMAIL' | 'PUSH'>('WHATSAPP');
    
    // Estado para Edição
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editSubject, setEditSubject] = useState('');
    const [editStageSlug, setEditStageSlug] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);

    // Estado para Criação
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newChannel, setNewChannel] = useState<'WHATSAPP' | 'EMAIL' | 'PUSH'>('WHATSAPP');
    const [newStageSlug, setNewStageSlug] = useState('new-dispatch');
    const [newSubject, setNewSubject] = useState('');
    const [newContent, setNewContent] = useState('');
    const [creating, setCreating] = useState(false);

    // Estado para Teste de Envio
    const [testingTemplateSlug, setTestingTemplateSlug] = useState<string | null>(null);
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const [sendingTemplateTest, setSendingTemplateTest] = useState(false);

    const STAGE_OPTIONS = [
        { slug: 'lead-created', name: '🚀 Lead Criado / Boas-Vindas', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
        { slug: 'contract-pending', name: '✍️ Contrato Pendente de Assinatura', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
        { slug: 'contract-signed', name: '✅ Contrato Assinado', badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
        { slug: 'protocolar', name: '🏛️ Protocolar Processo no INPI', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
        { slug: 'new-dispatch', name: '📑 Movimentação & Despacho RPI', badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
        { slug: 'invoice-pending', name: '💳 Fatura de Serviço Gerada', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
        { slug: 'payment-success', name: '💰 Confirmação de Pagamento', badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
        { slug: 'registro-vigor', name: '🛡️ Registro de Marca Concedido (Deferido)', badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
        { slug: 'processo-concluido', name: '🏆 Processo Concluído (Certificado Emitido)', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
        { slug: 'custom', name: '⚡ Notificação Customizada', badgeColor: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }
    ];

    const VARIABLE_PILLS = [
        { key: 'nomeCliente', label: 'Nome do Cliente', example: 'João Silva' },
        { key: 'nomeMarca', label: 'Nome da Marca', example: 'Asterysko' },
        { key: 'codigoProcesso', label: 'Código do Processo (AST-XXXXX)', example: 'AST-12345' },
        { key: 'detalhes', label: 'Resumo / Detalhes', example: 'Despacho publicado na RPI' },
        { key: 'linkPortal', label: 'Link do Portal', example: 'https://cliente.asterysko.com' },
        { key: 'valorFatura', label: 'Valor da Fatura', example: 'R$ 1.500,00' },
        { key: 'vencimentoFatura', label: 'Vencimento', example: '30/06/2026' }
    ];

    const DEFAULT_TEMPLATES_FALLBACK = [
        {
            id: 'registro-vigor',
            slug: 'registro-vigor',
            name: 'Registro de Marca Concedido (Deferido)',
            channel: 'WHATSAPP',
            stageSlug: 'registro-vigor',
            content: 'Parabéns {{nomeCliente}}! O registro da sua marca {{nomeMarca}} foi concedido pelo INPI (Processo {{codigoProcesso}}).',
            isActive: true
        },
        {
            id: 'certificado-disponivel',
            slug: 'certificado-disponivel',
            name: 'Certificado de Registro Emitido (Concluído)',
            channel: 'WHATSAPP',
            stageSlug: 'processo-concluido',
            content: 'Parabéns {{nomeCliente}}! 🎉 O Certificado de Registro da sua marca {{nomeMarca}} foi emitido pelo INPI e já está disponível para download no seu Portal do Cliente!\n\nAcesse: {{linkPortal}}',
            isActive: true
        },
        {
            id: 'new-dispatch',
            slug: 'new-dispatch',
            name: 'Novo Despacho (INPI)',
            channel: 'WHATSAPP',
            stageSlug: 'new-dispatch',
            content: 'Olá {{nomeCliente}}! Identificamos uma nova movimentação no INPI para o seu processo {{codigoProcesso}} da marca {{nomeMarca}}.\n\nDetalhes: {{detalhes}}',
            isActive: true
        },
        {
            id: 'invoice-pending',
            slug: 'invoice-pending',
            name: 'Fatura Pendente',
            channel: 'WHATSAPP',
            stageSlug: 'invoice-pending',
            content: 'Olá {{nomeCliente}}, a fatura referente aos serviços da marca {{nomeMarca}} foi gerada no valor de {{valorFatura}} com vencimento em {{vencimentoFatura}}.\n\nAcesse o portal: {{linkPortal}}',
            isActive: true
        },
        {
            id: 'payment-success',
            slug: 'payment-success',
            name: 'Confirmação de Pagamento',
            channel: 'WHATSAPP',
            stageSlug: 'payment-success',
            content: 'Olá {{nomeCliente}}! Confirmamos o recebimento do pagamento referente à sua fatura da marca {{nomeMarca}}. Obrigado!',
            isActive: true
        },
        {
            id: 'contract-pending',
            slug: 'contract-pending',
            name: 'Contrato Pendente (Assinatura)',
            channel: 'WHATSAPP',
            stageSlug: 'contract-pending',
            content: 'Olá {{nomeCliente}}! O seu contrato para o registro da marca {{nomeMarca}} está pronto para assinatura.\n\nAcesse para assinar: {{linkPortal}}',
            isActive: true
        },
        {
            id: 'contract-signed',
            slug: 'contract-signed',
            name: 'Contrato Assinado',
            channel: 'WHATSAPP',
            stageSlug: 'contract-signed',
            content: 'Olá {{nomeCliente}}! Recebemos o seu contrato assinado referente à marca {{nomeMarca}}. Daremos início ao protocolo junto ao INPI em breve.',
            isActive: true
        },
        {
            id: 'welcome-client',
            slug: 'welcome-client',
            name: 'Boas-vindas ao Cliente',
            channel: 'WHATSAPP',
            stageSlug: 'lead-created',
            content: 'Seja bem-vindo(a) à Asterysko, {{nomeCliente}}! Estamos felizes em cuidar da proteção da sua marca {{nomeMarca}}. Qualquer dúvida, estamos à disposição!',
            isActive: true
        },
        {
            id: 'email-welcome',
            slug: 'email-welcome',
            name: 'E-mail de Boas-vindas',
            channel: 'EMAIL',
            stageSlug: 'lead-created',
            emailSubject: 'Seja bem-vindo à Asterysko - Proteção de Marcas',
            content: 'Olá {{nomeCliente}},\n\nSeja muito bem-vindo(a) à Asterysko! Estamos iniciando os trabalhos para o registro da sua marca {{nomeMarca}}.\n\nAcompanhe seu processo em tempo real através do portal do cliente: {{linkPortal}}',
            isActive: true
        },
        {
            id: 'email-dispatch',
            slug: 'email-dispatch',
            name: 'E-mail de Movimentação RPI',
            channel: 'EMAIL',
            stageSlug: 'new-dispatch',
            emailSubject: 'Atualização RPI no Processo {{codigoProcesso}} ({{nomeMarca}})',
            content: 'Olá {{nomeCliente}},\n\nIdentificamos uma nova publicação da Revista da Propriedade Industrial (INPI) referente ao seu processo {{codigoProcesso}} da marca {{nomeMarca}}.\n\nResumo da Movimentação: {{detalhes}}\n\nAcesse o portal do cliente para ver o documento completo: {{linkPortal}}',
            isActive: true
        },
        {
            id: 'email-invoice',
            slug: 'email-invoice',
            name: 'E-mail de Fatura Gerada',
            channel: 'EMAIL',
            stageSlug: 'invoice-pending',
            emailSubject: 'Fatura Gerada - Asterysko (Marca {{nomeMarca}})',
            content: 'Olá {{nomeCliente}},\n\nUma nova fatura de serviço foi gerada no valor de {{valorFatura}} com vencimento em {{vencimentoFatura}}.\n\nAcesse o link para efetuar o pagamento: {{linkPortal}}',
            isActive: true
        }
    ];

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await api.get('/whatsapp/templates');
            const dbTemplates = Array.isArray(res.data) ? res.data : [];

            // Mescla templates do BD com os padrões fallback caso falte algum
            const merged = [...dbTemplates];
            for (const fallbackTpl of DEFAULT_TEMPLATES_FALLBACK) {
                const exists = merged.some(t => t.slug === fallbackTpl.slug || t.id === fallbackTpl.id);
                if (!exists) {
                    merged.push(fallbackTpl);
                }
            }
            setTemplates(merged);
        } catch (err) {
            console.error('Erro ao buscar templates:', err);
            setTemplates(DEFAULT_TEMPLATES_FALLBACK);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await api.patch(`/whatsapp/templates/${id}/toggle`);
            addToast({ 
                type: 'success', 
                title: currentStatus ? 'Notificação Desativada' : 'Notificação Ativada', 
                message: `O modelo foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.` 
            });
            fetchTemplates();
        } catch (err) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao alterar status da notificação.' });
        }
    };

    const handleDeleteTemplate = async (id: string, name: string) => {
        if (!window.confirm(`Deseja realmente excluir permanentemente a notificação "${name}"?`)) return;
        try {
            await api.delete(`/whatsapp/templates/${id}`);
            addToast({ type: 'success', title: 'Excluído', message: 'Modelo de notificação excluído com sucesso.' });
            fetchTemplates();
        } catch (err) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir modelo.' });
        }
    };

    const handleSaveEdit = async (tpl: any) => {
        setSaving(true);
        try {
            await api.put(`/whatsapp/templates/${tpl.slug}`, {
                name: editName || tpl.name,
                content: editContent,
                channel: activeChannel,
                stageSlug: editStageSlug || tpl.stageSlug,
                emailSubject: editSubject
            });
            addToast({ type: 'success', title: 'Salvo', message: 'Configurações de notificação salvas com sucesso.' });
            setEditingId(null);
            fetchTemplates();
        } catch (err) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar notificação.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!newName || !newContent) {
            addToast({ type: 'error', title: 'Campos vazios', message: 'Preencha o nome e o conteúdo da mensagem.' });
            return;
        }
        setCreating(true);
        try {
            await api.post('/whatsapp/templates', {
                name: newName,
                channel: newChannel,
                stageSlug: newStageSlug,
                emailSubject: newSubject,
                content: newContent
            });
            addToast({ type: 'success', title: 'Criado', message: 'Nova notificação criada com sucesso.' });
            setIsCreateModalOpen(false);
            setNewName('');
            setNewContent('');
            setNewSubject('');
            fetchTemplates();
        } catch (err: any) {
            addToast({ type: 'error', title: 'Erro de Criação', message: err.response?.data?.error || 'Falha ao criar nova notificação.' });
        } finally {
            setCreating(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploadingSlug(slug);

        try {
            await api.post(`/whatsapp/templates/${slug}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast({ type: 'success', title: 'Imagem Salva', message: 'Imagem comemorativa anexada com sucesso.' });
            fetchTemplates();
        } catch (err) {
            addToast({ type: 'error', title: 'Erro no Upload', message: 'Não foi possível anexar a imagem.' });
        } finally {
            setUploadingSlug(null);
        }
    };

    const handleRemoveImage = async (slug: string) => {
        if (!window.confirm('Deseja realmente remover a imagem anexada?')) return;
        setUploadingSlug(slug);
        try {
            await api.delete(`/whatsapp/templates/${slug}/image`);
            addToast({ type: 'success', title: 'Removido', message: 'Imagem removida com sucesso.' });
            fetchTemplates();
        } catch (err) {
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível remover a imagem.' });
        } finally {
            setUploadingSlug(null);
        }
    };

    const handleSendTemplateTest = async () => {
        if (!testPhoneNumber) {
            addToast({ type: 'error', title: 'Número vazio', message: 'Digite um número de telefone com DDD (ex: 5511999999999).' });
            return;
        }
        if (!testingTemplateSlug) return;

        setSendingTemplateTest(true);
        try {
            const res = await api.post(`/whatsapp/templates/${testingTemplateSlug}/send-test`, { number: testPhoneNumber });
            addToast({ type: 'success', title: 'Teste Enviado', message: res.data.message || 'Verifique seu WhatsApp!' });
            setTestingTemplateSlug(null);
            setTestPhoneNumber('');
        } catch (err: any) {
            addToast({ type: 'error', title: 'Falha no Envio', message: err.response?.data?.error || 'Erro ao disparar teste.' });
        } finally {
            setSendingTemplateTest(false);
        }
    };

    const channelTemplates = (Array.isArray(templates) ? templates : []).filter(t => (t.channel || 'WHATSAPP') === activeChannel);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-8">
            <div className="p-6 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/20 dark:bg-zinc-800/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                        <MessageSquare size={16} className="text-emerald-500" /> Automação de Mensagens & Notificações
                    </h3>
                    <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1">
                        Configure e personalize as mensagens automáticas disparadas a cada etapa do processo.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                    <Plus size={14} /> Nova Notificação
                </button>
            </div>

            <div className="flex border-b border-docka-100 dark:border-zinc-800 bg-docka-50/50 dark:bg-zinc-900/50 px-6 pt-3 gap-2 overflow-x-auto">
                <button
                    onClick={() => setActiveChannel('WHATSAPP')}
                    className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
                        activeChannel === 'WHATSAPP' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900 shadow-sm' 
                            : 'border-transparent text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200'
                    }`}
                >
                    <MessageSquare size={14} className="text-emerald-500" /> 📱 WhatsApp
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {(Array.isArray(templates) ? templates : []).filter(t => (t.channel || 'WHATSAPP') === 'WHATSAPP').length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveChannel('EMAIL')}
                    className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
                        activeChannel === 'EMAIL' 
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900 shadow-sm' 
                            : 'border-transparent text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200'
                    }`}
                >
                    <Mail size={14} className="text-blue-500" /> ✉️ E-mail
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {(Array.isArray(templates) ? templates : []).filter(t => t.channel === 'EMAIL').length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveChannel('PUSH')}
                    className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
                        activeChannel === 'PUSH' 
                            ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-white dark:bg-zinc-900 shadow-sm' 
                            : 'border-transparent text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200'
                    }`}
                >
                    <Bell size={14} className="text-purple-500" /> 🔔 Notificação Push (Portal)
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {(Array.isArray(templates) ? templates : []).filter(t => t.channel === 'PUSH').length}
                    </span>
                </button>
            </div>

            <div className="p-6 space-y-4">
                {loading ? (
                    <div className="py-12 text-center text-docka-400 text-xs italic flex items-center justify-center gap-2">
                        <RefreshCw size={14} className="animate-spin" /> Carregando modelo de notificações...
                    </div>
                ) : channelTemplates.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-docka-200 dark:border-zinc-800 rounded-xl text-center">
                        <MessageSquare size={32} className="mx-auto mb-2 text-docka-300 dark:text-zinc-600" />
                        <p className="text-sm font-bold text-docka-800 dark:text-zinc-200">Nenhuma notificação configurada para este canal</p>
                        <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1 mb-4">Clique no botão abaixo para criar a primeira mensagem de disparo.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                            + Criar Notificação para {activeChannel}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {channelTemplates.map((tpl) => {
                            const isEditing = editingId === tpl.id;
                            const stageObj = STAGE_OPTIONS.find(s => s.slug === (tpl.stageSlug || tpl.slug)) || STAGE_OPTIONS.find(s => s.slug === 'custom');
                            const metadata = (tpl.metadata as Record<string, any>) || {};

                            return (
                                <div 
                                    key={tpl.id} 
                                    className={`p-5 border rounded-2xl transition-all duration-300 shadow-sm ${
                                        tpl.isActive 
                                            ? 'bg-white dark:bg-zinc-900 border-docka-200 dark:border-zinc-800' 
                                            : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/40 opacity-75'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleToggleActive(tpl.id, tpl.isActive)}
                                                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                                                    tpl.isActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                                                }`}
                                                title={tpl.isActive ? 'Clique para desativar esta notificação' : 'Clique para ativar esta notificação'}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                                                    tpl.isActive ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                            </button>

                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">{tpl.name}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stageObj?.badgeColor}`}>
                                                        {stageObj?.name}
                                                    </span>
                                                    {tpl.isActive ? (
                                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                                            ATIVO
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                            INATIVO
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-docka-400 font-mono mt-0.5">Identificador: {tpl.slug}</p>
                                            </div>
                                        </div>

                                        {!isEditing ? (
                                            <div className="flex items-center gap-2 shrink-0">
                                                {activeChannel === 'WHATSAPP' && (
                                                    <button 
                                                        onClick={() => setTestingTemplateSlug(tpl.slug)}
                                                        className="px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-900/30 shadow-sm"
                                                        title="Testar Envio desta Mensagem"
                                                    >
                                                        <Send size={12} /> Testar
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setEditingId(tpl.id);
                                                        setEditName(tpl.name);
                                                        setEditContent(tpl.content);
                                                        setEditSubject(tpl.emailSubject || '');
                                                        setEditStageSlug(tpl.stageSlug || tpl.slug);
                                                    }}
                                                    className="p-1.5 text-docka-500 hover:text-docka-900 dark:hover:text-zinc-100 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                    title="Editar Notificação"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                    title="Excluir Notificação"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setEditingId(null)}
                                                    className="px-3 py-1.5 text-xs font-bold text-docka-500 hover:text-docka-900 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button 
                                                    onClick={() => handleSaveEdit(tpl)}
                                                    disabled={saving}
                                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {saving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />} Salvar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-4 pt-3 border-t border-docka-100 dark:border-zinc-800 animate-in fade-in duration-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Notificação</label>
                                                    <input 
                                                        type="text" 
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Etapa de Disparo Automático</label>
                                                    <select
                                                        value={editStageSlug}
                                                        onChange={(e) => setEditStageSlug(e.target.value)}
                                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                    >
                                                        {STAGE_OPTIONS.map(s => (
                                                            <option key={s.slug} value={s.slug}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {activeChannel === 'EMAIL' && (
                                                <div>
                                                    <label className="block text-[11px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Assunto do E-mail</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ex: Atualização sobre o seu processo de marca {{nomeMarca}}"
                                                        value={editSubject}
                                                        onChange={(e) => setEditSubject(e.target.value)}
                                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <label className="block text-[11px] font-bold text-docka-700 dark:text-zinc-400 uppercase">Mensagem / Corpo</label>
                                                    <span className="text-[10px] text-docka-400 italic">Clique nas pílulas abaixo para inserir variáveis dinâmicas</span>
                                                </div>

                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows={5}
                                                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono leading-relaxed"
                                                    placeholder="Digite o texto da mensagem..."
                                                />

                                                <div className="mt-2.5 pt-2 border-t border-docka-100 dark:border-zinc-800/60">
                                                    <p className="text-[10px] font-bold text-docka-500 dark:text-zinc-400 uppercase mb-1.5">Pílulas de Variáveis Rápidas:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {VARIABLE_PILLS.map(v => (
                                                            <button 
                                                                key={v.key}
                                                                type="button"
                                                                onClick={() => setEditContent(prev => prev + `{{${v.key}}}`)}
                                                                className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs flex items-center gap-1"
                                                                title={`Exemplo: ${v.example}`}
                                                            >
                                                                + {`{{${v.key}}}`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {activeChannel === 'WHATSAPP' && (
                                                <div className="pt-3 border-t border-docka-100 dark:border-zinc-800 space-y-2">
                                                    <label className="block text-[11px] font-bold text-docka-700 dark:text-zinc-400 uppercase">
                                                        Imagem Anexa (Enviada antes da mensagem de texto)
                                                    </label>
                                                    
                                                    {metadata.imageUrl ? (
                                                        <div className="flex items-center gap-3 p-2 bg-docka-50 dark:bg-zinc-800 rounded-lg border border-docka-100 dark:border-zinc-800 max-w-md">
                                                            <img 
                                                                src={`${api.defaults.baseURL?.replace('/api', '') || ''}${metadata.imageUrl}`}
                                                                alt="Preview" 
                                                                className="w-12 h-12 object-cover rounded border border-docka-200 dark:border-zinc-700" 
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold text-docka-800 dark:text-zinc-200 truncate">
                                                                    {metadata.imageName || 'imagem.jpg'}
                                                                </p>
                                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Imagem comemorativa ativa</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                disabled={uploadingSlug === tpl.slug}
                                                                onClick={() => handleRemoveImage(tpl.slug)}
                                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors text-xs font-bold flex items-center gap-1"
                                                            >
                                                                <Trash2 size={12} /> Remover
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="file"
                                                                id={`image-upload-${tpl.slug}`}
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(e, tpl.slug)}
                                                            />
                                                            <button
                                                                type="button"
                                                                disabled={uploadingSlug === tpl.slug}
                                                                onClick={() => document.getElementById(`image-upload-${tpl.slug}`)?.click()}
                                                                className="px-3 py-1.5 bg-docka-50 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-bold hover:bg-docka-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                            >
                                                                {uploadingSlug === tpl.slug ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />}
                                                                Anexar Imagem
                                                            </button>
                                                            <span className="text-[10px] text-docka-400 italic">PNG, JPG ou JPEG.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {activeChannel === 'EMAIL' && tpl.emailSubject && (
                                                <div className="px-3 py-1.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30 text-xs font-semibold text-blue-900 dark:text-blue-300">
                                                    <strong>Assunto:</strong> {tpl.emailSubject}
                                                </div>
                                            )}
                                            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-docka-100/70 dark:border-zinc-800/70">
                                                <p className="text-xs text-docka-800 dark:text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed">
                                                    {tpl.content || 'Mensagem ainda não configurada.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Criar Nova Notificação */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Criar Nova Notificação Automática"
            >
                <div className="space-y-4 py-2">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Notificação</label>
                        <input 
                            type="text"
                            placeholder="Ex: Notificação de Protocolo Realizado"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Canal de Disparo</label>
                            <select
                                value={newChannel}
                                onChange={(e: any) => setNewChannel(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="WHATSAPP">📱 WhatsApp</option>
                                <option value="EMAIL">✉️ E-mail</option>
                                <option value="PUSH">🔔 Push (Portal)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Etapa Vinculada</label>
                            <select
                                value={newStageSlug}
                                onChange={(e) => setNewStageSlug(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                {STAGE_OPTIONS.map(s => (
                                    <option key={s.slug} value={s.slug}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {newChannel === 'EMAIL' && (
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Assunto do E-mail</label>
                            <input 
                                type="text"
                                placeholder="Ex: Atualização do seu processo {{codigoProcesso}}"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase">Mensagem</label>
                            <span className="text-[10px] text-docka-400 italic">Pílulas rápidas:</span>
                        </div>

                        <textarea
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                            placeholder="Olá, {{nomeCliente}}! O seu processo {{codigoProcesso}} teve uma novidade..."
                        />

                        <div className="flex flex-wrap gap-1 mt-2">
                            {VARIABLE_PILLS.map(v => (
                                <button 
                                    key={v.key}
                                    type="button"
                                    onClick={() => setNewContent(prev => prev + `{{${v.key}}}`)}
                                    className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-100 transition-colors"
                                >
                                    + {`{{${v.key}}}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-docka-500 hover:text-docka-900 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateTemplate}
                            disabled={creating || !newName || !newContent}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {creating ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
                            Criar Notificação
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Teste de Envio por Template */}
            <Modal
                isOpen={!!testingTemplateSlug}
                onClose={() => { setTestingTemplateSlug(null); setTestPhoneNumber(''); }}
                title={`Testar Envio da Mensagem`}
            >
                <div className="space-y-4 py-2">
                    <p className="text-xs text-docka-500">
                        Digite o número de telefone completo com DDD e código do país (ex: 5511999999999) para receber este disparo de teste.
                    </p>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-docka-500 uppercase">Número do WhatsApp</label>
                        <input 
                            type="text" 
                            placeholder="5511999999999"
                            value={testPhoneNumber}
                            onChange={(e) => setTestPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => { setTestingTemplateSlug(null); setTestPhoneNumber(''); }}
                            className="px-4 py-2 text-xs font-bold text-docka-500 hover:text-docka-900 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSendTemplateTest}
                            disabled={sendingTemplateTest || !testPhoneNumber}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {sendingTemplateTest ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                            Enviar Disparo de Teste
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Standalone CrmStageTaskManager component outside parent render scope
const CrmStageTaskManager: React.FC = () => {
    const { addToast } = useToast();
    const [selectedStageKey, setSelectedStageKey] = useState('leads');
    const [tasksMap, setTasksMap] = useState<Record<string, { id: string; title: string; due: string }[]>>(() => {
        const saved = localStorage.getItem('asterysko_crm_stage_tasks');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return {
            'leads': [
                { id: 'leads_contact', title: 'Fazer contato inicial via WhatsApp / Ligação', due: 'Hoje' },
                { id: 'leads_qualify', title: 'Qualificar interesse e definir marcas/classes de Nice', due: 'Hoje' }
            ],
            'preparation': [
                { id: 'prep_proposal', title: 'Enviar proposta comercial em PDF', due: 'Hoje' },
                { id: 'prep_system_info', title: 'Cadastrar informações do cliente no portal', due: 'Amanhã' }
            ],
            'viability': [
                { id: 'viab_search', title: 'Realizar busca de anterioridade no Radar de Marcas', due: 'Hoje' },
                { id: 'viab_report', title: 'Gerar parecer técnico de viabilidade', due: 'Hoje' }
            ],
            'contract': [
                { id: 'cont_send', title: 'Enviar link do contrato para assinatura digital', due: 'Hoje' },
                { id: 'cont_docs', title: 'Coletar documento de identidade (RG ou CNH) e Contrato Social', due: 'Amanhã' }
            ],
            'service_payment': [
                { id: 'pay_invoice', title: 'Emitir fatura de honorários da Asterysko', due: 'Hoje' },
                { id: 'pay_confirm', title: 'Confirmar compensação do pagamento do serviço', due: 'Em 2 dias' }
            ],
            'documentation': [
                { id: 'docs_proxy', title: 'Solicitar assinatura da Procuração pelo cliente', due: 'Hoje' },
                { id: 'docs_validate', title: 'Validar procuração assinada no portal', due: 'Amanhã' }
            ],
            'federal_fee': [
                { id: 'fee_emit', title: 'Gerar guia GRU no portal do INPI', due: 'Hoje' },
                { id: 'fee_send', title: 'Enviar guia GRU e código de barras para o cliente', due: 'Hoje' },
                { id: 'fee_confirm', title: 'Acompanhar compensação da GRU (retribuição federal)', due: 'Em 3 dias' }
            ],
            'ready_to_file': [
                { id: 'file_collate', title: 'Conferir todos os documentos e guias anexadas', due: 'Hoje' },
                { id: 'file_protocol', title: 'Efetuar protocolo do pedido de registro no INPI', due: 'Hoje' }
            ],
            'filed': [
                { id: 'filed_receipt', title: 'Enviar recibo de protocolo INPI ao cliente', due: 'Hoje' },
                { id: 'filed_monitor', title: 'Monitorar publicação oficial na RPI (Revista da P.I.)', due: 'Semanal' }
            ],
            'examination': [
                { id: 'exam_monitor', title: 'Acompanhar andamento do exame de mérito do INPI', due: 'Mensal' }
            ],
            'opposition': [
                { id: 'opp_analyze', title: 'Analisar teor da oposição ou exigência notificada', due: 'Hoje' },
                { id: 'opp_reply', title: 'Elaborar e protocolar manifestação/réplica no INPI', due: 'Prazo RPI' }
            ],
            'granted': [
                { id: 'grant_emit', title: 'Gerar GRU do primeiro decênio e expedição de certificado', due: 'Hoje' },
                { id: 'grant_pay', title: 'Acompanhar pagamento da GRU de concessão pelo cliente', due: 'Prazo legal' }
            ],
            'won': [
                { id: 'won_cert', title: 'Enviar certificado de registro de marca ao cliente', due: 'Hoje' },
                { id: 'won_congrats', title: 'Enviar mensagem de congratulações e pós-venda', due: 'Amanhã' }
            ]
        };
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDue, setNewDue] = useState('Hoje');

    const stagesList = [
        { key: 'leads', label: 'Novos Leads' },
        { key: 'preparation', label: 'Preparação' },
        { key: 'viability', label: 'Viabilidade' },
        { key: 'contract', label: 'Contrato' },
        { key: 'service_payment', label: 'Pagamento Serviço' },
        { key: 'documentation', label: 'Procuração/Docs' },
        { key: 'federal_fee', label: 'Taxa Federal (GRU)' },
        { key: 'ready_to_file', label: 'A Protocolar' },
        { key: 'filed', label: 'Protocolado (RPI)' },
        { key: 'examination', label: 'Exame de Mérito' },
        { key: 'opposition', label: 'Oposição / Exigência' },
        { key: 'granted', label: 'Deferido' },
        { key: 'won', label: 'Concluído' }
    ];

    const saveTasks = (newMap: Record<string, { id: string; title: string; due: string }[]>) => {
        setTasksMap(newMap);
        localStorage.setItem('asterysko_crm_stage_tasks', JSON.stringify(newMap));
    };

    const handleAddTask = () => {
        if (!newTitle.trim()) return;
        const task = {
            id: `task_${Date.now()}`,
            title: newTitle.trim(),
            due: newDue || 'Hoje'
        };
        const currentTasks = tasksMap[selectedStageKey] || [];
        const updatedMap = {
            ...tasksMap,
            [selectedStageKey]: [...currentTasks, task]
        };
        saveTasks(updatedMap);
        setNewTitle('');
        setIsAddModalOpen(false);
        addToast({ type: 'success', title: 'Tarefa Criada', message: 'Nova tarefa pré-definida salva para esta etapa!' });
    };

    const handleDeleteTask = (taskId: string) => {
        const currentTasks = tasksMap[selectedStageKey] || [];
        const updatedMap = {
            ...tasksMap,
            [selectedStageKey]: currentTasks.filter(t => t.id !== taskId)
        };
        saveTasks(updatedMap);
        addToast({ type: 'success', title: 'Tarefa Removida', message: 'Tarefa excluída da etapa com sucesso.' });
    };

    const currentStageObj = stagesList.find(s => s.key === selectedStageKey) || stagesList[0];
    const currentTasksList = tasksMap[selectedStageKey] || [];

    return (
        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-6">
            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                        <CheckSquare size={16} className="text-[#0412dd] dark:text-[#3b48ff]" /> Gerenciador de Tarefas por Etapa (CRM)
                    </h3>
                    <p className="text-xs text-docka-500 dark:text-zinc-400 mt-0.5">
                        Defina quais tarefas e prazos o time deve executar ao mover negócios para cada etapa do funil.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-[#0412dd] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                    <Plus size={14} /> + Nova Tarefa
                </button>
            </div>

            {/* Stages Selector Tabs */}
            <div className="p-6">
                <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar border-b border-docka-100 dark:border-zinc-800 mb-6">
                    {stagesList.map(st => {
                        const count = (tasksMap[st.key] || []).length;
                        const isSel = st.key === selectedStageKey;
                        return (
                            <button
                                key={st.key}
                                onClick={() => setSelectedStageKey(st.key)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                                    isSel 
                                        ? 'bg-[#0412dd] text-white border-[#0412dd] shadow-sm'
                                        : 'bg-docka-50 dark:bg-zinc-800/60 text-docka-600 dark:text-zinc-400 border-docka-200 dark:border-zinc-700 hover:bg-docka-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <span>{st.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSel ? 'bg-white/20 text-white' : 'bg-docka-200/60 dark:bg-zinc-700 text-docka-700 dark:text-zinc-300'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-docka-400 dark:text-zinc-500 tracking-wider">
                        Tarefas pré-definidas da etapa: <span className="text-docka-900 dark:text-white">{currentStageObj.label}</span>
                    </h4>

                    {currentTasksList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentTasksList.map(task => (
                                <div key={task.id} className="p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between group hover:border-blue-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-blue-500 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-docka-900 dark:text-zinc-100">{task.title}</p>
                                            <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
                                                <Clock size={10} /> Prazo: {task.due}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                        title="Excluir tarefa"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center border-2 border-dashed border-docka-200 dark:border-zinc-800 rounded-xl">
                            <p className="text-xs font-semibold text-docka-400 dark:text-zinc-500">Nenhuma tarefa pré-definida para esta etapa.</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="mt-3 text-xs font-bold text-[#0412dd] dark:text-[#3b48ff] hover:underline cursor-pointer"
                            >
                                + Adicionar primeira tarefa
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Adicionar Tarefa */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={`+ Nova Tarefa: ${currentStageObj.label}`}
                size="md"
            >
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Título da Tarefa</label>
                        <input
                            type="text"
                            placeholder="Ex: Confirmar dados da procuração com o cliente"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Prazo Recomendado</label>
                        <select
                            value={newDue}
                            onChange={e => setNewDue(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500"
                        >
                            <option value="Hoje">Hoje</option>
                            <option value="Amanhã">Amanhã</option>
                            <option value="Em 2 dias">Em 2 dias</option>
                            <option value="Em 3 dias">Em 3 dias</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Prazo RPI">Prazo RPI (Legal)</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-docka-100 dark:border-zinc-800">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-docka-500 hover:text-docka-900"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddTask}
                            disabled={!newTitle.trim()}
                            className="px-5 py-2 bg-[#0412dd] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            Salvar Tarefa
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// Standalone WhatsAppCard component outside parent render scope
const WhatsAppCard: React.FC = () => {
    const { addToast } = useToast();
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [testNumber, setTestNumber] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const checkStatus = async () => {
        setChecking(true);
        try {
            const res = await api.get('/whatsapp/status');
            if (res.data.instance?.state === 'open' || res.data.state === 'open') {
                setStatus('connected');
                setQrCode(null);
            } else {
                setStatus('disconnected');
            }
        } catch (err) {
            setStatus('disconnected');
        } finally {
            setChecking(false);
        }
    };

    const handleConnect = async (forceReset: boolean = false) => {
        setChecking(true);
        setQrCode(null);
        try {
            const endpoint = forceReset ? '/whatsapp/connect?reset=true' : '/whatsapp/connect';
            const res = await api.get(endpoint);
            const rawBase64 = res.data.base64 || res.data.qrcode?.base64;
            
            if (rawBase64) {
                setQrCode(rawBase64.startsWith('data:image') ? rawBase64 : `data:image/png;base64,${rawBase64}`);
                setStatus('disconnected');
            } else if (res.data.code) {
                const codeUrl = res.data.code.startsWith('data:image') || res.data.code.startsWith('http') 
                    ? res.data.code 
                    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(res.data.code)}`;
                setQrCode(codeUrl);
                setStatus('disconnected');
            } else if (res.data.instance?.state === 'open' || res.data.state === 'open') {
                if (forceReset) {
                    // Se foi pedido reset forçado mas retornou open, faz retry chamando connect com reset
                    const retryRes = await api.get('/whatsapp/connect?reset=true');
                    const retryRaw = retryRes.data.base64 || retryRes.data.qrcode?.base64 || retryRes.data.code;
                    if (retryRaw) {
                        setQrCode(retryRaw.startsWith('data:image') || retryRaw.startsWith('http') ? retryRaw : `data:image/png;base64,${retryRaw}`);
                        setStatus('disconnected');
                    } else {
                        setStatus('connected');
                    }
                } else {
                    setStatus('connected');
                }
            } else {
                setStatus('disconnected');
            }
        } catch (err: any) {
            console.error('Erro ao conectar WhatsApp:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Falha ao gerar QR Code. Verifique se a API está online.';
            addToast({ type: 'error', title: 'Erro de Conexão', message: errorMsg });
            setStatus('disconnected');
        } finally {
            setChecking(false);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Tem certeza que deseja desconectar e resetar a sessão do WhatsApp?')) return;
        setChecking(true);
        try {
            await api.delete('/whatsapp/disconnect');
            addToast({ type: 'success', title: 'Sessão Resetada', message: 'Sessão resetada. Gerando novo QR Code...' });
            await handleConnect(true);
        } catch (err: any) {
            console.error('Erro ao desconectar WhatsApp:', err);
            setStatus('disconnected');
            setQrCode(null);
            addToast({ type: 'info', title: 'Sessão Limpa', message: 'Instância resetada. Clique em Gerar QR Code.' });
        } finally {
            setChecking(false);
        }
    };

    const handleSendTest = async () => {
        if (!testNumber) {
            addToast({ type: 'error', title: 'Número vazio', message: 'Digite um número de telefone com DDD (ex: 5511999999999).' });
            return;
        }
        setSendingTest(true);
        try {
            await api.post('/whatsapp/send-test', { number: testNumber });
            addToast({ type: 'success', title: 'Mensagem Enviada', message: 'Verifique seu WhatsApp! A mensagem de teste foi entregue.' });
        } catch (err: any) {
            console.error('Erro ao enviar teste WhatsApp:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Falha ao enviar mensagem de teste.';
            addToast({ type: 'error', title: 'Erro de Envio WhatsApp', message: errorMsg });
            
            setStatus('disconnected');
            setQrCode(null);
        } finally {
            setSendingTest(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-500" /> Conexão WhatsApp (Evolution API)
                </h3>
                <div className="flex items-center gap-2">
                    {status === 'connected' ? (
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> CONECTADO
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                            DESCONECTADO
                        </span>
                    )}
                    <button 
                        onClick={checkStatus} 
                        disabled={checking}
                        className="p-1.5 text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
                        title="Atualizar Status"
                    >
                        <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
            <div className="p-6">
                {status === 'connected' ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">WhatsApp Vinculado</p>
                                    <p className="text-xs text-docka-500">Seu número está pronto para enviar notificações automáticas.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                disabled={checking}
                                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 transition-colors flex items-center gap-2"
                            >
                                <Power size={14} /> Desconectar
                            </button>
                        </div>

                        <div className="pt-6 border-t border-docka-100 dark:border-zinc-800">
                            <h4 className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-3">Teste de Envio</h4>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Número (Ex: 5511999999999)"
                                    value={testNumber}
                                    onChange={(e) => setTestNumber(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                                <button
                                    onClick={handleSendTest}
                                    disabled={sendingTest || !testNumber}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {sendingTest ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                                    Enviar Teste
                                </button>
                            </div>
                            <p className="text-[10px] text-docka-400 mt-2 italic">Dica: Use o código do país (55) + DDD + Número.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                        {!qrCode ? (
                            <div className="text-center max-w-sm">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto mb-4">
                                    <QrCode size={32} />
                                </div>
                                <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-1">WhatsApp Desconectado</h4>
                                <p className="text-xs text-docka-500 mb-6">Conecte seu número para que o Asterysko possa enviar atualizações de processos aos seus clientes via WhatsApp.</p>
                                <button
                                    onClick={handleConnect}
                                    disabled={checking}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {checking ? <RefreshCw size={16} className="animate-spin" /> : <QrCode size={16} />}
                                    Gerar QR Code para Conectar
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                                <div className="p-4 bg-white rounded-2xl shadow-xl border border-zinc-100 mb-6">
                                    {/* QR Code image from Evolution API */}
                                    <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                                </div>
                                <p className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-1">Escaneie o código acima</p>
                                <p className="text-xs text-docka-500 mb-6 text-center">Abra o WhatsApp {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setQrCode(null)}
                                        className="px-4 py-2 text-xs font-bold text-docka-500 hover:text-docka-900 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={checkStatus}
                                        className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                                    >
                                        Já escaneei
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

    return (
        <DashboardPage title="Configurações Asterysko" icon={Shield}>
            <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-6 -mt-2">Preferências do escritório, integração WhatsApp, tabela de planos e portal do cliente.</p>

                {/* SETTINGS TABS NAVIGATION */}
                <div className="flex border-b border-docka-200 dark:border-zinc-800 mb-8 bg-white dark:bg-zinc-900 rounded-2xl p-1.5 shadow-sm gap-1 overflow-x-auto">
                    <button
                        onClick={() => setActiveSettingsTab('notifications')}
                        className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingsTab === 'notifications'
                                ? 'bg-[#0412dd] text-white shadow-md'
                                : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <Smartphone size={16} /> Conexões & Notificações
                    </button>

                    <button
                        onClick={() => setActiveSettingsTab('crm_inpi')}
                        className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingsTab === 'crm_inpi'
                                ? 'bg-[#0412dd] text-white shadow-md'
                                : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <CheckSquare size={16} /> CRM & Motor INPI
                    </button>

                    <button
                        onClick={() => setActiveSettingsTab('scout_ai')}
                        className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingsTab === 'scout_ai'
                                ? 'bg-[#0412dd] text-white shadow-md'
                                : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <Bot size={16} /> Scout AI
                    </button>

                    <button
                        onClick={() => setActiveSettingsTab('plans')}
                        className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingsTab === 'plans'
                                ? 'bg-[#0412dd] text-white shadow-md'
                                : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <CreditCard size={16} /> Planos & Honorários
                    </button>

                    <button
                        onClick={() => setActiveSettingsTab('portal')}
                        className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeSettingsTab === 'portal'
                                ? 'bg-[#0412dd] text-white shadow-md'
                                : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        <Users size={16} /> Portal do Cliente & Marca
                    </button>
                </div>

                <div className="space-y-8">
                    
                    {/* TAB 1: NOTIFICATIONS & WHATSAPP */}
                    {activeSettingsTab === 'notifications' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* WhatsApp Connection Section */}
                            <WhatsAppCard />

                            {/* WhatsApp Templates Section */}
                            <NotificationTemplatesManager />
                        </div>
                    )}

                    {activeSettingsTab === 'scout_ai' && (
                        <AsteryskoScoutAutomationSettings organizationId={organization?.id} />
                    )}

                    {/* TAB 2: CRM RULES & INPI MOTOR */}
                    {activeSettingsTab === 'crm_inpi' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* CRM Stage Task Manager Section */}
                            <CrmStageTaskManager />

                            {/* INPI Integration & RPI Upload */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Shield size={16} /> Motor INPI (Revista da Propriedade Industrial)
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-300 mb-4">
                                        <strong>Importante:</strong> Faça o upload do arquivo XML das Revistas (RPI) semanais ou históricas do INPI para alimentar o nosso Motor de Busca de Viabilidade interno.
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Upload Box */}
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Processar Revista (XML)</label>
                                            <div
                                                onClick={() => document.getElementById('rpi-upload')?.click()}
                                                className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                            >
                                                <Upload size={24} className="text-docka-400 dark:text-zinc-500 mb-2" />
                                                <p className="text-sm font-bold text-docka-700 dark:text-zinc-300">Clique para selecionar o XML</p>
                                                <p className="text-xs text-docka-500 dark:text-zinc-500 mt-1 text-center">Tamanho máx recomendado: 100MB<br />O processamento rodará em segundo plano.</p>
                                            </div>
                                            <input
                                                id="rpi-upload"
                                                type="file"
                                                className="hidden"
                                                accept=".xml"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        formData.append('rpiNumber', file.name.replace(/[^0-9]/g, '') || String(Date.now()));

                                                        addToast({ type: 'success', title: 'Upload Iniciado', message: `Enviando ${file.name} ao servidor...` });

                                                        await api.post('/asterysko/inpi/parse', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });

                                                        addToast({ type: 'success', title: 'Processamento Iniciado', message: 'O arquivo XML está sendo indexado no Motor de Busca em segundo plano.' });
                                                    } catch (err: any) {
                                                        console.error(err);
                                                        addToast({ type: 'error', title: 'Falha no Envio', message: err.response?.data?.error || 'Erro ao comunicar com a API.' });
                                                    } finally {
                                                        e.target.value = '';
                                                        setTimeout(fetchInpiHistory, 1500);
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Legacy Credentials info */}
                                        <div>
                                            <p className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Acesso API Automática (Futuro)</p>
                                            <div className="space-y-4 opacity-50 pointer-events-none">
                                                <div>
                                                    <label className="block text-xs uppercase font-bold text-docka-500 mb-1">Login e-INPI</label>
                                                    <input className="w-full px-3 py-2 bg-docka-50 dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-700" value="asterysko_pi" disabled />
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase font-bold text-docka-500 mb-1">Senha</label>
                                                    <input type="password" className="w-full px-3 py-2 bg-docka-50 dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-700" value="********" disabled />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* History List */}
                                    <div className="mt-8 pt-6 border-t border-docka-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase flex items-center gap-2">Histórico de Processamento</h4>
                                            <button onClick={fetchInpiHistory} className="text-xs px-3 py-1 bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-300 rounded-md hover:bg-docka-200 dark:hover:bg-zinc-700 font-bold transition-colors">Atualizar</button>
                                        </div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {loadingHistory ? (
                                                <div className="text-sm text-center text-docka-400 py-4">Carregando histórico...</div>
                                            ) : (!Array.isArray(inpiHistory) || inpiHistory.length === 0) ? (
                                                <div className="text-sm border-2 border-dashed border-docka-200 dark:border-zinc-800 p-6 rounded-xl text-center text-docka-500 dark:text-zinc-500 flex flex-col items-center">
                                                    <Info size={20} className="mb-2 opacity-50" />
                                                    Nenhum histórico de Revista do INPI encontrado. Faça seu primeiro Upload.
                                                </div>
                                            ) : (
                                                inpiHistory.map((log: any) => (
                                                    <div key={log.id} className="flex items-center justify-between p-3 bg-docka-50 dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm transition-colors hover:border-docka-300">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                                                RPI {log.rpiNumber}
                                                                {log.status === 'PROCESSING' && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full font-bold animate-pulse">Processando...</span>}
                                                                {log.status === 'COMPLETED' && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full font-bold">Concluído</span>}
                                                                {log.status === 'FAILED' && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full font-bold">Falhou</span>}
                                                            </span>
                                                            <span className="text-xs text-docka-500 uppercase mt-1">
                                                                Data da Edição: {log.rpiDate ? new Date(log.rpiDate).toLocaleDateString('pt-BR') : 'N/A'} • {log.fileName || ''}
                                                            </span>
                                                            {log.status === 'FAILED' && log.errorMessage && (
                                                                <span className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">{log.errorMessage}</span>
                                                            )}
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className="font-mono font-bold text-docka-700 dark:text-zinc-300">
                                                                {(log.totalExtracted || 0).toLocaleString('pt-BR')}
                                                            </span>
                                                            <span className="text-xs text-docka-400 uppercase">Marcas extraídas</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: PLANS & PRICING TABLE */}
                    {activeSettingsTab === 'plans' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Fees Table Section */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <CreditCard size={16} /> Tabela de Planos Asterysko
                                    </h3>
                                    <button
                                        onClick={() => { setSelectedPlan({ category: 'registration', commissionSales: 0, commissionOps: 0 }); setIsModalOpen(true); }}
                                        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Plus size={14} /> Novo Plano
                                    </button>
                                </div>
                                <div className="p-6">
                                    {loading ? (
                                        <div className="py-8 text-center text-docka-400 text-xs italic">Carregando honorários...</div>
                                    ) : (
                                        <>
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-docka-500 dark:text-zinc-500 uppercase font-semibold border-b border-docka-100 dark:border-zinc-800 tracking-wider">
                                                    <tr>
                                                        <th className="pb-3 text-left">Plano / Serviço</th>
                                                        <th className="pb-3 text-right">Valor</th>
                                                        <th className="pb-3 text-right">Com. Vendas</th>
                                                        <th className="pb-3 text-right">Com. Op.</th>
                                                        <th className="pb-3 text-right">Ação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                                    {(Array.isArray(plans) ? plans : []).map((plan) => (
                                                        <tr key={plan.id} className="group hover:bg-docka-50/50 dark:hover:bg-zinc-800/30">
                                                            <td className="py-3">
                                                                <p className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{plan.name}</p>
                                                                {plan.description && <p className="text-xs text-docka-500 dark:text-zinc-500">{plan.description}</p>}
                                                            </td>
                                                            <td className="py-3 text-right font-mono font-bold text-docka-900 dark:text-zinc-100">
                                                                R$ {Number(plan.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                                R$ {Number(plan.commissionSales || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="py-3 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                                                                R$ {Number(plan.commissionOps || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="py-3 text-right">
                                                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => { setSelectedPlan(plan); setIsModalOpen(true); }}
                                                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(plan.id)}
                                                                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!Array.isArray(plans) || plans.length === 0) && (
                                                        <tr>
                                                            <td colSpan={5} className="py-8 text-center text-docka-400 text-xs italic">Nenhum plano cadastrado.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                    <div className="mt-6 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3">
                                        <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-800/80 dark:text-blue-300/60 leading-relaxed italic">
                                            Estes valores servem de base para o CRM. Você ainda poderá ajustar o valor individual de cada lead durante o fechamento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: CLIENT PORTAL & BRANDING */}
                    {activeSettingsTab === 'portal' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Client Portal Management */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Users size={16} /> Portal do Cliente
                                    </h3>
                                    <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">ATIVO</span>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Link de Acesso Geral</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 flex items-center bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-docka-600 dark:text-zinc-400">
                                                    <Link size={14} className="mr-2 text-docka-400 dark:text-zinc-500" />
                                                    portal.asterysko.com/login
                                                </div>
                                                <button className="p-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-400">
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={onOpenClientPortal}
                                                    className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                                                >
                                                    <Eye size={16} /> Visualizar como Cliente
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-2">Personalização e Domínio</h4>

                                        <div className="mb-6">
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Domínio Customizado (White-Label)</label>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm text-docka-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                                        placeholder="Ex: cliente.asterysko.com"
                                                        value={clientPortalDomain}
                                                        onChange={(e) => setClientPortalDomain(e.target.value)}
                                                        onBlur={handleUpdateDomain}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleUpdateDomain();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={handleUpdateDomain}
                                                        className="px-4 py-2 bg-docka-100 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-docka-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                                    >
                                                        Salvar
                                                    </button>
                                                </div>
                                                {clientPortalDomain && (
                                                    <div className="mt-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/50">
                                                        <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                                            Configuração de Zona DNS
                                                            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-1.5 py-0.5 rounded font-semibold">Pendente</span>
                                                        </h5>
                                                        <p className="text-xs text-slate-500 dark:text-zinc-500 mb-4">Adicione o registro abaixo no seu provedor de domínio (Cloudflare, Hostinger, Registro.br, etc) para ativar o redirecionamento. A propagação pode levar alguns minutos.</p>

                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <span className="block text-xs uppercase font-semibold text-slate-400 dark:text-zinc-500 mb-1">Tipo</span>
                                                                <div className="text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 rounded w-full text-docka-900 dark:text-zinc-100">CNAME</div>
                                                            </div>
                                                            <div>
                                                                <span className="block text-xs uppercase font-semibold text-slate-400 dark:text-zinc-500 mb-1 flex items-center justify-between">
                                                                    Nome / Host
                                                                </span>
                                                                <div className="text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 rounded w-full text-docka-900 dark:text-zinc-100 truncate" title={clientPortalDomain}>
                                                                    {clientPortalDomain.split('.').length > 2 ? clientPortalDomain.split('.')[0] : '@'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="block text-xs uppercase font-semibold text-slate-400 dark:text-zinc-500 mb-1 flex items-center justify-between">
                                                                    Valor / Destino
                                                                </span>
                                                                <div className="text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 rounded w-full text-docka-900 dark:text-zinc-100 truncate">
                                                                    cname.vercel-dns.com
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cor Primária</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded bg-blue-600 border border-docka-200 dark:border-zinc-700" />
                                                    <input className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" defaultValue="#2563EB" />
                                                </div>
                                            </div>

                                            {/* Logo Upload Section */}
                                            <div>
                                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Logo do Portal</label>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                                <div className="flex items-center gap-3">
                                                    {organization?.logo && (
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-docka-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                                            <img src={`${api.defaults.baseURL?.replace('/api', '')}${organization.logo}`} alt="Logo" className="w-full h-full object-contain" />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={handleLogoClick}
                                                        className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm text-left text-docka-500 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                                    >
                                                        {organization?.logo ? 'Alterar imagem...' : 'Carregar imagem...'}
                                                    </button>
                                                </div>
                                            </div>

                                        </div>

                                        {organization && (
                                            <div className="mt-8 pt-6 border-t border-docka-100 dark:border-zinc-800">
                                                <OrganizationIconSettings organization={organization} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* MODAL: ADD/EDIT FEE */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { if (!saving) setIsModalOpen(false); }}
                title={selectedPlan?.id ? 'Editar Plano' : 'Novo Plano'}
                size="md"
                footer={
                    <div className="flex justify-end gap-2 outline-none">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : selectedPlan?.id ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 text-left">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Nome do Plano / Serviço</label>
                            <input
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Ex: Essencial - Registro de Marca"
                                value={selectedPlan?.name || ''}
                                onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Descrição (Opcional)</label>
                            <textarea
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Breve descrição do que está incluso..."
                                rows={2}
                                value={selectedPlan?.description || ''}
                                onChange={(e) => setSelectedPlan({ ...selectedPlan, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Valor do Plano (R$)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 font-bold focus:border-blue-500 outline-none transition-colors"
                                        placeholder="0,00"
                                        value={selectedPlan?.value || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Taxa Oficial (R$)</label>
                                <div className="relative">
                                    <AlertCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-500 dark:text-zinc-400 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Taxa INPI"
                                        value={selectedPlan?.officialTax || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, officialTax: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 font-mono">Comissão Comercial (R$)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" />
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 font-bold focus:border-emerald-500 outline-none transition-colors"
                                        placeholder="0,00"
                                        value={selectedPlan?.commissionSales || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, commissionSales: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 font-mono">Comissão Operação (R$)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300 font-bold focus:border-blue-500 outline-none transition-colors"
                                        placeholder="0,00"
                                        value={selectedPlan?.commissionOps || ''}
                                        onChange={(e) => setSelectedPlan({ ...selectedPlan, commissionOps: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Categoria</label>
                            <select
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                value={selectedPlan?.category || 'registration'}
                                onChange={(e) => setSelectedPlan({ ...selectedPlan, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardPage>
    );
};

export default AsteryskoSettingsView;
