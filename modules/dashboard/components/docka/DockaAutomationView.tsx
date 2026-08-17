import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft, Bot, Check, ChevronDown, Clock3, CreditCard, FormInput, GitBranch,
    Mail, MessageCircle, MoreHorizontal, Play, Plus, Radio, Save, Settings2,
    Slack, Sparkles, Webhook, Workflow, X, Zap
} from 'lucide-react';
import { Organization } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';

type NodeKind = 'trigger' | 'action';

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

interface AutomationTemplate {
    app: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    kind: NodeKind;
}

const STORAGE_KEY = 'manyways-automation-flow-v1';

const templates: AutomationTemplate[] = [
    { app: 'Manyways', title: 'Evento do sistema', description: 'Quando algo acontecer em uma empresa', icon: 'zap', color: '#7657F6', kind: 'trigger' },
    { app: 'Webhook', title: 'Webhook recebido', description: 'Receber dados de qualquer sistema', icon: 'webhook', color: '#F05D69', kind: 'trigger' },
    { app: 'Agenda', title: 'Data e horário', description: 'Executar em um horário programado', icon: 'clock', color: '#8779F4', kind: 'trigger' },
    { app: 'Formulário', title: 'Nova resposta', description: 'Quando um formulário for enviado', icon: 'form', color: '#5D7DF5', kind: 'trigger' },
    { app: 'E-mail', title: 'Enviar e-mail', description: 'Disparar uma mensagem personalizada', icon: 'mail', color: '#EA4335', kind: 'action' },
    { app: 'Slack', title: 'Notificar no Slack', description: 'Publicar em um canal ou conversa', icon: 'slack', color: '#4A154B', kind: 'action' },
    { app: 'WhatsApp', title: 'Enviar WhatsApp', description: 'Notificar um contato pelo WhatsApp', icon: 'message', color: '#17B26A', kind: 'action' },
    { app: 'Pagamento', title: 'Criar cobrança', description: 'Gerar uma nova cobrança', icon: 'card', color: '#635BFF', kind: 'action' },
    { app: 'Aguardar', title: 'Adicionar espera', description: 'Pausar o fluxo por um período', icon: 'clock', color: '#F79009', kind: 'action' },
    { app: 'Many AI', title: 'Gerar com IA', description: 'Analisar e produzir conteúdo', icon: 'bot', color: '#111827', kind: 'action' },
];

const initialNodes: AutomationNode[] = [
    { id: 'trigger-1', kind: 'trigger', app: 'Manyways', title: 'Novo pagamento confirmado', description: 'Inicia quando uma cobrança for paga', icon: 'zap', color: '#7657F6', organizationId: 'all' },
    { id: 'action-1', kind: 'action', app: 'Slack', title: 'Avisar equipe responsável', description: 'Envia uma notificação para o canal', icon: 'slack', color: '#4A154B', organizationId: 'all', message: 'Pagamento confirmado para {{cliente.nome}}.' },
    { id: 'action-2', kind: 'action', app: 'E-mail', title: 'Enviar confirmação ao cliente', description: 'Usa o e-mail do cadastro do cliente', icon: 'mail', color: '#EA4335', organizationId: 'all', message: 'Olá, {{cliente.nome}}! Seu pagamento foi confirmado.' },
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

const DockaAutomationView: React.FC<{ organizations: Organization[] }> = ({ organizations }) => {
    const { addToast } = useToast();
    const [flowName, setFlowName] = useState('Boas-vindas após pagamento');
    const [nodes, setNodes] = useState<AutomationNode[]>(initialNodes);
    const [selectedId, setSelectedId] = useState(initialNodes[0].id);
    const [catalogKind, setCatalogKind] = useState<NodeKind>('trigger');
    const [active, setActive] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showMobileCatalog, setShowMobileCatalog] = useState(false);
    const [showMobileConfig, setShowMobileConfig] = useState(false);

    const companies = useMemo(() => organizations.filter((org) => org.slug !== 'manyspace'), [organizations]);
    const selectedNode = nodes.find((node) => node.id === selectedId) || nodes[0];

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.nodes) && parsed.nodes.length) {
                setNodes(parsed.nodes);
                setSelectedId(parsed.nodes[0].id);
            }
            if (parsed.flowName) setFlowName(parsed.flowName);
            if (typeof parsed.active === 'boolean') setActive(parsed.active);
        } catch (error) {
            console.warn('Não foi possível carregar o rascunho de automação.', error);
        }
    }, []);

    const persist = (nextActive = active) => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ flowName, nodes, active: nextActive }));
    };

    const saveFlow = () => {
        persist();
        addToast({ type: 'success', title: 'Rascunho salvo', message: 'O fluxo ficou salvo neste dispositivo.' });
    };

    const toggleActive = () => {
        const next = !active;
        setActive(next);
        persist(next);
        addToast({
            type: next ? 'success' : 'info',
            title: next ? 'Fluxo ativado' : 'Fluxo pausado',
            message: next ? 'A configuração está pronta. Conecte os canais para executar disparos reais.' : 'Nenhuma nova execução será iniciada.',
        });
    };

    const testFlow = () => {
        setTesting(true);
        window.setTimeout(() => {
            setTesting(false);
            addToast({ type: 'success', title: 'Teste concluído', message: `${nodes.length} etapas validadas sem executar envios reais.` });
        }, 900);
    };

    const addNode = (template: AutomationTemplate) => {
        const node: AutomationNode = {
            ...template,
            id: `${template.kind}-${Date.now()}`,
            organizationId: 'all',
            message: template.kind === 'action' ? 'Use {{variáveis}} para personalizar esta ação.' : undefined,
        };
        setNodes((current) => template.kind === 'trigger'
            ? [node, ...current.filter((item) => item.kind !== 'trigger')]
            : [...current, node]);
        setSelectedId(node.id);
        setShowMobileCatalog(false);
        setShowMobileConfig(true);
    };

    const updateSelected = (patch: Partial<AutomationNode>) => {
        setNodes((current) => current.map((node) => node.id === selectedId ? { ...node, ...patch } : node));
    };

    const removeSelected = () => {
        if (!selectedNode || selectedNode.kind === 'trigger') return;
        const next = nodes.filter((node) => node.id !== selectedId);
        setNodes(next);
        setSelectedId(next[Math.max(0, next.length - 1)]?.id || '');
        setShowMobileConfig(false);
    };

    return (
        <div className="flex h-full flex-col overflow-hidden bg-white text-docka-900 dark:bg-zinc-950 dark:text-zinc-100">
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-docka-200 px-4 dark:border-zinc-800 lg:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <button className="hidden rounded-lg p-2 text-docka-500 hover:bg-docka-50 sm:block dark:hover:bg-zinc-900" aria-label="Voltar"><ArrowLeft size={17} /></button>
                    <div className="hidden items-center gap-2 text-xs text-docka-400 md:flex"><span>Automações</span><span>/</span></div>
                    <input
                        value={flowName}
                        onChange={(event) => setFlowName(event.target.value)}
                        className="min-w-0 max-w-[260px] truncate border-none bg-transparent text-sm font-bold outline-none sm:min-w-[260px]"
                        aria-label="Nome do fluxo"
                    />
                    <span className={`hidden rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider sm:inline-flex ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-docka-100 text-docka-500 dark:bg-zinc-800'}`}>{active ? 'Ativo' : 'Rascunho'}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => setShowMobileCatalog(true)} className="rounded-lg border border-docka-200 p-2 lg:hidden dark:border-zinc-700" aria-label="Adicionar etapa"><Plus size={17} /></button>
                    <button onClick={saveFlow} className="hidden items-center gap-2 rounded-xl border border-docka-200 bg-white px-3.5 py-2 text-xs font-bold shadow-sm transition hover:bg-docka-50 sm:flex dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"><Save size={15} /> Salvar</button>
                    <button onClick={testFlow} disabled={testing} className="flex items-center gap-2 rounded-xl bg-docka-100 px-3.5 py-2 text-xs font-bold transition hover:bg-docka-200 disabled:opacity-60 dark:bg-zinc-800 dark:hover:bg-zinc-700"><Play size={14} className={testing ? 'animate-pulse' : ''} /> <span className="hidden sm:inline">{testing ? 'Testando...' : 'Testar fluxo'}</span></button>
                    <button onClick={toggleActive} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-[.98] ${active ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:brightness-105'}`}><Radio size={14} /> {active ? 'Pausar' : 'Ativar'}</button>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                <aside className={`${showMobileCatalog ? 'fixed inset-y-0 left-0 z-50 flex w-[280px] shadow-2xl' : 'hidden'} flex-col border-r border-docka-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex lg:w-[240px] lg:shrink-0`}>
                    <div className="flex h-14 items-center justify-between border-b border-docka-100 px-4 dark:border-zinc-800">
                        <div className="flex items-center gap-2"><Sparkles size={16} className="text-violet-600" /><span className="text-xs font-bold">Adicionar etapa</span></div>
                        <button onClick={() => setShowMobileCatalog(false)} className="lg:hidden"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-2 border-b border-docka-100 p-2 dark:border-zinc-800">
                        {(['trigger', 'action'] as NodeKind[]).map((kind) => (
                            <button key={kind} onClick={() => setCatalogKind(kind)} className={`rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition ${catalogKind === kind ? 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' : 'text-docka-400'}`}>{kind === 'trigger' ? 'Gatilhos' : 'Ações'}</button>
                        ))}
                    </div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
                        <p className="mb-3 px-1 text-[9px] font-black uppercase tracking-[.18em] text-docka-400">{catalogKind === 'trigger' ? 'Iniciar quando...' : 'Depois, faça...'}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {templates.filter((item) => item.kind === catalogKind).map((item) => (
                                <button key={`${item.kind}-${item.app}`} onClick={() => addNode(item)} className="group min-h-[108px] rounded-2xl border border-docka-100 bg-docka-50/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-violet-800 dark:hover:bg-zinc-900">
                                    <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: item.color }}>{iconFor(item.icon, 16)}</span>
                                    <span className="block text-xs font-bold">{item.app}</span>
                                    <span className="mt-1 block text-[9px] leading-3 text-docka-400">{item.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {showMobileCatalog && <button className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setShowMobileCatalog(false)} aria-label="Fechar catálogo" />}

                <main
                    className="custom-scrollbar relative min-w-0 flex-1 overflow-auto bg-[#fbfbfc] p-8 dark:bg-zinc-950 lg:p-12"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, .28) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                    <div className="mx-auto flex min-h-full w-full max-w-[560px] flex-col items-center pb-16">
                        <div className="mb-6 flex items-center gap-2 rounded-full border border-docka-200 bg-white px-3 py-1.5 text-[10px] font-bold text-docka-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"><Workflow size={13} /> {nodes.length} etapas <span className="h-1 w-1 rounded-full bg-docka-300" /> todas as empresas</div>
                        {nodes.map((node, index) => (
                            <React.Fragment key={node.id}>
                                {index > 0 && (
                                    <div className="flex h-16 flex-col items-center">
                                        <div className="h-6 w-px bg-docka-300 dark:bg-zinc-700" />
                                        <button onClick={() => { setCatalogKind('action'); setShowMobileCatalog(true); }} className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-docka-200 bg-white text-docka-400 shadow-sm transition hover:border-violet-400 hover:text-violet-600 dark:border-zinc-700 dark:bg-zinc-900"><Plus size={13} /></button>
                                        <div className="h-4 w-px bg-docka-300 dark:bg-zinc-700" />
                                    </div>
                                )}
                                <button
                                    onClick={() => { setSelectedId(node.id); setShowMobileConfig(true); }}
                                    className={`group relative w-full max-w-[390px] rounded-2xl border bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900 ${selectedId === node.id ? 'border-violet-500 ring-4 ring-violet-100/70 dark:ring-violet-950/50' : 'border-docka-200 dark:border-zinc-700'}`}
                                >
                                    <div className="flex h-8 items-center justify-between border-b border-docka-100 px-4 dark:border-zinc-800">
                                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${node.kind === 'trigger' ? 'text-violet-600' : 'text-docka-500 dark:text-zinc-400'}`}>{node.kind === 'trigger' ? <Zap size={11} /> : <Play size={10} />} {node.kind === 'trigger' ? 'Gatilho' : `Ação ${index}`}</span>
                                        <MoreHorizontal size={15} className="text-docka-300" />
                                    </div>
                                    <div className="flex items-center gap-3 p-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: node.color }}>{iconFor(node.icon, 20)}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[10px] font-bold text-docka-400">{node.app}</span>
                                            <span className="mt-0.5 block truncate text-sm font-bold">{node.title}</span>
                                            <span className="mt-1 block truncate text-[10px] text-docka-400">{node.description}</span>
                                        </span>
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"><Check size={12} /></span>
                                    </div>
                                </button>
                            </React.Fragment>
                        ))}
                        <div className="h-7 w-px bg-docka-300 dark:bg-zinc-700" />
                        <button onClick={() => { setCatalogKind('action'); setShowMobileCatalog(true); }} className="flex items-center gap-2 rounded-xl border border-dashed border-violet-300 bg-white px-4 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 dark:border-violet-800 dark:bg-zinc-900 dark:hover:bg-violet-950/30"><Plus size={15} /> Adicionar ação</button>
                    </div>
                </main>

                <aside className={`${showMobileConfig ? 'fixed inset-y-0 right-0 z-50 flex w-[min(360px,92vw)] shadow-2xl' : 'hidden'} flex-col border-l border-docka-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 xl:flex xl:w-[320px] xl:shrink-0`}>
                    {selectedNode && (
                        <>
                            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-docka-100 px-5 dark:border-zinc-800">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ backgroundColor: selectedNode.color }}>{iconFor(selectedNode.icon, 18)}</span>
                                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{selectedNode.app}</p><p className="text-[10px] text-docka-400">{selectedNode.kind === 'trigger' ? 'Configurar gatilho' : 'Configurar ação'}</p></div>
                                <button onClick={() => setShowMobileConfig(false)} className="xl:hidden"><X size={18} /></button>
                            </div>
                            <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                                <div className="mb-5 flex rounded-xl bg-docka-50 p-1 dark:bg-zinc-900"><button className="flex-1 rounded-lg bg-white py-2 text-[10px] font-bold shadow-sm dark:bg-zinc-800">Configurar</button><button className="flex-1 py-2 text-[10px] font-bold text-docka-400">Conexão</button></div>
                                <div className="space-y-5">
                                    <Field label="Nome da etapa">
                                        <input value={selectedNode.title} onChange={(event) => updateSelected({ title: event.target.value })} className="automation-input" />
                                    </Field>
                                    <Field label="Empresa">
                                        <div className="relative">
                                            <select value={selectedNode.organizationId} onChange={(event) => updateSelected({ organizationId: event.target.value })} className="automation-input appearance-none pr-9">
                                                <option value="all">Todas as empresas</option>
                                                {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" />
                                        </div>
                                        <p className="mt-1.5 text-[9px] leading-4 text-docka-400">Escolha uma empresa ou deixe o fluxo disponível para todo o grupo.</p>
                                    </Field>
                                    {selectedNode.kind === 'trigger' ? (
                                        <Field label="Evento">
                                            <div className="relative"><select className="automation-input appearance-none pr-9" defaultValue="payment"><option value="payment">Pagamento confirmado</option><option value="lead">Novo lead recebido</option><option value="client">Cliente criado</option><option value="task">Tarefa vencendo</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" /></div>
                                        </Field>
                                    ) : (
                                        <Field label="Mensagem / instrução">
                                            <textarea value={selectedNode.message || ''} onChange={(event) => updateSelected({ message: event.target.value })} rows={6} className="automation-input resize-none leading-5" />
                                            <button className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-violet-600"><GitBranch size={12} /> Inserir variável</button>
                                        </Field>
                                    )}
                                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-800 dark:text-amber-300"><Settings2 size={13} /> Conexão necessária</div>
                                        <p className="mt-1 text-[9px] leading-4 text-amber-700/80 dark:text-amber-400/80">Conecte as credenciais deste canal antes de executar envios reais.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 border-t border-docka-100 p-4 dark:border-zinc-800">
                                {selectedNode.kind === 'action' && <button onClick={removeSelected} className="rounded-xl border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">Remover</button>}
                                <button onClick={saveFlow} className="ml-auto flex items-center gap-2 rounded-xl bg-docka-900 px-4 py-2.5 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"><Save size={14} /> Salvar etapa</button>
                            </div>
                        </>
                    )}
                </aside>
                {showMobileConfig && <button className="fixed inset-0 z-40 bg-black/30 xl:hidden" onClick={() => setShowMobileConfig(false)} aria-label="Fechar configuração" />}
            </div>
            <style>{`
                .automation-input { width: 100%; border-radius: .75rem; border: 1px solid #e5e7eb; background: #fff; padding: .65rem .75rem; font-size: .75rem; outline: none; transition: border-color .15s, box-shadow .15s; }
                .automation-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.1); }
                .dark .automation-input { border-color: #3f3f46; background: #18181b; color: #f4f4f5; }
                @media (prefers-reduced-motion: reduce) { .automation-input, button { transition: none !important; animation: none !important; } }
            `}</style>
        </div>
    );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
        <span className="mb-2 block text-[9px] font-black uppercase tracking-[.14em] text-docka-500 dark:text-zinc-400">{label}</span>
        {children}
    </label>
);

export default DockaAutomationView;
