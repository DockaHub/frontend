
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


import SearchAssistant from '../../asterysko/SearchAssistant';
import AsteryskoResearchView from './asterysko/AsteryskoResearchView';

interface AsteryskoDashboardProps {
    user: User;
    activeView: string;
    organization?: Organization;
}

const AsteryskoDashboard: React.FC<AsteryskoDashboardProps> = ({ activeView, organization }) => {
    const [viewingAsClient, setViewingAsClient] = useState(false);

    // If viewing as client, override everything else
    if (viewingAsClient) {
        return (
            <div className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 overflow-y-auto">
                <AsteryskoClientPortal onExit={() => setViewingAsClient(false)} />
            </div>
        );
    }

    // Routing
    switch (activeView) {
        case 'search':
            // NOTE: 'search' might refer to SearchAssistant or ResearchView. 
            // Ideally we rename 'search' to 'onboarding' or something for the assistant
            // and 'research' for the new view.
            // But for now, let's assume 'research' is the key for the new view.
            return <SearchAssistant onNext={() => { }} organizationId={organization?.id} />;

        case 'research':
            return (
                <div className="h-full overflow-y-auto">
                    <AsteryskoResearchView />
                </div>
            );

        case 'crm':
            return <AsteryskoCRMView />;
        case 'processes':
            return <AsteryskoProcessesView />;
        case 'clients':
            return <AsteryskoClientsView />;
        case 'financial':
            return <div className="h-full bg-docka-50 dark:bg-zinc-950"><AsteryskoFinancialView /></div>;
        case 'settings':
            return <AsteryskoSettingsView onOpenClientPortal={() => setViewingAsClient(true)} organization={organization} />;
        case 'documents':
            return <AsteryskoDocumentsView />;
        case 'overview':
            return <AsteryskoOverviewView />;
        default:
            return (
                <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
                    <PlaceholderView
                        title={`Asterysko ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                        icon={LayoutTemplate}
                        description="Módulo em desenvolvimento."
                    />
                </div>
            );
    }
};

export default AsteryskoDashboard;
