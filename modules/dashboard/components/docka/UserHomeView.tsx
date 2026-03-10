
import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, Calendar as CalendarIcon, ArrowRight, Building2, Plus, Search } from 'lucide-react';
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

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                            {greeting}, {user?.name?.split(' ')[0] || 'Visitante'}. <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-docka-500 dark:text-zinc-400 mt-1 capitalize">
                            {currentDate} • Você tem <strong className="text-docka-800 dark:text-zinc-200">{data?.tasks.length || 0} tarefas pendentes</strong> para hoje.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 text-docka-700 dark:text-zinc-300 border border-docka-200 dark:border-zinc-800 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
                            <Search size={16} /> Buscar
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-docka-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium shadow-sm">
                            <Plus size={16} /> Nova Tarefa
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (2/3) - Organizations & Projects */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Organizations Section */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Building2 size={18} className="text-docka-400 dark:text-zinc-500" /> Meus Espaços de Trabalho
                                </h2>
                                <button className="text-xs text-docka-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-medium">Gerenciar todos</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data?.organizations.map(org => (
                                    <div key={org.id} className="group bg-white dark:bg-zinc-900 p-5 rounded-xl border border-docka-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                        onClick={() => window.location.href = `/dashboard?org=${org.id}&view=overview`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={18} className="text-indigo-500" />
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-lg ${org.logoColor || 'bg-docka-500'} flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0`}>
                                                {org.name.substring(0, 1)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{org.name}</h3>
                                                <p className="text-xs text-docka-500 dark:text-zinc-400">{org.type}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-docka-500 dark:text-zinc-500">
                                            <div className="flex items-center gap-1.5 bg-docka-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                                <CheckSquare size={12} /> <span>{org.features ? (org as any)._count?.tasks || 0 : 0} Tarefas</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-docka-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                                <Clock size={12} /> <span>Ativo</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Org Card */}
                                <div className="border border-dashed border-docka-300 dark:border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-docka-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group min-h-[140px]">
                                    <div className="w-10 h-10 rounded-full bg-docka-100 dark:bg-zinc-800 flex items-center justify-center text-docka-400 dark:text-zinc-500 mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-docka-600 dark:text-zinc-400 group-hover:text-docka-900 dark:group-hover:text-zinc-200">Criar nova organização</span>
                                </div>
                            </div>
                        </section>

                        {/* Recent Activity / Updates (Placeholder) */}
                        <section>
                            <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-docka-400 dark:text-zinc-500" /> Atividade Recente
                            </h2>
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 divide-y divide-docka-100 dark:divide-zinc-800">
                                {(data?.activity || []).length > 0 ? data?.activity.map((act, i) => (
                                    <div key={i} className="p-4 flex gap-4 hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                            <CheckSquare size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-docka-800 dark:text-zinc-200">
                                                {act.message}
                                            </p>
                                            <p className="text-xs text-docka-400 dark:text-zinc-500 mt-1">
                                                {new Date(act.time).toLocaleDateString()} {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-docka-400 dark:text-zinc-500 italic text-sm">
                                        Nenhuma atividade recente encontrada.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (1/3) - Tasks & Agenda */}
                    <div className="space-y-8">

                        {/* Tasks Widget */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                    <CheckSquare size={16} className="text-indigo-500" /> Minhas Tarefas
                                </h3>
                                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Ver todas</button>
                            </div>
                            <div className="divide-y divide-docka-100 dark:divide-zinc-800">
                                {(data?.tasks || []).length > 0 ? data?.tasks.map(task => (
                                    <div key={task.id} className="p-4 hover:bg-docka-50 dark:hover:bg-zinc-800/30 transition-colors flex gap-3 group">
                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${task.status === 'DONE' ? 'bg-emerald-500 border-emerald-500' : 'border-docka-300 dark:border-zinc-600 hover:border-indigo-500'}`}>
                                            {task.status === 'DONE' && <CheckSquare size={10} className="text-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'text-docka-400 line-through' : 'text-docka-800 dark:text-zinc-200'}`}>{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                    task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                        'bg-docka-100 text-docka-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                    }`}>{task.priority}</span>
                                                <span className="text-xs text-docka-400 dark:text-zinc-500 flex items-center gap-1">
                                                    <Clock size={10} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { day: '2-digit', month: 'short' }) : 'S/ data'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-docka-400 dark:text-zinc-500 italic text-sm">
                                        Nenhuma tarefa pendente.
                                    </div>
                                )}
                            </div>
                            <button className="w-full py-2 text-xs text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors border-t border-docka-100 dark:border-zinc-800">
                                + Adicionar rápida
                            </button>
                        </div>

                        {/* Calendar / Agenda Widget */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CalendarIcon size={100} />
                            </div>
                            <h3 className="font-bold text-lg mb-4 relative z-10">Agenda de Hoje</h3>

                            <div className="space-y-4 relative z-10">
                                {(data?.agenda || []).length > 0 ? data?.agenda.map((event, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm">{event.title}</p>
                                                <p className="text-xs text-indigo-100">{event.organization?.name || 'Evento'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">
                                                    {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-xs text-indigo-100 capitalize">{event.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-4 text-center text-indigo-100/60 italic text-sm">
                                        Agenda livre para hoje!
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors relative z-10">
                                Ver calendário completo
                            </button>
                        </div>

                    </div>
                </div>

                {loading && (
                    <div className="fixed inset-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserHomeView;
