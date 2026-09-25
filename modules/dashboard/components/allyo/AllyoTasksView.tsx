import { useEffect, useMemo, useState } from 'react';
import { ALLYO_BORDER, AllyoPageHeader, FilterSelect, mapDemandToTasks, TaskRow, AllyoTask } from './AllyoUI';
import { allyoService } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const AllyoTasksView = () => {
    const [state, setState] = useState('Todos');
    const [client, setClient] = useState('Todos');
    const [project, setProject] = useState('Todos');
    const [cam, setCam] = useState('Todos');
    const [creative, setCreative] = useState('Todos');
    const [status, setStatus] = useState('Todos');
    const [period, setPeriod] = useState('Todos');

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

    const allTasks = liveTasks;

    const tasks = useMemo(() => allTasks.filter((task) => {
        if (state === 'Ativas' && task.status === 'Concluída') return false;
        if (state === 'Concluídas' && task.status !== 'Concluída') return false;
        if (client !== 'Todos' && task.client !== client) return false;
        if (project !== 'Todos' && task.projectName !== project) return false;
        if (cam !== 'Todos' && task.cam !== cam) return false;
        if (creative !== 'Todos' && task.creative !== creative) return false;
        if (status !== 'Todos' && task.status !== status) return false;
        return true;
    }), [allTasks, state, client, project, cam, creative, status, period]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Tarefas" />

            <div className={`relative z-30 flex min-h-[64px] flex-wrap items-center gap-[10px] border-b px-5 py-3 sm:px-[30px] ${ALLYO_BORDER}`}>
                <span className="mr-1 shrink-0 text-sm font-medium">Filtros</span>
                <FilterSelect label="Tarefas ativas" value={state} options={['Ativas', 'Concluídas']} onChange={setState} />
                <FilterSelect label="Período" value={period} options={['Esta semana', 'Este mês', 'Próximos 30 dias']} onChange={setPeriod} />
                <FilterSelect label="Clientes" value={client} options={unique(allTasks.map((task) => task.client))} onChange={setClient} />
                <FilterSelect label="Projetos" value={project} options={unique(allTasks.map((task) => task.projectName))} onChange={setProject} />
                <FilterSelect label="CAM" value={cam} options={unique(allTasks.map((task) => task.cam))} onChange={setCam} />
                <FilterSelect label="Criativo" value={creative} options={unique(allTasks.map((task) => task.creative))} onChange={setCreative} />
                <FilterSelect label="Status" value={status} options={unique(allTasks.map((task) => task.status))} onChange={setStatus} />
            </div>

            <section aria-live="polite">
                {tasks.map((task) => <TaskRow key={task.id} task={task} />)}

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
