import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ALLYO_BORDER, ALLYO_TASKS, AllyoPageHeader, TaskRow } from './AllyoUI';

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
                    <PanelTitle>Créditos entregues vs. aprovados</PanelTitle>
                    <div className="h-[374px] overflow-x-auto border-t dark:border-zinc-800">
                        <div className="h-full min-w-[560px] px-3 pb-4 pt-5 sm:px-5">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={credits} margin={{ top: 8, right: 0, left: -6, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="allyoDeliveredCredits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2a2ad7" stopOpacity={0.18} />
                                            <stop offset="100%" stopColor="#2a2ad7" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#e5e5e5" horizontal={false} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={{ stroke: '#e5e5e5' }}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#616161', fontFamily: 'Plus Jakarta Sans' }}
                                        interval={0}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#616161', fontFamily: 'Plus Jakarta Sans' }}
                                        width={38}
                                        domain={[0, 250]}
                                        ticks={[0, 50, 100, 150, 200, 250]}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#d4d4d8', strokeWidth: 1 }}
                                        formatter={(value, name) => [Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }), name]}
                                        contentStyle={{ border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 11, boxShadow: 'none' }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="delivered"
                                        name="Créditos entregues"
                                        stroke="#2a2ad7"
                                        strokeWidth={2}
                                        fill="url(#allyoDeliveredCredits)"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#ffffff', stroke: '#2a2ad7', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="approved"
                                        name="Créditos aprovados"
                                        stroke="#00a33c"
                                        strokeWidth={2}
                                        fill="transparent"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#ffffff', stroke: '#00a33c', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
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
