import { useEffect, useMemo, useState } from 'react';
import { ALLYO_BORDER, AllyoPageHeader, mapDemandToTasks, TaskRow, AllyoTask } from './AllyoUI';
import { allyoService } from '../../../../services/allyoService';
import { socketService } from '../../../../services/socketService';
import { Inbox } from 'lucide-react';

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

const AllyoOverviewView = ({ userName }: { userName?: string }) => {
    const firstName = userName?.trim().split(/\s+/)[0] || 'Criativo';
    const [liveTasks, setLiveTasks] = useState<AllyoTask[]>([]);

    const loadDemands = async () => {
        try {
            const res = await allyoService.getDemands();
            if (res && Array.isArray(res.demands)) {
                setLiveTasks(res.demands.flatMap(mapDemandToTasks));
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

    // 100% dados reais da API da Allyo
    const effectiveTasks = liveTasks;
    const openTasks = useMemo(() => effectiveTasks.filter((task) => task.status !== 'Concluída').slice(0, 3), [effectiveTasks]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title={`Olá, ${firstName}`} />

            <section className={`grid grid-cols-2 border-b ${ALLYO_BORDER}`} aria-label="Resumo do trabalho">
                <Metric label="Tarefas na sua fila" value={String(openTasks.length)} />
                <Metric label="Avaliação média" value="4,8" />
            </section>

            <section className={`border-b ${ALLYO_BORDER}`}>
                <div className="flex min-h-[58px] items-center justify-between px-5 sm:px-[30px]">
                    <h2 className="text-sm font-medium">Minhas tarefas</h2>
                    <span className="flex h-[25px] min-w-[25px] items-center justify-center rounded-full bg-[#ff0037] px-1.5 text-sm font-extrabold text-white">{openTasks.length}</span>
                </div>
                {openTasks.map((task) => <TaskRow key={task.id} task={task} />)}
                {openTasks.length === 0 && (
                    <div className="flex min-h-[140px] flex-col items-center justify-center p-6 text-center text-xs text-[#7f7f7f] dark:text-zinc-400">
                        <Inbox size={22} className="mb-2 text-zinc-400" />
                        <span>Nenhuma tarefa pendente na fila no momento.</span>
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
                    <PanelTitle>Top avaliações de Criativos</PanelTitle>
                    <div className="border-t dark:border-zinc-800">
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
                </div>
            </section>
        </div>
    );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
    <div className={`flex min-h-[170px] flex-col justify-between border-r p-5 last:border-r-0 sm:p-[30px] ${ALLYO_BORDER}`}>
        <span className="text-sm font-medium">{label}</span>
        <span className="font-season text-[32px] font-normal leading-none">{value}</span>
    </div>
);

const PanelTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex min-h-[72px] items-center px-5 sm:px-[30px]"><h2 className="text-sm font-medium">{children}</h2></div>
);

export default AllyoOverviewView;
