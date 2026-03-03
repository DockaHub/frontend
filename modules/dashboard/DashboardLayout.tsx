
import React, { useState, useEffect } from 'react';
import { Organization } from '../../types';

import FauvesDashboard from './components/FauvesDashboard';
import TokyonDashboard from './components/TokyonDashboard';
import AsteryskoDashboard from './components/AsteryskoDashboard';
import UmaChaveDashboard from './components/UmaChaveDashboard';
import DockaDashboard from './components/DockaDashboard';
import HostiziDashboard from './components/HostiziDashboard';
import { Menu, ChevronDown } from 'lucide-react';
import UserHomeView from './components/docka/UserHomeView';
import { useSearchParams } from 'react-router-dom';
import UnifiedSidebar from '../../components/UnifiedSidebar';

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
    // Local state for the Dashboard Module. 
    // It starts with the app's global org, but allows switching independently in the sidebar.
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize activeView from URL or default to 'overview'
    const initialView = searchParams.get('view') || 'overview';
    const [activeView, setActiveView] = useState(initialView);

    // Initialize selectedOrgId from URL or fallback to initialOrg
    const initialOrgId = searchParams.get('org') || initialOrg.id;
    const [selectedOrgId, setSelectedOrgId] = useState<string>(initialOrgId);

    // Sync activeView with URL changes
    useEffect(() => {
        const view = searchParams.get('view') || 'overview';
        setActiveView(view);

        // Also sync org from URL if it changes externally (e.g. back button)
        const orgParam = searchParams.get('org');
        if (orgParam && orgParam !== selectedOrgId) {
            setSelectedOrgId(orgParam);
        }
    }, [searchParams]);

    const [viewData, setViewData] = useState<any>(null); // Data passed between views
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Use passed userOrgs to find selected org, fallback to initialOrg if not found
    const selectedOrg = userOrgs.find(o => o.id === selectedOrgId) || initialOrg;

    // Helper to change view with data
    const handleViewChange = (view: string, data: any = null) => {
        setActiveView(view);
        setViewData(data);

        // Update URL to reflect current view
        setSearchParams(prev => {
            prev.set('view', view);
            return prev;
        });
    };

    const handleOrgChange = (org: Organization) => {
        setSelectedOrgId(org.id);

        // Reset view to overview when switching orgs
        handleViewChange('overview');

        // Update URL
        setSearchParams(prev => {
            prev.set('org', org.id);
            prev.set('view', 'overview');
            return prev;
        });
    };

    const renderContent = () => {
        // Global Home View
        if (activeView === 'home') {
            return <UserHomeView />;
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
            // Check for specific overrides if needed, otherwise default infra dashboard
            if (selectedOrg.slug.includes('hostizi')) {
                return <HostiziDashboard user={user} activeView={activeView} organization={selectedOrg} />;
            }
            return <TokyonDashboard user={user} activeView={activeView} organization={selectedOrg} />;
        }
        if (selectedOrg.slug === 'umachave') {
            return <UmaChaveDashboard user={user} activeView={activeView} organization={selectedOrg} />;
        }

        // Default / SAAS
        return <DockaDashboard activeView={activeView} organization={selectedOrg} />;
    };

    return (
        <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden flex-col lg:flex-row relative transition-colors duration-300">

            {/* MOBILE HEADER: Only visible on small screens */}
            <div className="lg:hidden h-14 bg-white dark:bg-zinc-900 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(true)}>
                    <div className={`w-6 h-6 rounded-md ${selectedOrg.logoColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                        {selectedOrg.name.substring(0, 1)}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{selectedOrg.name}</span>
                        <ChevronDown size={14} className="text-docka-400 dark:text-zinc-500" />
                    </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md">
                    <Menu size={20} />
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
                    <div className="absolute inset-y-0 left-0 w-[280px] bg-white dark:bg-zinc-900 shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
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
            <div className="flex-1 h-full overflow-hidden bg-docka-50 dark:bg-zinc-950 relative">
                {renderContent()}
            </div>
        </div>
    );
};

export default DashboardLayout;
