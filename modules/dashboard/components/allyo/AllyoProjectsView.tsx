import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, ChevronRight, FolderKanban, Loader2, Search, UsersRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../context/ToastContext';
import { allyoService, type AllyoDemand } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';
import { AllyoField, AllyoInput, AllyoPrimaryButton, AllyoSecondaryButton, AllyoSelect } from './AllyoForm';
import { ALLYO_BORDER, AllyoPageHeader, DataCell, FilterSelect, mapDemandToTasks } from './AllyoUI';

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));

const projectStatusClass = (status: string) => {
    if (status === 'Concluído') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'Em revisão') return 'text-[#fd6b32]';
    if (status === 'Inativo') return 'text-red-500 dark:text-red-400';
    if (status === 'Rascunho') return 'text-[#8b8b8b]';
    return 'text-[#2a2ad7] dark:text-indigo-300';
};

const toDateInput = (value?: string) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
};

const AllyoProjectsView = () => {
    const [, setSearchParams] = useSearchParams();
    const { addToast } = useToast();
    const [projects, setProjects] = useState<AllyoDemand[]>([]);
    const [selected, setSelected] = useState<AllyoDemand | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canManage, setCanManage] = useState<boolean | null>(null);
    const [query, setQuery] = useState('');
    const [state, setState] = useState('Ativos');
    const [client, setClient] = useState('Todos');
    const [service, setService] = useState('Todos');
    const [responsible, setResponsible] = useState('Todos');
    const [status, setStatus] = useState('Todos');

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const permissions = await allyoService.getPermissions();
            setCanManage(permissions.canManageProjects);
            if (!permissions.canManageProjects) {
                setProjects([]);
                return;
            }
            const response = await allyoService.getDemands();
            setProjects(Array.isArray(response?.demands) ? response.demands : []);
        } catch (error: any) {
            setCanManage(false);
            addToast({ type: 'error', title: 'Não foi possível carregar os projetos', message: error.response?.data?.message || 'Tente novamente em alguns instantes.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadProjects();
        socketService.connect();
        const refresh = () => void loadProjects();
        socketService.on('allyo:event', refresh);
        return () => socketService.off('allyo:event', refresh);
    }, []);

    const visibleProjects = useMemo(() => projects.filter((project) => {
        const term = query.trim().toLocaleLowerCase('pt-BR');
        const projectClient = project.workspace?.name || 'Cliente Allyo';
        const projectResponsibles = project.team || [];
        if (term && ![project.name, project.service, projectClient, ...projectResponsibles].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term))) return false;
        if (state === 'Ativos' && ['Concluído', 'Inativo'].includes(project.status)) return false;
        if (state === 'Concluídos' && project.status !== 'Concluído') return false;
        if (state === 'Inativos' && project.status !== 'Inativo') return false;
        if (client !== 'Todos' && projectClient !== client) return false;
        if (service !== 'Todos' && project.service !== service) return false;
        if (responsible !== 'Todos' && !projectResponsibles.includes(responsible)) return false;
        if (status !== 'Todos' && project.status !== status) return false;
        return true;
    }), [client, projects, query, responsible, service, state, status]);

    const openTask = (taskId: string) => {
        setSelected(null);
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'task-detail');
            next.set('task', taskId);
            return next;
        });
    };

    const replaceProject = (project: AllyoDemand) => {
        setProjects((current) => current.map((item) => item.id === project.id ? project : item));
        setSelected(project);
    };

    if (!isLoading && canManage === false) {
        return (
            <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950">
                <AllyoPageHeader title="Projetos" />
                <div className="flex min-h-[420px] items-center justify-center px-6 text-center"><div className="max-w-sm"><h2 className="font-season text-2xl text-black dark:text-white">Acesso restrito</h2><p className="mt-3 text-sm leading-6 text-[#7f7f7f] dark:text-zinc-400">Projetos podem ser administrados por CAM, CQS, Atendimento, liderança e administradores.</p></div></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Projetos" />

            <div className={`relative z-30 flex min-h-[64px] flex-wrap items-center gap-[10px] border-b px-5 py-3 sm:px-[30px] ${ALLYO_BORDER}`}>
                <span className="mr-1 shrink-0 text-sm font-medium">Filtros</span>
                <div className="relative min-w-[210px] flex-1 sm:max-w-[320px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar projetos" className="h-9 w-full rounded-full border border-[#e5e5e5] bg-white pl-9 pr-4 text-xs outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/15 dark:border-zinc-700 dark:bg-zinc-900" /></div>
                <FilterSelect label="Projetos ativos" value={state} options={['Ativos', 'Concluídos', 'Inativos']} onChange={setState} />
                <FilterSelect label="Clientes" value={client} options={unique(projects.map((project) => project.workspace?.name || 'Cliente Allyo'))} onChange={setClient} />
                <FilterSelect label="Serviços" value={service} options={unique(projects.map((project) => project.service))} onChange={setService} />
                <FilterSelect label="Responsáveis" value={responsible} options={unique(projects.flatMap((project) => project.team || []))} onChange={setResponsible} />
                <FilterSelect label="Status" value={status} options={unique(projects.map((project) => project.status))} onChange={setStatus} />
            </div>

            <section aria-live="polite" aria-label="Projetos da operação">
                {visibleProjects.map((project) => <ProjectRow key={project.id} project={project} onClick={() => setSelected(project)} />)}
                {isLoading && <div className="flex min-h-64 items-center justify-center text-sm text-[#777]"><Loader2 size={18} className="mr-2 animate-spin text-[#9db669]" /> Carregando projetos…</div>}
                {!isLoading && visibleProjects.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><FolderKanban size={26} className="text-[#9db669]" /><strong className="mt-4 text-sm">Nenhum projeto encontrado</strong><span className="mt-2 text-xs text-[#7f7f7f]">Ajuste os filtros para consultar outros projetos.</span></div>}
            </section>

            <ProjectManagementModal project={selected} onClose={() => setSelected(null)} onSaved={replaceProject} onOpenTask={openTask} />
        </div>
    );
};

const ProjectRow = ({ project, onClick }: { project: AllyoDemand; onClick: () => void }) => {
    const client = project.workspace?.name || 'Cliente Allyo';
    const taskCount = project.tasksList?.length || project.tasks || 0;
    return (
        <div className={`border-t ${ALLYO_BORDER}`}>
            <button type="button" onClick={onClick} className="grid min-h-[78px] w-full grid-cols-[minmax(230px,1.35fr)_minmax(120px,.7fr)_90px_120px_minmax(150px,1fr)_105px_18px] items-center gap-5 px-5 py-4 text-left transition-colors hover:bg-[#fafbf8] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9db669] sm:px-[30px] dark:hover:bg-zinc-900/70 max-xl:grid-cols-[minmax(210px,1.3fr)_120px_90px_minmax(150px,1fr)_105px_18px] max-lg:grid-cols-[minmax(200px,1fr)_90px_minmax(140px,1fr)_105px_18px] max-sm:grid-cols-[minmax(0,1fr)_92px_18px]">
                <span className="flex min-w-0 items-center gap-[10px]"><span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full border border-[#9db669] text-[#78904d]"><FolderKanban size={16} strokeWidth={1.6} /></span><span className="min-w-0"><strong className="block truncate text-sm font-medium">{project.name}</strong><span className="mt-1 block truncate text-[11px] text-[#777] dark:text-zinc-400">{project.service || 'Projeto criativo'} · {client}</span></span></span>
                <DataCell label="CLIENTE" value={client} className="max-xl:hidden" />
                <DataCell label="TAREFAS" value={String(taskCount)} />
                <DataCell label="PROGRESSO" value={`${Math.round(Number(project.progress || 0))}%`} className="max-lg:hidden" />
                <DataCell label="RESPONSÁVEIS" value={(project.team || []).join(', ') || 'A definir'} className="max-sm:hidden" />
                <DataCell label="STATUS" value={project.status} valueClassName={projectStatusClass(project.status)} className="max-sm:hidden" />
                <ChevronRight size={18} className="text-[#9f9f9f]" />
            </button>
        </div>
    );
};

const ProjectManagementModal = ({ project, onClose, onSaved, onOpenTask }: { project: AllyoDemand | null; onClose: () => void; onSaved: (project: AllyoDemand) => void; onOpenTask: (taskId: string) => void }) => {
    const { addToast } = useToast();
    const [status, setStatus] = useState('Em andamento');
    const [deadline, setDeadline] = useState('');
    const [team, setTeam] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [confirmInactive, setConfirmInactive] = useState(false);

    useEffect(() => {
        if (!project) return;
        setStatus(project.status === 'Inativo' ? 'Em andamento' : project.status || 'Em andamento');
        setDeadline(toDateInput(project.deadline));
        setTeam((project.team || []).join(', '));
        setConfirmInactive(false);
    }, [project]);

    if (!project) return null;
    const tasks = mapDemandToTasks(project);

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        const teamMembers = team.split(',').map((item) => item.trim()).filter(Boolean);
        setIsSaving(true);
        try {
            await Promise.all([
                allyoService.updateProjectStatus(project.id, { status, ...(deadline ? { deadline } : {}) }),
                ...(teamMembers.length > 0 ? [allyoService.assignProjectTeam(project.id, teamMembers)] : []),
            ]);
            onSaved({ ...project, status, deadline: deadline || project.deadline, team: teamMembers.length > 0 ? teamMembers : project.team });
            addToast({ type: 'success', title: 'Projeto atualizado', message: 'Status, prazo e responsáveis foram salvos.' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível atualizar o projeto', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const inactivate = async () => {
        setIsSaving(true);
        try {
            await allyoService.updateProjectStatus(project.id, { status: 'Inativo' });
            onSaved({ ...project, status: 'Inativo' });
            setConfirmInactive(false);
            addToast({ type: 'success', title: 'Projeto inativado', message: 'O histórico e as tarefas foram preservados.' });
            onClose();
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível inativar o projeto', message: error.response?.data?.message || 'Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen title="Gerenciar projeto" size="xl" onClose={onClose} footer={<><button type="button" onClick={() => confirmInactive ? void inactivate() : setConfirmInactive(true)} disabled={isSaving} className="mr-auto inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30">{confirmInactive ? 'Confirmar inativação' : 'Inativar projeto'}</button><AllyoSecondaryButton type="button" onClick={onClose}>Fechar</AllyoSecondaryButton><AllyoPrimaryButton type="submit" form="allyo-project-management" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar projeto'}</AllyoPrimaryButton></>}>
            <form id="allyo-project-management" onSubmit={save} className="space-y-6">
                <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#edf2e2] text-[#708746] dark:bg-[#9db669]/15"><BriefcaseBusiness size={21} /></span><span className="min-w-0"><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#829454]">{project.workspace?.name || 'Cliente Allyo'}</span><h2 className="mt-1 truncate font-season text-[25px] font-normal">{project.name}</h2><p className="mt-1 text-xs text-[#777]">{project.service} · {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} · {Math.round(Number(project.progress || 0))}% concluído</p></span></div>

                {confirmInactive && <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">Confirme no botão abaixo para retirar o projeto da operação ativa. O histórico e suas tarefas continuarão disponíveis.</div>}

                <div className="grid gap-4 sm:grid-cols-2">
                    <AllyoField label="Status do projeto"><AllyoSelect value={status} onChange={(event) => setStatus(event.target.value)}><option>Rascunho</option><option>Em andamento</option><option>Em revisão</option><option>Concluído</option></AllyoSelect></AllyoField>
                    <AllyoField label="Deadline"><AllyoInput type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></AllyoField>
                    <AllyoField label="Responsáveis" hint="separe por vírgulas" className="sm:col-span-2"><AllyoInput value={team} onChange={(event) => setTeam(event.target.value)} placeholder="CAM, CQS, Art Director e criativos" /></AllyoField>
                </div>

                <section>
                    <div className={`flex items-center justify-between border-b pb-3 ${ALLYO_BORDER}`}><span><strong className="block text-sm font-semibold">Tarefas do projeto</strong><span className="mt-1 block text-[11px] text-[#888]">Abra uma tarefa para administrar responsáveis, bloqueios, status e entregas.</span></span><span className="rounded-full bg-[#edf2e2] px-2.5 py-1 text-[10px] font-semibold text-[#607738] dark:bg-[#9db669]/15 dark:text-[#cce18e]">{tasks.length}</span></div>
                    <div>{tasks.map((task) => <button key={task.id} type="button" onClick={() => onOpenTask(task.id)} className={`grid min-h-[64px] w-full grid-cols-[minmax(0,1fr)_110px_90px_18px] items-center gap-4 border-b py-3 text-left transition hover:bg-[#fafbf8] dark:hover:bg-zinc-800/50 ${ALLYO_BORDER}`}><span className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dfe5d5] text-[#7a904f]"><FolderKanban size={14} /></span><span className="min-w-0"><strong className="block truncate text-xs font-semibold">{task.name}</strong><span className="mt-1 block truncate text-[10px] text-[#888]">#{task.publicId || task.id} · {task.category}</span></span></span><span className="max-sm:hidden"><span className="flex items-center gap-1.5 text-[10px] text-[#777]"><UsersRound size={12} /> {task.creative}</span></span><span className={`text-[10px] font-semibold ${projectStatusClass(task.status)}`}>{task.status}</span><ChevronRight size={15} className="text-[#aaa]" /></button>)}</div>
                    {tasks.length === 0 && <div className="flex min-h-28 items-center justify-center text-xs text-[#888]">Este projeto ainda não possui tarefas.</div>}
                </section>
            </form>
        </Modal>
    );
};

export default AllyoProjectsView;
