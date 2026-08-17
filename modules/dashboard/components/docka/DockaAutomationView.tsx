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
type FlowSource = 'system' | 'template' | 'form' | 'custom';

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
}

interface AutomationTemplate {
    app: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    kind: NodeKind;
}

interface NotificationTemplate {
    id: string;
    slug: string;
    name: string;
    channel: string;
    stageSlug?: string | null;
    content: string;
    isActive: boolean;
    updatedAt?: string;
}

interface DockaForm {
    id: string;
    name: string;
    org: string;
    target: string;
    status: string;
}

const CUSTOM_FLOWS_KEY = 'manyways-automation-flows-v2';

const templates: AutomationTemplate[] = [
    { app: 'Manyways', title: 'Evento do sistema', description: 'Quando algo acontecer em uma empresa', icon: 'zap', color: '#7657F6', kind: 'trigger' },
    { app: 'Webhook', title: 'Webhook recebido', description: 'Receber dados de qualquer sistema', icon: 'webhook', color: '#F05D69', kind: 'trigger' },
    { app: 'Agenda', title: 'Data e horário', description: 'Executar em um horário programado', icon: 'clock', color: '#8779F4', kind: 'trigger' },
    { app: 'Formulário', title: 'Nova resposta', description: 'Quando um formulário for enviado', icon: 'form', color: '#5D7DF5', kind: 'trigger' },
    { app: 'E-mail', title: 'Enviar e-mail', description: 'Disparar uma mensagem personalizada', icon: 'mail', color: '#EA4335', kind: 'action' },
    { app: 'Slack', title: 'Notificar no Slack', description: 'Publicar em um canal ou conversa', icon: 'slack', color: '#4A154B', kind: 'action' },
    { app: 'WhatsApp', title: 'Enviar WhatsApp', description: 'Notificar um contato pelo WhatsApp', icon: 'message', color: '#17B26A', kind: 'action' },
    { app: 'Financeiro', title: 'Criar cobrança', description: 'Gerar uma nova cobrança', icon: 'card', color: '#635BFF', kind: 'action' },
    { app: 'Aguardar', title: 'Adicionar espera', description: 'Pausar o fluxo por um período', icon: 'clock', color: '#F79009', kind: 'action' },
    { app: 'Many AI', title: 'Gerar com IA', description: 'Analisar e produzir conteúdo', icon: 'bot', color: '#111827', kind: 'action' },
];

const stageLabels: Record<string, string> = {
    'lead-created': 'Novo lead cadastrado',
    'new-dispatch': 'Nova movimentação no INPI',
    'invoice-pending': 'Nova fatura gerada',
    'payment-success': 'Pagamento confirmado',
    'contract-pending': 'Contrato aguardando assinatura',
    'contract-signed': 'Contrato assinado',
    'a-protocolar': 'GRU reconhecida',
    'protocolado': 'Processo protocolado',
    'registro-vigor': 'Registro de marca concedido',
    'processo-concluido': 'Certificado de registro emitido',
};

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

const buildAsteryskoSystemFlows = (organizationId: string): AutomationFlow[] => [
    {
        id: 'system-asterysko-scout-ai',
        name: 'Scout AI — pesquisa de oportunidades',
        description: 'Pesquisa empresas, valida candidatas e envia oportunidades elegíveis para análise.',
        organizationId,
        status: 'active',
        source: 'system',
        updatedAt: new Date().toISOString(),
        nodes: [
            node('scout-trigger', 'trigger', 'Agenda', 'Execução programada do Scout AI', 'Horário e segmentos configurados na Asterysko', organizationId, 'clock', '#8779F4'),
            node('scout-search', 'action', 'Many AI', 'Pesquisar e validar empresas', 'Descobre, estrutura e valida os websites candidatos', organizationId, 'bot', '#111827'),
            node('scout-crm', 'action', 'Asterysko CRM', 'Criar oportunidade para análise', 'Somente candidatas aprovadas pelos critérios de segurança', organizationId, 'zap', '#7657F6'),
        ],
    },
    {
        id: 'system-asterysko-ingestion',
        name: 'Motor de captação por fontes',
        description: 'Processa fontes ativas, recupera execuções interrompidas e enriquece oportunidades.',
        organizationId,
        status: 'active',
        source: 'system',
        updatedAt: new Date().toISOString(),
        nodes: [
            node('ingestion-trigger', 'trigger', 'Agenda', 'Fonte pronta para executar', 'Verificação automática das fontes agendadas', organizationId, 'clock', '#8779F4'),
            node('ingestion-process', 'action', 'Asterysko', 'Processar e normalizar resultados', 'Evita duplicidade e recupera execuções abandonadas', organizationId, 'zap', '#7657F6'),
            node('ingestion-enrich', 'action', 'Many AI', 'Enriquecer contatos empresariais', 'Valida canais e possíveis decisores', organizationId, 'bot', '#111827'),
        ],
    },
    {
        id: 'system-asterysko-new-lead',
        name: 'Novo lead — aviso comercial',
        description: 'Avisa a equipe sempre que um lead entra pelo CRM ou formulário do site.',
        organizationId,
        status: 'active',
        source: 'system',
        updatedAt: new Date().toISOString(),
        nodes: [
            node('lead-trigger', 'trigger', 'Asterysko CRM', 'Novo lead recebido', 'Lead criado manualmente ou pelo formulário', organizationId, 'form', '#5D7DF5'),
            node('lead-slack', 'action', 'Slack', 'Avisar equipe comercial', 'Publica a entrada do lead no canal configurado', organizationId, 'slack', '#4A154B'),
        ],
    },
    {
        id: 'system-asterysko-contract',
        name: 'Contrato assinado — provisionamento',
        description: 'Cria o processo e a cobrança, atualiza o CRM e confirma a assinatura ao cliente e à equipe.',
        organizationId,
        status: 'active',
        source: 'system',
        updatedAt: new Date().toISOString(),
        nodes: [
            node('contract-trigger', 'trigger', 'Asterysko CRM', 'Contrato assinado', 'Assinatura digital concluída pelo cliente', organizationId, 'zap', '#7657F6'),
            node('contract-billing', 'action', 'Financeiro', 'Criar processo e cobrança', 'Provisionamento idempotente no portal do cliente', organizationId, 'card', '#635BFF'),
            node('contract-slack', 'action', 'Slack', 'Avisar a equipe', 'Publica a confirmação no canal configurado', organizationId, 'slack', '#4A154B'),
            node('contract-client', 'action', 'E-mail + WhatsApp', 'Confirmar ao cliente', 'Envia as mensagens transacionais configuradas', organizationId, 'mail', '#EA4335'),
        ],
    },
];

const buildTemplateFlows = (templatesData: NotificationTemplate[], organizationId: string): AutomationFlow[] => {
    const groups = templatesData.reduce<Record<string, NotificationTemplate[]>>((accumulator, template) => {
        const stage = template.stageSlug || template.slug;
        accumulator[stage] = [...(accumulator[stage] || []), template];
        return accumulator;
    }, {});

    return Object.entries(groups).map(([stage, group]) => ({
        id: `template-${stage}`,
        name: stageLabels[stage] || group[0].name,
        description: `${group.length} comunicação${group.length > 1 ? 'ões' : ''} configurada${group.length > 1 ? 's' : ''} para esta etapa.`,
        organizationId,
        status: group.some((item) => item.isActive) ? 'active' : 'paused',
        source: 'template',
        updatedAt: group.map((item) => item.updatedAt || '').sort().at(-1) || new Date().toISOString(),
        nodes: [
            node(`trigger-${stage}`, 'trigger', 'Asterysko', stageLabels[stage] || stage, 'Mudança de etapa ou evento operacional', organizationId, 'zap', '#7657F6'),
            ...group.map((item) => node(
                `template-${item.id}`,
                'action',
                item.channel === 'EMAIL' ? 'E-mail' : 'WhatsApp',
                item.name,
                item.isActive ? 'Modelo ativo no sistema' : 'Modelo pausado no sistema',
                organizationId,
                item.channel === 'EMAIL' ? 'mail' : 'message',
                item.channel === 'EMAIL' ? '#EA4335' : '#17B26A',
                item.content,
            )),
        ],
    }));
};

const buildFormFlows = (forms: DockaForm[], organizations: Organization[]): AutomationFlow[] => forms.flatMap((form) => {
    const organization = organizations.find((item) => item.name.toLowerCase() === form.org.toLowerCase());
    if (!organization) return [];
    return [{
        id: `form-${form.id}`,
        name: `Formulário — ${form.name}`,
        description: `Captura respostas e encaminha automaticamente para ${form.target}.`,
        organizationId: organization.id,
        status: form.status?.toLowerCase() === 'active' ? 'active' as const : 'paused' as const,
        source: 'form' as const,
        updatedAt: new Date().toISOString(),
        nodes: [
            node(`form-trigger-${form.id}`, 'trigger', 'Formulário', form.name, 'Nova resposta recebida no site', organization.id, 'form', '#5D7DF5'),
            node(`form-action-${form.id}`, 'action', organization.slug === 'asterysko' ? 'Asterysko CRM' : 'Contatos', form.target, 'Cria o registro no painel da empresa', organization.id, 'zap', '#7657F6'),
            ...(organization.slug === 'asterysko' ? [node(`form-slack-${form.id}`, 'action', 'Slack', 'Avisar novo lead', 'Notifica o canal comercial configurado', organization.id, 'slack', '#4A154B')] : []),
        ],
    }];
});

const createDraftFlow = (organizationId: string): AutomationFlow => ({
    id: `custom-${Date.now()}`,
    name: 'Novo fluxo sem título',
    description: 'Configure um gatilho e adicione as ações deste fluxo.',
    organizationId,
    status: 'draft',
    source: 'custom',
    updatedAt: new Date().toISOString(),
    nodes: [node(`trigger-${Date.now()}`, 'trigger', 'Manyways', 'Escolha o que inicia o fluxo', 'Selecione um gatilho no catálogo à esquerda', organizationId, 'zap', '#7657F6')],
});

const statusStyles: Record<FlowStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    paused: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    draft: 'bg-docka-50 text-docka-500 border-docka-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
};

const statusLabel: Record<FlowStatus, string> = { active: 'Ativo', paused: 'Pausado', draft: 'Rascunho' };

const DockaAutomationView: React.FC<{ organizations: Organization[] }> = ({ organizations }) => {
    const { addToast } = useToast();
    const companies = useMemo(() => organizations.filter((item) => item.slug !== 'manyspace'), [organizations]);
    const [flows, setFlows] = useState<AutomationFlow[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingFlow, setEditingFlow] = useState<AutomationFlow | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState('');
    const [catalogKind, setCatalogKind] = useState<NodeKind>('trigger');
    const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);
    const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
    const [catalogHighlight, setCatalogHighlight] = useState(false);
    const catalogTimer = useRef<number | null>(null);

    useEffect(() => {
        let mounted = true;
        const loadFlows = async () => {
            setLoading(true);
            const asterysko = companies.find((item) => item.slug === 'asterysko');
            const systemFlows = asterysko ? buildAsteryskoSystemFlows(asterysko.id) : [];
            let notificationFlows: AutomationFlow[] = [];
            let formFlows: AutomationFlow[] = [];

            const [templateResult, formsResult] = await Promise.allSettled([
                asterysko ? api.get<NotificationTemplate[]>('/whatsapp/templates') : Promise.resolve({ data: [] as NotificationTemplate[] }),
                api.get<DockaForm[]>('/forms'),
            ]);

            if (asterysko && templateResult.status === 'fulfilled') {
                notificationFlows = buildTemplateFlows(templateResult.value.data || [], asterysko.id);
            }
            if (formsResult.status === 'fulfilled') {
                formFlows = buildFormFlows(formsResult.value.data || [], companies);
            }

            let customFlows: AutomationFlow[] = [];
            try {
                const stored = window.localStorage.getItem(CUSTOM_FLOWS_KEY);
                customFlows = stored ? JSON.parse(stored) : [];
                if (!Array.isArray(customFlows)) customFlows = [];
            } catch {
                customFlows = [];
            }

            if (mounted) {
                setFlows([...systemFlows, ...notificationFlows, ...formFlows, ...customFlows]);
                setLoading(false);
            }
        };
        void loadFlows();
        return () => { mounted = false; };
    }, [companies]);

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

    const persistCustomFlow = (flow: AutomationFlow) => {
        const next = [...flows.filter((item) => item.id !== flow.id), { ...flow, updatedAt: new Date().toISOString() }];
        setFlows(next);
        window.localStorage.setItem(CUSTOM_FLOWS_KEY, JSON.stringify(next.filter((item) => item.source === 'custom')));
    };

    const saveFlow = () => {
        if (!editingFlow || !isEditable) return;
        const saved = { ...editingFlow, updatedAt: new Date().toISOString() };
        setEditingFlow(saved);
        persistCustomFlow(saved);
        addToast({ type: 'success', title: 'Fluxo salvo', message: 'O rascunho foi atualizado na lista desta empresa.' });
    };

    const toggleFlow = () => {
        if (!editingFlow || !isEditable) return;
        const nextStatus: FlowStatus = editingFlow.status === 'active' ? 'paused' : 'active';
        const next = { ...editingFlow, status: nextStatus, updatedAt: new Date().toISOString() };
        setEditingFlow(next);
        persistCustomFlow(next);
        addToast({
            type: nextStatus === 'active' ? 'success' : 'info',
            title: nextStatus === 'active' ? 'Fluxo marcado como ativo' : 'Fluxo pausado',
            message: 'O motor genérico de execução será conectado ao backend em uma próxima etapa.',
        });
    };

    const updateFlow = (patch: Partial<AutomationFlow>) => {
        if (!editingFlow || !isEditable) return;
        setEditingFlow({ ...editingFlow, ...patch });
    };

    const updateSelectedNode = (patch: Partial<AutomationNode>) => {
        if (!editingFlow || !selectedNode || !isEditable) return;
        setEditingFlow({ ...editingFlow, nodes: editingFlow.nodes.map((item) => item.id === selectedNode.id ? { ...item, ...patch } : item) });
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
        const nextNodes = template.kind === 'trigger' ? [newNode, ...editingFlow.nodes.filter((item) => item.kind !== 'trigger')] : [...editingFlow.nodes, newNode];
        setEditingFlow({ ...editingFlow, nodes: nextNodes });
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
                            {loading ? <div className="flex min-h-64 items-center justify-center"><div className="flex items-center gap-2 text-xs font-bold text-docka-400"><Sparkles size={16} className="animate-pulse text-violet-500" /> Carregando fluxos existentes...</div></div> : visibleFlows.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><div className="mb-4 rounded-2xl bg-docka-50 p-4 text-docka-300 dark:bg-zinc-800"><ListFilter size={26} /></div><h3 className="text-sm font-bold">Nenhum fluxo nesta empresa</h3><p className="mt-1 max-w-md text-xs leading-5 text-docka-400">Ainda não existe uma automação implementada para esta empresa. Você pode iniciar um novo rascunho.</p><button onClick={createFlow} className="mt-4 flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2 text-xs font-bold text-violet-600 hover:bg-violet-50 dark:border-violet-900 dark:hover:bg-violet-950/30"><Plus size={14} /> Criar primeiro fluxo</button></div> : <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{visibleFlows.map((flow) => <FlowCard key={flow.id} flow={flow} company={companyFor(flow.organizationId)} onClick={() => openEditor(flow)} />)}</div>}
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
                <div className="flex shrink-0 items-center gap-2">{isEditable ? <><button onClick={saveFlow} className="hidden items-center gap-2 rounded-xl border border-docka-200 bg-white px-3.5 py-2 text-xs font-bold shadow-sm transition hover:bg-docka-50 sm:flex dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"><Save size={15} /> Salvar</button><button onClick={toggleFlow} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm ${editingFlow.status === 'active' ? 'bg-amber-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`}><Radio size={14} /> {editingFlow.status === 'active' ? 'Pausar' : 'Ativar'}</button></> : <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Check size={14} /> Configuração existente</span>}</div>
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
                    {selectedNode && <><div className="flex h-16 shrink-0 items-center gap-3 border-b border-docka-100 px-5 dark:border-zinc-800"><span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ backgroundColor: selectedNode.color }}>{iconFor(selectedNode.icon, 18)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{selectedNode.app}</p><p className="text-[10px] text-docka-400">{selectedNode.kind === 'trigger' ? 'Detalhes do gatilho' : 'Detalhes da ação'}</p></div><button onClick={() => setMobileConfigOpen(false)} className="xl:hidden"><X size={18} /></button></div><div className="custom-scrollbar flex-1 overflow-y-auto p-5"><div className="mb-5 flex rounded-xl bg-docka-50 p-1 dark:bg-zinc-900"><button className="flex-1 rounded-lg bg-white py-2 text-[10px] font-bold shadow-sm dark:bg-zinc-800">Configuração</button><button className="flex-1 py-2 text-[10px] font-bold text-docka-400">Conexão</button></div><div className="space-y-5"><Field label="Nome da etapa"><input value={selectedNode.title} disabled={!isEditable} onChange={(event) => updateSelectedNode({ title: event.target.value })} className="automation-input disabled:cursor-default disabled:opacity-75" /></Field><Field label="Empresa"><div className="relative"><select value={editingFlow.organizationId} disabled={!isEditable} onChange={(event) => updateFlow({ organizationId: event.target.value, nodes: editingFlow.nodes.map((item) => ({ ...item, organizationId: event.target.value })) })} className="automation-input appearance-none pr-9 disabled:cursor-default disabled:opacity-75">{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div></Field>{selectedNode.message && <Field label="Mensagem / instrução"><textarea value={selectedNode.message} disabled={!isEditable} onChange={(event) => updateSelectedNode({ message: event.target.value })} rows={7} className="automation-input resize-none leading-5 disabled:cursor-default disabled:opacity-75" />{isEditable && <button className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-violet-600"><GitBranch size={12} /> Inserir variável</button>}</Field>}<div className={`rounded-xl border p-3 ${isEditable ? 'border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20' : 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20'}`}><div className={`flex items-center gap-2 text-[10px] font-bold ${isEditable ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}`}><Settings2 size={13} /> {isEditable ? 'Rascunho do construtor' : 'Conectado ao sistema atual'}</div><p className={`mt-1 text-[9px] leading-4 ${isEditable ? 'text-amber-700/80 dark:text-amber-400/80' : 'text-emerald-700/80 dark:text-emerald-400/80'}`}>{isEditable ? 'As etapas ficam salvas, mas a execução genérica ainda depende do motor no backend.' : 'Este desenho representa o fluxo que já existe no código e nas configurações atuais.'}</p></div></div></div>{isEditable && <div className="flex shrink-0 items-center gap-2 border-t border-docka-100 p-4 dark:border-zinc-800">{selectedNode.kind === 'action' && <button onClick={removeSelectedNode} className="rounded-xl border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Remover</button>}<button onClick={saveFlow} className="ml-auto flex items-center gap-2 rounded-xl bg-docka-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"><Save size={14} /> Salvar fluxo</button></div>}</>}
                </aside>
                {mobileConfigOpen && <button className="fixed inset-0 z-40 bg-black/30 xl:hidden" onClick={() => setMobileConfigOpen(false)} aria-label="Fechar configuração" />}
            </div>
            <style>{`.automation-input{width:100%;border-radius:.75rem;border:1px solid #e5e7eb;background:#fff;padding:.65rem .75rem;font-size:.75rem;outline:none;transition:border-color .15s,box-shadow .15s}.automation-input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.1)}.dark .automation-input{border-color:#3f3f46;background:#18181b;color:#f4f4f5}@media(prefers-reduced-motion:reduce){.automation-input,button{transition:none!important;animation:none!important}}`}</style>
        </div>
    );
};

const CompanyChip = ({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) => <button onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold transition ${active ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300' : 'border-docka-200 bg-white text-docka-500 hover:border-docka-300 dark:border-zinc-700 dark:bg-zinc-950'}`}>{label}<span className={`rounded-full px-1.5 py-0.5 text-[8px] ${active ? 'bg-violet-600 text-white' : 'bg-docka-100 dark:bg-zinc-800'}`}>{count}</span></button>;

const Metric = ({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: 'violet' | 'emerald' | 'blue' }) => {
    const styles = { violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40', emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' };
    return <div className="flex items-center justify-between rounded-2xl border border-docka-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-docka-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><div className={`rounded-xl p-3 ${styles[tone]}`}><Icon size={19} /></div></div>;
};

const FlowCard = ({ flow, company, onClick }: { flow: AutomationFlow; company?: Organization; onClick: () => void }) => <button onClick={onClick} className="group rounded-2xl border border-docka-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-violet-900"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">{iconFor(flow.nodes[0]?.icon || 'zap', 18)}</div><div className="min-w-0"><h3 className="truncate text-xs font-bold">{flow.name}</h3><p className="mt-1 truncate text-[9px] text-docka-400">{company?.name || 'Empresa'}</p></div></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] font-black uppercase ${statusStyles[flow.status]}`}>{statusLabel[flow.status]}</span></div><p className="mt-4 line-clamp-2 min-h-8 text-[10px] leading-4 text-docka-500 dark:text-zinc-400">{flow.description}</p><div className="mt-4 flex items-center justify-between border-t border-docka-50 pt-3 dark:border-zinc-800"><div className="flex -space-x-1.5">{flow.nodes.slice(0, 4).map((item) => <span key={item.id} className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white text-white dark:border-zinc-950" style={{ backgroundColor: item.color }}>{iconFor(item.icon, 11)}</span>)}{flow.nodes.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-white bg-docka-100 text-[8px] font-bold dark:border-zinc-950 dark:bg-zinc-800">+{flow.nodes.length - 4}</span>}</div><span className="flex items-center gap-1 text-[9px] font-bold text-violet-600 opacity-70 transition group-hover:opacity-100">Abrir fluxo <ChevronDown size={11} className="-rotate-90" /></span></div></button>;

const Connector = ({ onAdd }: { onAdd?: () => void }) => <div className="flex h-16 flex-col items-center"><div className="h-6 w-px bg-docka-300 dark:bg-zinc-700" />{onAdd ? <button onClick={onAdd} className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-docka-200 bg-white text-docka-400 shadow-sm hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-900"><Plus size={13} /></button> : <div className="h-2 w-2 rounded-full bg-docka-300 dark:bg-zinc-700" />}<div className="h-4 w-px bg-docka-300 dark:bg-zinc-700" /></div>;

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[.14em] text-docka-500 dark:text-zinc-400">{label}</span>{children}</label>;

export default DockaAutomationView;
