
import React, { useState } from 'react';
import { User, Organization } from '../../../types';
import { LayoutTemplate } from 'lucide-react';
import AsteryskoCRMView from './asterysko/AsteryskoCRMView';
import AsteryskoProcessesView from './asterysko/AsteryskoProcessesView';
import AsteryskoFinancialView from './asterysko/AsteryskoFinancialView';
import AsteryskoSettingsView from './asterysko/AsteryskoSettingsView';
import AsteryskoOverviewView from './asterysko/AsteryskoOverviewView';
import AsteryskoDocumentsView from './asterysko/AsteryskoDocumentsView';
import AsteryskoClientPortal from './asterysko/AsteryskoClientPortal';
import AsteryskoClientsView from './asterysko/AsteryskoClientsView';
import AsteryskoPerformanceView from './asterysko/AsteryskoPerformanceView';


import SearchAssistant from '../../asterysko/SearchAssistant';
import AsteryskoResearchView from './asterysko/AsteryskoResearchView';
import AsteryskoHomeView from './asterysko/AsteryskoHomeView';

interface AsteryskoDashboardProps {
    user: User;
    activeView: string;
    organization?: Organization;
}

const AsteryskoDashboard: React.FC<AsteryskoDashboardProps> = ({ user, activeView, organization }) => {
    const [viewingAsClient, setViewingAsClient] = useState(false);
    const canManageSettings = ['ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(String(user?.role || '').toUpperCase())
        || organization?.memberRole === 'OWNER'
        || organization?.memberRole === 'ADMIN';

    // If viewing as client, override everything else
    if (viewingAsClient) {
        return (
            <div className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 overflow-y-auto">
                <AsteryskoClientPortal onExit={() => setViewingAsClient(false)} />
            </div>
        );
    }

    const userName = user?.name ? user.name.split(' ')[0] : 'Usuário';

    // Routing
    switch (activeView) {
        case 'search':
            return <SearchAssistant onNext={() => { }} organizationId={organization?.id} />;

        case 'research':
            return <AsteryskoResearchView />;

        case 'opportunities':
        case 'crm':
            return <AsteryskoCRMView organization={organization} />;
        case 'processes':
            return <AsteryskoProcessesView />;
        case 'clients':
            return <AsteryskoClientsView organization={organization} />;
        case 'financial':
            return <div className="h-full bg-[#fafafa] dark:bg-zinc-950"><AsteryskoFinancialView /></div>;
        case 'settings':
            return canManageSettings
                ? <AsteryskoSettingsView onOpenClientPortal={() => setViewingAsClient(true)} organization={organization} visibleTabs={['notifications', 'crm_rules', 'plans', 'portal']} />
                : (
                    <div className="flex h-full min-h-0 w-full items-center justify-center bg-white p-6 text-center dark:bg-zinc-950">
                        <div className="max-w-md">
                            <LayoutTemplate size={28} className="mx-auto text-[#0412dd] dark:text-[#3b48ff]" />
                            <h1 className="mt-4 font-season text-2xl font-[420] text-black dark:text-white">Configurações restritas</h1>
                            <p className="mt-2 text-xs leading-6 text-[#7f7f7f] dark:text-zinc-400">Somente administradores da Asterysko podem alterar integrações, planos, regras do CRM e o Portal do Cliente.</p>
                        </div>
                    </div>
                );
        case 'performance':
            return <AsteryskoPerformanceView />;
        case 'documents':
            return <AsteryskoDocumentsView />;
        case 'overview':
        case 'home':
            return <AsteryskoHomeView userName={userName} />;
        default:
            return (
                <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
                    <AsteryskoHomeView userName={userName} />
                </div>
            );
    }
};

export default AsteryskoDashboard;
