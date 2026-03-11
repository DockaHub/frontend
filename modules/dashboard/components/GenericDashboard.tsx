
import React from 'react';
import { Activity, Users, ArrowUpRight, Globe, ShieldCheck, DollarSign, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Organization } from '../../../types';
import { ORGANIZATIONS } from '../../../constants';

interface GenericDashboardProps {
    org: Organization;
}

const GenericDashboard: React.FC<GenericDashboardProps> = ({ org }) => {
    // Filter out the 'docka' org from the list to show as children
    const portfolioOrgs = ORGANIZATIONS.filter(o => o.slug !== 'docka');

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar transition-colors">
            <div className="max-w-7xl mx-auto">

                {/* Global Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Visão Global</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Painel consolidado de todas as organizações e negócios.</p>
                </div>

                {/* Consolidated Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-6 rounded-xl shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-docka-300 dark:text-zinc-500">
                                <DollarSign size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider">Receita Total do Grupo</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-1">R$ 380.200</h3>
                            <p className="text-sm text-emerald-400 dark:text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp size={12} /> +15% vs mês anterior
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform dark:text-zinc-900">
                            <Globe size={120} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Building2 size={20} /></div>
                            <span className="text-xs font-bold text-docka-500 dark:text-zinc-400 bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{portfolioOrgs.length} Empresas</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">{portfolioOrgs.length}</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-400 mt-1">Negócios Ativos</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Users size={20} /></div>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">1,842</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-400 mt-1">Usuários/Clientes Totais</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-docka-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Activity size={20} /></div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">100%</span>
                        </div>
                        <h3 className="text-3xl font-bold text-docka-900 dark:text-zinc-100">Estável</h3>
                        <p className="text-sm text-docka-500 dark:text-zinc-400 mt-1">Saúde do Ecossistema</p>
                    </div>
                </div>

                {/* Companies Grid */}
                <h2 className="text-lg font-bold text-docka-900 dark:text-zinc-100 mb-6">Performance por Empresa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {portfolioOrgs.map(org => (
                        <div key={org.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-800 p-6 hover:shadow-md hover:border-docka-300 dark:hover:border-zinc-700 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 ${!org.svgIcon ? org.logoColor : ''} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden`}
                                        style={org.svgIcon ? { backgroundColor: org.iconBg || '#2563EB', color: org.iconColor || '#ffffff' } : {}}
                                    >
                                        {org.svgIcon ? (
                                            <div
                                                className="w-full h-full p-2 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:block"
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
                                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{org.name}</h3>
                                    </div>
                                </div>
                                <button className="text-xs font-medium text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 bg-docka-50 dark:bg-zinc-800 px-2 py-1 rounded">
                                    Gerenciar
                                </button>
                            </div>

                            {/* Mock Mini Stats per Company */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-docka-500 dark:text-zinc-400 font-medium uppercase">Receita</div>
                                    <div className="font-bold text-docka-900 dark:text-zinc-100">R$ 45k</div>
                                </div>
                                <div className="w-full bg-docka-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${org.slug === 'fauves' ? 'bg-amber-500' : org.slug === 'tokyon' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: '70%' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Logs / Audit */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                            <ShieldCheck size={16} className="text-docka-400 dark:text-zinc-500" /> Log de Auditoria Global
                        </h3>
                        <button className="text-xs text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 font-medium">Ver tudo</button>
                    </div>
                    <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                        {[
                            { action: 'Novo Contrato Assinado', target: 'Uma Chave / Ed. Solar', user: 'Sistema', time: 'Há 5 min' },
                            { action: 'Acesso Administrativo', target: 'Fauves Dashboard', user: 'Alex Arquiteto', time: 'Há 12 min' },
                            { action: 'Alerta de Pagamento', target: 'Tokyon / Fatura #992', user: 'Financeiro', time: 'Há 1 hora' },
                            { action: 'Backup Realizado', target: 'Database Global', user: 'System Bot', time: 'Há 3 horas' },
                        ].map((log, i) => (
                            <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-docka-300 dark:bg-zinc-600" />
                                    <span className="text-sm font-medium text-docka-800 dark:text-zinc-200">{log.action}</span>
                                    <span className="text-xs text-docka-400 dark:text-zinc-500 hidden md:inline">em {log.target}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-docka-700 dark:text-zinc-300">{log.user}</div>
                                    <div className="text-docka-400 dark:text-zinc-500 text-[10px]">{log.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default GenericDashboard;
