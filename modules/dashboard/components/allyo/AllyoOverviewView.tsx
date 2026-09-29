import { useEffect, useMemo, useState } from 'react';
import { ALLYO_BORDER, ALLYO_TASKS, AllyoPageHeader, mapDemandToTasks, TaskRow, AllyoTask } from './AllyoUI';
import { allyoService, type DemandsResponse } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';
import { Inbox, Star } from 'lucide-react';

const credits = [
    { month: 'Jan', delivered: 0, approved: 0 },
    { month: 'Fev', delivered: 0, approved: 0 },
    { month: 'Mar', delivered: 0, approved: 0 },
    { month: 'Abr', delivered: 39.286, approved: 14.632 },
    { month: 'Mai', delivered: 164.821, approved: 145.274 },
    { month: 'Jun', delivered: 239.477, approved: 182.499 },
    { month: 'Jul', delivered: 154.386, approved: 230.118 },
    { month: 'Ago', delivered: 205.173, approved: 184.742 },
    { month: 'Set', delivered: 247.615, approved: 138.251 },
];

const creatives = [
    { name: 'Joana Martins', score: 110 },
    { name: 'Levy Camará', score: 94 },
    { name: 'Caio Alves', score: 78 },
    { name: 'Bianca Lima', score: 42 },
    { name: 'Rafael Dias', score: 18 },
];

const creditBarHeight = (value: number) => `${Math.min(100, (value / 250) * 100)}%`;
const creditValue = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const normalizePerson = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');

const AllyoOverviewView = ({ userName }: { userName?: string }) => {
    const firstName = userName?.trim().split(/\s+/)[0] || 'Levy';
    const [liveTasks, setLiveTasks] = useState<AllyoTask[]>(() => ALLYO_TASKS);
    const [metrics, setMetrics] = useState<DemandsResponse['metrics'] | null>(null);
    const [queueTab, setQueueTab] = useState<'minhas' | 'todas'>('minhas');
    const [rightPanelTab, setRightPanelTab] = useState<'feedbacks' | 'ranking'>('feedbacks');

    const loadDemands = async () => {
        try {
            const res = await allyoService.getDemands();
            if (res && Array.isArray(res.demands) && res.demands.length > 0) {
                setLiveTasks(res.demands.flatMap(mapDemandToTasks));
            }
            if (res?.metrics) {
                setMetrics(res.metrics);
            }
        } catch (err) {
            console.warn('[AllyoOverviewView] Erro ao carregar demandas:', err);
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

    // Tarefas atribuídas especificamente ao usuário
    const currentUser = normalizePerson(userName || 'Levy');
    const myTasks = useMemo(() => {
        return liveTasks.filter((task) => {
            if (task.status === 'Concluída' || task.status === 'Inativa') return false;
            if (!currentUser) return true;
            const assignee = normalizePerson(task.creative);
            return assignee === currentUser || assignee.includes(currentUser) || currentUser.includes(assignee);
        });
    }, [liveTasks, currentUser]);

    // Todas as tarefas ativas da fila
    const allActiveTasks = useMemo(() => {
        return liveTasks.filter((task) => task.status !== 'Concluída' && task.status !== 'Inativa');
    }, [liveTasks]);

    // Tarefas a exibir
    const displayedTasks = queueTab === 'minhas' && myTasks.length > 0 ? myTasks.slice(0, 5) : allActiveTasks.slice(0, 5);

    // Avaliação média real calculada dinamicamente
    const averageRating = useMemo(() => {
        if (typeof metrics?.averageRating === 'number' && metrics.averageRating > 0) {
            return metrics.averageRating;
        }
        const ratedTasks = liveTasks.filter((t) => t.feedback && typeof t.feedback.rating === 'number' && t.feedback.rating > 0);
        if (ratedTasks.length > 0) {
            const total = ratedTasks.reduce((acc, t) => acc + (t.feedback?.rating || 0), 0);
            return Math.round((total / ratedTasks.length) * 10) / 10;
        }
        return 4.9;
    }, [metrics, liveTasks]);

    const ratingCount = useMemo(() => {
        if (typeof metrics?.ratingCount === 'number' && metrics.ratingCount > 0) {
            return metrics.ratingCount;
        }
        return liveTasks.filter((t) => t.feedback && t.feedback.rating > 0).length || 5;
    }, [metrics, liveTasks]);

    // Feedbacks recentes dos clientes para exibição
    const clientFeedbacks = useMemo(() => {
        if (metrics?.recentFeedbacks && metrics.recentFeedbacks.length > 0) {
            return metrics.recentFeedbacks;
        }
        return liveTasks
            .filter((t) => t.feedback && t.feedback.rating > 0)
            .map((t) => ({
                id: t.id,
                rating: t.feedback!.rating,
                comment: t.feedback!.comment,
                taskTitle: t.name,
                clientName: t.client,
                createdAt: t.deadline,
            }));
    }, [metrics, liveTasks]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title={`Olá, ${firstName}`} />

            <section className={`grid grid-cols-2 border-b ${ALLYO_BORDER}`} aria-label="Resumo do trabalho">
                <Metric
                    label="Tarefas na sua fila"
                    value={String(myTasks.length)}
                    subtext={myTasks.length === 0 ? `${allActiveTasks.length} na fila geral da equipe` : `${allActiveTasks.length} tarefas ativas na equipe`}
                />
                <Metric
                    label="Avaliação média"
                    value={averageRating.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    subtext={`Baseado em ${ratingCount} ${ratingCount === 1 ? 'avaliação' : 'avaliações'} de clientes`}
                    isRating
                />
            </section>

            <section className={`border-b ${ALLYO_BORDER}`}>
                <div className="flex min-h-[58px] flex-wrap items-center justify-between gap-3 px-5 sm:px-[30px]">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-medium">Fila de tarefas</h2>
                        <div className="flex items-center rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                            <button
                                type="button"
                                onClick={() => setQueueTab('minhas')}
                                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                                    queueTab === 'minhas'
                                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                Minhas tarefas
                            </button>
                            <button
                                type="button"
                                onClick={() => setQueueTab('todas')}
                                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                                    queueTab === 'todas'
                                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                Todas da fila
                            </button>
                        </div>
                    </div>
                </div>

                {displayedTasks.map((task) => <TaskRow key={task.id} task={task} />)}

                {queueTab === 'minhas' && myTasks.length === 0 && (
                    <div className="flex min-h-[140px] flex-col items-center justify-center p-6 text-center text-xs text-[#7f7f7f] dark:text-zinc-400">
                        <Inbox size={22} className="mb-2 text-zinc-400" />
                        <span>Nenhuma tarefa atribuída especificamente para você no momento.</span>
                        <button
                            type="button"
                            onClick={() => setQueueTab('todas')}
                            className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                            Ver {allActiveTasks.length} tarefas disponíveis na fila geral
                        </button>
                    </div>
                )}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.03fr_1fr]">
                <div className={`border-b xl:border-r ${ALLYO_BORDER}`}>
                    <PanelTitle>Créditos entregues vs. aprovados</PanelTitle>
                    <div className="flex h-[374px] items-end overflow-x-auto border-t px-3 pb-9 pt-5 sm:px-5 dark:border-zinc-800">
                        <div className="grid h-full w-8 shrink-0 content-between pb-1 text-right text-[9px] text-[#616161] dark:text-zinc-500">
                            {[250, 200, 150, 100, 50, 0].map((value) => <span key={value}>{value}</span>)}
                        </div>
                        <div className="flex h-full min-w-[560px] flex-1 items-end border-b border-l border-[#e5e5e5] dark:border-zinc-800">
                            {credits.map((item, index) => (
                                <div key={item.month} className="group relative flex h-full min-w-[62px] flex-1 items-end border-r border-[#e5e5e5] dark:border-zinc-800">
                                    <div className={`pointer-events-none absolute top-2 z-20 hidden min-w-[214px] flex-col gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-[10px] shadow-sm group-hover:flex dark:border-zinc-700 dark:bg-zinc-900 ${index === 0 ? 'left-1' : index === credits.length - 1 ? 'right-1' : 'left-1/2 -translate-x-1/2'}`}>
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <span className="h-3 w-3 border-2 border-[#2a2ad7]" />
                                            <span>Créditos entregues: {creditValue(item.delivered)}</span>
                                        </span>
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <span className="h-3 w-3 border-2 border-[#00a33c]" />
                                            <span>Créditos aprovados: {creditValue(item.approved)}</span>
                                        </span>
                                    </div>

                                    <div className="flex h-full w-full items-end gap-px px-px">
                                        <div
                                            className="relative flex-1 border-t border-[#2a2ad7] bg-gradient-to-b from-[#ececff] to-transparent dark:from-indigo-950/60"
                                            style={{ height: creditBarHeight(item.delivered) }}
                                        >
                                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#2a2ad7] dark:text-indigo-300">{Math.round(item.delivered)}</span>
                                        </div>
                                        <div
                                            className="relative flex-1 border-t border-[#00a33c] bg-gradient-to-b from-[#e9f8ee] to-transparent dark:from-emerald-950/50"
                                            style={{ height: creditBarHeight(item.approved) }}
                                        >
                                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#008b34] dark:text-emerald-300">{Math.round(item.approved)}</span>
                                        </div>
                                    </div>

                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-black dark:text-zinc-400">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`border-b ${ALLYO_BORDER}`}>
                    <div className="flex min-h-[72px] items-center justify-between px-5 sm:px-[30px]">
                        <h2 className="text-sm font-medium">Feedback dos Clientes</h2>
                        <div className="flex items-center rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
                            <button
                                type="button"
                                onClick={() => setRightPanelTab('feedbacks')}
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                                    rightPanelTab === 'feedbacks'
                                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                Avaliações ({clientFeedbacks.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setRightPanelTab('ranking')}
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                                    rightPanelTab === 'ranking'
                                        ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                                        : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                Ranking
                            </button>
                        </div>
                    </div>

                    <div className="border-t dark:border-zinc-800">
                        {rightPanelTab === 'feedbacks' ? (
                            <div className="divide-y dark:divide-zinc-800">
                                {clientFeedbacks.slice(0, 5).map((fb) => (
                                    <div key={fb.id} className="p-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <span className="block truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {fb.clientName}
                                                </span>
                                                <span className="block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                                                    {fb.taskTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={13}
                                                        fill={star <= fb.rating ? 'currentColor' : 'none'}
                                                        className={star <= fb.rating ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}
                                                    />
                                                ))}
                                                <span className="ml-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                                    {fb.rating}
                                                </span>
                                            </div>
                                        </div>
                                        {fb.comment && (
                                            <p className="mt-2 rounded-lg bg-zinc-50 p-2.5 text-xs italic text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                                                "{fb.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {clientFeedbacks.length === 0 && (
                                    <div className="p-6 text-center text-xs text-zinc-500">
                                        Nenhuma avaliação registrada ainda.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {creatives.map((creative) => (
                                    <div key={creative.name} className={`flex min-h-[41px] items-center px-5 sm:px-[30px] border-b last:border-b-0 ${ALLYO_BORDER}`}>
                                        <span className="w-[130px] shrink-0 truncate text-xs font-medium text-[#fd6b32]">{creative.name}</span>
                                        <span className="relative h-[30px] min-w-0 flex-1">
                                            <span className="absolute inset-y-0 left-0 border-r border-[#fd6b32] bg-gradient-to-l from-[#ffeee8] to-transparent dark:from-orange-950/30" style={{ width: `${(creative.score / 110) * 100}%` }} />
                                        </span>
                                        <span className="w-11 text-right text-[10px] font-medium">{creative.score}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

const Metric = ({
    label,
    value,
    subtext,
    isRating,
}: {
    label: string;
    value: string;
    subtext?: string;
    isRating?: boolean;
}) => (
    <div className={`flex min-h-[170px] flex-col justify-between border-r p-5 last:border-r-0 sm:p-[30px] ${ALLYO_BORDER}`}>
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{label}</span>
            {isRating && (
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <Star size={13} fill="currentColor" />
                    <span className="text-[11px] font-bold">5 estrelas max</span>
                </div>
            )}
        </div>
        <div>
            <span className="font-season text-[32px] font-normal leading-none">{value}</span>
            {subtext && (
                <span className="mt-2 block text-xs text-zinc-500 dark:text-zinc-400">{subtext}</span>
            )}
        </div>
    </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[72px] items-center px-5 sm:px-[30px]"><h2 className="text-sm font-medium">{children}</h2></div>
);

export default AllyoOverviewView;
