import { useEffect, useMemo, useState } from 'react';
import { ALLYO_BORDER, AllyoPageHeader, FilterSelect, mapDemandToTask, TaskRow, AllyoTask } from './AllyoUI';
import { allyoService } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';
import { RefreshCw, Radio, Inbox } from 'lucide-react';

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
    const [isConnected, setIsConnected] = useState(false);

    const loadDemands = async () => {
        setIsLoading(true);
        try {
            const res = await allyoService.getDemands();
            if (res && Array.isArray(res.demands)) {
                const mapped = res.demands.map(mapDemandToTask);
                setLiveTasks(mapped);
                setIsConnected(true);
            }
        } catch (err) {
            console.warn('[AllyoTasksView] Erro ao carregar demandas da API Allyo:', err);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDemands();

        socketService.connect();
        const handleEvent = (event: any) => {
            console.log('[AllyoTasksView] Evento em tempo real recebido:', event);
            loadDemands();
        };

        socketService.on('allyo:event', handleEvent);
        return () => {
            socketService.off('allyo:event', handleEvent);
        };
    }, []);

    // 100% dados reais da API da Allyo Space
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
            <div className="flex items-center justify-between border-b px-5 py-2 sm:px-[30px] border-[#e5e5e5] dark:border-zinc-800">
                <AllyoPageHeader title="Tarefas" />
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        <Radio size={12} />
                        <span>{isConnected ? 'Railway Conectado' : 'Conectando...'}</span>
                    </div>

                    <button
                        onClick={loadDemands}
                        disabled={isLoading}
                        title="Recarregar demandas do Railway"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e5e5] text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {allTasks.length > 0 && (
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
            )}

            <section aria-live="polite">
                {tasks.map((task) => <TaskRow key={task.id} task={task} />)}

                {!isLoading && allTasks.length === 0 && (
                    <div className="flex min-h-[380px] flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
                            <Inbox size={28} strokeWidth={1.5} />
                        </div>
                        <h3 className="mt-4 font-season text-xl text-black dark:text-white">Nenhuma demanda ativa</h3>
                        <p className="mt-2 max-w-md text-xs leading-relaxed text-[#7f7f7f] dark:text-zinc-400">
                            A integração com o backend da Allyo Space no Railway está 100% conectada e pronta. Assim que um cliente abrir uma demanda ou enviar um briefing no portal da Allyo, ela aparecerá aqui em tempo real.
                        </p>
                    </div>
                )}

                {isLoading && allTasks.length === 0 && (
                    <div className="flex min-h-[250px] items-center justify-center text-xs text-zinc-500">
                        <RefreshCw size={16} className="mr-2 animate-spin text-[#9db669]" />
                        Carregando demandas do Railway...
                    </div>
                )}
            </section>
        </div>
    );
};

export default AllyoTasksView;
