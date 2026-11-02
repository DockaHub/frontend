import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronUp, Circle, Clock3, LockKeyhole, PencilLine, RotateCcw } from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';
import type { AllyoCatalogProduct, AllyoDemand } from '../../../../services/allyoService';
import type { AllyoFlowTask, AllyoFlowTaskStatus, AllyoProject } from './allyoProjects';
import AllyoProjectFlowEditor from './AllyoProjectFlowEditor';

const statusCopy: Record<AllyoFlowTaskStatus, { label: string; className: string; icon: typeof Check }> = {
    done: { label: 'Concluída', className: 'bg-[#eaf4dd] text-[#617740] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]', icon: Check },
    in_progress: { label: 'Em andamento', className: 'bg-[#eef0ff] text-[#3f48a9] dark:bg-indigo-500/10 dark:text-indigo-300', icon: RotateCcw },
    available: { label: 'Liberada', className: 'bg-[#f1f3ed] text-[#65705f] dark:bg-zinc-800 dark:text-zinc-300', icon: Circle },
    blocked: { label: 'Bloqueada', className: 'bg-[#f4f4f2] text-[#7f857e] dark:bg-zinc-800 dark:text-zinc-400', icon: LockKeyhole },
    review: { label: 'Em revisão', className: 'bg-[#fff0e9] text-[#b65c31] dark:bg-orange-500/10 dark:text-orange-300', icon: Clock3 },
};

export interface FlowColumn {
    depth: number;
    tasks: AllyoFlowTask[];
}

export const buildFlowColumns = (tasks: AllyoFlowTask[]): FlowColumn[] => {
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const memo = new Map<string, number>();
    const visiting = new Set<string>();
    const depthOf = (task: AllyoFlowTask): number => {
        const cached = memo.get(task.id);
        if (cached !== undefined) return cached;
        if (visiting.has(task.id)) return 0;
        visiting.add(task.id);
        const dependencies = (task.dependsOn || []).map((id) => byId.get(id)).filter((item): item is AllyoFlowTask => Boolean(item));
        const depth = dependencies.length > 0 ? Math.max(...dependencies.map((dependency) => depthOf(dependency) + 1)) : 0;
        visiting.delete(task.id);
        memo.set(task.id, depth);
        return depth;
    };
    const grouped = new Map<number, AllyoFlowTask[]>();
    tasks.forEach((task) => {
        const depth = depthOf(task);
        grouped.set(depth, [...(grouped.get(depth) || []), task]);
    });
    return Array.from(grouped.entries()).sort(([left], [right]) => left - right).map(([depth, columnTasks]) => ({ depth, tasks: columnTasks }));
};

interface AllyoProjectFlowProps {
    project: AllyoProject;
    demand: AllyoDemand;
    currentTaskId: string;
    onOpenTask: (taskId: string) => void;
    isClientView: boolean;
    canManageFlow: boolean;
    catalogProducts: AllyoCatalogProduct[];
    onDemandUpdated: (demand: AllyoDemand) => void;
}

const AllyoProjectFlow = ({ project, demand, currentTaskId, onOpenTask, isClientView, canManageFlow, catalogProducts, onDemandUpdated }: AllyoProjectFlowProps) => {
    const [open, setOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const tasks = useMemo(() => project.stages.flatMap((stage) => stage.tasks), [project.stages]);
    const inProgress = tasks.filter((task) => task.status === 'in_progress' || task.status === 'review').length;
    const blocked = tasks.filter((task) => task.status === 'blocked').length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const totalCredits = tasks.reduce((total, task) => total + task.credits, 0);

    if (isClientView) return <ClientProjectJourney project={project} currentTaskId={currentTaskId} />;

    return <>
        <section className={`border-b bg-[#fbfcf9] dark:bg-zinc-950 ${ALLYO_BORDER}`} aria-labelledby="project-flow-title">
            <div className="flex w-full items-center gap-3 px-5 py-4 sm:px-[30px]">
                <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf3e2] text-[#75884f] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><ArrowRight size={15} /></span>
                    <span className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#869268]">Fluxo inteligente do projeto</span><strong id="project-flow-title" className="mt-0.5 block truncate text-sm font-semibold">{project.name}</strong></span>
                    <span className="hidden items-center gap-3 text-[11px] text-[#727972] lg:flex"><span>{completed} concluídas</span><span className="h-1 w-1 rounded-full bg-[#b7bdb7]" /><span>{inProgress} em andamento</span><span className="h-1 w-1 rounded-full bg-[#b7bdb7]" /><span>{blocked} bloqueadas</span></span>
                    <span className="hidden text-[11px] font-semibold text-[#69745d] sm:inline">{open ? 'Recolher' : 'Ver fluxo'}</span>{open ? <ChevronUp size={17} className="shrink-0 text-[#858b85]" /> : <ChevronDown size={17} className="shrink-0 text-[#858b85]" />}
                </button>
                {canManageFlow && <button type="button" onClick={() => setEditorOpen(true)} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-[#cad5bf] bg-white px-3.5 text-[11px] font-bold text-[#526b35] transition hover:border-[#8ea269] hover:bg-[#f5f8ef] dark:border-zinc-700 dark:bg-zinc-900 dark:text-[#cce18e]"><PencilLine size={13} /> Editar fluxo</button>}
            </div>
            {!open && <CompactFlow project={project} currentTaskId={currentTaskId} inProgress={inProgress} blocked={blocked} onOpenTask={onOpenTask} />}
            {open && <div className={`border-t px-5 pb-6 pt-5 sm:px-[30px] ${ALLYO_BORDER}`}><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-xs leading-5 text-[#777f78] dark:text-zinc-400">As conexões representam dependências reais. Tarefas empilhadas na mesma coluna estão liberadas para acontecer em paralelo.</p><div className="flex items-center gap-2 text-[11px] font-semibold"><span className="rounded-full border border-[#dce4d1] bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">{tasks.length} tarefas</span><span className="rounded-full border border-[#dce4d1] bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">{totalCredits.toLocaleString('pt-BR')} créditos</span><span className="rounded-full border border-[#dce4d1] bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">Entrega {project.deadline}</span></div></div><ProjectDependencyGraph tasks={tasks} currentTaskId={currentTaskId} onOpenTask={onOpenTask} /></div>}
        </section>
        {editorOpen && <AllyoProjectFlowEditor demand={demand} catalogProducts={catalogProducts} onClose={() => setEditorOpen(false)} onSaved={(updated) => { onDemandUpdated(updated); setEditorOpen(false); }} />}
    </>;
};

const ClientProjectJourney = ({ project, currentTaskId }: { project: AllyoProject; currentTaskId: string }) => <section className={`border-b bg-[#fbfcf9] px-5 py-5 sm:px-[30px] dark:bg-zinc-950 ${ALLYO_BORDER}`} aria-label="Andamento do projeto"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#869268]">Andamento do projeto</span><h2 className="mt-1 text-sm font-semibold">{project.name}</h2></div><p className="text-[11px] text-[#777f78] dark:text-zinc-400">Acompanhe os marcos da entrega e as etapas que precisam da sua aprovação.</p></div><div className="mt-4 overflow-x-auto pb-1"><div className="flex min-w-max items-stretch">{project.stages.map((stage, index) => {
    const current = stage.tasks.some((task) => task.id === currentTaskId);
    const done = stage.tasks.length > 0 && stage.tasks.every((task) => task.status === 'done');
    const needsApproval = stage.tasks.some((task) => task.status === 'review');
    const active = stage.tasks.some((task) => task.status === 'in_progress');
    const label = done ? 'Concluída' : needsApproval ? 'Sua aprovação' : active || current ? 'Em preparação' : 'Próxima etapa';
    return <div className="flex items-center" key={stage.id}>{index > 0 && <span className="mx-2 flex w-8 items-center"><span className="h-px flex-1 bg-[#ccd5c5]" /><ArrowRight size={11} className="-ml-px text-[#9ca993]" /></span>}<div className={`min-w-[178px] rounded-[10px] border px-3.5 py-3 ${needsApproval ? 'border-[#dca06d] bg-[#fff8f2]' : current ? 'border-[#78944a] bg-[#f4f8ec]' : done ? 'border-[#cdddbc] bg-[#f7faf2]' : 'border-[#e0e4dd] bg-white dark:border-zinc-700 dark:bg-zinc-900'}`}><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#858d85]">Etapa {index + 1}</span><strong className="mt-1 block text-xs">{stage.title}</strong><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${needsApproval ? 'bg-[#ffead8] text-[#9a542d]' : done ? 'bg-[#e7f2dc] text-[#5d743b]' : 'bg-[#eef1ec] text-[#697169]'}`}>{label}</span></div></div>;
})}</div></div></section>;

const CompactFlow = ({ project, currentTaskId, inProgress, blocked, onOpenTask }: { project: AllyoProject; currentTaskId: string; inProgress: number; blocked: number; onOpenTask: (taskId: string) => void }) => <div className="overflow-x-auto px-5 pb-4 sm:px-[30px]"><div className={`flex min-w-max items-center rounded-[10px] border bg-white px-3 py-2 dark:bg-zinc-900 ${ALLYO_BORDER}`}>{buildFlowColumns(project.stages.flatMap((stage) => stage.tasks)).map((column, columnIndex) => <div key={column.depth} className="flex items-center">{columnIndex > 0 && <span className="mx-2 flex w-7 items-center"><span className="h-px flex-1 bg-[#dce1d8] dark:bg-zinc-700" /><ArrowRight size={10} className="-ml-px text-[#aeb5ad]" /></span>}<span className="mr-2 text-[9px] font-bold uppercase tracking-[.06em] text-[#858d85]">{columnIndex === 0 ? 'Início' : `Etapa ${columnIndex + 1}`}</span><span className="flex items-center gap-1">{column.tasks.map((task) => { const status = statusCopy[task.status] || statusCopy.available; const StatusIcon = status.icon; return <button type="button" onClick={() => onOpenTask(task.id)} key={task.id} title={`${task.title} · ${status.label}`} aria-label={`${task.title}: ${status.label}`} className={`inline-flex h-6 w-6 items-center justify-center rounded-[6px] ${status.className} ${task.id === currentTaskId ? 'ring-2 ring-[#78944a] ring-offset-1 dark:ring-offset-zinc-900' : ''}`}><StatusIcon size={11} /></button>; })}</span></div>)}<span className="mx-3 h-5 w-px bg-[#dfe3dc] dark:bg-zinc-700" /><span className="text-[11px] font-medium text-[#555d56] dark:text-zinc-300">{inProgress} em andamento <span className="px-1.5 text-[#a4aaa3]">•</span> {blocked} bloqueadas</span></div></div>;

const ProjectDependencyGraph = ({ tasks, currentTaskId, onOpenTask }: { tasks: AllyoFlowTask[]; currentTaskId: string; onOpenTask: (taskId: string) => void }) => {
    const columns = useMemo(() => buildFlowColumns(tasks), [tasks]);
    const graphRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef(new Map<string, HTMLButtonElement>());
    const [paths, setPaths] = useState<Array<{ id: string; d: string; active: boolean }>>([]);
    useLayoutEffect(() => {
        const updatePaths = () => {
            const graph = graphRef.current;
            if (!graph) return;
            const bounds = graph.getBoundingClientRect();
            const next: Array<{ id: string; d: string; active: boolean }> = [];
            tasks.forEach((task) => (task.dependsOn || []).forEach((dependencyId) => {
                const source = cardRefs.current.get(dependencyId)?.getBoundingClientRect();
                const target = cardRefs.current.get(task.id)?.getBoundingClientRect();
                if (!source || !target) return;
                const startX = source.right - bounds.left;
                const startY = source.top + source.height / 2 - bounds.top;
                const endX = target.left - bounds.left;
                const endY = target.top + target.height / 2 - bounds.top;
                const bend = Math.max(28, (endX - startX) * .45);
                next.push({ id: `${dependencyId}-${task.id}`, d: `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`, active: dependencyId === currentTaskId || task.id === currentTaskId });
            }));
            setPaths(next);
        };
        const frame = requestAnimationFrame(updatePaths);
        const observer = new ResizeObserver(updatePaths);
        if (graphRef.current) observer.observe(graphRef.current);
        window.addEventListener('resize', updatePaths);
        return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', updatePaths); };
    }, [currentTaskId, tasks]);
    const byId = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
    return <div className="overflow-x-auto pb-2"><div ref={graphRef} className="relative grid min-w-max grid-flow-col auto-cols-[minmax(240px,300px)] items-start gap-14 px-1 pb-1"><svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true"><defs><marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#a9b4a2" /></marker><marker id="flow-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#78944a" /></marker></defs>{paths.map((path) => <path key={path.id} d={path.d} fill="none" stroke={path.active ? '#78944a' : '#bdc6b8'} strokeWidth={path.active ? 2 : 1.4} markerEnd={`url(#${path.active ? 'flow-arrow-active' : 'flow-arrow'})`} />)}</svg>{columns.map((column, index) => <div className="relative z-10 min-w-0" key={column.depth}><div className="mb-2.5 flex items-center gap-2 px-1"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#172019] text-[9px] font-bold text-white dark:bg-[#d0f08e] dark:text-[#172019]">{index + 1}</span><strong className="text-[10px] font-bold uppercase tracking-[.08em] text-[#626a63]">{index === 0 ? 'Início' : `Etapa ${index + 1}`}</strong>{column.tasks.length > 1 && <span className="ml-auto rounded-full bg-[#eef2e9] px-2 py-1 text-[8px] font-bold uppercase tracking-[.05em] text-[#667657]">Paralelas</span>}</div><div className="space-y-2">{column.tasks.map((task) => <FlowTaskCard key={task.id} task={task} current={task.id === currentTaskId} tasksById={byId} parallel={column.tasks.length > 1} onOpenTask={onOpenTask} cardRef={(node) => { if (node) cardRefs.current.set(task.id, node); else cardRefs.current.delete(task.id); }} />)}</div></div>)}</div></div>;
};

const FlowTaskCard = ({ task, current, tasksById, parallel, onOpenTask, cardRef }: { task: AllyoFlowTask; current: boolean; tasksById: Map<string, AllyoFlowTask>; parallel: boolean; onOpenTask: (taskId: string) => void; cardRef?: (node: HTMLButtonElement | null) => void }) => {
    const status = statusCopy[task.status] || statusCopy.available;
    const StatusIcon = status.icon;
    const blockers = (task.dependsOn || []).map((id) => { const dependency = tasksById.get(id); return dependency ? `${dependency.title}${dependency.requiresClientApproval ? ' (aprovação do cliente)' : ''}` : null; }).filter((value): value is string => Boolean(value));
    return <button ref={cardRef} type="button" onClick={() => onOpenTask(task.id)} className={`group block min-h-[96px] w-full rounded-[10px] border bg-white p-3 text-left transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78944a] focus-visible:ring-offset-2 dark:bg-zinc-900 ${current ? 'border-2 border-[#78944a] bg-[#f4f8ec] shadow-[0_0_0_3px_rgba(120,148,74,.16)] dark:bg-[#9db669]/10' : task.status === 'blocked' ? 'border-[#e1e5de] opacity-80 hover:border-[#aeb9a6] hover:opacity-100 dark:border-zinc-800' : `${ALLYO_BORDER} hover:border-[#9db669] hover:bg-[#fafcf7] dark:hover:bg-zinc-800`}`} aria-current={current ? 'step' : undefined} aria-label={`Abrir tarefa ${task.title}${current ? ', tarefa atual' : ''}`}><div className="flex items-start justify-between gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold ${status.className}`}><StatusIcon size={10} />{status.label}</span>{current && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#315844] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.06em] text-white shadow-sm"><Circle size={6} fill="currentColor" />Você está aqui</span>}</div><h3 className="mt-2 text-[12px] font-semibold leading-4 text-[#202520] dark:text-zinc-100">{task.title}</h3><p className="mt-0.5 truncate text-[10px] text-[#858b85]">{task.specialty} · {task.assignee}</p><div className="mt-2 flex items-end justify-between gap-2">{task.status === 'blocked' && blockers.length > 0 ? <span className="line-clamp-1 text-[9px] leading-3.5 text-[#8a9089]">Aguarda {blockers.join(' e ')}</span> : parallel ? <span className="text-[9px] text-[#8a9089]">Pode iniciar em paralelo</span> : <span />}<span className="shrink-0 text-[10px] font-semibold text-[#68705f]">C {task.credits.toLocaleString('pt-BR')}</span></div></button>;
};

export default AllyoProjectFlow;
