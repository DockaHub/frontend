
import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import DockaOverviewView from './docka/DockaOverviewView';
import DockaEcosystemView from './docka/DockaEcosystemView';
import DockaAuditView from './docka/DockaAuditView';
import DockaBillingView from './docka/DockaBillingView';
import DockaSettingsView from './docka/DockaSettingsView';
import DockaFormsView from './docka/DockaFormsView';
import UserHomeView from './docka/UserHomeView';

interface DockaDashboardProps {
    activeView: string;
    organization?: Organization;
}

const DockaDashboard: React.FC<DockaDashboardProps> = ({ activeView, organization }) => {
    switch (activeView) {
        case 'home':
            return <UserHomeView />;
        case 'overview':
            return <DockaOverviewView />;
        case 'ecosystem':
            return <DockaEcosystemView />;
        case 'forms':
            return <DockaFormsView />;
        case 'audit':
            return <DockaAuditView />;
        case 'billing':
            return <DockaBillingView />;
        case 'settings':
            return <DockaSettingsView organization={organization} />;
        default:
            return (
                <div className="h-full bg-white animate-in fade-in duration-300">
                    <PlaceholderView
                        title={`Docka ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                        icon={LayoutTemplate}
                        description="Módulo em desenvolvimento."
                    />
                </div>
            );
    }
};

export default DockaDashboard;
