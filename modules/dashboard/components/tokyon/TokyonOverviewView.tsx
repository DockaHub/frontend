
import React from 'react';
import { 
    Zap, Briefcase, TrendingUp, Users, Clock, ArrowUpRight,
    BarChart, Target, AlertCircle, CheckCircle2
} from 'lucide-react';

const TokyonOverviewView: React.FC = () => {
    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar transition-colors animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">Visão Geral</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Status operacional e comercial de todos os eixos da Tokyon.</p>
                </div>

                {/* Big Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-orange-600 dark:text-orange-500">
                                <Zap size={20} fill="currentColor" />
                                <span className="text-xs font-bold uppercase tracking-wider">Aproveitamento Comercial</span>
                            </div>
                            <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 mb-1">82%</h3>
                            <p className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                                <TrendingUp size={12} /> +4% vs mês anterior
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Briefcase size={20} /></div>
                            <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">12 Ativos</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">12</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-400 mt-1">Projetos em Execução</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Users size={20} /></div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-full">92% CSAT</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">R$ 1.2M</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-400 mt-1">Pipeline de Vendas</p>
                    </div>
                </div>

                {/* ORCHESTRA DASHBOARD SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Sales Funnel */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-docka-200 dark:border-zinc-800 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Target size={16} className="text-orange-600" /> Funnel de Vendas
                            </h3>
                            <span className="text-[10px] font-bold text-docka-400 uppercase tracking-widest">Este Mês</span>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { label: 'Leads', value: 45, color: 'bg-docka-900 dark:bg-zinc-700' },
                                { label: 'Qualificação', value: 28, color: 'bg-indigo-600' },
                                { label: 'Proposta', value: 12, color: 'bg-amber-500' },
                                { label: 'Negociação', value: 6, color: 'bg-orange-600' },
                                { label: 'Ganho', value: 4, color: 'bg-emerald-500' },
                            ].map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="flex justify-between items-center text-[10px] font-bold mb-1 px-1">
                                        <span className="text-docka-600 dark:text-zinc-400 uppercase tracking-tight">{step.label}</span>
                                        <span className="text-docka-900 dark:text-zinc-100">{step.value}</span>
                                    </div>
                                    <div className="w-full h-8 bg-docka-50 dark:bg-zinc-800 rounded-lg overflow-hidden flex shadow-inner">
                                        <div 
                                            className={`h-full ${step.color} flex items-center px-3 transition-all duration-1000 ease-out`}
                                            style={{ width: `${(step.value / 45) * 100}%` }}
                                        >
                                            <div className="w-full h-1 bg-white/20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Health Dashboard */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-docka-200 dark:border-zinc-800 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Zap size={16} className="text-emerald-500" /> Saúde da Operação
                            </h3>
                            <button className="text-[10px] font-bold text-orange-600 hover:underline uppercase tracking-widest">Ver Projetos</button>
                        </div>

                        <div className="flex gap-6 mb-8">
                             <div className="flex-1 flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 transition-all hover:scale-105">
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">08</span>
                                <span className="text-[10px] font-bold text-emerald-700/60 dark:text-emerald-400/60 uppercase text-center leading-tight">No Prazo</span>
                             </div>
                             <div className="flex-1 flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/20 transition-all hover:scale-105">
                                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">03</span>
                                <span className="text-[10px] font-bold text-orange-700/60 dark:text-orange-400/60 uppercase text-center leading-tight">Em Atenção</span>
                             </div>
                             <div className="flex-1 flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/20 transition-all hover:scale-105">
                                <span className="text-2xl font-black text-red-600 dark:text-red-400">01</span>
                                <span className="text-[10px] font-bold text-red-700/60 dark:text-red-400/60 uppercase text-center leading-tight">Atrasado</span>
                             </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest border-b border-docka-50 dark:border-zinc-800 pb-2">Gargalos Críticos</h4>
                            {[
                                { project: 'SulAmérica: Redesign', issue: 'Aguardando Feedback Asset V3', days: '3 dias', status: 'at-risk' },
                                { project: 'Coca-Cola: Campanha', issue: 'Aprovação de Orçamento Extra', days: '1 dia', status: 'delayed' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-docka-50 dark:bg-zinc-800/40 rounded-xl hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors">
                                    <div className={`w-2 h-2 rounded-full ${item.status === 'at-risk' ? 'bg-orange-500' : 'bg-red-500'} animate-pulse`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-docka-900 dark:text-zinc-100 truncate">{item.project}</p>
                                        <p className="text-[10px] text-docka-500 dark:text-zinc-500 truncate">{item.issue}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-docka-400 dark:text-zinc-600 shrink-0">{item.days}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activities */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-docka-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 flex justify-between items-center">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Clock size={16} className="text-docka-400" /> Atividades Recentes
                            </h3>
                            <button className="text-xs text-orange-600 font-bold hover:underline">Ver CRM</button>
                        </div>
                        <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {[
                                { title: 'Design de Interface (XP Inc)', time: 'Há 2h', type: 'design' },
                                { title: 'Sprint Web Evolution concluída', time: 'Há 5h', type: 'project' },
                                { title: 'Assinatura Brandbook (Soma)', time: 'Ontem', type: 'design' },
                                { title: 'Novo lead via LinkedIn', time: 'Ontem', type: 'sales' },
                            ].map((item, i) => (
                                <div key={i} className="px-6 py-4 hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-docka-900 dark:text-zinc-100">{item.title}</p>
                                            <span className="text-xs text-docka-400 dark:text-zinc-500">{item.time}</span>
                                        </div>
                                        <ArrowUpRight size={14} className="text-docka-300" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marketing Ad / Orange Program Promo */}
                    <div className="space-y-6">
                        <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col h-full">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-4">Execução Total</h4>
                                <h2 className="text-2xl font-black mb-2 tracking-tighter">Orange Program™</h2>
                                <p className="text-sm opacity-90 mb-6 leading-relaxed">Sua infraestrutura de execução high-ticket operando em capacidade total.</p>
                                <button className="mt-auto bg-white text-orange-600 px-6 py-3 rounded-xl text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-center uppercase">
                                    Expandir Operação
                                </button>
                            </div>
                            <Zap className="absolute -right-12 -bottom-12 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                <div className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase mb-2 tracking-widest">SLA Médio</div>
                                <div className="text-2xl font-black text-docka-900 dark:text-zinc-100">2.4 <span className="text-xs font-medium text-docka-400">dias</span></div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                                <div className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase mb-2 tracking-widest">Conversão Final</div>
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">12.5%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokyonOverviewView;
