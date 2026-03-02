
import React from 'react';
import { User, Organization } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import { LayoutTemplate, Car } from 'lucide-react';
import UmaChaveOverviewView from './umachave/UmaChaveOverviewView';
import UmaChavePropertiesView from './umachave/UmaChavePropertiesView';
import UmaChaveContractsView from './umachave/UmaChaveContractsView';
import UmaChaveFinanceView from './umachave/UmaChaveFinanceView';
import UmaChaveSettingsView from './umachave/UmaChaveSettingsView';
import AsteryskoCRMView from './asterysko/AsteryskoCRMView'; // Reusing CRM

interface UmaChaveDashboardProps {
    user: User;
    activeView: string;
    organization?: Organization;
}

const UmaChaveDashboard: React.FC<UmaChaveDashboardProps> = ({ activeView, organization }) => {

    // Routing
    switch (activeView) {
        case 'overview':
            return <UmaChaveOverviewView />;
        case 'properties':
            return <UmaChavePropertiesView />;
        case 'contracts':
            return <UmaChaveContractsView />;
        case 'financial':
            return <UmaChaveFinanceView />;
        case 'crm':
            return <AsteryskoCRMView />; // Can reuse or adapt CRM
        case 'settings':
            return <UmaChaveSettingsView organization={organization} />;
        case 'vehicles':
            return (
                <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
                    <PlaceholderView
                        title="UmaChave para Dirigir"
                        icon={Car}
                        description="O marketplace de veículos está em fase de desenvolvimento. Em breve você poderá gerenciar vendas de carros por aqui."
                    />
                </div>
            );
        default:
            return (
                <div className="h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
                    <PlaceholderView
                        title={`UmaChave ${activeView.charAt(0).toUpperCase() + activeView.slice(1)}`}
                        icon={LayoutTemplate}
                        description="Módulo em desenvolvimento."
                    />
                </div>
            );
    }
};

export default UmaChaveDashboard;
