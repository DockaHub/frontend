
import React, { useState, useEffect } from 'react';
import { Organization } from '../../types';

import FauvesDashboard from './components/FauvesDashboard';
import TokyonDashboard from './components/TokyonDashboard';
import AsteryskoDashboard from './components/AsteryskoDashboard';
import UmaChaveDashboard from './components/UmaChaveDashboard';
import ManySpaceDashboard from './components/ManySpaceDashboard';
import { ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import UnifiedSidebar, { BrandLogo } from '../../components/UnifiedSidebar';

interface DashboardLayoutProps {
    currentOrg: Organization;
    userOrgs: Organization[];
    user: any;
    onLogout: () => void;
    onOpenProfile: () => void;
    onOpenPreferences: () => void;
    theme: string;
    onToggleTheme: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ currentOrg: initialOrg, userOrgs = [], user, onLogout, onOpenProfile, onOpenPreferences, theme, onToggleTheme }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived state directly from URL - SINGLE SOURCE OF TRUTH
    const activeView = searchParams.get('view') || 'overview';
    const selectedOrgId = searchParams.get('org') || initialOrg.id;
    
    // Find selected org from userOrgs, fallback to initialOrg (prop from App.tsx)
    const selectedOrg = userOrgs.find(o => o.id === selectedOrgId) || initialOrg;

    const [viewData, setViewData] = useState<any>(null); // Data passed between views (not in URL for security/size)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper to change view
    const handleViewChange = (view: string, data: any = null) => {
        if (data) setViewData(data);

        // Update URL to reflect current view
        setSearchParams(prev => {
            prev.set('view', view);
            return prev;
        }, { replace: true });
    };

    const handleOrgChange = (org: Organization) => {
        // Update URL - This will trigger a re-render of DashboardLayout because searchParams changes
        setSearchParams(prev => {
            prev.set('org', org.id);
            prev.set('view', 'overview');
            return prev;
        }, { replace: true });
    };


    const renderContent = () => {
        if (!selectedOrg) {
            return <AsteryskoDashboard user={user} activeView={activeView} organization={initialOrg} />;
        }
        // Routing by Organization Type (More robust for real data)
        if (selectedOrg.type === 'AGENCY') {
            return <AsteryskoDashboard user={user} activeView={activeView} organization={selectedOrg} />;
        }
        if (selectedOrg.type === 'EVENT_TECH') {
            return (
                <FauvesDashboard
                    user={user}
                    activeView={activeView}
                    onNavigate={handleViewChange}
                    viewData={viewData}
                    organization={selectedOrg}
                />
            );
        }
        if (selectedOrg.type === 'INFRASTRUCTURE') {
            return <TokyonDashboard user={user} activeView={activeView} onNavigate={handleViewChange} organization={selectedOrg} />;
        }
        if (selectedOrg.slug === 'umachave') {
            return <UmaChaveDashboard user={user} activeView={activeView} organization={selectedOrg} />;
        }

        // Default / SAAS
        return <ManySpaceDashboard
            activeView={activeView}
            organization={selectedOrg}
            organizations={userOrgs}
        />;
    };

    return (
        <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white transition-colors duration-300 dark:bg-zinc-950 lg:flex-row">

            {/* MOBILE HEADER: Only visible on small screens */}
            <div className="z-20 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center border-b border-docka-200 bg-white px-4 pt-[env(safe-area-inset-top)] dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
                <button type="button" className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl text-left" onClick={() => setIsMobileMenuOpen(true)} aria-label={`Abrir menu e trocar empresa. Empresa atual: ${selectedOrg?.name || 'Asterysko'}`}>
                    <BrandLogo org={selectedOrg} size="sm" className="!h-7 !w-7 !rounded-lg" />
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-docka-900 dark:text-zinc-100">{selectedOrg?.name || 'Asterysko'}</span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-docka-500 dark:text-zinc-400">Menu e empresas <ChevronDown size={12} /></span>
                    </span>
                </button>
            </div>

            {/* SIDEBAR: Desktop (static) & Mobile (Drawer) */}

            {/* Desktop Sidebar Wrapper */}
            <div className="hidden lg:flex h-full shrink-0">
                <UnifiedSidebar
                    currentOrg={selectedOrg}
                    onOrgChange={handleOrgChange}
                    userOrgs={userOrgs}
                    user={user}
                    onLogout={onLogout}
                    onOpenProfile={onOpenProfile}
                    onOpenPreferences={onOpenPreferences}
                    theme={theme as any}
                    onToggleTheme={onToggleTheme}
                />
            </div>

            {/* Mobile Sidebar Overlay & Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute inset-y-0 left-0 flex w-[min(280px,calc(100vw-32px))] flex-col bg-white shadow-xl animate-in slide-in-from-left duration-200 dark:bg-zinc-900">
                        <UnifiedSidebar
                            currentOrg={selectedOrg}
                            onOrgChange={handleOrgChange}
                            className="w-full border-none"
                            onClose={() => setIsMobileMenuOpen(false)}
                            userOrgs={userOrgs}
                            user={user}
                            onLogout={onLogout}
                            onOpenProfile={onOpenProfile}
                            onOpenPreferences={onOpenPreferences}
                            theme={theme as any}
                            onToggleTheme={onToggleTheme}
                        />
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-white dark:bg-zinc-950">
                {renderContent()}
            </div>
        </div>
    );
};

export default DashboardLayout;
