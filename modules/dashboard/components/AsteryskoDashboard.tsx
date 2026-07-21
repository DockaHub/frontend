
import React, { useState } from 'react';
import { User, Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
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

        case 'crm':
            return <AsteryskoCRMView organization={organization} />;
        case 'processes':
            return <AsteryskoProcessesView />;
        case 'clients':
            return <AsteryskoClientsView organization={organization} />;
        case 'financial':
            return <div className="h-full bg-[#fafafa] dark:bg-zinc-950"><AsteryskoFinancialView /></div>;
        case 'settings':
            return <AsteryskoSettingsView onOpenClientPortal={() => setViewingAsClient(true)} organization={organization} />;
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
