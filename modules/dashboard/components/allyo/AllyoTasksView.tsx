import { useEffect, useMemo, useState } from 'react';
import { ALLYO_BORDER, AllyoPageHeader, FilterSelect, mapDemandToTasks, TaskRow, AllyoTask } from './AllyoUI';
import { allyoService } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';
import { Search, SlidersHorizontal } from 'lucide-react';

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const DEFAULT_COLUMNS = ['credits', 'id', 'client', 'deadline', 'status'];
const COLUMN_LABELS: Record<string, string> = { credits: 'Créditos', id: 'ID', client: 'Cliente', deadline: 'Deadline', status: 'Status' };

const AllyoTasksView = () => {
    const [state, setState] = useState('Ativas');
    const [client, setClient] = useState('Todos');
    const [project, setProject] = useState('Todos');
    const [cam, setCam] = useState('Todos');
    const [creative, setCreative] = useState('Todos');
    const [status, setStatus] = useState('Todos');
    const [period, setPeriod] = useState('Todos');
    const [category, setCategory] = useState('Todos');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('Prazo crescente');
    const [columns, setColumns] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem('allyo-task-columns') || 'null') || DEFAULT_COLUMNS; } catch { return DEFAULT_COLUMNS; }
    });
    const [showColumns, setShowColumns] = useState(false);

    const [liveTasks, setLiveTasks] = useState<AllyoTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadDemands = async () => {
        setIsLoading(true);
        try {
            const res = await allyoService.getDemands();
            if (res && Array.isArray(res.demands)) {
                setLiveTasks(res.demands.flatMap(mapDemandToTasks));
            }
        } catch (err) {
            console.warn('[AllyoTasksView] Erro ao carregar demandas:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDemands();

        socketService.connect();
        const handleEvent = () => loadDemands();

        socketService.on('allyo:event', handleEvent);
        return () => {
            socketService.off('allyo:event', handleEvent);
        };
    }, []);

    useEffect(() => { localStorage.setItem('allyo-task-columns', JSON.stringify(columns)); }, [columns]);

    const allTasks = liveTasks;

    const tasks = useMemo(() => allTasks.filter((task) => {
        if (state === 'Ativas' && (task.status === 'Concluída' || task.status === 'Inativa')) return false;
        if (state === 'Concluídas' && task.status !== 'Concluída') return false;
        if (state === 'Inativas' && task.status !== 'Inativa') return false;
        if (client !== 'Todos' && task.client !== client) return false;
        if (project !== 'Todos' && task.projectName !== project) return false;
        if (cam !== 'Todos' && task.cam !== cam) return false;
        if (creative !== 'Todos' && task.creative !== creative) return false;
        if (status !== 'Todos' && task.status !== status) return false;
        if (category !== 'Todos' && task.category !== category) return false;
        if (query && ![task.name, task.projectName, task.client, task.publicId, task.id].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))) return false;
        if (period !== 'Todos') {
            const deadline = task.deadlineAt ? new Date(task.deadlineAt) : null;
            if (!deadline || Number.isNaN(deadline.getTime())) return false;
            const now = new Date();
            const limit = new Date(now);
            if (period === 'Esta semana') limit.setDate(now.getDate() + (7 - now.getDay()));
            if (period === 'Este mês') limit.setMonth(now.getMonth() + 1, 0);
            if (period === 'Próximos 30 dias') limit.setDate(now.getDate() + 30);
            if (deadline < now || deadline > limit) return false;
        }
        return true;
    }).sort((left, right) => {
        if (sort === 'Nome A–Z') return left.name.localeCompare(right.name, 'pt-BR');
        if (sort === 'Créditos maiores') return right.credits - left.credits;
        const leftTime = left.deadlineAt ? new Date(left.deadlineAt).getTime() : Number.MAX_SAFE_INTEGER;
        const rightTime = right.deadlineAt ? new Date(right.deadlineAt).getTime() : Number.MAX_SAFE_INTEGER;
        return sort === 'Prazo decrescente' ? rightTime - leftTime : leftTime - rightTime;
    }), [allTasks, state, client, project, cam, creative, status, period, category, query, sort]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Tarefas" />

            <div className={`relative z-30 flex min-h-[64px] flex-wrap items-center gap-[10px] border-b px-5 py-3 sm:px-[30px] ${ALLYO_BORDER}`}>
                <span className="mr-1 shrink-0 text-sm font-medium">Filtros</span>
                <label className="flex min-h-9 items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 dark:border-zinc-700 dark:bg-zinc-900"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-36 bg-transparent text-xs outline-none" placeholder="Buscar tarefa" /></label>
                <FilterSelect label="Tarefas ativas" value={state} options={['Ativas', 'Concluídas', 'Inativas']} onChange={setState} />
                <FilterSelect label="Período" value={period} options={['Esta semana', 'Este mês', 'Próximos 30 dias']} onChange={setPeriod} />
                <FilterSelect label="Clientes" value={client} options={unique(allTasks.map((task) => task.client))} onChange={setClient} />
                <FilterSelect label="Projetos" value={project} options={unique(allTasks.map((task) => task.projectName))} onChange={setProject} />
                <FilterSelect label="CAM" value={cam} options={unique(allTasks.map((task) => task.cam))} onChange={setCam} />
                <FilterSelect label="Criativo" value={creative} options={unique(allTasks.map((task) => task.creative))} onChange={setCreative} />
                <FilterSelect label="Status" value={status} options={unique(allTasks.map((task) => task.status))} onChange={setStatus} />
                <FilterSelect label="Especialidade" value={category} options={unique(allTasks.map((task) => task.category))} onChange={setCategory} />
                <FilterSelect label="Ordenação" value={sort} options={['Prazo crescente', 'Prazo decrescente', 'Nome A–Z', 'Créditos maiores']} onChange={setSort} includeAll={false} />
                <div className="relative"><button type="button" onClick={() => setShowColumns((value) => !value)} className="flex min-h-9 items-center gap-2 rounded-full border border-[#e5e5e5] px-4 text-xs font-semibold dark:border-zinc-700"><SlidersHorizontal size={13} /> Colunas</button>{showColumns && <div className="absolute right-0 top-11 z-50 w-48 rounded-[12px] border border-[#e5e5e5] bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">{DEFAULT_COLUMNS.map((column) => <label key={column} className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs"><input type="checkbox" checked={columns.includes(column)} onChange={(event) => setColumns((current) => event.target.checked ? [...current, column] : current.filter((item) => item !== column))} />{COLUMN_LABELS[column]}</label>)}</div>}</div>
            </div>

            <section aria-live="polite" className="overflow-x-auto">
                <div className="min-w-[720px]">{tasks.map((task) => <TaskRow key={task.id} task={task} visibleColumns={columns} />)}</div>

                {!isLoading && tasks.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <strong className="text-sm font-semibold">Nenhuma tarefa encontrada</strong>
                        <span className="mt-2 text-xs text-[#7f7f7f]">As demandas dos clientes aparecerão aqui assim que forem abertas.</span>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AllyoTasksView;
