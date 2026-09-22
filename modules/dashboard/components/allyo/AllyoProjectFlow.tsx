import { useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronUp, Circle, Clock3, LockKeyhole, RotateCcw } from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';
import type { AllyoFlowTask, AllyoFlowTaskStatus, AllyoProject } from './allyoProjects';

const statusCopy: Record<AllyoFlowTaskStatus, { label: string; className: string; icon: typeof Check }> = {
    done: { label: 'Concluída', className: 'bg-[#eaf4dd] text-[#617740] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]', icon: Check },
    in_progress: { label: 'Em andamento', className: 'bg-[#eef0ff] text-[#3f48a9] dark:bg-indigo-500/10 dark:text-indigo-300', icon: RotateCcw },
    available: { label: 'Liberada', className: 'bg-[#f1f3ed] text-[#65705f] dark:bg-zinc-800 dark:text-zinc-300', icon: Circle },
    blocked: { label: 'Bloqueada', className: 'bg-[#f4f4f2] text-[#7f857e] dark:bg-zinc-800 dark:text-zinc-400', icon: LockKeyhole },
    review: { label: 'Em revisão', className: 'bg-[#fff0e9] text-[#b65c31] dark:bg-orange-500/10 dark:text-orange-300', icon: Clock3 },
};

const AllyoProjectFlow = ({ project, currentTaskId }: { project: AllyoProject; currentTaskId: string }) => {
    const [open, setOpen] = useState(true);
    const tasks = useMemo(() => project.stages.flatMap((stage) => stage.tasks), [project.stages]);
    const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
    const inProgress = tasks.filter((task) => task.status === 'in_progress' || task.status === 'review').length;
    const blocked = tasks.filter((task) => task.status === 'blocked').length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const totalCredits = tasks.reduce((total, task) => total + task.credits, 0);

    return (
        <section className={`border-b bg-[#fbfcf9] dark:bg-zinc-950 ${ALLYO_BORDER}`} aria-labelledby="project-flow-title">
            <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-[30px]" aria-expanded={open}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3e2] text-[#75884f] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><ArrowRight size={17} /></span>
                <span className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#869268]">Fluxo inteligente do projeto</span>
                    <strong id="project-flow-title" className="mt-1 block truncate font-season text-lg font-normal">{project.name}</strong>
                </span>
                <span className="hidden items-center gap-3 text-xs text-[#727972] md:flex"><span>{completed} concluídas</span><span className="h-1 w-1 rounded-full bg-[#b7bdb7]" /><span>{inProgress} em andamento</span><span className="h-1 w-1 rounded-full bg-[#b7bdb7]" /><span>{blocked} bloqueadas</span></span>
                {open ? <ChevronUp size={17} className="shrink-0 text-[#858b85]" /> : <ChevronDown size={17} className="shrink-0 text-[#858b85]" />}
            </button>

            {open && (
                <div className={`border-t px-5 pb-6 pt-5 sm:px-[30px] ${ALLYO_BORDER}`}>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="max-w-2xl text-xs leading-5 text-[#777f78] dark:text-zinc-400">As tarefas do projeto aparecem como contexto. Você trabalha somente nas que foram atribuídas a você; as demais mostram de onde sua entrega vem e o que ela libera.</p>
                        <div className="flex items-center gap-2 text-[11px] font-semibold"><span className="rounded-full border border-[#dce4d1] bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">{tasks.length} tarefas</span><span className="rounded-full border border-[#dce4d1] bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">{totalCredits.toLocaleString('pt-BR')} créditos</span><span className="rounded-full border border-[#dce4d1] bg-white px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">Entrega {project.deadline}</span></div>
                    </div>

                    <div className="overflow-x-auto pb-2">
                        <div className="grid min-w-[920px] grid-cols-4 gap-3">
                            {project.stages.map((stage, stageIndex) => (
                                <div key={stage.id} className="min-w-0">
                                    <div className="mb-3 flex items-center gap-2 px-1">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#172019] text-[9px] font-bold text-white dark:bg-[#d0f08e] dark:text-[#172019]">{stageIndex + 1}</span>
                                        <strong className="text-[11px] font-bold uppercase tracking-[.08em] text-[#626a63] dark:text-zinc-400">{stage.title}</strong>
                                        {stageIndex < project.stages.length - 1 && <span className="ml-auto flex flex-1 items-center"><span className="h-px flex-1 bg-[#dce1d8] dark:bg-zinc-700" /><ArrowRight size={12} className="-ml-px text-[#b3b9b1]" /></span>}
                                    </div>
                                    <div className="space-y-2.5">
                                        {stage.tasks.map((task) => <FlowTaskCard key={task.id} task={task} current={task.id === currentTaskId} tasksById={tasksById} parallel={stage.tasks.length > 1} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

const FlowTaskCard = ({ task, current, tasksById, parallel }: { task: AllyoFlowTask; current: boolean; tasksById: Map<string, AllyoFlowTask>; parallel: boolean }) => {
    const status = statusCopy[task.status];
    const StatusIcon = status.icon;
    const blockers = (task.dependsOn || []).map((id) => tasksById.get(id)?.title).filter(Boolean);
    return (
        <article className={`min-h-[132px] rounded-[12px] border bg-white p-3.5 transition dark:bg-zinc-900 ${current ? 'border-[#9db669] shadow-[0_0_0_2px_rgba(157,182,105,.13)]' : task.status === 'blocked' ? 'border-[#e5e7e2] opacity-80 dark:border-zinc-800' : ALLYO_BORDER}`} aria-current={current ? 'step' : undefined}>
            <div className="flex items-start justify-between gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-bold ${status.className}`}><StatusIcon size={10} />{status.label}</span>{current && <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#7e9252]">Sua tarefa</span>}</div>
            <h3 className="mt-3 text-[12px] font-semibold leading-4 text-[#202520] dark:text-zinc-100">{task.title}</h3>
            <p className="mt-1 text-[10px] text-[#858b85]">{task.specialty} · {task.assignee}</p>
            <div className="mt-3 flex items-end justify-between gap-2">
                {task.status === 'blocked' && blockers.length > 0 ? <span className="line-clamp-2 text-[9px] leading-3.5 text-[#8a9089]">Aguarda {blockers.join(' e ')}</span> : parallel ? <span className="text-[9px] text-[#8a9089]">Pode acontecer em paralelo</span> : <span />}
                <span className="shrink-0 text-[10px] font-semibold text-[#68705f]">C {task.credits.toLocaleString('pt-BR')}</span>
            </div>
        </article>
    );
};

export default AllyoProjectFlow;
