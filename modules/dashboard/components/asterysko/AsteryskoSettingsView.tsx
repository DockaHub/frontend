import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, Users, Link, Copy, Eye, Plus, Edit2, Trash2, DollarSign, Info, AlertCircle, Upload, MessageSquare, RefreshCw, Smartphone, QrCode, Power, Send, Save, Check, X } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';
import DashboardPage from '../../../../components/DashboardPage';

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
        fetchPlans();
        fetchInpiHistory();
    }, []);

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

    const WhatsAppTemplatesSection = () => {
        const [templates, setTemplates] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [editingSlug, setEditingSlug] = useState<string | null>(null);
        const [editContent, setEditContent] = useState('');
        const [saving, setSaving] = useState(false);

        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const res = await api.get('/whatsapp/templates');
                setTemplates(res.data);
            } catch (err) {
                console.error('Erro ao buscar templates:', err);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchTemplates();
        }, []);

        const handleSaveTemplate = async (slug: string) => {
            setSaving(true);
            try {
                await api.put(`/whatsapp/templates/${slug}`, { 
                    content: editContent,
                    name: DEFAULT_TEMPLATES.find(t => t.slug === slug)?.name
                });
                addToast({ type: 'success', title: 'Salvo', message: 'Template atualizado com sucesso.' });
                setEditingSlug(null);
                fetchTemplates();
            } catch (err) {
                addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar template.' });
            } finally {
                setSaving(false);
            }
        };

        const DEFAULT_TEMPLATES = [
            {
                slug: 'new-dispatch',
                name: 'Novo Despacho (INPI)',
                variables: ['cliente', 'marca', 'processo', 'despacho', 'detalhes'],
                description: 'Enviado quando uma nova movimentação é detectada no INPI.'
            },
            {
                slug: 'invoice-pending',
                name: 'Fatura Pendente',
                variables: ['cliente', 'valor', 'vencimento', 'link'],
                description: 'Enviado quando uma nova fatura de serviço é gerada.'
            },
            {
                slug: 'payment-success',
                name: 'Confirmação de Pagamento',
                variables: ['cliente', 'valor'],
                description: 'Enviado quando o pagamento de uma fatura é confirmado.'
            },
            {
                slug: 'contract-signed',
                name: 'Contrato Assinado',
                variables: ['cliente', 'marca'],
                description: 'Enviado como confirmação após a assinatura do contrato.'
            },
            {
                slug: 'welcome-client',
                name: 'Boas-vindas ao Cliente',
                variables: ['cliente'],
                description: 'Enviado manualmente ou via trigger ao cadastrar novo cliente.'
            }
        ];

        return (
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm mt-8">
                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                        <MessageSquare size={16} className="text-emerald-500" /> Configuração de Mensagens Automáticas (WhatsApp)
                    </h3>
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                        {DEFAULT_TEMPLATES.map((tpl) => {
                            const dbTpl = templates.find(t => t.slug === tpl.slug);
                            const isEditing = editingSlug === tpl.slug;

                            return (
                                <div key={tpl.slug} className="p-4 border border-docka-100 dark:border-zinc-800 rounded-xl hover:border-docka-200 dark:hover:border-zinc-700 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">{tpl.name}</h4>
                                            <p className="text-xs text-docka-500 mt-1">{tpl.description}</p>
                                        </div>
                                        {!isEditing ? (
                                            <button 
                                                onClick={() => {
                                                    setEditingSlug(tpl.slug);
                                                    setEditContent(dbTpl?.content || '');
                                                }}
                                                className="p-2 text-docka-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => setEditingSlug(null)}
                                                    className="p-2 text-docka-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleSaveTemplate(tpl.slug)}
                                                    disabled={saving}
                                                    className="p-2 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                                >
                                                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                placeholder="Escreva sua mensagem aqui..."
                                            />
                                            <div className="flex flex-wrap gap-1.5">
                                                {tpl.variables.map(v => (
                                                    <button 
                                                        key={v}
                                                        onClick={() => setEditContent(prev => prev + `{{${v}}}`)}
                                                        className="px-2 py-1 bg-docka-50 dark:bg-zinc-800 text-[10px] font-bold text-docka-600 dark:text-zinc-400 rounded hover:bg-docka-100 transition-colors"
                                                    >
                                                        + {`{{${v}}}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-docka-100 dark:border-zinc-800/50">
                                            <p className="text-xs text-docka-700 dark:text-zinc-300 whitespace-pre-wrap italic">
                                                {dbTpl?.content || 'Template ainda não configurado.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const WhatsAppCard = () => {
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

        const handleConnect = async () => {
            setChecking(true);
            try {
                const res = await api.get('/whatsapp/connect');
                // Evolution API v2 usually returns base64 image and the raw code
                if (res.data.base64) {
                    setQrCode(res.data.base64.startsWith('data:image') ? res.data.base64 : `data:image/png;base64,${res.data.base64}`);
                    setStatus('disconnected');
                } else if (res.data.qrcode?.base64) {
                    setQrCode(res.data.qrcode.base64.startsWith('data:image') ? res.data.qrcode.base64 : `data:image/png;base64,${res.data.qrcode.base64}`);
                    setStatus('disconnected');
                } else if (res.data.code) {
                    // Fallback to QR code generator if base64 is not present (not common in v2)
                    setQrCode(res.data.code);
                    setStatus('disconnected');
                } else if (res.data.instance?.state === 'open') {
                    setStatus('connected');
                }
            } catch (err: any) {
                console.error('Erro ao conectar WhatsApp:', err);
                const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Falha ao gerar QR Code. Verifique se a API está online.';
                addToast({ type: 'error', title: 'Erro de Conexão', message: errorMsg });
            } finally {
                setChecking(false);
            }
        };

        const handleDisconnect = async () => {
            if (!window.confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
            setChecking(true);
            try {
                await api.delete('/whatsapp/disconnect');
                setStatus('disconnected');
                setQrCode(null);
                addToast({ type: 'success', title: 'Desconectado', message: 'WhatsApp desconectado com sucesso.' });
            } catch (err: any) {
                console.error('Erro ao desconectar WhatsApp:', err);
                const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Falha ao desconectar.';
                addToast({ type: 'error', title: 'Erro', message: errorMsg });
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
                addToast({ type: 'success', title: 'Mensagem Enviada', message: 'Verifique seu WhatsApp!' });
            } catch (err: any) {
                console.error('Erro ao enviar teste WhatsApp:', err);
                addToast({ type: 'error', title: 'Erro ao Enviar', message: err.response?.data?.error || 'Falha ao enviar mensagem de teste.' });
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
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-10 -mt-2">Preferências do escritório, tabela de planos e portal do cliente.</p>

                <div className="space-y-8">
                    
                    {/* WhatsApp Connection Section */}
                    <WhatsAppCard />

                    {/* WhatsApp Templates Section */}
                    <WhatsAppTemplatesSection />

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
                                                // Exemplo: Usamos o timestamp atual como número genérico caso não venha no nome
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
                                                // Limpa o input
                                                e.target.value = '';
                                                setTimeout(fetchInpiHistory, 1500); // refresh list
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
                                    ) : inpiHistory.length === 0 ? (
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
                                                    <span className="text-xs text-docka-500 uppercase mt-1">Data da Edição: {new Date(log.rpiDate).toLocaleDateString('pt-BR')} • {log.fileName}</span>
                                                    {log.status === 'FAILED' && log.errorMessage && (
                                                        <span className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">{log.errorMessage}</span>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="font-mono font-bold text-docka-700 dark:text-zinc-300">{log.totalExtracted.toLocaleString('pt-BR')}</span>
                                                    <span className="text-xs text-docka-400 uppercase">Marcas extraídas</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

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
                                            {plans.map((plan) => (
                                                <tr key={plan.id} className="group hover:bg-docka-50/50 dark:hover:bg-zinc-800/30">
                                                    <td className="py-3">
                                                        <p className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{plan.name}</p>
                                                        {plan.description && <p className="text-xs text-docka-500 dark:text-zinc-500">{plan.description}</p>}
                                                    </td>
                                                    <td className="py-3 text-right font-mono font-bold text-docka-900 dark:text-zinc-100">
                                                        R$ {Number(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                                            {plans.length === 0 && (
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
                                            className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
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
                                                className="px-4 py-2 bg-docka-100 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:bg-docka-200 dark:hover:bg-zinc-700 transition-colors"
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
                                                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl text-sm text-left text-docka-500 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors"
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
