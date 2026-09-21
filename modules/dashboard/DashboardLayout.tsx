
import React, { useEffect, useRef, useState } from 'react';
import { Organization } from '../../types';

import FauvesDashboard from './components/FauvesDashboard';
import TokyonDashboard from './components/TokyonDashboard';
import AsteryskoDashboard from './components/AsteryskoDashboard';
import UmaChaveDashboard from './components/UmaChaveDashboard';
import ManySpaceDashboard from './components/ManySpaceDashboard';
import AllyoDashboard from './components/AllyoDashboard';
import { ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import UnifiedSidebar, { BrandLogo } from '../../components/UnifiedSidebar';
import { getBrandBgColor } from '../../utils/brandFavicon';

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
    const [transitionTarget, setTransitionTarget] = useState<Organization | null>(null);
    const transitionTimers = useRef<number[]>([]);

    useEffect(() => () => {
        transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    }, []);

    // Helper to change view
    const handleViewChange = (view: string, data: any = null) => {
        if (data) setViewData(data);

        // Update URL to reflect current view
        setSearchParams(prev => {
            prev.set('view', view);
            return prev;
        }, { replace: true });
    };

    const applyOrgChange = (org: Organization) => {
        // Update URL - This will trigger a re-render of DashboardLayout because searchParams changes
        setSearchParams(prev => {
            prev.set('org', org.id);
            prev.set('view', 'overview');
            return prev;
        }, { replace: true });
    };

    const handleOrgChange = (org: Organization) => {
        if (org.id === selectedOrg.id || transitionTarget) return;

        transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
        transitionTimers.current = [];

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            applyOrgChange(org);
            return;
        }

        setTransitionTarget(org);
        transitionTimers.current = [
            window.setTimeout(() => applyOrgChange(org), 260),
            window.setTimeout(() => setTransitionTarget(null), 760),
        ];
    };


    const renderContent = () => {
        if (!selectedOrg) {
            return <AsteryskoDashboard user={user} activeView={activeView} organization={initialOrg} />;
        }
        if (selectedOrg.slug === 'allyo') {
            return <AllyoDashboard user={user} activeView={activeView} organization={selectedOrg} />;
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

            {transitionTarget && <WorkspaceSwitchTransition organization={transitionTarget} />}
        </div>
    );
};

const WorkspaceSwitchTransition = ({ organization }: { organization: Organization }) => {
    const background = getBrandBgColor(organization);
    const foreground = getReadableForeground(background);

    return (
        <div
            className="workspace-switch-overlay absolute inset-0 z-[100] flex items-center justify-center overflow-hidden"
            style={{
                backgroundColor: background,
                color: foreground,
                backgroundImage: 'radial-gradient(circle at 28% 20%, rgba(255,255,255,.18), transparent 30%), radial-gradient(circle at 78% 82%, rgba(255,255,255,.1), transparent 34%)',
            }}
            role="status"
            aria-live="polite"
            aria-label={`Abrindo o workspace ${organization.name}`}
        >
            <style>{`
                @keyframes workspace-switch-cover {
                    0% { opacity: 0; clip-path: circle(0 at 38px 38px); }
                    12% { opacity: 1; }
                    43% { opacity: 1; clip-path: circle(155vmax at 38px 38px); }
                    68% { opacity: 1; clip-path: circle(155vmax at 38px 38px); }
                    100% { opacity: 0; clip-path: circle(155vmax at 38px 38px); }
                }
                @keyframes workspace-switch-mark {
                    0%, 16% { opacity: 0; transform: translateY(10px) scale(.86); }
                    45%, 68% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-6px) scale(.98); }
                }
                .workspace-switch-overlay {
                    animation: workspace-switch-cover 760ms cubic-bezier(.72, 0, .2, 1) both;
                    pointer-events: auto;
                }
                .workspace-switch-mark {
                    animation: workspace-switch-mark 760ms cubic-bezier(.22, 1, .36, 1) both;
                }
            `}</style>
            <div className="workspace-switch-mark relative flex flex-col items-center px-6 text-center">
                <div className="absolute -inset-16 -z-10 rounded-full bg-white/10 blur-3xl" />
                <div className="rounded-[22px] bg-white/10 p-2.5 shadow-[0_24px_70px_rgba(0,0,0,.22)] ring-1 ring-white/20 backdrop-blur-md">
                    <BrandLogo org={organization} size="lg" className="!h-16 !w-16 !rounded-2xl" />
                </div>
                <span className="mt-5 text-xs font-bold uppercase tracking-[.16em] opacity-75">Trocando de workspace</span>
                <strong className="mt-1.5 font-season text-[32px] font-normal leading-tight sm:text-[38px]">{organization.name}</strong>
            </div>
        </div>
    );
};

const getReadableForeground = (color: string) => {
    const normalized = color.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(normalized)) return '#ffffff';
    const red = Number.parseInt(normalized.slice(0, 2), 16);
    const green = Number.parseInt(normalized.slice(2, 4), 16);
    const blue = Number.parseInt(normalized.slice(4, 6), 16);
    return ((red * 299 + green * 587 + blue * 114) / 1000) > 170 ? '#111111' : '#ffffff';
};

export default DashboardLayout;
