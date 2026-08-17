import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft, Bot, Building2, Check, ChevronDown, Clock3, CreditCard,
    FormInput, GitBranch, ListFilter, Mail, MessageCircle, MoreHorizontal, Play,
    Plus, Radio, Save, Search, Settings2, Slack, Sparkles, Webhook, Workflow,
    X, Zap
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
    organization?: { id: string; name: string; slug?: string };
}

interface AutomationCompany {
    id: string;
    name: string;
    slug?: string;
}

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
    };

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

    const testFlow = async () => {
        if (!editingFlow) return;
        let target = editingFlow;
        if (target.id.startsWith('draft-')) {
            const saved = await saveFlow();
            if (!saved) return;
            target = saved;
        }
        try {
            const response = await api.post(`/automations/${target.id}/test`, { payload: { name: 'Cliente de teste', email: 'teste@example.com', phone: '5585999999999' } });
            const success = response.data?.status === 'SUCCEEDED';
            addToast({ type: success ? 'success' : 'warning', title: success ? 'Teste validado' : 'Teste concluído com alerta', message: success ? 'Todas as etapas foram validadas pelo motor sem realizar envios reais.' : response.data?.error || 'Consulte o histórico da execução.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Falha no teste', message: error.response?.data?.error || 'Não foi possível testar o fluxo.' });
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
                <div className="flex shrink-0 items-center gap-2">{isEditable && <button onClick={testFlow} className="hidden items-center gap-2 rounded-xl border border-docka-200 bg-white px-3.5 py-2 text-xs font-bold shadow-sm hover:bg-docka-50 sm:flex dark:border-zinc-700 dark:bg-zinc-900"><Play size={14} /> Testar</button>}{isEditable && <button onClick={() => void saveFlow()} className="hidden items-center gap-2 rounded-xl border border-docka-200 bg-white px-3.5 py-2 text-xs font-bold shadow-sm transition hover:bg-docka-50 md:flex dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"><Save size={15} /> Salvar</button>}<button onClick={toggleFlow} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm ${editingFlow.status === 'active' ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`}><Radio size={14} /> {editingFlow.status === 'active' ? 'Pausar' : 'Ativar'}</button></div>
            </header>

            <div className="flex min-h-0 flex-1">
                <aside className={`${mobileCatalogOpen ? 'fixed inset-y-0 left-0 z-50 flex w-[280px]' : 'hidden'} ${catalogHighlight ? 'lg:ring-4 lg:ring-inset lg:ring-violet-100 dark:lg:ring-violet-950/40' : ''} flex-col border-r border-docka-200 bg-white shadow-2xl transition-shadow dark:border-zinc-800 dark:bg-zinc-950 lg:static lg:inset-auto lg:z-auto lg:flex lg:w-[240px] lg:shrink-0 lg:shadow-none`}>
                    <div className="flex h-14 items-center justify-between border-b border-docka-100 px-4 dark:border-zinc-800"><div className="flex items-center gap-2"><Sparkles size={16} className="text-violet-600" /><span className="text-xs font-bold">{isEditable ? 'Adicionar etapa' : 'Etapas disponíveis'}</span></div><button onClick={() => setMobileCatalogOpen(false)} className="lg:hidden"><X size={18} /></button></div>
                    <div className="grid grid-cols-2 border-b border-docka-100 p-2 dark:border-zinc-800">{(['trigger', 'action'] as NodeKind[]).map((kind) => <button key={kind} disabled={!isEditable} onClick={() => setCatalogKind(kind)} className={`rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40 ${catalogKind === kind ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' : 'text-docka-400'}`}>{kind === 'trigger' ? 'Gatilhos' : 'Ações'}</button>)}</div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto p-3"><p className="mb-3 px-1 text-[9px] font-black uppercase tracking-[.18em] text-docka-400">{catalogKind === 'trigger' ? 'Iniciar quando...' : 'Depois, faça...'}</p>{!isEditable && <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50 p-3 text-[9px] leading-4 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300">Este fluxo representa uma automação já implementada no sistema e está disponível para consulta.</div>}<div className="grid grid-cols-2 gap-2">{templates.filter((item) => item.kind === catalogKind).map((item) => <button key={`${item.kind}-${item.app}`} disabled={!isEditable} onClick={() => addNode(item)} className="group min-h-[108px] rounded-2xl border border-docka-100 bg-docka-50/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-violet-800 dark:hover:bg-zinc-900"><span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: item.color }}>{iconFor(item.icon, 16)}</span><span className="block text-xs font-bold">{item.app}</span><span className="mt-1 block text-[9px] leading-3 text-docka-400">{item.title}</span></button>)}</div></div>
                </aside>
                {mobileCatalogOpen && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileCatalogOpen(false)} aria-label="Fechar catálogo" />}

                <main className="custom-scrollbar relative min-w-0 flex-1 overflow-auto bg-[#fbfbfc] p-8 dark:bg-zinc-950 lg:p-12" style={{ backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, .28) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-col items-center pb-16"><div className="mb-6 flex items-center gap-2 rounded-full border border-docka-200 bg-white px-3 py-1.5 text-[10px] font-bold text-docka-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"><Building2 size={13} /> {companyFor(editingFlow.organizationId)?.name || 'Empresa'} <span className="h-1 w-1 rounded-full bg-docka-300" /> {editingFlow.nodes.length} etapas</div>{editingFlow.nodes.map((flowNode, index) => <React.Fragment key={flowNode.id}>{index > 0 && <Connector onAdd={isEditable ? () => openCatalog('action') : undefined} />}<button onClick={() => { setSelectedNodeId(flowNode.id); if (window.matchMedia('(max-width: 1279px)').matches) setMobileConfigOpen(true); }} className={`relative w-full max-w-[390px] rounded-2xl border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900 ${selectedNode?.id === flowNode.id ? 'border-violet-500 ring-4 ring-violet-100/70 dark:ring-violet-950/50' : 'border-docka-200 dark:border-zinc-700'}`}><div className="flex h-8 items-center justify-between border-b border-docka-100 px-4 dark:border-zinc-800"><span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${flowNode.kind === 'trigger' ? 'text-violet-600' : 'text-docka-500 dark:text-zinc-400'}`}>{flowNode.kind === 'trigger' ? <Zap size={11} /> : <Play size={10} />} {flowNode.kind === 'trigger' ? 'Gatilho' : `Ação ${index}`}</span><MoreHorizontal size={15} className="text-docka-300" /></div><div className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: flowNode.color }}>{iconFor(flowNode.icon, 20)}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-bold text-docka-400">{flowNode.app}</span><span className="mt-0.5 block truncate text-sm font-bold">{flowNode.title}</span><span className="mt-1 block truncate text-[10px] text-docka-400">{flowNode.description}</span></span><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Check size={12} /></span></div></button></React.Fragment>)}{isEditable && <><div className="h-7 w-px bg-docka-300 dark:bg-zinc-700" /><button onClick={() => openCatalog('action')} className="flex items-center gap-2 rounded-xl border border-dashed border-violet-300 bg-white px-4 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 dark:border-violet-800 dark:bg-zinc-900 dark:hover:bg-violet-950/30"><Plus size={15} /> Adicionar ação</button></>}</div>
                </main>

                <aside className={`${mobileConfigOpen ? 'fixed inset-y-0 right-0 z-50 flex w-[min(360px,92vw)]' : 'hidden'} flex-col border-l border-docka-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 xl:static xl:inset-auto xl:z-auto xl:flex xl:w-[320px] xl:shrink-0 xl:shadow-none`}>
                    {selectedNode && <><div className="flex h-16 shrink-0 items-center gap-3 border-b border-docka-100 px-5 dark:border-zinc-800"><span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ backgroundColor: selectedNode.color }}>{iconFor(selectedNode.icon, 18)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{selectedNode.app}</p><p className="text-[10px] text-docka-400">{selectedNode.kind === 'trigger' ? 'Detalhes do gatilho' : 'Detalhes da ação'}</p></div><button onClick={() => setMobileConfigOpen(false)} className="xl:hidden"><X size={18} /></button></div><div className="custom-scrollbar flex-1 overflow-y-auto p-5"><div className="mb-5 flex rounded-xl bg-docka-50 p-1 dark:bg-zinc-900"><button className="flex-1 rounded-lg bg-white py-2 text-[10px] font-bold shadow-sm dark:bg-zinc-800">Configuração</button><button className="flex-1 py-2 text-[10px] font-bold text-docka-400">Conexão</button></div><div className="space-y-5"><Field label="Nome da etapa"><input value={selectedNode.title} disabled={!isEditable} onChange={(event) => updateSelectedNode({ title: event.target.value })} className="automation-input disabled:cursor-default disabled:opacity-75" /></Field><Field label="Empresa"><div className="relative"><select value={editingFlow.organizationId} disabled={!isEditable} onChange={(event) => updateFlow({ organizationId: event.target.value, nodes: editingFlow.nodes.map((item) => ({ ...item, organizationId: event.target.value })) })} className="automation-input appearance-none pr-9 disabled:cursor-default disabled:opacity-75">{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>{selectedNode.kind === 'trigger' && isEditable && <TriggerConfiguration node={selectedNode} flowId={editingFlow.id} onChange={updateTriggerConfiguration} />}{selectedNode.kind === 'action' && isEditable && <ActionConfiguration node={selectedNode} onChange={(patch) => updateSelectedNode(patch)} />}{selectedNode.message && !isEditable && <Field label="Mensagem / instrução"><textarea value={selectedNode.message} disabled rows={7} className="automation-input resize-none leading-5 disabled:cursor-default disabled:opacity-75" /></Field>}<div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20"><div className="flex items-center gap-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300"><Settings2 size={13} /> {isEditable ? 'Conectado ao motor Manyways' : 'Conectado ao sistema atual'}</div><p className="mt-1 text-[9px] leading-4 text-emerald-700/80 dark:text-emerald-400/80">{isEditable ? 'Salvar persiste o fluxo; Ativar passa a receber eventos reais e executar as ações.' : 'Ativar ou Pausar altera diretamente a configuração desta automação nativa.'}</p></div></div></div>{isEditable && <div className="flex shrink-0 items-center gap-2 border-t border-docka-100 p-4 dark:border-zinc-800">{selectedNode.kind === 'action' && <button onClick={removeSelectedNode} className="rounded-xl border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Remover</button>}<button onClick={() => void saveFlow()} className="ml-auto flex items-center gap-2 rounded-xl bg-docka-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"><Save size={14} /> Salvar fluxo</button></div>}</>}
                </aside>
                {mobileConfigOpen && <button className="fixed inset-0 z-40 bg-black/30 xl:hidden" onClick={() => setMobileConfigOpen(false)} aria-label="Fechar configuração" />}
            </div>
            <style>{`.automation-input{width:100%;border-radius:.75rem;border:1px solid #e5e7eb;background:#fff;padding:.65rem .75rem;font-size:.75rem;outline:none;transition:border-color .15s,box-shadow .15s}.automation-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.1)}.dark .automation-input{border-color:#3f3f46;background:#18181b;color:#f4f4f5}@media(prefers-reduced-motion:reduce){.automation-input,button{transition:none!important;animation:none!important}}`}</style>
        </div>
    );
};

const TriggerConfiguration = ({ node, flowId, onChange }: { node: AutomationNode; flowId: string; onChange: (config: Record<string, any>, triggerType: string) => void }) => {
    const config = node.config || {};
    if (node.app === 'Agenda') {
        return <Field label="Executar a cada"><div className="relative"><select value={Number(config.intervalMinutes || 60)} onChange={(event) => onChange({ intervalMinutes: Number(event.target.value) }, 'SCHEDULE')} className="automation-input appearance-none pr-9"><option value={5}>5 minutos</option><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={60}>1 hora</option><option value={360}>6 horas</option><option value={1440}>1 dia</option><option value={10080}>1 semana</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>;
    }
    const events = node.app === 'Formulário'
        ? [{ value: 'form.submitted', label: 'Nova resposta enviada' }]
        : node.app === 'Webhook'
            ? [{ value: 'webhook.received', label: 'Webhook recebido' }]
            : [
                { value: 'crm.lead.created', label: 'Novo lead criado' },
                { value: 'contract.signed', label: 'Contrato assinado' },
                { value: 'invoice.created', label: 'Nova fatura criada' },
                { value: 'payment.confirmed', label: 'Pagamento confirmado' },
                { value: 'form.submitted', label: 'Formulário enviado' },
            ];
    const webhookUrl = node.app === 'Webhook' && config.secret && !flowId.startsWith('draft-')
        ? `${String(api.defaults.baseURL || '').replace(/\/$/, '')}/automations/hooks/${flowId}/${config.secret}`
        : '';
    return <><Field label="Evento que inicia o fluxo"><div className="relative"><select value={config.eventType || events[0].value} onChange={(event) => onChange({ ...config, eventType: event.target.value }, node.app === 'Webhook' ? 'WEBHOOK' : 'EVENT')} className="automation-input appearance-none pr-9">{events.map((event) => <option key={event.value} value={event.value}>{event.label}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>{node.app === 'Webhook' && <Field label="URL de entrada">{webhookUrl ? <div className="space-y-2"><input readOnly value={webhookUrl} className="automation-input" /><button type="button" onClick={() => void navigator.clipboard.writeText(webhookUrl)} className="text-[10px] font-bold text-violet-600">Copiar URL do webhook</button></div> : <p className="rounded-xl bg-docka-50 p-3 text-[10px] text-docka-500 dark:bg-zinc-900">Salve o fluxo para gerar a URL segura de entrada.</p>}</Field>}</>;
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

const CompanyChip = ({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) => <button onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold transition ${active ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300' : 'border-docka-200 bg-white text-docka-500 hover:border-docka-300 dark:border-zinc-700 dark:bg-zinc-950'}`}>{label}<span className={`rounded-full px-1.5 py-0.5 text-[8px] ${active ? 'bg-violet-600 text-white' : 'bg-docka-100 dark:bg-zinc-800'}`}>{count}</span></button>;

const Metric = ({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: 'violet' | 'emerald' | 'blue' }) => {
    const styles = { violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' };
    return <div className="flex items-center justify-between rounded-2xl border border-docka-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-docka-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><div className={`rounded-xl p-3 ${styles[tone]}`}><Icon size={19} /></div></div>;
};

const FlowCard = ({ flow, company, onClick }: { flow: AutomationFlow; company?: AutomationCompany; onClick: () => void }) => <button onClick={onClick} className="group rounded-2xl border border-docka-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-900"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">{iconFor(flow.nodes[0]?.icon || 'zap', 18)}</div><div className="min-w-0"><h3 className="truncate text-xs font-bold">{flow.name}</h3><p className="mt-1 truncate text-[9px] text-docka-400">{company?.name || flow.organization?.name || 'Empresa'}</p></div></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase ${statusStyles[flow.status]}`}>{statusLabel[flow.status]}</span></div><p className="mt-4 line-clamp-2 min-h-8 text-[10px] leading-4 text-docka-500 dark:text-zinc-400">{flow.description}</p><div className="mt-4 flex items-center justify-between border-t border-docka-50 pt-3 dark:border-zinc-800"><div className="flex -space-x-1.5">{flow.nodes.slice(0, 4).map((item) => <span key={item.id} className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white text-white dark:border-zinc-950" style={{ backgroundColor: item.color }}>{iconFor(item.icon, 11)}</span>)}{flow.nodes.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-docka-100 text-[8px] font-bold dark:border-zinc-950 dark:bg-zinc-800">+{flow.nodes.length - 4}</span>}</div><span className="flex items-center gap-1 text-[9px] font-bold text-violet-600 opacity-70 transition group-hover:opacity-100">Abrir fluxo <ChevronDown size={11} className="-rotate-90" /></span></div></button>;

const Connector = ({ onAdd }: { onAdd?: () => void }) => <div className="flex h-16 flex-col items-center"><div className="h-6 w-px bg-docka-300 dark:bg-zinc-700" />{onAdd ? <button onClick={onAdd} className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-docka-200 bg-white text-docka-400 shadow-sm hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-900"><Plus size={13} /></button> : <div className="h-2 w-2 rounded-full bg-docka-300 dark:bg-zinc-700" />}<div className="h-4 w-px bg-docka-300 dark:bg-zinc-700" /></div>;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[.14em] text-docka-500 dark:text-zinc-400">{label}</span>{children}</label>;

export default DockaAutomationView;
