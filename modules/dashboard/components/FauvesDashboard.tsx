import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { Organization, User } from '../../../types';
import PlaceholderView from '../../../components/PlaceholderView';
import { FauvesToastProvider } from './fauves/FauvesUI';

const FauvesOverviewView = React.lazy(() => import('./fauves/FauvesOverviewView'));
const FauvesOrganizationsView = React.lazy(() => import('./fauves/FauvesOrganizationsView'));
const FauvesEventsAdminView = React.lazy(() => import('./fauves/FauvesEventsAdminView'));
const FauvesFinanceAdminView = React.lazy(() => import('./fauves/FauvesFinanceAdminView'));
const FauvesMarketingView = React.lazy(() => import('./fauves/FauvesMarketingView'));
const FauvesAuditSettingsView = React.lazy(() => import('./fauves/FauvesAuditSettingsView'));
const ManagementView = React.lazy(() => import('./fauves/ManagementView'));
const SupportView = React.lazy(() => import('./fauves/SupportView'));
const LeadsView = React.lazy(() => import('./fauves/LeadsView'));
const ReportsView = React.lazy(() => import('./fauves/ReportsView'));

interface FauvesDashboardProps {
    user: User;
    activeView: string;
    onNavigate?: (view: string, data?: unknown) => void;
    viewData?: unknown;
    organization?: Organization;
}

const FauvesDashboard: React.FC<FauvesDashboardProps> = ({ activeView, user }) => {
    const userName = user?.name ? user.name.split(' ')[0] : 'Usuário';

    const renderView = () => {
        switch (activeView) {
            case 'overview': return <FauvesOverviewView userName={userName} />;
            case 'organizations': return <FauvesOrganizationsView />;
            case 'events': return <FauvesEventsAdminView />;
            case 'users': return <ManagementView type="users" />;
            case 'finance': return <FauvesFinanceAdminView />;
            case 'helpdesk':
            case 'helpdesk-tickets':
            case 'helpdesk-chat':
            case 'helpdesk-center': return <SupportView activeSubView={activeView} />;
            case 'marketing': return <FauvesMarketingView />;
            case 'slides': return <FauvesMarketingView initialTab="slides" />;
            case 'artists': return <FauvesMarketingView initialTab="artists" />;
            case 'ads': return <FauvesMarketingView initialTab="ads" />;
            case 'settings': return <FauvesAuditSettingsView />;
            case 'leads': return <LeadsView />;
            case 'reports': return <ReportsView />;
            case 'categories': return <ManagementView type="categories" />;
            default: return <PlaceholderView title={`Fauves ${activeView}`} icon={LayoutTemplate} description="Esta área ainda não está disponível para a operação." />;
        }
    };

    return (
        <FauvesToastProvider>
            <div className={`h-full overflow-y-auto transition-colors ${activeView === 'overview' ? 'bg-white dark:bg-zinc-950' : 'bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,.08),transparent_28%),linear-gradient(to_bottom,#f8fafc,#ffffff_32%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,.08),transparent_28%),linear-gradient(to_bottom,#09090b,#09090b)]'}`}>
                <div className={activeView === 'overview' ? 'min-h-full' : 'min-h-full p-4 sm:p-6 lg:p-8'}>
                    <div className={activeView === 'overview' ? 'min-h-full' : 'mx-auto max-w-[1500px]'}><React.Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm font-semibold text-[#2a2ad7]">Carregando Fauves…</div>}>{renderView()}</React.Suspense></div>
                </div>
            </div>
        </FauvesToastProvider>
    );
};

export default FauvesDashboard;
