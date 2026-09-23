import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronRight, Grid2X2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { readTaskActivity, subscribeToTaskActivity } from './allyoTaskActivity';

export const ALLYO_BORDER = 'border-[#e5e5e5] dark:border-zinc-800';
export const ALLYO_ACCENT = '#9db669';

export interface AllyoDeliverableScene {
    id: string;
    label: string;
    title: string;
    copy: string;
}

export interface AllyoDeliverable {
    id: string;
    title: string;
    type: 'Carrossel' | 'Estático';
    format: string;
    approvalFormat: string;
    software: string;
    scenes: AllyoDeliverableScene[];
}

export interface AllyoTask {
    id: string;
    name: string;
    projectId: string;
    projectName: string;
    credits: number;
    category: string;
    client: string;
    deadline: string;
    time: string;
    status: 'Iniciar' | 'Em andamento' | 'Em revisão' | 'Concluída';
    cam: string;
    creative: string;
    deliverables?: AllyoDeliverable[];
}

export function mapDemandToTask(demand: any): AllyoTask {
    const statusMap: Record<string, 'Iniciar' | 'Em andamento' | 'Em revisão' | 'Concluída'> = {
        'Rascunho': 'Iniciar',
        'Em andamento': 'Em andamento',
        'Em revisão': 'Em revisão',
        'Concluído': 'Concluída',
        'Concluída': 'Concluída',
    };

    const status = statusMap[demand.status] || 'Em andamento';
    const creative = Array.isArray(demand.team) && demand.team[0] ? demand.team[0] : 'Levy';
    const client = demand.workspace?.name || 'Cliente Allyo';
    const category = demand.service || 'Design';
    const deliverables = Array.isArray(demand.briefing?.deliverables)
        ? demand.briefing.deliverables.map((d: any, idx: number) => ({
            id: `deliv-${idx}`,
            title: typeof d === 'string' ? d : d.title || `Entregável ${idx + 1}`,
            type: (typeof d === 'string' && d.toLowerCase().includes('carrossel')) ? 'Carrossel' as const : 'Estático' as const,
            format: '1080x1350',
            approvalFormat: 'PNG',
            software: 'Figma',
            scenes: [],
        }))
        : undefined;

    return {
        id: demand.id,
        name: demand.name,
        projectId: demand.id,
        projectName: demand.name,
        credits: demand.tasks || 1,
        category,
        client,
        deadline: demand.deadline || new Date(demand.createdAt || Date.now()).toLocaleDateString('pt-BR'),
        time: '18h00min',
        status,
        cam: 'Marina',
        creative,
        deliverables,
    };
}

export const ALLYO_TASKS: AllyoTask[] = [
    { id: '123456', name: 'KV campanha de lançamento', projectId: 'project-fauves-launch', projectName: 'Campanha de lançamento 2027', credits: 1, category: 'Design', client: 'Fauves', deadline: '20/12/2026', time: '10h30min', status: 'Iniciar', cam: 'Marina', creative: 'Levy' },
    { id: '123457', name: 'Storyboard para filme manifesto', projectId: 'project-asterysko-security', projectName: 'Campanha Segurança 24h', credits: 1, category: 'Storyboard', client: 'Asterysko', deadline: '21/12/2026', time: '14h00min', status: 'Em andamento', cam: 'Marina', creative: 'Joana' },
    { id: '123458', name: 'Motion para redes sociais', projectId: 'project-tokyon-institutional', projectName: 'Campanha institucional', credits: 1, category: 'Motion', client: 'Tokyon', deadline: '22/12/2026', time: '16h45min', status: 'Em revisão', cam: 'Bruno', creative: 'Levy' },
    { id: '123459', name: 'Edição do case anual', projectId: 'project-fauves-launch', projectName: 'Campanha de lançamento 2027', credits: 1, category: 'Vídeo', client: 'Fauves', deadline: '23/12/2026', time: '09h00min', status: 'Iniciar', cam: 'Bruno', creative: 'Caio' },
    { id: '123460', name: 'Landing page institucional', projectId: 'project-manyspace-brand', projectName: 'Reposicionamento digital', credits: 1, category: 'Digital', client: 'ManySpace', deadline: '26/12/2026', time: '12h00min', status: 'Concluída', cam: 'Marina', creative: 'Joana' },
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

export const AllyoPageHeader = ({ title }: { title: string }) => (
    <header className={`sticky top-0 z-20 flex h-[75px] shrink-0 items-center justify-between border-b bg-white/95 px-5 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
        <h1 className="truncate font-season text-[22px] font-normal text-black dark:text-white">{title}</h1>
        <div className="flex items-center gap-[5px] text-black dark:text-zinc-300">
            <CalendarDays size={18} className="text-[#9f9f9f]" />
            <span className="hidden text-sm font-semibold sm:inline">{todayLabel()}</span>
        </div>
    </header>
);

const statusColor: Record<AllyoTask['status'], string> = {
    'Iniciar': 'text-[#9db669]',
    'Em andamento': 'text-[#2a2ad7] dark:text-indigo-300',
    'Em revisão': 'text-[#fd6b32]',
    'Concluída': 'text-emerald-600 dark:text-emerald-400',
};

export const TaskRow = ({ task }: { task: AllyoTask }) => {
    const [, setSearchParams] = useSearchParams();
    const [clientChanges, setClientChanges] = useState(() => readTaskActivity(task.id).filter((item) => item.type === 'client_file_change').length);

    useEffect(() => subscribeToTaskActivity(task.id, () => {
        setClientChanges(readTaskActivity(task.id).filter((item) => item.type === 'client_file_change').length);
    }), [task.id]);

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
                        {clientChanges > 0 && <span className="mt-1 inline-block rounded-full bg-[#e6f2e8] px-2 py-1 text-[10px] font-semibold text-[#34704a] dark:bg-emerald-900/40 dark:text-emerald-200">{clientChanges} {clientChanges === 1 ? 'alteração do cliente' : 'alterações do cliente'}</span>}
                    </span>
                </span>
                <span className="min-w-0" aria-label={formatTaskCredits(task.credits)}>
                    <span className="block text-[9px] font-medium leading-none text-[#616161] dark:text-zinc-500">CRÉDITOS</span>
                    <span className="mt-[10px] flex items-center gap-1.5 text-sm font-medium leading-none text-black dark:text-zinc-200"><span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#9db669] text-[9px] font-bold text-[#72894c] dark:text-[#d0f08e]">C</span>{task.credits.toLocaleString('pt-BR')}</span>
                </span>
                <DataCell label="ID" value={task.id} className="max-lg:hidden" />
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
