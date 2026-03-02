
import React, { useState } from 'react';
import {
    Zap, Globe, Bot, TrendingUp, ShieldCheck, LayoutTemplate
} from 'lucide-react';
import { User, Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import TokyonClientsView from './tokyon/TokyonClientsView';
import TokyonFinancialView from './tokyon/TokyonFinancialView';
import TokyonSettingsView from './tokyon/TokyonSettingsView';
import TokyonClientPortal from './tokyon/TokyonClientPortal';

interface TokyonDashboardProps {
    user: User;
    activeView: string;
    organization?: Organization;
}

const TokyonDashboard: React.FC<TokyonDashboardProps> = ({ activeView, organization }) => {
    const [viewingAsClient, setViewingAsClient] = useState(false);

    // If viewing as client, override everything else
    if (viewingAsClient) {
        return (
            <div className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 overflow-y-auto">
                <TokyonClientPortal onExit={() => setViewingAsClient(false)} />
            </div>
        );
    }

    // KANBAN / CRM / PROJECTS VIEW
    if (activeView === 'clients') {
        return <TokyonClientsView />;
    }

    // FINANCIAL VIEW
    if (activeView === 'financial') {
        return <TokyonFinancialView />;
    }

    // SETTINGS VIEW
    if (activeView === 'settings') {
        return <TokyonSettingsView onOpenClientPortal={() => setViewingAsClient(true)} organization={organization} />;
    }

    // ORANGE PROGRAM VIEW (The core product details)
    if (activeView === 'orange-program') {
        return (
            <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-orange-600 text-white p-1 rounded">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">Orange Program</h1>
                            </div>
                            <p className="text-docka-500 dark:text-zinc-400 text-sm">Execução estratégica completa para marcas high-ticket.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">Módulo Ativo</span>
                        </div>
                    </div>

                    {/* The 5 Pillars Visual */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                        {[
                            { title: 'Posicionamento', icon: Zap, desc: 'Brand Core & Identidade', color: 'bg-docka-900 dark:bg-zinc-800' },
                            { title: 'Presença Digital', icon: Globe, desc: 'Evolução Web & Social', color: 'bg-orange-600' },
                            { title: 'Automação', icon: Bot, desc: 'CRM & Fluxos de IA', color: 'bg-docka-900 dark:bg-zinc-800' },
                            { title: 'Crescimento', icon: TrendingUp, desc: 'SalesKit & Estratégia', color: 'bg-docka-900 dark:bg-zinc-800' },
                            { title: 'Proteção', icon: ShieldCheck, desc: 'INPI & BrandGuard', color: 'bg-blue-700' },
                        ].map((pillar, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-4 relative group hover:shadow-lg hover:border-orange-200 dark:hover:border-zinc-700 transition-all hover:-translate-y-1">
                                <div className={`w-10 h-10 ${pillar.color} rounded-lg flex items-center justify-center text-white mb-3 shadow-md`}>
                                    <pillar.icon size={20} />
                                </div>
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm mb-1">{pillar.title}</h3>
                                <p className="text-xs text-docka-500 dark:text-zinc-400">{pillar.desc}</p>
                                <div className="absolute top-4 right-4 text-xs font-bold text-docka-300 dark:text-zinc-700 group-hover:text-docka-900 dark:group-hover:text-zinc-300 transition-colors">0{i + 1}</div>
                            </div>
                        ))}
                    </div>

                    {/* Placeholder for content below pillars */}
                    <div className="bg-docka-50 dark:bg-zinc-900/50 border border-dashed border-docka-200 dark:border-zinc-800 rounded-xl p-12 text-center">
                        <p className="text-docka-400 dark:text-zinc-600 font-medium text-sm">Selecione um cliente para ver o detalhamento do programa.</p>
                    </div>
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

export default TokyonDashboard;
