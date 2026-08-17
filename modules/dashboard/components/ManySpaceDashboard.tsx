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
import DockaGroupFinanceView from './docka/DockaGroupFinanceView';
import DockaClientsView from './docka/DockaClientsView';
import DockaTeamAccessView from './docka/DockaTeamAccessView';
import DockaAutomationView from './docka/DockaAutomationView';

interface ManySpaceDashboardProps {
    activeView: string;
    organization?: Organization;
    organizations?: Organization[];
}

const ManySpaceDashboard: React.FC<ManySpaceDashboardProps> = ({ activeView, organization, organizations = [] }) => {
    switch (activeView) {
        case 'home':
            return <UserHomeView />;
        case 'overview':
            return <DockaOverviewView />;
        case 'ecosystem':
            return <DockaEcosystemView />;
        case 'clients':
            return <DockaClientsView />;
        case 'team':
            return <DockaTeamAccessView organizations={organizations} />;
        case 'automations':
            return <DockaAutomationView organizations={organizations} />;
        case 'forms':
            return <DockaFormsView />;
        case 'audit':
            return <DockaAuditView />;
        case 'finance':
            return <DockaGroupFinanceView />;
        case 'billing':
            return <DockaBillingView />;
        case 'settings':
            return <DockaSettingsView organization={organization} organizations={organizations} />;
        default:
            return (
                <div className="h-full bg-white animate-in fade-in duration-300">
                    <PlaceholderView
                        title={`ManySpace ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                        icon={LayoutTemplate}
                        description="Módulo em desenvolvimento."
                    />
                </div>
            );
    }
};

export default ManySpaceDashboard;
