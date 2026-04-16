
import React, { useState } from 'react';
import { 
    LayoutTemplate, Zap, Globe, Bot, TrendingUp, LayoutGrid, Calendar, Download
} from 'lucide-react';
import { User, Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import TokyonFinancialView from './tokyon/TokyonFinancialView';
import TokyonSettingsView from './tokyon/TokyonSettingsView';
import TokyonClientPortal from './tokyon/TokyonClientPortal';
import GenericKanbanView from './tokyon/GenericKanbanView';
import TokyonOverviewView from './tokyon/TokyonOverviewView';
import TokyonOrangeProgramListView from './tokyon/TokyonOrangeProgramListView';
import TokyonClientListView from './tokyon/TokyonClientListView';

interface TokyonDashboardProps {
    user: User;
    activeView: string;
    organization?: Organization;
    onNavigate?: (view: string) => void;
}

const TokyonDashboard: React.FC<TokyonDashboardProps> = ({ activeView, organization, onNavigate }) => {
    const [viewingAsClient, setViewingAsClient] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [orangeSubView, setOrangeSubView] = useState<'list' | 'details'>('list');

    // Helper to handle navigation from Kanban
    const handleStrategicJump = (client: any) => {
        setSelectedClient(client);
        setOrangeSubView('details');
        if (onNavigate) onNavigate('orange-program');
    };

    // If viewing as client, override everything else
    if (viewingAsClient) {
        return (
            <div className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 overflow-y-auto">
                <TokyonClientPortal onExit={() => setViewingAsClient(false)} />
            </div>
        );
    }

    // OVERVIEW VIEW
    if (activeView === 'overview') {
        return <TokyonOverviewView />;
    }

    // BOARDS / KANBAN VIEWS
    if (['clients', 'projects', 'generic-board'].includes(activeView)) {
        return <GenericKanbanView initialBoardId={activeView} onViewChange={(view) => {
            if (onNavigate) onNavigate(view);
        }} onStrategicJump={handleStrategicJump} />;
    }

    // FINANCIAL VIEW
    if (activeView === 'financial') {
        return <TokyonFinancialView />;
    }

    // CLIENT LIST VIEW
    if (activeView === 'client-list') {
        return <TokyonClientListView />;
    }

    // SETTINGS VIEW
    if (activeView === 'settings') {
        return <TokyonSettingsView onOpenClientPortal={() => setViewingAsClient(true)} organization={organization} />;
    }

    // ORANGE PROGRAM VIEW (The core product details)
    if (activeView === 'orange-program') {
        if (orangeSubView === 'list' && !selectedClient) {
            return (
                <TokyonOrangeProgramListView 
                    onSelectClient={(client) => {
                        setSelectedClient(client);
                        setOrangeSubView('details');
                    }} 
                />
            );
        }

        return (
            <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
                <div className="max-w-6xl mx-auto">
                     <TokyonOrangeProgramView 
                        client={selectedClient} 
                        onBack={() => {
                            setSelectedClient(null);
                            setOrangeSubView('list');
                        }}
                    />
                </div>
            </div>
        );
    }

    // Fallback for other views
    return (
        <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
            <PlaceholderView
                title={`Tokyon ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                icon={LayoutTemplate}
                description="Módulo em desenvolvimento."
            />
        </div>
    );
};

// Extracted internal component for Orange Program
const TokyonOrangeProgramView: React.FC<{ client?: any; onBack?: () => void }> = ({ client, onBack }) => {
    const clientName = client?.name || client?.title || 'XP Inc.';
    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-6">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-xl text-docka-400 dark:text-zinc-500 transition-colors"
                        >
                            <LayoutGrid size={24} />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-orange-600 text-white p-1 rounded">
                                <Zap size={16} fill="currentColor" />
                            </div>
                            <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">
                                Orange Program™ • {clientName}
                            </h1>
                        </div>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm">
                            Acompanhamento estratégico para {clientName}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">Módulo Ativo</span>
                </div>
            </div>

            {/* Project Status Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-docka-50 dark:bg-zinc-900 p-6 rounded-2xl border border-docka-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-docka-400 uppercase mb-2 tracking-widest">Saúde da Entrega</p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center text-emerald-600 font-bold text-sm">85%</div>
                        <div>
                            <p className="text-lg font-bold text-docka-900 dark:text-zinc-100">Dentro do Prazo</p>
                            <p className="text-xs text-docka-500">Milestone: Identidade Visual</p>
                        </div>
                    </div>
                </div>
                <div className="bg-docka-50 dark:bg-zinc-900 p-6 rounded-2xl border border-docka-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-docka-400 uppercase mb-2 tracking-widest">Aproveitamento Comercial</p>
                    <p className="text-3xl font-bold text-orange-600">+22%</p>
                    <p className="text-xs text-docka-500 mt-1">Geração de Leads Qualificados</p>
                </div>
                <div className="bg-docka-50 dark:bg-zinc-900 p-6 rounded-2xl border border-docka-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-docka-400 uppercase mb-2 tracking-widest">Vigência Contratual</p>
                    <p className="text-lg font-bold text-docka-900 dark:text-zinc-100">12 Meses</p>
                    <p className="text-xs text-docka-500 mt-1">Expira em: Jan 2027</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                {[
                    { title: 'Posicionamento', icon: Zap, desc: 'Brand Core & Identidade', color: 'bg-docka-900 dark:bg-zinc-800', status: '100%', badge: 'Finalizado' },
                    { title: 'Presença Digital', icon: Globe, desc: 'Evolução Web & Social', color: 'bg-orange-600', status: '60%', badge: 'Ativo' },
                    { title: 'Automação', icon: Bot, desc: 'CRM & Fluxos de IA', color: 'bg-docka-900 dark:bg-zinc-800', status: '0%', badge: 'Aguardando' },
                    { title: 'Crescimento', icon: TrendingUp, desc: 'SalesKit & Estratégia', color: 'bg-docka-900 dark:bg-zinc-800', status: '0%', badge: 'Aguardando' },
                    { title: 'Design UI/UX', icon: LayoutGrid, desc: 'Interfaces de Alta Fidelidade', color: 'bg-docka-900 dark:bg-zinc-800', status: '0%', badge: 'Aguardando' },
                ].map((pillar, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-4 relative group hover:shadow-lg hover:border-orange-200 dark:hover:border-zinc-700 transition-all hover:-translate-y-1">
                        <div className={`w-10 h-10 ${pillar.color} rounded-lg flex items-center justify-center text-white mb-3 shadow-md`}>
                            <pillar.icon size={20} />
                        </div>
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-1">{pillar.title}</h3>
                        <p className="text-xs text-docka-500 dark:text-zinc-400 mb-4">{pillar.desc}</p>
                        
                        <div className="mt-auto">
                            <div className="flex justify-between text-[10px] font-bold mb-1">
                                <span className={pillar.status === '100%' ? 'text-emerald-600' : 'text-orange-600'}>{pillar.badge}</span>
                                <span className="text-docka-400">{pillar.status}</span>
                            </div>
                            <div className="w-full h-1 bg-docka-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full ${pillar.status === '100%' ? 'bg-emerald-500' : 'bg-orange-600'} rounded-full`} style={{ width: pillar.status }} />
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 text-xs font-bold text-docka-200 dark:text-zinc-800 group-hover:text-docka-300 dark:group-hover:text-zinc-700 transition-colors">0{i + 1}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-lg text-docka-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                        <Calendar size={18} className="text-orange-600" /> Próximas Entregas Estratégicas
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: 'Apresentação: Identidade Visual Taurus', date: 'Hoje, 16:00', type: 'Reunião' },
                            { title: 'Lançamento Landing Page Evolution', date: 'Sex, 14 Mar', type: 'Release' },
                            { title: 'Treinamento CRM (Soma)', date: 'Seg, 17 Mar', type: 'Onboarding' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-docka-50 dark:bg-zinc-800/50 rounded-xl hover:bg-docka-100 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-600" />
                                    <div>
                                        <p className="text-sm font-bold text-docka-900 dark:text-zinc-100">{item.title}</p>
                                        <p className="text-xs text-docka-500">{item.date}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-docka-400 uppercase bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-docka-100 dark:border-zinc-800">{item.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-docka-900 dark:bg-zinc-900 border border-docka-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col h-full">
                        <h3 className="text-white font-bold text-lg mb-2">Relatório de Impacto</h3>
                        <p className="text-zinc-400 text-sm mb-6">Visualização consolidada de ROI e eficiência para este cliente.</p>
                        
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="bg-zinc-800/50 backdrop-blur-md rounded-xl p-4 border border-zinc-700/50">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">CPA Médio</p>
                                <p className="text-xl font-bold text-white">R$ 14,50</p>
                            </div>
                            <div className="bg-zinc-800/50 backdrop-blur-md rounded-xl p-4 border border-zinc-700/50">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Conversão Web</p>
                                <p className="text-xl font-bold text-white">4.8%</p>
                            </div>
                        </div>
                        
                        <button className="w-full mt-6 bg-white py-3 rounded-xl text-zinc-900 font-bold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
                             Gerar PDF Executivo <Download size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokyonDashboard;
