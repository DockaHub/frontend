
import React from 'react';
import { User, Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import { LayoutTemplate } from 'lucide-react';
import HostiziOverviewView from './hostizi/HostiziOverviewView';
import HostiziHostingView from './hostizi/HostiziHostingView';
import HostiziDomainsView from './hostizi/HostiziDomainsView';
import HostiziWebmailView from './hostizi/HostiziWebmailView';
import HostiziFinancialView from './hostizi/HostiziFinancialView';
import HostiziSupportView from './hostizi/HostiziSupportView';
import HostiziSettingsView from './hostizi/HostiziSettingsView';
import HostiziClientsView from './hostizi/HostiziClientsView';

interface HostiziDashboardProps {
    user: User;
    activeView: string;
    organization?: Organization;
}

const HostiziDashboard: React.FC<HostiziDashboardProps> = ({ activeView, organization }) => {

    switch (activeView) {
        case 'overview':
            return <HostiziOverviewView />;
        case 'clients':
            return <HostiziClientsView />;
        case 'hosting':
            return <HostiziHostingView />;
        case 'domains':
            return <HostiziDomainsView />;
        case 'webmail':
            return <HostiziWebmailView />;
        case 'financial':
            return <HostiziFinancialView />;
        case 'support':
            return <HostiziSupportView />;
        case 'settings':
            return <HostiziSettingsView organization={organization} />;
        default:
            return (
                <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
                    <PlaceholderView
                        title={`Hostizi ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                        icon={LayoutTemplate}
                        description="Módulo em desenvolvimento."
                    />
                </div>
            );
    }
};

export default HostiziDashboard;
