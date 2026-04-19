
import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, Calendar as CalendarIcon, ArrowRight, Building2, Plus, Search, Users } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Organization } from '../../../../types';
import { api } from '../../../../services/api';

interface HomeData {
    organizations: Organization[];
    tasks: any[];
    agenda: any[];
    activity: any[];
}

const UserHomeView: React.FC = () => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');

        const fetchHomeData = async () => {
            try {
                const response = await api.get('/dashboard/home');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const currentDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

import DashboardPage from '../../../../components/DashboardPage';
import { Home } from 'lucide-react';

const UserHomeView: React.FC = () => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');

        const fetchHomeData = async () => {
            try {
                const response = await api.get('/dashboard/home');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    const currentDate = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <DashboardPage 
            title={`${greeting}, ${user?.name?.split(' ')[0] || 'Visitante'} 👋`}
            icon={Home}
            actions={
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 border border-docka-200 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-700 transition-all text-xs font-bold uppercase tracking-widest">
                        <Search size={14} /> Buscar
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-docka-800 dark:hover:bg-white transition-all text-xs font-bold uppercase tracking-widest shadow-sm">
                        <Plus size={14} /> Nova Tarefa
                    </button>
                </div>
            }
        >
            <div className="animate-in fade-in duration-500">
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-10 -mt-2 capitalize">
                    {currentDate} • Você tem <strong className="text-docka-900 dark:text-zinc-100">{data?.tasks.length || 0} tarefas pendentes</strong> para hoje.
                </p>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column (3/4) - Organizations & Activity */}
                    <div className="lg:col-span-3 space-y-12">

                        {/* Organizations Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-black text-docka-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-widest">
                                    <Building2 size={16} className="text-docka-400 dark:text-zinc-500" /> Meus Espaços de Trabalho
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {data?.organizations.map(org => (
                                    <div key={org.id} className="group bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 hover:border-docka-400 dark:hover:border-zinc-600 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                                        onClick={() => window.location.href = `/dashboard?org=${org.id}&view=overview`}>
                                        <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <ArrowRight size={20} className="text-docka-400 dark:text-zinc-500" />
                                        </div>

                                        <div className="flex items-center gap-5 mb-5">
                                            <div
                                                className={`w-14 h-14 rounded-xl ${!org.svgIcon ? (org.logoColor || 'bg-docka-500') : ''} flex items-center justify-center text-white font-bold text-xl shadow-inner shrink-0 overflow-hidden border border-black/5 dark:border-white/5`}
                                                style={org.svgIcon ? { backgroundColor: org.iconBg || '#2563EB', color: org.iconColor || '#ffffff' } : {}}
                                            >
                                                {org.svgIcon ? (
                                                    <div
                                                        className="w-full h-full p-3 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:block"
                                                        style={{ transform: `scale(${org.iconScale || 1})` }}
                                                        dangerouslySetInnerHTML={{
                                                            __html: org.svgIcon
                                                                .replace(/<svg([^>]*?)\s+(width|height)=["'][^"']*["']/gi, '<svg$1')
                                                                .replace(/<svg([^>]*?)\s+(width|height)=["'][^"']*["']/gi, '<svg$1')
                                                                .trim()
                                                        }}
                                                    />
                                                ) : (
                                                    org.name.substring(0, 1)
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors">{org.name}</h3>
                                                <p className="text-[10px] text-docka-400 dark:text-zinc-500 uppercase font-black mt-0.5 tracking-tighter opacity-60">Ecossistema Docka</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-docka-500 dark:text-zinc-500">
                                            {org.slug === 'asterysko' ? (
                                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold border border-blue-100 dark:border-blue-900/30 text-[10px] uppercase tracking-widest">
                                                    <Users size={12} /> <span>{org.leadsAguardando || 0} Leads</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-docka-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-widest border border-docka-100 dark:border-zinc-700/50">
                                                    <CheckSquare size={12} /> <span>{org.features ? (org as any)._count?.tasks || 0 : 0} Tarefas</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {user?.role === 'ADMIN' && (
                                    <div className="border-2 border-dashed border-docka-100 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-docka-50/50 dark:hover:bg-zinc-800/20 transition-all cursor-pointer group min-h-[160px]">
                                        <div className="w-12 h-12 rounded-full bg-docka-50 dark:bg-zinc-800 flex items-center justify-center text-docka-300 dark:text-zinc-600 mb-4 group-hover:bg-docka-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all shadow-sm">
                                            <Plus size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-widest group-hover:text-docka-900 dark:group-hover:text-zinc-100">Adicionar Organização</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section>
                            <h2 className="text-xs font-black text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2 uppercase tracking-widest">
                                <Clock size={16} className="text-docka-400 dark:text-zinc-500" /> Atividade Recente
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 divide-y divide-docka-50 dark:divide-zinc-800 shadow-sm overflow-hidden">
                                {(data?.activity || []).length > 0 ? data?.activity.map((act, i) => (
                                    <div key={i} className="p-5 flex gap-4 hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                            <CheckSquare size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-docka-900 dark:text-zinc-200 font-medium leading-relaxed">
                                                {act.message}
                                            </p>
                                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1 font-bold uppercase tracking-tight opacity-70">
                                                {new Date(act.time).toLocaleDateString()} • {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center">
                                        <Clock size={32} className="text-docka-100 dark:text-zinc-800 mx-auto mb-3" />
                                        <p className="text-[10px] font-bold uppercase text-docka-400 dark:text-zinc-500 tracking-widest">Nenhuma atividade registrada no momento.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (1/4) - Tasks & Agenda */}
                    <div className="space-y-8 lg:sticky lg:top-0 h-fit">

                        {/* Tasks Widget */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="p-5 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-docka-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-widest">
                                    <CheckSquare size={14} className="text-docka-400" /> Minhas Tarefas
                                </h3>
                                <button className="text-[9px] font-black uppercase text-docka-400 hover:text-indigo-600 tracking-widest transition-colors">Ver todas</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800 max-h-[350px] overflow-y-auto custom-scrollbar">
                                {(data?.tasks || []).length > 0 ? data?.tasks.map(task => (
                                    <div key={task.id} className="p-5 hover:bg-docka-50/50 dark:hover:bg-zinc-800/30 transition-colors flex gap-4 group">
                                        <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-all ${task.status === 'DONE' ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-sm' : 'border-docka-200 dark:border-zinc-700 hover:border-docka-900 dark:hover:border-zinc-400'}`}>
                                            {task.status === 'DONE' && <CheckSquare size={10} className="text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold leading-tight ${task.status === 'DONE' ? 'text-docka-300 dark:text-zinc-600 line-through' : 'text-docka-900 dark:text-zinc-100'}`}>{task.title}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shadow-sm border ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                                    task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30' :
                                                        'bg-docka-50 text-docka-500 border-docka-100 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700'
                                                    }`}>{task.priority}</span>
                                                <span className="text-[9px] text-docka-400 dark:text-zinc-500 font-bold uppercase flex items-center gap-1 opacity-70 tracking-tighter">
                                                    <Clock size={10} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { day: '2-digit', month: 'short' }) : 'S/ data'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center">
                                        <p className="text-[9px] font-bold uppercase text-docka-300 dark:text-zinc-600 tracking-widest leading-loose">Nada para fazer no momento.<br/>Aproveite o tempo!</p>
                                    </div>
                                )}
                            </div>
                            <button className="w-full py-3 text-[9px] font-black uppercase text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-100 hover:bg-docka-50 dark:hover:bg-zinc-800/80 transition-all border-t border-docka-50 dark:border-zinc-800 tracking-widest">
                                + Adição Rápida
                            </button>
                        </div>

                        {/* Calendar Widget */}
                        <div className="bg-docka-900 dark:bg-zinc-100 rounded-xl p-6 text-white dark:text-zinc-900 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform translate-x-4 -translate-y-4">
                                <CalendarIcon size={120} />
                            </div>
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-6 relative z-10 opacity-70">Agenda de Hoje</h3>

                            <div className="space-y-4 relative z-10">
                                {(data?.agenda || []).length > 0 ? data?.agenda.map((event, i) => (
                                    <div key={i} className="bg-white/10 dark:bg-black/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 dark:border-black/5 hover:bg-white/20 dark:hover:bg-black/10 transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs truncate leading-tight">{event.title}</p>
                                                <p className="text-[9px] font-black uppercase mt-1 opacity-60 tracking-widest">{event.organization?.name || 'Geral'}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-black text-[10px] uppercase tracking-tighter">
                                                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 ml-auto shadow-sm shadow-blue-400/50" title={event.type} />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center relative z-10">
                                        <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.15em]">Sua agenda está livre!</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-8 py-3 bg-white/10 dark:bg-black/5 hover:bg-white dark:hover:bg-zinc-900 hover:text-docka-900 dark:hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10 dark:border-black/5 shadow-inner relative z-10">
                                Calendário Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {loading && (
                <div className="fixed inset-0 bg-docka-50/80 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center z-[200] animate-in fade-in duration-500">
                    <div className="w-12 h-12 border-4 border-docka-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
                    <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-docka-900 dark:text-zinc-100 animate-pulse">Iniciando Docka</span>
                </div>
            )}
export default UserHomeView;
