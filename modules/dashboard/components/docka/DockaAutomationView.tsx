import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, ArrowLeft, Bot, Building2, Check, CheckCircle2, ChevronDown, Clock3, CreditCard,
    FormInput, GitBranch, History, Info, ListFilter, Mail, MessageCircle, MoreHorizontal, Play,
    Pencil, Plus, Radio, RefreshCw, Save, Search, Send, Settings2, Slack, Sparkles, Trash2,
    Webhook, WifiOff, Workflow, X, Zap
} from 'lucide-react';
import { Organization } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import api from '../../../../services/api';

type NodeKind = 'trigger' | 'action';
type FlowStatus = 'active' | 'paused' | 'draft';
type FlowSource = 'native' | 'custom';

interface AutomationNode {
    id: string;
    kind: NodeKind;
    app: string;
    title: string;
    description: string;
    color: string;
    icon: string;
    organizationId: string;
    message?: string;
    type?: string;
    config?: Record<string, any>;
}

interface AutomationFlow {
    id: string;
    name: string;
    description: string;
    organizationId: string;
    status: FlowStatus;
    source: FlowSource;
    nodes: AutomationNode[];
    updatedAt: string;
    triggerType?: string;
    triggerConfig?: Record<string, any>;
    triggerDetails?: TriggerDetails;
    runtime?: RuntimeDetails;
    lastExecutedAt?: string | null;
    nextRunAt?: string | null;
    organization?: { id: string; name: string; slug?: string };
}

interface TriggerDetails {
    eventType: string;
    label: string;
    description: string;
    origin: string;
    payload: string[];
}

interface AutomationExecution {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'WAITING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    dryRun: boolean;
    triggerType: string;
    steps?: Array<Record<string, any>>;
    error?: string | null;
    createdAt: string;
    startedAt?: string | null;
    finishedAt?: string | null;
}

interface RuntimeDetails {
    active: boolean;
    engine: string;
    trackingMode: 'native_service' | 'automation_engine';
    statusExplanation: string;
    executionCount: number;
    lastExecution?: AutomationExecution | null;
}

interface AutomationCompany {
    id: string;
    name: string;
    slug?: string;
}

interface ConnectionState {
    configured: boolean;
    connected: boolean;
    status: 'connected' | 'disconnected' | 'misconfigured';
    label: string;
    detail?: string;
    identity?: string;
    checkedAt?: string;
    canTest?: boolean;
    canSendTest?: boolean;
    settingsTarget?: string;
}

type AutomationConnections = Record<'email' | 'slack' | 'whatsapp' | 'webhook' | 'internal' | 'schedule', ConnectionState>;

interface AutomationTemplate {
    app: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    kind: NodeKind;
}

const templates: AutomationTemplate[] = [
    { app: 'Manyways', title: 'Evento do sistema', description: 'Quando algo acontecer em uma empresa', icon: 'zap', color: '#7657F6', kind: 'trigger' },
    { app: 'Webhook', title: 'Webhook recebido', description: 'Receber dados de qualquer sistema', icon: 'webhook', color: '#F05D69', kind: 'trigger' },
    { app: 'Agenda', title: 'Data e horário', description: 'Executar em um horário programado', icon: 'clock', color: '#8779F4', kind: 'trigger' },
    { app: 'Formulário', title: 'Nova resposta', description: 'Quando um formulário for enviado', icon: 'form', color: '#5D7DF5', kind: 'trigger' },
    { app: 'E-mail', title: 'Enviar e-mail', description: 'Disparar uma mensagem personalizada', icon: 'mail', color: '#EA4335', kind: 'action' },
    { app: 'Slack', title: 'Notificar no Slack', description: 'Publicar em um canal ou conversa', icon: 'slack', color: '#4A154B', kind: 'action' },
    { app: 'WhatsApp', title: 'Enviar WhatsApp', description: 'Notificar um contato pelo WhatsApp', icon: 'message', color: '#17B26A', kind: 'action' },
    { app: 'Webhook', title: 'Enviar webhook', description: 'Enviar dados para outro sistema', icon: 'webhook', color: '#F05D69', kind: 'action' },
    { app: 'Notificação interna', title: 'Notificar equipe', description: 'Criar uma notificação dentro da Manyways', icon: 'zap', color: '#7657F6', kind: 'action' },
    { app: 'Aguardar', title: 'Adicionar espera', description: 'Pausar o fluxo por um período', icon: 'clock', color: '#F79009', kind: 'action' },
];

const eventOptions: TriggerDetails[] = [
    { eventType: 'crm.lead.created', label: 'Novo lead criado', description: 'Dispara imediatamente depois que um lead é salvo no CRM, seja pelo formulário público ou por cadastro manual.', origin: 'CRM e formulários', payload: ['name', 'email', 'phone', 'deal.id', 'deal.status', 'form.id'] },
    { eventType: 'crm.lead.assigned', label: 'Lead atribuído', description: 'Dispara quando um responsável é definido ou alterado para um lead existente.', origin: 'CRM', payload: ['name', 'email', 'phone', 'deal.id', 'deal.assignedUserId'] },
    { eventType: 'contract.signed', label: 'Contrato assinado', description: 'Dispara somente após a assinatura digital ser confirmada e persistida no contrato do cliente.', origin: 'Contratos', payload: ['name', 'email', 'phone', 'deal.id', 'deal.title', 'deal.processId'] },
    { eventType: 'invoice.created', label: 'Fatura criada', description: 'Dispara quando uma nova cobrança é criada para o cliente; não significa que ela foi paga.', origin: 'Financeiro', payload: ['name', 'email', 'phone', 'invoice.id', 'invoice.amount', 'invoice.dueDate', 'invoice.status'] },
    { eventType: 'payment.confirmed', label: 'Pagamento confirmado', description: 'Dispara depois que o provedor financeiro confirma e o sistema registra o pagamento.', origin: 'Financeiro', payload: ['name', 'email', 'phone', 'invoice.id', 'invoice.amount', 'invoice.status'] },
    { eventType: 'process.updated', label: 'Processo atualizado', description: 'Dispara quando um novo despacho altera o andamento do processo e essa atualização é salva.', origin: 'Processos e monitoramento INPI', payload: ['name', 'email', 'phone', 'process.id', 'process.status', 'dispatch.id', 'dispatch.code', 'dispatch.description'] },
    { eventType: 'form.submitted', label: 'Formulário enviado', description: 'Dispara após uma resposta válida ser recebida, armazenada e convertida no registro de destino.', origin: 'Formulários', payload: ['name', 'email', 'phone', 'company', 'message', 'form.id', 'form.targetStage', 'recordId'] },
    { eventType: 'webhook.received', label: 'Webhook recebido', description: 'Dispara quando a URL segura deste fluxo recebe uma requisição HTTP válida.', origin: 'Sistema externo', payload: ['Corpo JSON enviado ao webhook'] },
];

const iconFor = (name: string, size = 18) => {
    const props = { size, strokeWidth: 1.9 };
    switch (name) {
        case 'webhook': return <Webhook {...props} />;
        case 'clock': return <Clock3 {...props} />;
        case 'form': return <FormInput {...props} />;
        case 'mail': return <Mail {...props} />;
        case 'slack': return <Slack {...props} />;
        case 'message': return <MessageCircle {...props} />;
        case 'card': return <CreditCard {...props} />;
        case 'bot': return <Bot {...props} />;
        default: return <Zap {...props} />;
    }
};

const node = (
    id: string,
    kind: NodeKind,
    app: string,
    title: string,
    description: string,
    organizationId: string,
    icon: string,
    color: string,
    message?: string,
): AutomationNode => ({ id, kind, app, title, description, organizationId, icon, color, message });

const createDraftFlow = (organizationId: string): AutomationFlow => ({
    id: `draft-${Date.now()}`,
    name: 'Novo fluxo sem título',
    description: 'Configure um gatilho e adicione as ações deste fluxo.',
    organizationId,
    status: 'draft',
    source: 'custom',
    updatedAt: new Date().toISOString(),
    triggerType: 'EVENT',
    triggerConfig: { eventType: 'crm.lead.created' },
    nodes: [node(`trigger-${Date.now()}`, 'trigger', 'Manyways', 'Escolha o que inicia o fluxo', 'Selecione um gatilho no catálogo à esquerda', organizationId, 'zap', '#7657F6')],
});

const visualForApp = (app = '') => {
    const value = app.toLowerCase();
    if (value.includes('slack')) return { icon: 'slack', color: '#4A154B' };
    if (value.includes('whatsapp')) return { icon: 'message', color: '#17B26A' };
    if (value.includes('mail') || value.includes('e-mail')) return { icon: 'mail', color: '#EA4335' };
    if (value.includes('agenda') || value.includes('aguard')) return { icon: 'clock', color: '#8779F4' };
    if (value.includes('form')) return { icon: 'form', color: '#5D7DF5' };
    if (value.includes('finance')) return { icon: 'card', color: '#635BFF' };
    if (value.includes('ai')) return { icon: 'bot', color: '#111827' };
    if (value.includes('webhook')) return { icon: 'webhook', color: '#F05D69' };
    return { icon: 'zap', color: '#7657F6' };
};

const connectionKeyFor = (node?: AutomationNode): keyof AutomationConnections => {
    const app = String(node?.app || '').toLowerCase();
    if (app.includes('slack')) return 'slack';
    if (app.includes('whatsapp')) return 'whatsapp';
    if (app.includes('mail') || app.includes('e-mail')) return 'email';
    if (app.includes('webhook')) return 'webhook';
    if (app.includes('agenda') || app.includes('aguard')) return 'schedule';
    return 'internal';
};

const normalizeFlow = (flow: AutomationFlow): AutomationFlow => ({
    ...flow,
    status: String(flow.status).toLowerCase() as FlowStatus,
    source: String(flow.source).toLowerCase() as FlowSource,
    description: flow.description || '',
    nodes: (flow.nodes || []).map((item) => ({
        ...item,
        config: item.kind === 'trigger' ? { ...(item.config || {}), ...(flow.triggerConfig || {}) } : item.config,
        description: item.description || '',
        organizationId: item.organizationId || flow.organizationId,
        ...(!item.icon || !item.color ? visualForApp(item.app) : {}),
    })),
});

const statusStyles: Record<FlowStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    paused: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    draft: 'bg-docka-50 text-docka-500 border-docka-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

const statusLabel: Record<FlowStatus, string> = { active: 'Ativo', paused: 'Pausado', draft: 'Rascunho' };

const DockaAutomationView: React.FC<{ organizations: Organization[] }> = ({ organizations }) => {
    const { addToast } = useToast();
    const [flows, setFlows] = useState<AutomationFlow[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [editingFlow, setEditingFlow] = useState<AutomationFlow | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState('');
    const [catalogKind, setCatalogKind] = useState<NodeKind>('trigger');
    const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
    const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
    const [catalogHighlight, setCatalogHighlight] = useState(false);
    const [sideTab, setSideTab] = useState<'configuration' | 'connection' | 'activity'>('configuration');
    const [connections, setConnections] = useState<AutomationConnections | null>(null);
    const [connectionsLoading, setConnectionsLoading] = useState(false);
    const [overviewConnections, setOverviewConnections] = useState<AutomationConnections | null>(null);
    const [overviewConnectionsLoading, setOverviewConnectionsLoading] = useState(false);
    const [connectionTesting, setConnectionTesting] = useState('');
    const [executions, setExecutions] = useState<AutomationExecution[]>([]);
    const [executionsLoading, setExecutionsLoading] = useState(false);
    const catalogTimer = useRef<number | null>(null);
    const companies = useMemo<AutomationCompany[]>(() => {
        const available = new Map<string, AutomationCompany>();
        organizations.forEach((organization) => available.set(organization.id, organization));
        flows.forEach((flow) => {
            if (flow.organization && !available.has(flow.organization.id)) {
                available.set(flow.organization.id, flow.organization);
            }
        });
        return [...available.values()].sort((first, second) => first.name.localeCompare(second.name));
    }, [flows, organizations]);

    const loadFlows = async (quiet = false) => {
        if (!quiet) setLoading(true);
        setLoadError('');
        try {
            const response = await api.get<AutomationFlow[]>('/automations');
            setFlows((response.data || []).map(normalizeFlow));
        } catch (error: any) {
            const message = error.response?.data?.error || 'O motor de automações está temporariamente indisponível.';
            setLoadError(message);
            addToast({ type: 'error', title: 'Erro ao carregar automações', message });
        } finally {
            if (!quiet) setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        if (mounted) void loadFlows();
        return () => { mounted = false; };
    }, []);

    useEffect(() => () => {
        if (catalogTimer.current) window.clearTimeout(catalogTimer.current);
    }, []);

    const visibleFlows = useMemo(() => flows.filter((flow) => {
        const companyMatches = selectedCompanyId === 'all' || flow.organizationId === selectedCompanyId;
        const text = `${flow.name} ${flow.description}`.toLowerCase();
        return companyMatches && text.includes(search.trim().toLowerCase());
    }), [flows, search, selectedCompanyId]);

    const selectedNode = editingFlow?.nodes.find((item) => item.id === selectedNodeId) || editingFlow?.nodes[0];
    const isEditable = editingFlow?.source === 'custom';
    const companyFor = (organizationId: string) => companies.find((item) => item.id === organizationId);

    const openEditor = (flow: AutomationFlow) => {
        setEditingFlow({ ...flow, nodes: flow.nodes.map((item) => ({ ...item })) });
        setSelectedNodeId(flow.nodes[0]?.id || '');
        setCatalogKind('trigger');
        setMobileCatalogOpen(false);
        setMobileConfigOpen(false);
        setSideTab('configuration');
        setConnections(null);
        setExecutions([]);
    };

    const loadConnections = async () => {
        if (!editingFlow) return;
        setConnectionsLoading(true);
        try {
            const response = await api.get<AutomationConnections>('/automations/connections', { params: { organizationId: editingFlow.organizationId } });
            setConnections(response.data);
        } catch (error: any) {
            addToast({ type: 'error', title: 'Falha ao verificar conexão', message: error.response?.data?.error || 'Tente novamente.' });
        } finally {
            setConnectionsLoading(false);
        }
    };

    const loadExecutions = async () => {
        if (!editingFlow || editingFlow.id.startsWith('draft-')) {
            setExecutions([]);
            return;
        }
        setExecutionsLoading(true);
        try {
            const response = await api.get<AutomationExecution[]>(`/automations/${editingFlow.id}/executions`);
            setExecutions(response.data || []);
        } catch (error: any) {
            addToast({ type: 'error', title: 'Falha ao carregar histórico', message: error.response?.data?.error || 'Tente novamente.' });
        } finally {
            setExecutionsLoading(false);
        }
    };

    useEffect(() => {
        if (!editingFlow || sideTab !== 'connection') return;
        void loadConnections();
    }, [editingFlow?.organizationId, sideTab]);

    useEffect(() => {
        if (!editingFlow || sideTab !== 'activity') return;
        void loadExecutions();
    }, [editingFlow?.id, sideTab]);

    useEffect(() => {
        if (editingFlow || selectedCompanyId === 'all') {
            setOverviewConnections(null);
            return;
        }
        let active = true;
        setOverviewConnectionsLoading(true);
        api.get<AutomationConnections>('/automations/connections', { params: { organizationId: selectedCompanyId } })
            .then((response) => { if (active) setOverviewConnections(response.data); })
            .catch(() => { if (active) setOverviewConnections(null); })
            .finally(() => { if (active) setOverviewConnectionsLoading(false); });
        return () => { active = false; };
    }, [editingFlow, selectedCompanyId]);

    const createFlow = () => {
        if (selectedCompanyId === 'all') {
            addToast({ type: 'info', title: 'Selecione uma empresa', message: 'Escolha a empresa no filtro antes de criar o novo fluxo.' });
            return;
        }
        const organizationId = selectedCompanyId;
        if (!organizationId) {
            addToast({ type: 'warning', title: 'Nenhuma empresa disponível', message: 'Cadastre uma empresa antes de criar um fluxo.' });
            return;
        }
        openEditor(createDraftFlow(organizationId));
    };

    const saveFlow = async (): Promise<AutomationFlow | null> => {
        if (!editingFlow || !isEditable) return null;
        try {
            const payload = {
                organizationId: editingFlow.organizationId,
                name: editingFlow.name,
                description: editingFlow.description,
                triggerType: editingFlow.triggerType || 'EVENT',
                triggerConfig: editingFlow.triggerConfig || {},
                nodes: editingFlow.nodes,
            };
            const response = editingFlow.id.startsWith('draft-')
                ? await api.post<AutomationFlow>('/automations', payload)
                : await api.put<AutomationFlow>(`/automations/${editingFlow.id}`, payload);
            const saved = normalizeFlow(response.data);
            setEditingFlow(saved);
            await loadFlows(true);
            addToast({ type: 'success', title: 'Fluxo salvo', message: 'A automação foi persistida no motor da Manyways.' });
            return saved;
        } catch (error: any) {
            addToast({ type: 'error', title: 'Erro ao salvar fluxo', message: error.response?.data?.error || 'Revise as etapas e tente novamente.' });
            return null;
        }
    };

    const toggleFlow = async () => {
        if (!editingFlow) return;
        let target = editingFlow;
        if (target.id.startsWith('draft-')) {
            const saved = await saveFlow();
            if (!saved) return;
            target = saved;
        }
        const nextStatus: FlowStatus = editingFlow.status === 'active' ? 'paused' : 'active';
        try {
            const response = await api.patch<AutomationFlow>(`/automations/${target.id}/status`, { status: nextStatus.toUpperCase() });
            setEditingFlow(normalizeFlow(response.data));
            await loadFlows(true);
            addToast({ type: nextStatus === 'active' ? 'success' : 'info', title: nextStatus === 'active' ? 'Automação ativada' : 'Automação pausada', message: nextStatus === 'active' ? 'Novos eventos já podem iniciar este fluxo.' : 'Nenhuma nova execução será iniciada.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível alterar o status', message: error.response?.data?.error || 'Tente novamente.' });
        }
    };

    const testFlow = async (dryRun = true) => {
        if (!editingFlow) return;
        let target = editingFlow;
        if (target.id.startsWith('draft-')) {
            const saved = await saveFlow();
            if (!saved) return;
            target = saved;
        }
        const payload: Record<string, string> = { name: 'Cliente de teste', brand: 'Marca de teste' };
        if (!dryRun) {
            const hasEmail = target.nodes.some((item) => connectionKeyFor(item) === 'email');
            const hasWhatsApp = target.nodes.some((item) => connectionKeyFor(item) === 'whatsapp');
            if (hasEmail) {
                const email = window.prompt('Qual e-mail deve receber o teste real?');
                if (email === null) return;
                payload.email = email.trim();
            }
            if (hasWhatsApp) {
                const phone = window.prompt('Qual WhatsApp deve receber o teste real? Informe DDI + DDD + número.');
                if (phone === null) return;
                payload.phone = phone.replace(/\D/g, '');
            }
            if (!window.confirm('Executar este fluxo agora? As ações serão realizadas de verdade, inclusive mensagens e webhooks.')) return;
        } else {
            payload.email = 'teste@example.com';
            payload.phone = '5511999999999';
        }
        try {
            const response = await api.post(`/automations/${target.id}/test`, { payload, dryRun });
            const success = response.data?.status === 'SUCCEEDED';
            addToast({ type: success ? 'success' : 'warning', title: success ? (dryRun ? 'Validação concluída' : 'Teste real executado') : 'Teste concluído com alerta', message: success ? (dryRun ? 'Todas as etapas foram validadas sem realizar envios.' : 'As ações reais foram executadas. Confira os destinatários e o histórico.') : response.data?.error || 'Consulte o histórico da execução.' });
            await loadExecutions();
            const refreshed = await api.get<AutomationFlow>(`/automations/${target.id}`);
            setEditingFlow(normalizeFlow(refreshed.data));
        } catch (error: any) {
            addToast({ type: 'error', title: 'Falha no teste', message: error.response?.data?.error || 'Não foi possível testar o fluxo.' });
        }
    };

    const testConnection = async (service: keyof AutomationConnections, send: boolean, organizationIdOverride?: string) => {
        const organizationId = organizationIdOverride || editingFlow?.organizationId;
        if (!organizationId) return;
        let recipient = '';
        if (send && service === 'email') {
            const value = window.prompt('Qual e-mail deve receber a mensagem de teste?');
            if (value === null) return;
            recipient = value.trim();
        }
        if (send && service === 'whatsapp') {
            const value = window.prompt('Qual WhatsApp deve receber o teste? Informe DDI + DDD + número.');
            if (value === null) return;
            recipient = value.replace(/\D/g, '');
        }
        if (send && !window.confirm(`Enviar um teste real por ${service === 'email' ? 'e-mail' : service === 'whatsapp' ? 'WhatsApp' : 'Slack'} agora?`)) return;
        setConnectionTesting(`${service}:${send ? 'send' : 'check'}`);
        try {
            const flowId = editingFlow && !editingFlow.id.startsWith('draft-') ? editingFlow.id : undefined;
            const response = await api.post(`/automations/connections/${service}/test`, { send, recipient, flowId }, { params: { organizationId } });
            addToast({ type: 'success', title: send ? 'Entrega confirmada' : 'Conexão validada', message: response.data?.message || 'Teste concluído.' });
            if (editingFlow) await loadConnections();
            if (organizationIdOverride) {
                const refreshed = await api.get<AutomationConnections>('/automations/connections', { params: { organizationId } });
                setOverviewConnections(refreshed.data);
            }
        } catch (error: any) {
            addToast({ type: 'error', title: 'Teste falhou', message: error.response?.data?.error || 'Não foi possível validar esta integração.' });
        } finally {
            setConnectionTesting('');
        }
    };

    const personalizeFlow = async () => {
        if (!editingFlow || editingFlow.source !== 'native') return;
        try {
            const response = await api.post<AutomationFlow>(`/automations/${editingFlow.id}/duplicate`);
            const personalized = normalizeFlow(response.data);
            await loadFlows(true);
            openEditor(personalized);
            addToast({ type: 'success', title: 'Versão editável criada', message: 'O fluxo original continua protegido. Agora você pode alterar gatilhos, ações e mensagens nesta versão.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível personalizar', message: error.response?.data?.error || 'Tente novamente.' });
        }
    };

    const deleteFlow = async () => {
        if (!editingFlow || !isEditable) return;
        if (!window.confirm(`Excluir o fluxo “${editingFlow.name}”? Esta ação não pode ser desfeita.`)) return;
        if (editingFlow.id.startsWith('draft-')) {
            setEditingFlow(null);
            return;
        }
        try {
            await api.delete(`/automations/${editingFlow.id}`);
            setEditingFlow(null);
            await loadFlows(true);
            addToast({ type: 'success', title: 'Fluxo excluído', message: 'A automação personalizada foi removida.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível excluir', message: error.response?.data?.error || 'Tente novamente.' });
        }
    };

    const updateFlow = (patch: Partial<AutomationFlow>) => {
        if (!editingFlow || !isEditable) return;
        setEditingFlow({ ...editingFlow, ...patch });
    };

    const updateSelectedNode = (patch: Partial<AutomationNode>) => {
        if (!editingFlow || !selectedNode || !isEditable) return;
        setEditingFlow({ ...editingFlow, nodes: editingFlow.nodes.map((item) => item.id === selectedNode.id ? { ...item, ...patch } : item) });
    };

    const updateTriggerConfiguration = (config: Record<string, any>, triggerType: string) => {
        if (!editingFlow || !selectedNode || !isEditable) return;
        setEditingFlow({
            ...editingFlow,
            triggerConfig: config,
            triggerType,
            nodes: editingFlow.nodes.map((item) => item.id === selectedNode.id ? { ...item, config } : item),
        });
    };

    const openCatalog = (kind: NodeKind) => {
        if (!isEditable) return;
        setCatalogKind(kind);
        if (window.matchMedia('(max-width: 1023px)').matches) {
            setMobileCatalogOpen(true);
            return;
        }
        setCatalogHighlight(true);
        if (catalogTimer.current) window.clearTimeout(catalogTimer.current);
        catalogTimer.current = window.setTimeout(() => setCatalogHighlight(false), 700);
    };

    const addNode = (template: AutomationTemplate) => {
        if (!editingFlow || !isEditable) return;
        const newNode = node(`${template.kind}-${Date.now()}`, template.kind, template.app, template.title, template.description, editingFlow.organizationId, template.icon, template.color, template.kind === 'action' ? 'Use {{variáveis}} para personalizar esta ação.' : undefined);
        if (template.kind === 'trigger') {
            newNode.config = template.app === 'Formulário'
                ? { eventType: 'form.submitted' }
                : template.app === 'Webhook'
                    ? { eventType: 'webhook.received' }
                    : template.app === 'Agenda'
                        ? { intervalMinutes: 60 }
                        : { eventType: 'crm.lead.created' };
        } else if (template.app === 'E-mail') {
            newNode.config = { to: '{{email}}', subject: template.title };
        } else if (template.app === 'WhatsApp') {
            newNode.config = { to: '{{phone}}' };
        } else if (template.app === 'Aguardar') {
            newNode.config = { seconds: 60 };
        } else if (template.app === 'Webhook') {
            newNode.config = { url: '' };
        }
        const nextNodes = template.kind === 'trigger' ? [newNode, ...editingFlow.nodes.filter((item) => item.kind !== 'trigger')] : [...editingFlow.nodes, newNode];
        setEditingFlow({
            ...editingFlow,
            nodes: nextNodes,
            ...(template.kind === 'trigger' ? {
                triggerType: template.app === 'Agenda' ? 'SCHEDULE' : template.app === 'Webhook' ? 'WEBHOOK' : 'EVENT',
                triggerConfig: newNode.config,
            } : {}),
        });
        setSelectedNodeId(newNode.id);
        setMobileCatalogOpen(false);
        if (window.matchMedia('(max-width: 1279px)').matches) setMobileConfigOpen(true);
    };

    const removeSelectedNode = () => {
        if (!editingFlow || !selectedNode || selectedNode.kind === 'trigger' || !isEditable) return;
        const nextNodes = editingFlow.nodes.filter((item) => item.id !== selectedNode.id);
        setEditingFlow({ ...editingFlow, nodes: nextNodes });
        setSelectedNodeId(nextNodes.at(-1)?.id || '');
        setMobileConfigOpen(false);
    };

    if (!editingFlow) {
        return (
            <div className="flex h-full flex-col overflow-hidden bg-[#fafafa] dark:bg-zinc-950">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-docka-200 bg-white px-5 dark:border-zinc-800 dark:bg-zinc-950 lg:px-7">
                    <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-600 p-2 text-white shadow-sm"><Workflow size={18} /></div><div><h1 className="text-lg font-bold text-docka-900 dark:text-zinc-100">Automações</h1><p className="hidden text-[10px] text-docka-400 sm:block">Todos os fluxos do grupo em um só lugar</p></div></div>
                    <button onClick={createFlow} className="flex items-center gap-2 rounded-xl bg-docka-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-docka-800 dark:bg-zinc-100 dark:text-zinc-900"><Plus size={15} /> Novo fluxo</button>
                </header>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-5 lg:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        <section className="rounded-2xl border border-docka-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex items-center gap-3"><div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"><Building2 size={18} /></div><div><p className="text-sm font-bold">Selecione uma empresa</p><p className="text-[10px] text-docka-400">A lista abaixo mostra apenas os fluxos da empresa selecionada.</p></div></div>
                                <div className="relative min-w-[260px]"><select value={selectedCompanyId} onChange={(event) => setSelectedCompanyId(event.target.value)} className="w-full appearance-none rounded-xl border border-docka-200 bg-white px-4 py-3 pr-10 text-xs font-bold outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-950"><option value="all">Todas as empresas</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-docka-400" /></div>
                            </div>
                            <div className="mt-5 flex gap-2 overflow-x-auto pb-1"><CompanyChip active={selectedCompanyId === 'all'} label="Todas" count={flows.length} onClick={() => setSelectedCompanyId('all')} />{companies.map((company) => <CompanyChip key={company.id} active={selectedCompanyId === company.id} label={company.name} count={flows.filter((flow) => flow.organizationId === company.id).length} onClick={() => setSelectedCompanyId(company.id)} />)}</div>
                        </section>

                        <div className="grid gap-4 sm:grid-cols-3"><Metric label="Fluxos encontrados" value={visibleFlows.length} icon={Workflow} tone="violet" /><Metric label="Fluxos ativos" value={visibleFlows.filter((flow) => flow.status === 'active').length} icon={Radio} tone="emerald" /><Metric label="Empresas com fluxos" value={new Set(flows.map((flow) => flow.organizationId)).size} icon={Building2} tone="blue" /></div>

                        {selectedCompanyId !== 'all' && <IntegrationOverview company={companyFor(selectedCompanyId)} connections={overviewConnections} loading={overviewConnectionsLoading} testing={connectionTesting} onTest={(service, send) => void testConnection(service, send, selectedCompanyId)} />}

                        <section className="overflow-hidden rounded-2xl border border-docka-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="flex flex-col gap-3 border-b border-docka-100 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold">Fluxos</h2><p className="mt-0.5 text-[10px] text-docka-400">Clique em um fluxo para visualizar o gatilho e todas as ações.</p></div><div className="relative w-full sm:w-72"><Search size={14} className="absolute left-3 top-3 text-docka-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar automação..." className="w-full rounded-xl border border-docka-200 bg-docka-50/50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-950" /></div></div>
                            {loading ? <div className="flex min-h-64 items-center justify-center"><div className="flex items-center gap-2 text-xs font-bold text-docka-400"><Sparkles size={16} className="animate-pulse text-violet-500" /> Carregando fluxos existentes...</div></div> : loadError ? <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><div className="mb-4 rounded-2xl bg-red-50 p-4 text-red-500 dark:bg-red-950/30"><Workflow size={26} /></div><h3 className="text-sm font-bold">Motor temporariamente indisponível</h3><p className="mt-1 max-w-md text-xs leading-5 text-docka-400">{loadError}</p><button onClick={() => void loadFlows()} className="mt-4 rounded-xl border border-violet-200 px-4 py-2 text-xs font-bold text-violet-600 hover:bg-violet-50 dark:border-violet-900 dark:hover:bg-violet-950/30">Tentar novamente</button></div> : visibleFlows.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><div className="mb-4 rounded-2xl bg-docka-50 p-4 text-docka-300 dark:bg-zinc-800"><ListFilter size={26} /></div><h3 className="text-sm font-bold">Nenhum fluxo nesta empresa</h3><p className="mt-1 max-w-md text-xs leading-5 text-docka-400">Ainda não existe uma automação implementada para esta empresa. Você pode iniciar um novo rascunho.</p><button onClick={createFlow} className="mt-4 flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2 text-xs font-bold text-violet-600 hover:bg-violet-50 dark:border-violet-900 dark:hover:bg-violet-950/30"><Plus size={14} /> Criar primeiro fluxo</button></div> : <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{visibleFlows.map((flow) => <FlowCard key={flow.id} flow={flow} company={companyFor(flow.organizationId)} onClick={() => openEditor(flow)} />)}</div>}
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white text-docka-900 dark:bg-zinc-950 dark:text-zinc-100">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-docka-200 px-4 dark:border-zinc-800 lg:px-5">
                <div className="flex min-w-0 items-center gap-3"><button onClick={() => setEditingFlow(null)} className="rounded-lg p-2 text-docka-500 hover:bg-docka-50 dark:hover:bg-zinc-900" aria-label="Voltar para fluxos"><ArrowLeft size={17} /></button><div className="hidden items-center gap-2 text-xs text-docka-400 md:flex"><span>Automações</span><span>/</span></div><input value={editingFlow.name} disabled={!isEditable} onChange={(event) => updateFlow({ name: event.target.value })} className="min-w-0 max-w-[280px] truncate border-none bg-transparent text-sm font-bold outline-none disabled:opacity-100 sm:min-w-[260px]" aria-label="Nome do fluxo" /><span className={`hidden rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wider sm:inline-flex ${statusStyles[editingFlow.status]}`}>{statusLabel[editingFlow.status]}</span>{!isEditable && <span className="hidden rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-600 lg:inline-flex dark:bg-violet-950/40 dark:text-violet-300">Fluxo do sistema</span>}</div>
                <div className="flex shrink-0 items-center gap-2">{!isEditable && <button onClick={() => void personalizeFlow()} className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"><Pencil size={14} /> Personalizar</button>}{isEditable && <button onClick={() => void testFlow(true)} className="hidden items-center gap-2 rounded-xl border border-docka-200 bg-white px-3.5 py-2 text-xs font-bold shadow-sm hover:bg-docka-50 sm:flex dark:border-zinc-700 dark:bg-zinc-900"><Play size={14} /> Validar</button>}{isEditable && <button onClick={() => void deleteFlow()} className="hidden rounded-xl border border-red-100 bg-white p-2.5 text-red-600 hover:bg-red-50 sm:flex dark:border-red-900 dark:bg-zinc-900 dark:hover:bg-red-950/30" aria-label="Excluir fluxo"><Trash2 size={15} /></button>}{isEditable && <button onClick={() => void saveFlow()} className="hidden items-center gap-2 rounded-xl border border-docka-200 bg-white px-3.5 py-2 text-xs font-bold shadow-sm transition hover:bg-docka-50 md:flex dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"><Save size={15} /> Salvar</button>}<button onClick={toggleFlow} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm ${editingFlow.status === 'active' ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`}><Radio size={14} /> {editingFlow.status === 'active' ? 'Pausar' : 'Ativar'}</button></div>
            </header>

            <div className="flex min-h-0 flex-1">
                <aside className={`${mobileCatalogOpen ? 'fixed inset-y-0 left-0 z-50 flex w-[280px]' : 'hidden'} ${catalogHighlight ? 'lg:ring-4 lg:ring-inset lg:ring-violet-100 dark:lg:ring-violet-950/40' : ''} flex-col border-r border-docka-200 bg-white shadow-2xl transition-shadow dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:inset-auto lg:z-auto lg:flex lg:w-[240px] lg:shrink-0 lg:shadow-none`}>
                    <div className="flex h-14 items-center justify-between border-b border-docka-100 px-4 dark:border-zinc-800"><div className="flex items-center gap-2"><Sparkles size={16} className="text-violet-600" /><span className="text-xs font-bold">{isEditable ? 'Adicionar etapa' : 'Etapas disponíveis'}</span></div><button onClick={() => setMobileCatalogOpen(false)} className="lg:hidden"><X size={18} /></button></div>
                    <div className="grid grid-cols-2 border-b border-docka-100 p-2 dark:border-zinc-800">{(['trigger', 'action'] as NodeKind[]).map((kind) => <button key={kind} disabled={!isEditable} onClick={() => setCatalogKind(kind)} className={`rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40 ${catalogKind === kind ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' : 'text-docka-400'}`}>{kind === 'trigger' ? 'Gatilhos' : 'Ações'}</button>)}</div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto p-3"><p className="mb-3 px-1 text-[9px] font-black uppercase tracking-[.18em] text-docka-400">{catalogKind === 'trigger' ? 'Iniciar quando...' : 'Depois, faça...'}</p>{!isEditable && <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50 p-3 text-[9px] leading-4 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300"><p>Este é o fluxo original do sistema. Crie uma versão editável para melhorar gatilhos e ações sem comprometer a operação atual.</p><button onClick={() => void personalizeFlow()} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-2 py-2 text-[10px] font-bold text-white"><Pencil size={12} /> Personalizar fluxo</button></div>}<div className="grid grid-cols-2 gap-2">{templates.filter((item) => item.kind === catalogKind).map((item) => <button key={`${item.kind}-${item.app}`} disabled={!isEditable} onClick={() => addNode(item)} className="group min-h-[108px] rounded-2xl border border-docka-100 bg-docka-50/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-violet-800 dark:hover:bg-zinc-900"><span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: item.color }}>{iconFor(item.icon, 16)}</span><span className="block text-xs font-bold">{item.app}</span><span className="mt-1 block text-[9px] leading-3 text-docka-400">{item.title}</span></button>)}</div></div>
                </aside>
                {mobileCatalogOpen && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileCatalogOpen(false)} aria-label="Fechar catálogo" />}

                <main className="custom-scrollbar relative min-w-0 flex-1 overflow-auto bg-[#fbfbfc] p-8 dark:bg-zinc-950 lg:p-12" style={{ backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, .28) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-col items-center pb-16"><div className="mb-6 flex items-center gap-2 rounded-full border border-docka-200 bg-white px-3 py-1.5 text-[10px] font-bold text-docka-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"><Building2 size={13} /> {companyFor(editingFlow.organizationId)?.name || 'Empresa'} <span className="h-1 w-1 rounded-full bg-docka-300" /> {editingFlow.nodes.length} etapas</div>{editingFlow.nodes.map((flowNode, index) => <React.Fragment key={flowNode.id}>{index > 0 && <Connector onAdd={isEditable ? () => openCatalog('action') : undefined} />}<button onClick={() => { setSelectedNodeId(flowNode.id); if (window.matchMedia('(max-width: 1279px)').matches) setMobileConfigOpen(true); }} className={`relative w-full max-w-[390px] rounded-2xl border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900 ${selectedNode?.id === flowNode.id ? 'border-violet-500 ring-4 ring-violet-100/70 dark:ring-violet-950/50' : 'border-docka-200 dark:border-zinc-700'}`}><div className="flex h-8 items-center justify-between border-b border-docka-100 px-4 dark:border-zinc-800"><span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${flowNode.kind === 'trigger' ? 'text-violet-600' : 'text-docka-500 dark:text-zinc-400'}`}>{flowNode.kind === 'trigger' ? <Zap size={11} /> : <Play size={10} />} {flowNode.kind === 'trigger' ? 'Gatilho' : `Ação ${index}`}</span><MoreHorizontal size={15} className="text-docka-300" /></div><div className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: flowNode.color }}>{iconFor(flowNode.icon, 20)}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold text-docka-400">{flowNode.app}</span><span className="mt-0.5 block truncate text-sm font-bold">{flowNode.title}</span><span className="mt-1 block truncate text-[10px] text-docka-400">{flowNode.description}</span></span><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Check size={12} /></span></div></button></React.Fragment>)}{isEditable && <><div className="h-7 w-px bg-docka-300 dark:bg-zinc-700" /><button onClick={() => openCatalog('action')} className="flex items-center gap-2 rounded-xl border border-dashed border-violet-300 bg-white px-4 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 dark:border-violet-800 dark:bg-zinc-900 dark:hover:bg-violet-950/30"><Plus size={15} /> Adicionar ação</button></>}</div>
                </main>

                <aside className={`${mobileConfigOpen ? 'fixed inset-y-0 right-0 z-50 flex w-[min(360px,92vw)]' : 'hidden'} flex-col border-l border-docka-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 xl:static xl:inset-auto xl:z-auto xl:flex xl:w-[320px] xl:shrink-0 xl:shadow-none`}>
                    {selectedNode && <>
                        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-docka-100 px-5 dark:border-zinc-800">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ backgroundColor: selectedNode.color }}>{iconFor(selectedNode.icon, 18)}</span>
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{selectedNode.app}</p><p className="text-[10px] text-docka-400">{selectedNode.kind === 'trigger' ? 'Detalhes do gatilho' : 'Detalhes da ação'}</p></div>
                            <button onClick={() => setMobileConfigOpen(false)} className="xl:hidden"><X size={18} /></button>
                        </div>
                        <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                            <div className="mb-5 grid grid-cols-3 rounded-xl bg-docka-50 p-1 dark:bg-zinc-900">
                                <button onClick={() => setSideTab('configuration')} className={`rounded-lg py-2 text-[10px] font-bold ${sideTab === 'configuration' ? 'bg-white shadow-sm dark:bg-zinc-800' : 'text-docka-400'}`}>Configuração</button>
                                <button onClick={() => setSideTab('connection')} className={`rounded-lg py-2 text-[10px] font-bold ${sideTab === 'connection' ? 'bg-white shadow-sm dark:bg-zinc-800' : 'text-docka-400'}`}>Conexão</button>
                                <button onClick={() => setSideTab('activity')} className={`rounded-lg py-2 text-[10px] font-bold ${sideTab === 'activity' ? 'bg-white shadow-sm dark:bg-zinc-800' : 'text-docka-400'}`}>Histórico</button>
                            </div>
                            {sideTab === 'connection' ? (
                                <ConnectionPanel node={selectedNode} connections={connections} loading={connectionsLoading} testing={connectionTesting} onRefresh={() => void loadConnections()} onTest={testConnection} />
                            ) : sideTab === 'activity' ? (
                                <ActivityPanel flow={editingFlow} executions={executions} loading={executionsLoading} onRefresh={() => void loadExecutions()} onValidate={() => void testFlow(true)} onRun={() => void testFlow(false)} />
                            ) : (
                                <div className="space-y-5">
                                    {selectedNode.kind === 'trigger' && <TriggerExplanation details={isEditable ? eventOptions.find((item) => item.eventType === (editingFlow.triggerConfig?.eventType || selectedNode.config?.eventType)) || editingFlow.triggerDetails : editingFlow.triggerDetails} />}
                                    <Field label="Nome da etapa"><input value={selectedNode.title} disabled={!isEditable} onChange={(event) => updateSelectedNode({ title: event.target.value })} className="automation-input disabled:cursor-default disabled:opacity-75" /></Field>
                                    <Field label="Descrição da etapa"><input value={selectedNode.description} disabled={!isEditable} onChange={(event) => updateSelectedNode({ description: event.target.value })} className="automation-input disabled:cursor-default disabled:opacity-75" /></Field>
                                    <Field label="Empresa"><div className="relative"><select value={editingFlow.organizationId} disabled={!isEditable} onChange={(event) => updateFlow({ organizationId: event.target.value, nodes: editingFlow.nodes.map((item) => ({ ...item, organizationId: event.target.value })) })} className="automation-input appearance-none pr-9 disabled:cursor-default disabled:opacity-75">{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>
                                    {selectedNode.kind === 'trigger' && isEditable && <TriggerConfiguration node={selectedNode} flowId={editingFlow.id} onChange={updateTriggerConfiguration} />}
                                    {selectedNode.kind === 'action' && isEditable && <ActionConfiguration node={selectedNode} onChange={(patch) => updateSelectedNode(patch)} />}
                                    {selectedNode.message && !isEditable && <Field label="Mensagem / instrução"><textarea value={selectedNode.message} disabled rows={7} className="automation-input resize-none leading-5 disabled:cursor-default disabled:opacity-75" /></Field>}
                                    <RuntimePanel flow={editingFlow} />
                                </div>
                            )}
                        </div>
                        {isEditable && sideTab === 'configuration' && <div className="flex shrink-0 items-center gap-2 border-t border-docka-100 p-4 dark:border-zinc-800">{selectedNode.kind === 'action' && <button onClick={removeSelectedNode} className="rounded-xl border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Remover etapa</button>}<button onClick={() => void saveFlow()} className="ml-auto flex items-center gap-2 rounded-xl bg-docka-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"><Save size={14} /> Salvar fluxo</button></div>}
                    </>}
                </aside>
                {mobileConfigOpen && <button className="fixed inset-0 z-40 bg-black/30 xl:hidden" onClick={() => setMobileConfigOpen(false)} aria-label="Fechar configuração" />}
            </div>
            <style>{`.automation-input{width:100%;border-radius:.75rem;border:1px solid #e5e7eb;background:#fff;padding:.65rem .75rem;font-size:.75rem;outline:none;transition:border-color .15s,box-shadow .15s}.automation-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.1)}.dark .automation-input{border-color:#3f3f46;background:#18181b;color:#f4f4f5}@media(prefers-reduced-motion:reduce){.automation-input,button{transition:none!important;animation:none!important}}`}</style>
        </div>
    );
};

const formatDateTime = (value?: string | null) => value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
    : 'Ainda não executado';

const TriggerExplanation = ({ details }: { details?: TriggerDetails }) => {
    if (!details) return null;
    return <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
        <div className="flex items-start gap-2.5"><Info size={15} className="mt-0.5 shrink-0 text-violet-600" /><div><p className="text-xs font-bold text-violet-900 dark:text-violet-200">{details.label}</p><p className="mt-1 text-[10px] leading-4 text-violet-800/80 dark:text-violet-300/80">{details.description}</p></div></div>
        <div className="mt-3 border-t border-violet-100 pt-3 text-[9px] leading-4 text-violet-700 dark:border-violet-900/50 dark:text-violet-300"><strong>Origem real:</strong> {details.origin}{details.eventType && <><br /><strong>Evento:</strong> <code>{details.eventType}</code></>}</div>
        {details.payload?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{details.payload.map((item) => <code key={item} className="rounded-md bg-white px-1.5 py-0.5 text-[8px] text-violet-700 dark:bg-zinc-900 dark:text-violet-300">{item}</code>)}</div>}
    </div>;
};

const RuntimePanel = ({ flow }: { flow: AutomationFlow }) => {
    const runtime = flow.runtime;
    const active = flow.status === 'active' && runtime?.active !== false;
    return <div className={`rounded-xl border p-3 ${active ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
        <div className={`flex items-center gap-2 text-[10px] font-bold ${active ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>{active ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {active ? 'Ativo no backend' : flow.status === 'draft' ? 'Rascunho no backend' : 'Pausado no backend'}</div>
        <p className="mt-1 text-[9px] leading-4 opacity-80">{runtime?.statusExplanation || (active ? 'O motor pode receber eventos reais.' : 'O fluxo não inicia novas execuções.')}</p>
        <div className="mt-2 border-t border-current/10 pt-2 text-[9px] opacity-75"><strong>Motor:</strong> {runtime?.engine || (flow.source === 'native' ? 'Módulo nativo' : 'Motor Manyways')}<br /><strong>Última execução:</strong> {formatDateTime(runtime?.lastExecution?.finishedAt || flow.lastExecutedAt)}</div>
    </div>;
};

const ActivityPanel = ({ flow, executions, loading, onRefresh, onValidate, onRun }: { flow: AutomationFlow; executions: AutomationExecution[]; loading: boolean; onRefresh: () => void; onValidate: () => void; onRun: () => void }) => <div className="space-y-4">
    <RuntimePanel flow={flow} />
    {flow.source === 'custom' ? <div className="grid grid-cols-2 gap-2"><button onClick={onValidate} className="flex items-center justify-center gap-1.5 rounded-xl border border-docka-200 px-3 py-2.5 text-[10px] font-bold hover:bg-docka-50 dark:border-zinc-700 dark:hover:bg-zinc-900"><Play size={12} /> Validar sem enviar</button><button onClick={onRun} className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-[10px] font-bold text-white hover:bg-violet-700"><Send size={12} /> Teste real</button></div> : <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[9px] leading-4 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">Este fluxo roda dentro do módulo nativo indicado. O status acima altera a configuração real; teste os canais na aba <strong>Conexão</strong>.</div>}
    <div className="flex items-center justify-between"><div><p className="text-xs font-bold">Últimas execuções</p><p className="text-[9px] text-docka-400">Validações não enviam; testes reais e eventos ativos enviam.</p></div><button onClick={onRefresh} className="rounded-lg p-2 text-docka-400 hover:bg-docka-50 dark:hover:bg-zinc-900" aria-label="Atualizar histórico"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button></div>
    {loading ? <div className="flex items-center gap-2 rounded-xl bg-docka-50 p-4 text-[10px] font-bold text-docka-400 dark:bg-zinc-900"><RefreshCw size={13} className="animate-spin" /> Carregando histórico...</div> : executions.length === 0 ? <div className="rounded-xl border border-dashed border-docka-200 p-5 text-center dark:border-zinc-700"><History size={18} className="mx-auto text-docka-300" /><p className="mt-2 text-[10px] font-bold">Nenhuma execução registrada</p><p className="mt-1 text-[9px] text-docka-400">O histórico aparecerá aqui após uma validação ou evento real.</p></div> : <div className="space-y-2">{executions.map((execution) => {
        const succeeded = execution.status === 'SUCCEEDED';
        const running = ['PENDING', 'RUNNING', 'WAITING'].includes(execution.status);
        return <div key={execution.id} className="rounded-xl border border-docka-100 p-3 dark:border-zinc-800"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2">{succeeded ? <CheckCircle2 size={14} className="text-emerald-500" /> : running ? <RefreshCw size={14} className="animate-spin text-blue-500" /> : <AlertTriangle size={14} className="text-red-500" />}<div><p className="text-[10px] font-bold">{execution.triggerType === 'CONNECTION_TEST' ? (execution.dryRun ? 'Conexão verificada' : 'Entrega do canal testada') : execution.dryRun ? 'Validação sem envio' : execution.triggerType === 'TEST' ? 'Teste real' : `Evento ${execution.triggerType}`}</p><p className="text-[8px] text-docka-400">{formatDateTime(execution.finishedAt || execution.createdAt)}</p></div></div><span className={`rounded-full px-2 py-1 text-[8px] font-black ${succeeded ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : running ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40' : 'bg-red-50 text-red-700 dark:bg-red-950/40'}`}>{execution.status}</span></div>{execution.error && <p className="mt-2 rounded-lg bg-red-50 p-2 text-[8px] leading-3 text-red-700 dark:bg-red-950/30 dark:text-red-300">{execution.error}</p>}<p className="mt-2 text-[8px] text-docka-400">{execution.steps?.length || 0} etapa(s) processada(s)</p></div>;
    })}</div>}
</div>;

const TriggerConfiguration = ({ node, flowId, onChange }: { node: AutomationNode; flowId: string; onChange: (config: Record<string, any>, triggerType: string) => void }) => {
    const config = node.config || {};
    if (node.app === 'Agenda') {
        return <Field label="Executar a cada"><div className="relative"><select value={Number(config.intervalMinutes || 60)} onChange={(event) => onChange({ intervalMinutes: Number(event.target.value) }, 'SCHEDULE')} className="automation-input appearance-none pr-9"><option value={5}>5 minutos</option><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={60}>1 hora</option><option value={360}>6 horas</option><option value={1440}>1 dia</option><option value={10080}>1 semana</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>;
    }
    const events = node.app === 'Formulário'
        ? eventOptions.filter((item) => item.eventType === 'form.submitted')
        : node.app === 'Webhook'
            ? eventOptions.filter((item) => item.eventType === 'webhook.received')
            : eventOptions.filter((item) => item.eventType !== 'webhook.received');
    const webhookUrl = node.app === 'Webhook' && config.secret && !flowId.startsWith('draft-')
        ? `${String(api.defaults.baseURL || '').replace(/\/$/, '')}/automations/hooks/${flowId}/${config.secret}`
        : '';
    return <><Field label="Evento que inicia o fluxo"><div className="relative"><select value={config.eventType || events[0].eventType} onChange={(event) => onChange({ ...config, eventType: event.target.value }, node.app === 'Webhook' ? 'WEBHOOK' : 'EVENT')} className="automation-input appearance-none pr-9">{events.map((event) => <option key={event.eventType} value={event.eventType}>{event.label}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>{node.app === 'Webhook' && <Field label="URL de entrada">{webhookUrl ? <div className="space-y-2"><input readOnly value={webhookUrl} className="automation-input" /><button type="button" onClick={() => void navigator.clipboard.writeText(webhookUrl)} className="text-[10px] font-bold text-violet-600">Copiar URL do webhook</button></div> : <p className="rounded-xl bg-docka-50 p-3 text-[10px] text-docka-500 dark:bg-zinc-900">Salve o fluxo para gerar a URL segura de entrada.</p>}</Field>}</>;
};

const ActionConfiguration = ({ node, onChange }: { node: AutomationNode; onChange: (patch: Partial<AutomationNode>) => void }) => {
    const config = node.config || {};
    if (node.app === 'Aguardar') {
        return <Field label="Tempo de espera (segundos)"><input type="number" min={1} max={604800} value={Number(config.seconds || 60)} onChange={(event) => onChange({ config: { ...config, seconds: Number(event.target.value) } })} className="automation-input" /></Field>;
    }
    return <>
        {(node.app === 'E-mail' || node.app === 'WhatsApp') && <Field label={node.app === 'E-mail' ? 'Destinatário' : 'Número do WhatsApp'}><input value={config.to || (node.app === 'E-mail' ? '{{email}}' : '{{phone}}')} onChange={(event) => onChange({ config: { ...config, to: event.target.value } })} className="automation-input" /></Field>}
        {node.app === 'E-mail' && <Field label="Assunto"><input value={config.subject || node.title} onChange={(event) => onChange({ config: { ...config, subject: event.target.value } })} className="automation-input" /></Field>}
        {node.app === 'Webhook' && <Field label="URL HTTPS"><input value={config.url || ''} placeholder="https://api.exemplo.com/webhook" onChange={(event) => onChange({ config: { ...config, url: event.target.value } })} className="automation-input" /></Field>}
        {node.app !== 'Financeiro' && node.app !== 'Many AI' && <Field label="Mensagem / instrução"><textarea value={node.message || ''} onChange={(event) => onChange({ message: event.target.value })} rows={6} className="automation-input resize-none leading-5" /><button type="button" className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-violet-600"><GitBranch size={12} /> Use variáveis como {'{{name}}'}, {'{{email}}'} ou {'{{phone}}'}</button></Field>}
    </>;
};

const ConnectionPanel = ({ node, connections, loading, testing, onRefresh, onTest }: { node: AutomationNode; connections: AutomationConnections | null; loading: boolean; testing: string; onRefresh: () => void; onTest: (service: keyof AutomationConnections, send: boolean) => void }) => {
    const key = connectionKeyFor(node);
    const connection = connections?.[key];
    const names: Record<keyof AutomationConnections, string> = {
        email: 'Provedor de e-mail',
        slack: 'Workspace e canal do Slack',
        whatsapp: 'Instância do WhatsApp',
        webhook: 'Conexão HTTPS',
        internal: 'Serviços internos da Manyways',
        schedule: 'Agendador da Manyways',
    };
    const openSettings = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'settings');
        url.searchParams.set('section', connection?.settingsTarget || key);
        window.location.assign(url.toString());
    };
    if (loading) return <div className="flex items-center gap-2 rounded-xl bg-docka-50 p-4 text-xs font-bold text-docka-400 dark:bg-zinc-900"><Sparkles size={15} className="animate-pulse text-violet-500" /> Verificando conexão...</div>;
    const connected = connection?.connected === true;
    const checking = testing === `${key}:check`;
    const sending = testing === `${key}:send`;
    return <div className="space-y-4">
        <div className={`rounded-2xl border p-4 ${connected ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : connection?.configured ? 'border-red-100 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20' : 'border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
            <div className="flex items-start gap-3">{connected ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" /> : connection?.configured ? <WifiOff size={17} className="mt-0.5 shrink-0 text-red-600" /> : <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />}<div className="min-w-0"><p className="text-xs font-bold">{names[key]}</p><p className="mt-1 text-[10px] font-bold leading-4">{connection?.label || 'Conexão ainda não verificada.'}</p>{connection?.identity && <p className="mt-1 truncate text-[9px] text-docka-500 dark:text-zinc-400">{connection.identity}</p>}<p className="mt-2 text-[9px] leading-4 text-docka-500 dark:text-zinc-400">{connection?.detail || 'Abra as configurações para concluir esta integração.'}</p></div></div>
            {connection?.checkedAt && <p className="mt-3 border-t border-current/10 pt-2 text-[8px] opacity-60">Verificação real em {formatDateTime(connection.checkedAt)}</p>}
        </div>
        <div className="rounded-xl border border-docka-100 p-3 text-[10px] leading-4 text-docka-500 dark:border-zinc-800"><strong className="block text-docka-800 dark:text-zinc-200">Como esta etapa usa a conexão</strong><span>{node.kind === 'trigger' ? 'O gatilho recebe eventos desta origem e entrega os dados às próximas ações.' : `Quando o fluxo chega aqui, a ação usa ${names[key].toLowerCase()}. A ativação será bloqueada se esta conexão estiver indisponível.`}</span></div>
        <div className="grid grid-cols-2 gap-2">
            {connection?.canTest && <button disabled={Boolean(testing)} onClick={() => onTest(key, false)} className="flex items-center justify-center gap-1.5 rounded-xl border border-docka-200 px-3 py-2.5 text-[10px] font-bold hover:bg-docka-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"><RefreshCw size={12} className={checking ? 'animate-spin' : ''} /> Verificar</button>}
            {connection?.canSendTest && <button disabled={Boolean(testing)} onClick={() => onTest(key, true)} className="flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-[10px] font-bold text-white hover:bg-violet-700 disabled:opacity-50"><Send size={12} className={sending ? 'animate-pulse' : ''} /> Enviar teste</button>}
        </div>
        {['email', 'slack', 'whatsapp'].includes(key) && <button onClick={openSettings} className="flex w-full items-center justify-center gap-2 rounded-xl bg-docka-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"><Settings2 size={13} /> Gerenciar configurações</button>}
        <button onClick={onRefresh} disabled={loading} className="w-full text-[9px] font-bold text-docka-400 hover:text-violet-600">Atualizar diagnóstico</button>
    </div>;
};

const IntegrationOverview = ({ company, connections, loading, testing, onTest }: { company?: AutomationCompany; connections: AutomationConnections | null; loading: boolean; testing: string; onTest: (service: keyof AutomationConnections, send: boolean) => void }) => {
    const services: Array<{ key: keyof AutomationConnections; name: string; icon: React.ReactNode }> = [
        { key: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle size={16} /> },
        { key: 'slack', name: 'Slack', icon: <Slack size={16} /> },
        { key: 'email', name: 'E-mail', icon: <Mail size={16} /> },
    ];
    const openSettings = (section: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'settings');
        url.searchParams.set('section', section);
        window.location.assign(url.toString());
    };
    return <section className="rounded-2xl border border-docka-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Settings2 size={16} className="text-violet-600" /><h2 className="text-sm font-bold">Conexões de {company?.name || 'empresa'}</h2></div><p className="mt-1 text-[10px] text-docka-400">Status consultado diretamente em cada serviço. Teste a conexão ou faça uma entrega real.</p></div>{loading && <RefreshCw size={15} className="animate-spin text-violet-500" />}</div>
        <div className="grid gap-3 lg:grid-cols-3">{services.map(({ key, name, icon }) => {
            const connection = connections?.[key];
            const connected = connection?.connected === true;
            const busy = testing.startsWith(`${key}:`);
            return <div key={key} className={`rounded-xl border p-3 ${connected ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/10' : 'border-red-100 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/10'}`}><div className="flex items-start gap-2.5"><span className={connected ? 'text-emerald-600' : 'text-red-500'}>{icon}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-xs font-bold">{name}</p><span className={`text-[8px] font-black uppercase ${connected ? 'text-emerald-700' : 'text-red-600'}`}>{connected ? 'Conectado' : 'Atenção'}</span></div><p className="mt-1 truncate text-[9px] text-docka-500 dark:text-zinc-400">{connection?.identity || connection?.label || 'Aguardando diagnóstico'}</p><p className="mt-2 min-h-8 text-[8px] leading-3 text-docka-400">{connection?.detail}</p></div></div><div className="mt-3 grid grid-cols-3 gap-1.5"><button disabled={busy || !connection?.canTest} onClick={() => onTest(key, false)} className="rounded-lg border border-current/10 bg-white px-2 py-2 text-[8px] font-bold disabled:opacity-40 dark:bg-zinc-900">Verificar</button><button disabled={busy || !connection?.canSendTest} onClick={() => onTest(key, true)} className="rounded-lg bg-violet-600 px-2 py-2 text-[8px] font-bold text-white disabled:opacity-40">Enviar teste</button><button onClick={() => openSettings(connection?.settingsTarget || key)} className="rounded-lg border border-current/10 bg-white px-2 py-2 text-[8px] font-bold dark:bg-zinc-900">Configurar</button></div></div>;
        })}</div>
    </section>;
};

const CompanyChip = ({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) => <button onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold transition ${active ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300' : 'border-docka-200 bg-white text-docka-500 hover:border-docka-300 dark:border-zinc-700 dark:bg-zinc-950'}`}>{label}<span className={`rounded-full px-1.5 py-0.5 text-[8px] ${active ? 'bg-violet-600 text-white' : 'bg-docka-100 dark:bg-zinc-800'}`}>{count}</span></button>;

const Metric = ({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: 'violet' | 'emerald' | 'blue' }) => {
    const styles = { violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' };
    return <div className="flex items-center justify-between rounded-2xl border border-docka-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-docka-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><div className={`rounded-xl p-3 ${styles[tone]}`}><Icon size={19} /></div></div>;
};

const FlowCard = ({ flow, company, onClick }: { flow: AutomationFlow; company?: AutomationCompany; onClick: () => void }) => {
    const lastExecution = flow.runtime?.lastExecution;
    return <button onClick={onClick} className="group rounded-2xl border border-docka-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-900"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">{iconFor(flow.nodes[0]?.icon || 'zap', 18)}</div><div className="min-w-0"><h3 className="truncate text-xs font-bold">{flow.name}</h3><p className="mt-1 truncate text-[9px] text-docka-400">{company?.name || flow.organization?.name || 'Empresa'}</p></div></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase ${statusStyles[flow.status]}`}>{statusLabel[flow.status]}</span></div><p className="mt-4 line-clamp-2 min-h-8 text-[10px] leading-4 text-docka-500 dark:text-zinc-400">{flow.description}</p>{flow.triggerDetails && <div className="mt-3 rounded-lg bg-violet-50/70 px-2.5 py-2 text-[9px] text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"><strong>Gatilho:</strong> {flow.triggerDetails.label}</div>}<div className="mt-3 flex items-center justify-between text-[8px] text-docka-400"><span>{flow.runtime?.engine || (flow.source === 'native' ? 'Módulo nativo' : 'Motor Manyways')}</span><span className={lastExecution?.status === 'FAILED' ? 'font-bold text-red-500' : lastExecution?.status === 'SUCCEEDED' ? 'font-bold text-emerald-600' : ''}>{lastExecution ? `${lastExecution.status} · ${formatDateTime(lastExecution.finishedAt || lastExecution.createdAt)}` : 'Sem execução registrada'}</span></div><div className="mt-3 flex items-center justify-between border-t border-docka-50 pt-3 dark:border-zinc-800"><div className="flex -space-x-1.5">{flow.nodes.slice(0, 4).map((item) => <span key={item.id} className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white text-white dark:border-zinc-950" style={{ backgroundColor: item.color }}>{iconFor(item.icon, 11)}</span>)}{flow.nodes.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-docka-100 text-[8px] font-bold dark:border-zinc-950 dark:bg-zinc-800">+{flow.nodes.length - 4}</span>}</div><span className="flex items-center gap-1 text-[9px] font-bold text-violet-600 opacity-70 transition group-hover:opacity-100">Abrir fluxo <ChevronDown size={11} className="-rotate-90" /></span></div></button>;
};

const Connector = ({ onAdd }: { onAdd?: () => void }) => <div className="flex h-16 flex-col items-center"><div className="h-6 w-px bg-docka-300 dark:bg-zinc-700" />{onAdd ? <button onClick={onAdd} className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-docka-200 bg-white text-docka-400 shadow-sm hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-900"><Plus size={13} /></button> : <div className="h-2 w-2 rounded-full bg-docka-300 dark:bg-zinc-700" />}<div className="h-4 w-px bg-docka-300 dark:bg-zinc-700" /></div>;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[.14em] text-docka-500 dark:text-zinc-400">{label}</span>{children}</label>;

export default DockaAutomationView;
