import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronRight, Grid2X2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ALLYO_BORDER = 'border-[#e5e5e5] dark:border-zinc-800';
export const ALLYO_ACCENT = '#9db669';

export interface AllyoDeliverableScene {
    id: string;
    label: string;
    title: string;
    copy: string;
}

interface AllyoDeliverySchema {
    taskType?: string | null;
    structure?: string | null;
    itemLabel?: string | null;
    items?: Array<{
        id?: string;
        position?: number;
        label?: string;
        title?: string;
        copy?: string;
        instructions?: string;
        cta?: string;
    }>;
}

export interface AllyoDeliverable {
    id: string;
    title: string;
    type: string;
    format: string;
    approvalFormat: string;
    software: string;
    scenes: AllyoDeliverableScene[];
}

export interface AllyoTask {
    id: string;
    publicId?: string;
    name: string;
    projectId: string;
    projectName: string;
    credits: number;
    creditsConsumed?: number;
    estimatedHours?: number;
    category: string;
    client: string;
    deadline: string;
    time: string;
    status: 'Iniciar' | 'Em andamento' | 'Em revisão' | 'Alteração' | 'Concluída' | 'Bloqueada' | 'Inativa';
    cam: string;
    creative: string;
    workflowStage?: string;
    dependsOn?: string[];
    requiresClientApproval?: boolean;
    dependencyBlocked?: boolean;
    delivery?: string | null;
    version?: string | null;
    taskType?: string | null;
    deliverables?: AllyoDeliverable[];
    files?: any[];
    briefing?: {
        inheritedFromProject: boolean;
        catalogCode?: string | null;
        overview?: string | null;
        objective?: string | null;
        audience?: string | null;
        tone?: string | null;
        deliverables: string[];
        formats: string[];
        creativeDirection: string[];
        references?: string;
        referenceLinks?: string[];
        deliverySchema?: AllyoDeliverySchema;
    };
    feedback?: {
        id?: string;
        rating: number;
        comment?: string | null;
        createdAt?: string;
    } | null;
}

export const numericTaskId = (value: string) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
    return String(100000 + ((hash >>> 0) % 900000));
};

const mapTaskStatus = (status: string): AllyoTask['status'] => {
    const statusMap: Record<string, AllyoTask['status']> = {
        'A iniciar': 'Iniciar',
        'Rascunho': 'Iniciar',
        'Em andamento': 'Em andamento',
        'Em revisão': 'Em revisão',
        'Alteração': 'Alteração',
        'Em alteração': 'Alteração',
        'Concluído': 'Concluída',
        'Concluída': 'Concluída',
        'Bloqueada': 'Bloqueada',
        'Inativa': 'Inativa',
    };
    return statusMap[status] || 'Em andamento';
};

const demandDeliverables = (source: any): AllyoDeliverable[] | undefined => Array.isArray(source?.deliverables)
    ? source.deliverables.map((deliverable: any, idx: number) => {
        const title = typeof deliverable === 'string' ? deliverable : deliverable.title || `Entregável ${idx + 1}`;
        const inferredType = String(typeof deliverable === 'string' ? deliverable : deliverable.type || '').toLowerCase().includes('carrossel') ? 'Carrossel' : 'Estático';
        return {
            id: typeof deliverable === 'object' && deliverable.id ? String(deliverable.id) : `deliv-${idx}`,
            title,
            type: typeof deliverable === 'object' && deliverable.type ? String(deliverable.type) : inferredType,
            format: typeof deliverable === 'object' && deliverable.format ? String(deliverable.format) : 'Conforme briefing',
            approvalFormat: typeof deliverable === 'object' && deliverable.approvalFormat ? String(deliverable.approvalFormat) : 'Conforme briefing',
            software: typeof deliverable === 'object' && deliverable.software ? String(deliverable.software) : 'Conforme especialidade',
            scenes: typeof deliverable === 'object' && Array.isArray(deliverable.scenes) ? deliverable.scenes : [],
        };
    })
    : undefined;

const structuredDemandDeliverables = (task: any): AllyoDeliverable[] | undefined => {
    const schema = (task?.deliverySchema || task?.briefing?.deliverySchema) as AllyoDeliverySchema | undefined;
    if (!schema || !Array.isArray(schema.items) || schema.items.length === 0) return undefined;
    const formats = Array.isArray(task?.briefing?.formats) ? task.briefing.formats.map(String) : [];
    const format = formats.find((value: string) => /^Dimens[aã]o:/i.test(value))?.replace(/^Dimens[aã]o:\s*/i, '') || 'Conforme briefing';
    const approvalFormat = formats.find((value: string) => /^Arquivo final:/i.test(value))?.replace(/^Arquivo final:\s*/i, '') || 'Conforme briefing';
    const software = formats.find((value: string) => /^Arquivo aberto:/i.test(value))?.replace(/^Arquivo aberto:\s*/i, '') || 'Conforme especialidade';
    const typeLabels: Record<string, string> = {
        carousel: 'Carrossel', presentation: 'Apresentação', storyboard: 'Storyboard', landing: 'Landing page', document: 'Documento', 'image-set': 'Imagens', generic: 'Entrega',
    };
    return [{
        id: `structured-${task.id || 'task'}`,
        title: task.title || typeLabels[String(schema.taskType)] || 'Entrega',
        type: typeLabels[String(schema.taskType)] || 'Entrega',
        format,
        approvalFormat,
        software: software.toLocaleLowerCase('pt-BR') === 'não solicitado' ? 'Não solicitado' : software,
        scenes: schema.items
            .slice()
            .sort((left, right) => Number(left.position || 0) - Number(right.position || 0))
            .map((item, index) => ({
                id: String(item.id || index + 1),
                label: String(item.label || `${schema.itemLabel || 'Item'} ${index + 1}`),
                title: String(item.title || item.label || `${schema.itemLabel || 'Item'} ${index + 1}`),
                copy: [
                    item.copy ? String(item.copy) : 'Sem texto informado',
                    item.instructions ? `Direção visual: ${item.instructions}` : '',
                    item.cta ? `CTA: ${item.cta}` : '',
                ].filter(Boolean).join('\n\n'),
            })),
    }];
};

export function mapDemandToTasks(demand: any): AllyoTask[] {
    const projectCreative = Array.isArray(demand.team) && demand.team[0] ? demand.team[0] : 'A definir';
    const client = demand.workspace?.name || 'Cliente Allyo';
    const sourceTasks = Array.isArray(demand.tasksList) && demand.tasksList.length > 0
        ? demand.tasksList
        : [{ id: demand.id, projectId: demand.id, title: demand.name, team: demand.service || 'Design', status: demand.status }];

    return sourceTasks.map((task: any) => ({
        id: task.id,
        publicId: task.publicId || numericTaskId(task.id),
        name: task.title || demand.name,
        projectId: demand.id,
        projectName: demand.name,
        credits: Math.max(0.01, Number(task.credits ?? 1)),
        creditsConsumed: Number(task.creditsConsumed || 0),
        estimatedHours: Number(task.estimatedHours ?? (Number(task.credits ?? 1) * 12)),
        category: task.team || demand.service || 'Design',
        client,
        deadline: (() => {
            const value = new Date(task.deadlineAt || demand.deadline || demand.createdAt || Date.now());
            return Number.isNaN(value.getTime()) ? 'A definir' : value.toLocaleDateString('pt-BR');
        })(),
        time: (() => {
            const value = new Date(task.deadlineAt || demand.deadline || '');
            return Number.isNaN(value.getTime()) ? 'A definir' : `${value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')}min`;
        })(),
        status: mapTaskStatus(task.status || demand.status),
        cam: 'Marina',
        creative: task.assignee || projectCreative,
        workflowStage: task.workflowStage || 'Produção',
        dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
        requiresClientApproval: Boolean(task.requiresClientApproval),
        dependencyBlocked: Boolean(task.dependencyBlocked),
        delivery: task.delivery,
        version: task.version,
        taskType: task.taskType || task.deliverySchema?.taskType || task.briefing?.deliverySchema?.taskType || task.briefing?.taskType || null,
        deliverables: structuredDemandDeliverables(task) || demandDeliverables(task.briefing) || (sourceTasks.length === 1 ? demandDeliverables(demand.briefing) : undefined),
        briefing: task.briefing ? {
            ...task.briefing,
            referenceLinks: Array.isArray(task.briefing.referenceLinks) && task.briefing.referenceLinks.length > 0
                ? task.briefing.referenceLinks
                : Array.isArray(demand.briefing?.referenceLinks)
                ? demand.briefing.referenceLinks
                : [],
        } : (demand.briefing ? {
            inheritedFromProject: true,
            ...demand.briefing,
            deliverables: Array.isArray(demand.briefing.deliverables) ? demand.briefing.deliverables : [],
            formats: Array.isArray(demand.briefing.formats) ? demand.briefing.formats : [],
            creativeDirection: Array.isArray(demand.briefing.creativeDirection) ? demand.briefing.creativeDirection : [],
            referenceLinks: Array.isArray(demand.briefing.referenceLinks) ? demand.briefing.referenceLinks : [],
        } : undefined),
        files: (Array.isArray(task.files) && task.files.length > 0 ? task.files : demand.files) || [],
        feedback: task.feedback || null,
    }));
}

export function mapDemandToTask(demand: any): AllyoTask {
    return mapDemandToTasks(demand)[0];
}

export const ALLYO_TASKS: AllyoTask[] = [
    { id: '123456', name: 'KV campanha de lançamento', projectId: 'project-fauves-launch', projectName: 'Campanha de lançamento 2027', credits: 1, category: 'Design', client: 'Fauves', deadline: '20/12/2026', time: '10h30min', status: 'Iniciar', cam: 'Marina', creative: 'Levy', feedback: { rating: 5, comment: 'Excelente entrega! Visual limpo, tipografia perfeita e rápida aprovação.' } },
    { id: '123457', name: 'Storyboard para filme manifesto', projectId: 'project-asterysko-security', projectName: 'Campanha Segurança 24h', credits: 1, category: 'Storyboard', client: 'Asterysko', deadline: '21/12/2026', time: '14h00min', status: 'Em andamento', cam: 'Marina', creative: 'Joana', feedback: { rating: 5, comment: 'Storyboard muito bem estruturado e detalhado.' } },
    { id: '123458', name: 'Motion para redes sociais', projectId: 'project-tokyon-institutional', projectName: 'Campanha institucional', credits: 1, category: 'Motion', client: 'Tokyon', deadline: '22/12/2026', time: '16h45min', status: 'Em revisão', cam: 'Bruno', creative: 'Levy', feedback: { rating: 5, comment: 'Motion fluido e objetivo, aprovado com louvor!' } },
    { id: '123459', name: 'Edição do case anual', projectId: 'project-fauves-launch', projectName: 'Campanha de lançamento 2027', credits: 1, category: 'Vídeo', client: 'Fauves', deadline: '23/12/2026', time: '09h00min', status: 'Iniciar', cam: 'Bruno', creative: 'Caio' },
    { id: '123460', name: 'Landing page institucional', projectId: 'project-manyspace-brand', projectName: 'Reposicionamento digital', credits: 1, category: 'Digital', client: 'ManySpace', deadline: '26/12/2026', time: '12h00min', status: 'Concluída', cam: 'Marina', creative: 'Joana', feedback: { rating: 4, comment: 'Ótima arquitetura de informação e fluidez visual.' } },
    {
        id: '123461',
        name: 'Peças para mídia paga',
        projectId: 'project-asterysko-security',
        projectName: 'Campanha Segurança 24h',
        credits: 1,
        category: 'Design',
        client: 'Asterysko',
        deadline: '28/12/2026',
        time: '11h15min',
        status: 'Em andamento',
        cam: 'Bruno',
        creative: 'Caio',
        deliverables: [
            {
                id: 'pedido-01', title: 'Carrossel · Rotina mais segura', type: 'Carrossel', format: '1080 × 1350 px', approvalFormat: 'PNG', software: 'Photoshop',
                scenes: [
                    { id: '01', label: 'Capa', title: 'Teste sua rotina de segurança', copy: 'Some 1 ponto para cada SIM e descubra seu resultado no final.' },
                    { id: '02', label: 'Pergunta 1', title: 'Você monitora os acessos?', copy: 'Mostre como pequenas ações ajudam a construir uma rotina mais segura.' },
                    { id: '03', label: 'Pergunta 2', title: 'Sua equipe sabe como agir?', copy: 'Reforce a importância de processos claros para situações inesperadas.' },
                    { id: '04', label: 'Resultado', title: 'Confira sua pontuação', copy: 'Apresente as faixas de resultado de maneira simples e visual.' },
                    { id: '05', label: 'Encerramento', title: 'Segurança começa com prevenção', copy: 'Finalize com a solução e um CTA para conversar com um especialista.' },
                ],
            },
            {
                id: 'pedido-02', title: 'Carrossel · Monitoramento 24h', type: 'Carrossel', format: '1080 × 1350 px', approvalFormat: 'PNG', software: 'Photoshop',
                scenes: [
                    { id: '01', label: 'Capa', title: 'Proteção que não pausa', copy: 'Introduza o monitoramento contínuo com uma mensagem direta.' },
                    { id: '02', label: 'Benefício', title: 'Acompanhamento em tempo real', copy: 'Destaque visibilidade e resposta rápida em qualquer horário.' },
                    { id: '03', label: 'Tecnologia', title: 'Tudo conectado', copy: 'Mostre os dispositivos trabalhando de forma integrada.' },
                    { id: '04', label: 'Confiança', title: 'Uma central pronta para agir', copy: 'Reforce o apoio de especialistas quando um alerta acontece.' },
                    { id: '05', label: 'CTA', title: 'Cuide do que importa', copy: 'Convide o público a conhecer a solução completa.' },
                ],
            },
            {
                id: 'pedido-03', title: 'Estático · Resposta rápida', type: 'Estático', format: '1080 × 1350 px', approvalFormat: 'PNG', software: 'Photoshop',
                scenes: [{ id: '01', label: 'Peça única', title: 'Não é só ver. É poder agir.', copy: 'Câmera em destaque e mensagem de resposta rápida com leitura imediata.' }],
            },
            {
                id: 'pedido-04', title: 'Estático · Controle pelo aplicativo', type: 'Estático', format: '1080 × 1350 px', approvalFormat: 'PNG', software: 'Photoshop',
                scenes: [{ id: '01', label: 'Peça única', title: 'Sua segurança na palma da mão', copy: 'Apresente o aplicativo e os principais controles disponíveis ao usuário.' }],
            },
            {
                id: 'pedido-05', title: 'Estático · Fale com um especialista', type: 'Estático', format: '1080 × 1350 px', approvalFormat: 'PNG', software: 'Photoshop',
                scenes: [{ id: '01', label: 'Peça única', title: 'Proteção sob medida para sua rotina', copy: 'Peça de conversão com CTA direto para atendimento.' }],
            },
        ],
    },
    { id: '123462', name: 'Apresentação comercial', projectId: 'project-tokyon-institutional', projectName: 'Campanha institucional', credits: 1, category: 'Catálogo', client: 'Tokyon', deadline: '30/12/2026', time: '15h30min', status: 'Iniciar', cam: 'Marina', creative: 'Levy' },
    { id: '123463', name: 'Desdobramento de identidade', projectId: 'project-manyspace-brand', projectName: 'Reposicionamento digital', credits: 1, category: 'Branding', client: 'ManySpace', deadline: '05/01/2027', time: '17h00min', status: 'Em revisão', cam: 'Bruno', creative: 'Joana' },
];

export const formatTaskCredits = (credits: number) => `${credits.toLocaleString('pt-BR')} ${credits === 1 ? 'crédito' : 'créditos'}`;

export const todayLabel = () => {
    const now = new Date();
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}. de ${now.getFullYear()}`;
};

export const AllyoPageHeader = ({ title, actions }: { title: string; actions?: ReactNode }) => (
    <header className={`sticky top-0 z-20 flex h-[75px] shrink-0 items-center justify-between border-b bg-white/95 px-5 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
        <h1 className="truncate font-season text-[22px] font-normal text-black dark:text-white">{title}</h1>
        <div className="flex items-center gap-3">
            {actions}
            <div className="hidden items-center gap-[5px] text-black md:flex dark:text-zinc-300">
                <CalendarDays size={18} className="text-[#9f9f9f]" />
                <span className="text-sm font-semibold">{todayLabel()}</span>
            </div>
        </div>
    </header>
);

const statusColor: Record<AllyoTask['status'], string> = {
    'Iniciar': 'text-[#9db669]',
    'Em andamento': 'text-[#2a2ad7] dark:text-indigo-300',
    'Em revisão': 'text-[#fd6b32]',
    'Alteração': 'text-[#ff7a45]',
    'Concluída': 'text-emerald-600 dark:text-emerald-400',
    'Bloqueada': 'text-[#737a72] dark:text-zinc-400',
    'Inativa': 'text-red-500 dark:text-red-400',
};

export const TaskRow = ({ task }: { task: AllyoTask }) => {
    const [, setSearchParams] = useSearchParams();

    const openTask = () => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'task-detail');
            next.set('task', task.id);
            return next;
        });
    };

    return (
        <div className={`border-t ${ALLYO_BORDER}`}>
            <button
                type="button"
                onClick={openTask}
                className="grid min-h-[78px] w-full grid-cols-[minmax(220px,1.35fr)_76px_70px_90px_minmax(155px,1fr)_105px_18px] items-center gap-5 px-5 py-4 text-left transition-colors hover:bg-[#fafbf8] sm:px-[30px] dark:hover:bg-zinc-900/70 max-lg:grid-cols-[minmax(190px,1fr)_76px_minmax(155px,1fr)_105px_18px] max-md:grid-cols-[minmax(190px,1fr)_76px_105px_18px] max-sm:grid-cols-[minmax(0,1fr)_68px_18px]"
            >
                <span className="flex min-w-0 items-center gap-[10px]">
                    <span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full border border-[#9db669] text-[#9db669]" aria-hidden="true">
                        <Grid2X2 size={15} strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 text-sm font-medium leading-5 text-black dark:text-white">
                        <strong className="block truncate font-medium">{task.name}</strong>
                        <span className="block truncate text-[11px] text-[#777] dark:text-zinc-400">{task.projectName} · {task.category}</span>
                    </span>
                </span>
                <span className="min-w-0" aria-label={formatTaskCredits(task.credits)}>
                    <span className="block text-[9px] font-medium leading-none text-[#616161] dark:text-zinc-500">CRÉDITOS</span>
                    <span className="mt-[10px] flex items-center gap-1.5 text-sm font-medium leading-none text-black dark:text-zinc-200"><span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#9db669] text-[9px] font-bold text-[#72894c] dark:text-[#d0f08e]">C</span>{task.credits.toLocaleString('pt-BR')}</span>
                </span>
                <DataCell label="ID" value={task.publicId || task.id} className="max-lg:hidden" />
                <DataCell label="CLIENTE" value={task.client} className="max-lg:hidden" />
                <DataCell label="DEADLINE" value={`${task.deadline} • ${task.time}`} className="max-md:hidden" />
                <DataCell label="STATUS" value={task.status} valueClassName={statusColor[task.status]} className="max-sm:hidden" />
                <ChevronRight size={18} className="text-[#9f9f9f]" />
            </button>
        </div>
    );
};

export const DataCell = ({ label, value, className = '', valueClassName = '' }: { label: string; value: string; className?: string; valueClassName?: string }) => (
    <span className={`min-w-0 ${className}`}>
        <span className="block text-[9px] font-medium leading-none text-[#616161] dark:text-zinc-500">{label}</span>
        <span className={`mt-[10px] block truncate text-sm font-medium leading-none text-black dark:text-zinc-200 ${valueClassName}`}>{value}</span>
    </span>
);

export const FilterSelect = ({ label, value, options, onChange, includeAll = true }: { label: string; value: string; options: string[]; onChange: (value: string) => void; includeAll?: boolean }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const visibleValue = value === 'Todos' ? label : value;

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    const select = (nextValue: string) => {
        onChange(nextValue);
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-controls={menuId}
                className={`flex min-h-9 items-center gap-[10px] rounded-full border bg-white py-2 pl-[15px] pr-[13px] text-xs font-semibold outline-none transition-all dark:bg-zinc-900 dark:text-white ${open ? 'border-[#9db669] shadow-[0_0_0_3px_rgba(157,182,105,.13)] dark:border-[#d0f08e]' : 'border-[#e5e5e5] hover:border-[#b9ca94] dark:border-zinc-700'}`}
            >
                <span className={`max-w-[180px] truncate ${value === 'Todos' ? 'text-black dark:text-white' : 'text-[#72844d] dark:text-[#d0f08e]'}`}>{visibleValue}</span>
                <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? 'rotate-180 text-[#9db669]' : 'text-black dark:text-zinc-400'}`} />
            </button>

            {open && (
                <div id={menuId} role="listbox" className="absolute left-0 top-[calc(100%+8px)] z-[80] min-w-[210px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white p-1.5 shadow-[0_18px_45px_rgba(19,31,21,.16)] animate-in fade-in zoom-in-95 duration-150 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="px-3 pb-2 pt-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#9f9f9f]">{label}</div>
                    {includeAll && (
                        <button type="button" role="option" aria-selected={value === 'Todos'} onClick={() => select('Todos')} className={`flex w-full items-center justify-between gap-4 rounded-[9px] px-3 py-2.5 text-left text-xs transition-colors ${value === 'Todos' ? 'bg-[#f3f7ea] font-semibold text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]' : 'text-black hover:bg-[#f7f7f5] dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>
                            <span>Todos</span>{value === 'Todos' && <Check size={14} />}
                        </button>
                    )}
                    {options.filter((option, index, list) => list.indexOf(option) === index).map((option) => (
                        <button key={option} type="button" role="option" aria-selected={value === option} onClick={() => select(option)} className={`flex w-full items-center justify-between gap-4 rounded-[9px] px-3 py-2.5 text-left text-xs transition-colors ${value === option ? 'bg-[#f3f7ea] font-semibold text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]' : 'text-black hover:bg-[#f7f7f5] dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>
                            <span className="truncate">{option}</span>{value === option && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
