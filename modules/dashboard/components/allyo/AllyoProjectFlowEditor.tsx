import { useMemo, useState } from 'react';
import { ArrowRight, Check, GitBranch, Loader2, Plus, Search, X } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { allyoService, type AllyoCatalogProduct, type AllyoDemand, type AllyoDemandTask } from '../../../../services/allyoService';
import { resolveAllyoTaskType, type AllyoTaskType } from './allyoTaskPresentation';

type DraftTask = {
    id: string;
    title: string;
    team: string;
    credits: number;
    workflowStage: string;
    dependsOn: string[];
    requiresClientApproval: boolean;
    taskType: AllyoTaskType;
    isNew: boolean;
};

const normalize = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

const inferStage = (type: AllyoTaskType, value = '') => {
    if (type === 'copy' || /conteudo|copy|roteiro|texto|legenda/.test(normalize(value))) return 'Conteúdo';
    if (['video', 'motion', 'audio'].includes(type)) return 'Produção';
    if (/qualidade|finalizacao|publicacao|qa/.test(normalize(value))) return 'Finalização';
    return 'Criação';
};

const productTaskType = (product: AllyoCatalogProduct): AllyoTaskType => resolveAllyoTaskType({
    name: product.name,
    category: `${product.category} ${product.subcategory || ''} ${product.specialistRole}`,
    briefing: { catalogCode: product.code, deliverables: [product.description], formats: product.formats.available },
});

const toDraftTask = (task: AllyoDemandTask): DraftTask => {
    const type = resolveAllyoTaskType({ name: task.title, category: task.team, taskType: task.taskType, briefing: task.briefing });
    return {
        id: task.id,
        title: task.title,
        team: task.team,
        credits: Math.max(.01, Number(task.credits || 1)),
        workflowStage: task.workflowStage || inferStage(type, `${task.title} ${task.team}`),
        dependsOn: task.dependsOn || [],
        requiresClientApproval: Boolean(task.requiresClientApproval),
        taskType: type,
        isNew: false,
    };
};

const buildColumns = (tasks: DraftTask[]) => {
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const memo = new Map<string, number>();
    const visiting = new Set<string>();
    const depthOf = (task: DraftTask): number => {
        const cached = memo.get(task.id);
        if (cached !== undefined) return cached;
        if (visiting.has(task.id)) return 0;
        visiting.add(task.id);
        const dependencies = task.dependsOn.map((id) => byId.get(id)).filter((item): item is DraftTask => Boolean(item));
        const depth = dependencies.length ? Math.max(...dependencies.map((dependency) => depthOf(dependency) + 1)) : 0;
        visiting.delete(task.id);
        memo.set(task.id, depth);
        return depth;
    };
    const grouped = new Map<number, DraftTask[]>();
    tasks.forEach((task) => { const depth = depthOf(task); grouped.set(depth, [...(grouped.get(depth) || []), task]); });
    return Array.from(grouped.entries()).sort(([left], [right]) => left - right).map(([depth, columnTasks]) => ({ depth, tasks: columnTasks }));
};

const findCycle = (tasks: DraftTask[]): string[] | null => {
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const visited = new Set<string>();
    const path = new Set<string>();
    const visit = (id: string): string[] | null => {
        if (path.has(id)) return [...path, id];
        if (visited.has(id)) return null;
        visited.add(id);
        path.add(id);
        for (const dependency of byId.get(id)?.dependsOn || []) {
            if (!byId.has(dependency)) continue;
            const cycle = visit(dependency);
            if (cycle) return cycle;
        }
        path.delete(id);
        return null;
    };
    for (const task of tasks) { const cycle = visit(task.id); if (cycle) return cycle; }
    return null;
};

const compatibility: Record<AllyoTaskType, AllyoTaskType[]> = {
    video: ['copy', 'storyboard', 'video', 'motion', 'audio'], motion: ['copy', 'storyboard', 'motion', 'audio'], audio: ['copy', 'audio'], storyboard: ['copy', 'storyboard', 'video', 'motion'],
    social: ['copy', 'social', 'carousel', 'branding'], carousel: ['copy', 'social', 'carousel', 'branding'], landing: ['copy', 'landing', 'branding'], email: ['copy', 'email', 'social'],
    presentation: ['copy', 'presentation', 'branding', 'document'], branding: ['copy', 'branding', 'social', 'document'], document: ['copy', 'document', 'branding'], copy: ['copy', 'social', 'carousel', 'landing', 'email', 'presentation', 'storyboard', 'video', 'motion', 'document'], generic: ['generic'],
};

const AllyoProjectFlowEditor = ({ demand, catalogProducts, onClose, onSaved }: { demand: AllyoDemand; catalogProducts: AllyoCatalogProduct[]; onClose: () => void; onSaved: (demand: AllyoDemand) => void }) => {
    const { addToast } = useToast();
    const [tasks, setTasks] = useState<DraftTask[]>(() => (demand.tasksList || []).map(toDraftTask));
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => demand.tasksList?.[0]?.id || null);
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [catalogQuery, setCatalogQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const columns = useMemo(() => buildColumns(tasks), [tasks]);
    const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null;
    const cycle = useMemo(() => findCycle(tasks), [tasks]);
    const totalCredits = tasks.reduce((total, task) => total + task.credits, 0);

    const allowedTypes = useMemo(() => {
        const existing = new Set(tasks.map((task) => task.taskType));
        const allowed = new Set<AllyoTaskType>();
        existing.forEach((type) => (compatibility[type] || []).forEach((item) => allowed.add(item)));
        if (allowed.size === 0) allowed.add('generic');
        return allowed;
    }, [tasks]);

    const relevantProducts = useMemo(() => {
        const query = normalize(catalogQuery);
        const candidates = catalogProducts.filter((product) => product.status === 'published' && allowedTypes.has(productTaskType(product)));
        return candidates.filter((product) => !query || normalize(`${product.name} ${product.description} ${product.category} ${product.subcategory} ${product.specialistRole}`).includes(query)).slice(0, 80);
    }, [allowedTypes, catalogProducts, catalogQuery]);

    const updateSelected = (changes: Partial<DraftTask>) => {
        if (!selectedTaskId) return;
        setTasks((current) => current.map((task) => task.id === selectedTaskId ? { ...task, ...changes } : task));
    };

    const toggleDependency = (dependencyId: string) => {
        if (!selectedTask) return;
        updateSelected({ dependsOn: selectedTask.dependsOn.includes(dependencyId) ? selectedTask.dependsOn.filter((id) => id !== dependencyId) : [...selectedTask.dependsOn, dependencyId] });
    };

    const addProduct = (product: AllyoCatalogProduct) => {
        const type = productTaskType(product);
        const id = `new-${typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`;
        const task: DraftTask = { id, title: product.name, team: product.specialistRole || product.category, credits: Math.max(.01, Number(product.credits.original || 1)), workflowStage: inferStage(type, `${product.name} ${product.category} ${product.specialistRole}`), dependsOn: [], requiresClientApproval: false, taskType: type, isNew: true };
        setTasks((current) => [...current, task]);
        setSelectedTaskId(id);
        setCatalogOpen(false);
        setCatalogQuery('');
    };

    const save = async () => {
        if (saving || cycle) return;
        setSaving(true);
        try {
            const idMap = new Map<string, string>();
            for (const task of tasks.filter((item) => item.isNew)) {
                const response: any = await allyoService.createProjectTask(demand.id, { title: task.title, team: task.team, credits: task.credits, taskType: task.taskType, workflowStage: task.workflowStage, status: 'A iniciar' });
                const createdId = String(response?.task?.id || response?.id || '');
                if (!createdId) throw new Error(`A tarefa “${task.title}” foi criada sem um identificador válido.`);
                idMap.set(task.id, createdId);
            }
            await Promise.all(tasks.map((task) => allyoService.updateTask(idMap.get(task.id) || task.id, {
                title: task.title,
                team: task.team,
                credits: task.credits,
                taskType: task.taskType,
                workflowStage: task.workflowStage,
                dependsOn: task.dependsOn.map((id) => idMap.get(id) || id),
                requiresClientApproval: task.requiresClientApproval,
            })));
            const response = await allyoService.getDemands();
            const updated = response.demands.find((item) => item.id === demand.id);
            if (!updated) throw new Error('O fluxo foi salvo, mas o projeto não pôde ser recarregado.');
            addToast({ type: 'success', title: 'Fluxo atualizado', message: 'Dependências, paralelismo e novas tarefas foram salvos.' });
            onSaved(updated);
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível salvar o fluxo', message: error?.response?.data?.message || error.message || 'Tente novamente.' });
        } finally {
            setSaving(false);
        }
    };

    return <div className="fixed inset-0 z-[160] flex flex-col bg-[#f8f9f6] text-[#1c211d] dark:bg-zinc-950 dark:text-zinc-100" role="dialog" aria-modal="true" aria-labelledby="flow-editor-title">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#dde2da] bg-white px-5 sm:px-7 dark:border-zinc-800 dark:bg-zinc-950"><div className="min-w-0"><span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#829454]">Editor do fluxo inteligente</span><h1 id="flow-editor-title" className="mt-1 truncate text-base font-semibold">{demand.name}</h1></div><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-[#59605a] transition hover:bg-[#f0f2ed]" aria-label="Fechar editor"><X size={20} /></button></header>
        <div className="flex min-h-0 flex-1">
            <main className="min-w-0 flex-1 overflow-auto" style={{ backgroundImage: 'radial-gradient(circle, rgba(120,148,74,.18) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e5de] bg-white/95 px-5 py-3 backdrop-blur sm:px-7 dark:border-zinc-800 dark:bg-zinc-950/95"><div className="flex items-center gap-2 text-[11px]"><span className="rounded-full bg-[#edf2e7] px-3 py-1.5 font-bold text-[#5e733f]">{tasks.length} tarefas</span><span className="rounded-full bg-[#edf2e7] px-3 py-1.5 font-bold text-[#5e733f]">{totalCredits.toLocaleString('pt-BR')} créditos</span>{cycle && <span className="rounded-full bg-red-50 px-3 py-1.5 font-bold text-red-600">Remova a dependência circular</span>}</div><button type="button" onClick={() => setCatalogOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#b8c8a7] bg-white px-4 text-[11px] font-bold text-[#526b35] shadow-sm hover:bg-[#f4f8ee] dark:border-zinc-700 dark:bg-zinc-900"><Plus size={14} /> Adicionar tarefa ao fluxo</button></div>
                <div className="min-h-full min-w-max px-7 py-10"><div className="flex items-start gap-8">{columns.map((column, index) => <div className="w-[260px] shrink-0" key={column.depth}><div className="mb-3 flex items-center gap-2 px-1"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#172019] text-[10px] font-bold text-white">{index + 1}</span><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#626a63]">{index === 0 ? 'Início paralelo' : `Etapa ${index + 1}`}</span>{index < columns.length - 1 && <ArrowRight size={14} className="ml-auto text-[#9da99a]" />}</div><div className="space-y-2.5">{column.tasks.map((task) => <button type="button" key={task.id} onClick={() => setSelectedTaskId(task.id)} className={`block min-h-[104px] w-full rounded-[12px] border bg-white p-3 text-left shadow-sm transition dark:bg-zinc-900 ${task.id === selectedTaskId ? 'border-2 border-[#78944a] ring-4 ring-[#78944a]/10' : 'border-[#dce1d9] hover:border-[#a7b79a]'}`}><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#eef2e9] px-2 py-1 text-[9px] font-bold text-[#617153]">{task.workflowStage}</span>{task.isNew && <span className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-bold uppercase text-indigo-600">Nova</span>}</div><strong className="mt-2 block text-xs leading-4">{task.title}</strong><span className="mt-1 block truncate text-[10px] text-[#858b85]">{task.team} · C {task.credits.toLocaleString('pt-BR')}</span><span className="mt-2 flex items-center gap-1 text-[9px] text-[#778077]"><GitBranch size={10} />{task.dependsOn.length ? `Após ${task.dependsOn.length} tarefa(s)` : column.tasks.length > 1 ? 'Início independente' : 'Sem dependências'}</span></button>)}</div></div>)}</div></div>
            </main>
            <aside className="w-[350px] shrink-0 overflow-y-auto border-l border-[#dde2da] bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 max-lg:hidden">{selectedTask ? <div className="space-y-5"><div><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#829454]">Configurar tarefa</span><h2 className="mt-1 text-base font-semibold">{selectedTask.title}</h2></div><label className="block text-xs font-semibold">Nome<input value={selectedTask.title} onChange={(event) => updateSelected({ title: event.target.value })} className="mt-2 h-10 w-full rounded-[9px] border border-[#dce1da] px-3 text-xs outline-none focus:border-[#78944a] dark:border-zinc-700 dark:bg-zinc-900" /></label><label className="block text-xs font-semibold">Etapa<select value={selectedTask.workflowStage} onChange={(event) => updateSelected({ workflowStage: event.target.value })} className="mt-2 h-10 w-full rounded-[9px] border border-[#dce1da] bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900"><option>Conteúdo</option><option>Criação</option><option>Produção</option><option>Finalização</option></select></label><label className="block text-xs font-semibold">Créditos<input type="number" min="0.01" step="0.01" value={selectedTask.credits} onChange={(event) => updateSelected({ credits: Math.max(.01, Number(event.target.value)) })} className="mt-2 h-10 w-full rounded-[9px] border border-[#dce1da] px-3 text-xs outline-none focus:border-[#78944a] dark:border-zinc-700 dark:bg-zinc-900" /></label><label className="flex items-start gap-3 rounded-[10px] border border-[#dfe4dc] bg-[#fafbf8] p-3"><input type="checkbox" checked={selectedTask.requiresClientApproval} onChange={(event) => updateSelected({ requiresClientApproval: event.target.checked })} className="mt-0.5 h-4 w-4 accent-[#78944a]" /><span><strong className="block text-xs">Exigir aprovação do cliente</strong><small className="mt-1 block text-[10px] leading-4 text-[#777]">As tarefas dependentes só serão liberadas após a aprovação.</small></span></label><div><span className="text-xs font-semibold">Depende de</span><div className="mt-2 space-y-1.5">{tasks.filter((task) => task.id !== selectedTask.id).map((task) => <label key={task.id} className="flex cursor-pointer items-center gap-2 rounded-[9px] border border-[#e2e5df] px-3 py-2.5 hover:bg-[#fafbf8]"><input type="checkbox" checked={selectedTask.dependsOn.includes(task.id)} onChange={() => toggleDependency(task.id)} className="h-4 w-4 accent-[#78944a]" /><span className="min-w-0"><strong className="block truncate text-[11px]">{task.title}</strong><small className="text-[9px] text-[#888]">{task.workflowStage}</small></span></label>)}</div></div></div> : <div className="flex min-h-60 items-center justify-center text-center text-xs text-[#888]">Selecione uma tarefa no fluxo para configurá-la.</div>}</aside>
        </div>
        <footer className="flex min-h-[68px] shrink-0 items-center justify-between gap-4 border-t border-[#dde2da] bg-white px-5 sm:px-7 dark:border-zinc-800 dark:bg-zinc-950"><span className="text-[11px] text-[#757c76]">Tarefas na mesma coluna podem começar juntas; conexões criam bloqueios sequenciais.</span><div className="flex items-center gap-2"><button type="button" onClick={onClose} className="h-10 rounded-full border border-[#d8ddd5] px-5 text-xs font-semibold">Cancelar</button><button type="button" onClick={() => void save()} disabled={saving || Boolean(cycle) || tasks.length === 0} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#172019] px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-45">{saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{saving ? 'Salvando...' : 'Salvar fluxo inteligente'}</button></div></footer>
        {catalogOpen && <div className="absolute inset-0 z-30 flex flex-col bg-white dark:bg-zinc-950"><header className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#e0e3de] px-6"><div><h2 className="text-lg font-semibold">Adicionar tarefa ao fluxo</h2><p className="mt-1 text-xs text-[#777]">Somente produtos compatíveis com as entregas deste projeto são exibidos.</p></div><button type="button" onClick={() => setCatalogOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f1f2ef]"><X size={20} /></button></header><div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-6 py-5"><label className="flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-[#dde1db] px-3"><Search size={16} className="text-[#899087]" /><input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Buscar tarefa compatível..." className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" /></label><div className="mt-5 overflow-y-auto rounded-[12px] border border-[#e1e4df]">{relevantProducts.map((product) => <button type="button" onClick={() => addProduct(product)} key={product.code} className="grid min-h-[68px] w-full grid-cols-[minmax(0,1fr)_170px_90px_20px] items-center gap-4 border-b border-[#eceeea] px-4 text-left last:border-b-0 hover:bg-[#fafbf8]"><span className="min-w-0"><strong className="block truncate text-xs">{product.name}</strong><small className="mt-1 block truncate text-[10px] text-[#888]">{product.description}</small></span><span className="truncate text-[10px] text-[#707870]">{product.specialistRole}</span><span className="text-[10px] font-semibold">C {Number(product.credits.original || 1).toLocaleString('pt-BR')}</span><Plus size={15} className="text-[#78944a]" /></button>)}{relevantProducts.length === 0 && <div className="flex min-h-44 items-center justify-center text-xs text-[#888]">Nenhuma tarefa compatível encontrada.</div>}</div></div></div>}
    </div>;
};

export default AllyoProjectFlowEditor;
