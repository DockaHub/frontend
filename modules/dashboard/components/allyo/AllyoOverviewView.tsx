import React from 'react';
import { ALLYO_BORDER, ALLYO_TASKS, AllyoPageHeader, TaskRow } from './AllyoUI';

const sales = [
    { month: 'jul/25', value: 5 }, { month: 'ago/25', value: 42 }, { month: 'set/25', value: 82 },
    { month: 'out/25', value: 60 }, { month: 'nov/25', value: 160 }, { month: 'dez/25', value: 160 },
    { month: 'jan/26', value: 160 }, { month: 'fev/26', value: 160 }, { month: 'mar/26', value: 160 },
    { month: 'abr/26', value: 160 }, { month: 'mai/26', value: 160 }, { month: 'jun/26', value: 191 },
];

const creatives = [
    { name: 'Joana Martins', score: 110 },
    { name: 'Levy Camará', score: 94 },
    { name: 'Caio Alves', score: 78 },
    { name: 'Bianca Lima', score: 42 },
    { name: 'Rafael Dias', score: 18 },
];

const AllyoOverviewView = ({ userName }: { userName?: string }) => {
    const firstName = userName?.trim().split(/\s+/)[0] || 'Criativo';
    const openTasks = ALLYO_TASKS.filter((task) => task.status !== 'Concluída').slice(0, 3);

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
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.03fr_1fr]">
                <div className={`border-b xl:border-r ${ALLYO_BORDER}`}>
                    <PanelTitle>Vendas nos últimos 30 dias</PanelTitle>
                    <div className="flex h-[374px] items-end overflow-x-auto border-t px-3 pb-9 pt-5 sm:px-5 dark:border-zinc-800">
                        <div className="grid h-full w-8 shrink-0 content-between pb-1 text-right text-[9px] text-[#616161] dark:text-zinc-500">
                            {[200, 160, 120, 80, 40, 0].map((value) => <span key={value}>{value}</span>)}
                        </div>
                        <div className="flex h-full min-w-[560px] flex-1 items-end border-b border-l border-[#e5e5e5] dark:border-zinc-800">
                            {sales.map((item) => (
                                <div key={item.month} className="relative flex h-full min-w-[46px] flex-1 items-end border-r border-[#e5e5e5] dark:border-zinc-800">
                                    <div className="relative w-full border-t border-[#2a2ad7] bg-gradient-to-b from-[#ececff] to-transparent dark:from-indigo-950/60" style={{ height: `${Math.max(10, item.value / 2)}%` }}>
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-black dark:text-zinc-300">{item.value}</span>
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
