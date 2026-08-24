

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import UnifiedSidebar from './components/UnifiedSidebar';
import MailLayout from './modules/mail/MailLayout';
import ChatLayout from './modules/chat/ChatLayout';
import CalendarLayout from './modules/calendar/CalendarLayout';
import DriveLayout from './modules/drive/DriveLayout';
import PeopleLayout from './modules/people/PeopleLayout';
import MeetLayout from './modules/meet/MeetLayout';
import TasksLayout from './modules/tasks/TasksLayout';
import DashboardLayout from './modules/dashboard/DashboardLayout';
import AsteryskoLayout from './modules/asterysko/AsteryskoLayout';
import AdminView from './components/admin/AdminView';

import UserSettingsModal from './components/settings/UserSettingsModal';
import CommandPalette from './components/common/CommandPalette';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './modules/auth/LoginPage';
import { WorkspaceEntryPage } from './modules/auth/WorkspaceEntryPage';
import { ForcePasswordChange } from './components/auth/ForcePasswordChange';
import { RoleGuard } from './components/auth/RoleGuard';
import { Organization } from './types';
import { ORGANIZATIONS } from './constants';
import {
  Mail, MessageSquare, Calendar, HardDrive, Users,
  LayoutDashboard, CheckSquare, Video, Settings,
  LogOut, Sun, Moon, Building2
} from 'lucide-react';

import { CallProvider } from './context/CallContext';
import { MeetProvider } from './context/MeetContext';
import { NotificationProvider } from './context/NotificationContext';
import CallOverlay from './modules/chat/components/CallOverlay';

import { ContractSignaturePage } from './modules/asterysko/public/ContractSignaturePage';
import AsteryskoClientPortal from './modules/dashboard/components/asterysko/AsteryskoClientPortal';
import { AsteryskoLoginPage } from './modules/asterysko/public/AsteryskoLoginPage';
import WelcomePage from './modules/asterysko/public/WelcomePage';
import { getApiBaseUrl } from './services/api';
import { useDynamicFaviconAndTitle } from './hooks/useDynamicFaviconAndTitle';

// Main App Content component to use hooks inside Provider
const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated, isFreshLogin, completeFreshLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { addToast } = useToast();


  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('docka-theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'preferences'>('profile');

  // Initialize with Docka HQ (org_1) - placeholder
  const [currentOrg, setCurrentOrg] = useState<Organization>(ORGANIZATIONS[0]);
  const [userOrgs, setUserOrgs] = useState<Organization[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [organizationsError, setOrganizationsError] = useState('');
  const [organizationReloadKey, setOrganizationReloadKey] = useState(0);

  // Domain Routing State
  const [isTenantDomain, setIsTenantDomain] = useState(false);
  const [resolvingDomain, setResolvingDomain] = useState(true);

  // Dynamic Favicon & Title for all Organizations and Pages
  useDynamicFaviconAndTitle({
    currentOrg,
    userOrgs,
    isTenantDomain,
    resolvingDomain,
    isAuthenticated,
  });

  // Check Custom Domain
  useEffect(() => {
    const checkCustomDomain = async () => {
      const hostname = window.location.hostname;

      // Domínios da plataforma Manyways/Docka — NUNCA são tenant do cliente
      const PLATFORM_DOMAINS = ['localhost', '127.0.0.1', 'dockahub', 'vercel.app', 'manyways', 'manyways.app', 'docka.app'];
      const isPlatformDomain = PLATFORM_DOMAINS.some(d => hostname === d || hostname.includes(d));

      if (isPlatformDomain) {
        setResolvingDomain(false);
        return;
      }

      try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/organizations/public/resolve-domain?domain=${hostname}`);
        if (response.ok) {
          const data = await response.json().catch(() => null);
          // Só considera tenant se a resposta contém um organizationId válido
          if (data && (data.organizationId || data.id || data.slug)) {
            setIsTenantDomain(true);
          }
        }
      } catch (error) {
        console.error('Domain resolution failed', error);
      } finally {
        setResolvingDomain(false);
      }
    };
    checkCustomDomain();
  }, []);

  // Enforce Routing by Role
  useEffect(() => {
    if (!resolvingDomain && isAuthenticated && user) {
      const isPublicPath = location.pathname.startsWith('/portal') || location.pathname.startsWith('/sign');
      
      // If client is in admin dashboard area, force to portal
      if (user.role === 'CLIENT' && !isPublicPath) {
        console.log('Client detected on admin path, redirecting to portal...');
        navigate('/portal', { replace: true });
      }
    }
  }, [isAuthenticated, resolvingDomain, user?.role, location.pathname, navigate]);

  // Fetch real organizations for the user
  useEffect(() => {
    const fetchUserOrgs = async () => {
      if (user?.id) {
        setOrganizationsLoaded(false);
        setOrganizationsError('');
        setUserOrgs([]);
        try {
          const { organizationService } = await import('./services/organizationService');
          const orgs = await organizationService.getMyOrganizations();

          if (orgs && orgs.length > 0) {
            console.log('Loading user organizations:', orgs);

            const filteredOrgs = orgs.filter(org => 
              !org.name.includes("'s Workspace") &&
              org.slug !== 'docka' &&
              !org.name.toLowerCase().includes('docka')
            );

            const sortedOrgs = [...filteredOrgs].sort((a, b) => {
              const aIsMaster = a.slug === 'manyspace' || a.slug === 'manyways';
              const bIsMaster = b.slug === 'manyspace' || b.slug === 'manyways';
              if (aIsMaster && !bIsMaster) return -1;
              if (!aIsMaster && bIsMaster) return 1;
              return a.name.localeCompare(b.name);
            });

            const enhancedOrgs = sortedOrgs.map(org => ({
              ...org,
              logoColor: org.logoColor || 'bg-blue-600',
              type: (org.type || 'SAAS').toUpperCase() as any,
              features: org.features || { calendar: true, drive: true, contacts: true, tasks: true, meet: true }
            }));

            if (enhancedOrgs.length > 0) {
              setUserOrgs(enhancedOrgs);

              // CHECK URL FOR PERSISTENCE
              const params = new URLSearchParams(window.location.search);
              const orgId = params.get('org');
              const savedOrg = enhancedOrgs.find(o => o.id === orgId);

              if (savedOrg) {
                setCurrentOrg(savedOrg);
              } else if (enhancedOrgs.length === 1) {
                // AUTO-REDIRECT IF ONLY ONE ORG
                const singleOrg = enhancedOrgs[0];
                setCurrentOrg(singleOrg);
                
                // If on home, go to overview
                if (!isFreshLogin && (window.location.pathname === '/' || (window.location.pathname === '/dashboard' && !params.get('view')))) {
                  navigate(`/dashboard?org=${singleOrg.id}&view=overview`, { replace: true });
                }
              } else {
                setCurrentOrg(enhancedOrgs[0]);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load user organizations:', error);
          setOrganizationsError('Confira sua conexão e tente novamente em instantes.');
        } finally {
          setOrganizationsLoaded(true);
        }
      }
    };
    fetchUserOrgs();
  }, [user?.id, organizationReloadKey]);

  // Sync currentOrg with URL parameter reactively
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orgId = params.get('org');
    
    // REDIRECT FROM PLACEHOLDER TO REAL ORG IF LOADED
    if (orgId === 'org_1' && userOrgs.length > 0 && userOrgs[0].id !== 'org_1') {
      console.log('Redirecting from placeholder to real organization...');
      navigate(`/dashboard?org=${userOrgs[0].id}&view=overview`, { replace: true });
      return;
    }

    if (orgId && currentOrg?.id !== orgId && userOrgs.length > 0) {
      const targetOrg = userOrgs.find(o => o.id === orgId);
      if (targetOrg) {
        setCurrentOrg(targetOrg);
      }
    }
  }, [location.search, userOrgs, currentOrg?.id, navigate]);

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('docka-theme', theme);
  }, [theme]);

  // Global Keyboard Shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      addToast({
        type: 'info',
        title: `Tema ${newTheme === 'dark' ? 'Escuro' : 'Claro'} Ativado`,
        duration: 2000
      });
      return newTheme;
    });
  };

  const handleLogout = () => {
    setUserOrgs([]);
    setOrganizationsLoaded(false);
    setOrganizationsError('');
    logout();
    setIsSettingsOpen(false);
    addToast({
      type: 'info',
      title: 'Você saiu da conta',
      duration: 3000
    });
    // Em domínio de cliente (ex: cliente.asterysko.com), nunca redirecionar para /login da Manyways
    navigate(isTenantDomain ? '/portal/login' : '/login', { replace: true });
  };

  const handleWorkspaceEnter = useCallback((organization: Organization) => {
    setCurrentOrg(organization);
    navigate(`/dashboard?org=${organization.id}&view=overview`, { replace: true });
    completeFreshLogin();
  }, [completeFreshLogin, navigate]);

  // Open Settings Handlers
  const handleOpenProfile = () => {
    setSettingsTab('profile');
    setIsSettingsOpen(true);
  };

  const handleOpenPreferences = () => {
    setSettingsTab('preferences');
    setIsSettingsOpen(true);
  };

  const handleNavigateToAdmin = () => {
    setIsSettingsOpen(false);
    navigate('/admin');
  };

    // Command Palette Actions Definition - Filtered by Permissions
    const commandActions = [
      // Navigation
      { id: 'nav-dash', label: 'Ir para Painel', icon: LayoutDashboard, section: 'Navegação', perform: () => navigate(`/dashboard?org=${currentOrg.id}`) },
      // { id: 'nav-mail', label: 'Ir para E-mail', icon: Mail, section: 'Navegação', perm: 'canAccessContent', perform: () => navigate(`/mail?org=${currentOrg.id}`) },
      { id: 'nav-chat', label: 'Ir para Chat', icon: MessageSquare, section: 'Navegação', perm: 'canAccessContent', perform: () => navigate(`/chat?org=${currentOrg.id}`) },
      { id: 'nav-calendar', label: 'Ir para Agenda', icon: Calendar, section: 'Navegação', perm: 'canAccessContent', perform: () => navigate(`/calendar?org=${currentOrg.id}`) },
      { id: 'nav-drive', label: 'Ir para Drive', icon: HardDrive, section: 'Navegação', perm: 'canAccessContent', perform: () => navigate(`/drive?org=${currentOrg.id}`) },
      { id: 'nav-tasks', label: 'Ir para Tarefas', icon: CheckSquare, section: 'Navegação', perm: 'canAccessContent', perform: () => navigate(`/tasks?org=${currentOrg.id}`) },
      { id: 'nav-meet', label: 'Ir para Meet', icon: Video, section: 'Navegação', perm: 'canAccessContent', perform: () => navigate(`/meet?org=${currentOrg.id}`) },
      { id: 'nav-people', label: 'Ir para Pessoas', icon: Users, section: 'Navegação', perm: 'canAccessPeople', perform: () => navigate(`/contacts?org=${currentOrg.id}`) },
  
      // Organizations
      ...(userOrgs.length > 0 ? userOrgs : ORGANIZATIONS).map(org => ({
        id: `org-${org.id}`,
        label: `Mudar para ${org.name}`,
        icon: Building2,
        section: 'Workspaces',
        perform: () => {
          setCurrentOrg(org);
          navigate(`/dashboard?org=${org.id}`);
          addToast({
            type: 'success',
            title: `Workspace Alterado`,
            message: `Você agora está visualizando ${org.name}.`
          });
        }
      })).filter(action => {
          // If the action is for an org the user is not in (and they aren't admin), they shouldn't see it
          // But userOrgs is already filtered by the backend.
          return true;
      }),
  
      // System
      { id: 'sys-theme', label: `Alternar para Modo ${theme === 'light' ? 'Escuro' : 'Claro'}`, icon: theme === 'light' ? Moon : Sun, section: 'Sistema', perform: toggleTheme },
      { id: 'sys-settings', label: 'Abrir Preferências', icon: Settings, section: 'Sistema', perform: handleOpenPreferences },
      { id: 'sys-admin', label: 'Console Admin', icon: LayoutDashboard, section: 'Sistema', perform: handleNavigateToAdmin },
      { id: 'sys-logout', label: 'Sair da Conta', icon: LogOut, section: 'Sistema', perform: handleLogout },
    ].filter(action => {
        if (!('perm' in action)) return true;
        if (currentOrg.memberRole === 'OWNER' || currentOrg.memberRole === 'ADMIN' || user?.role === 'ADMIN') return true;
        return (currentOrg.memberPermissions as any)?.[(action as any).perm] !== false;
    });


  // ... (inside AppContent)

  if (resolvingDomain) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (location.pathname.startsWith('/portal/welcome')) {
      return <WelcomePage theme={theme} onToggleTheme={toggleTheme} />;
    }
    if (location.pathname.startsWith('/sign')) {
      const dealId = location.pathname.split('/')[2];
      return <ContractSignaturePage dealId={dealId} />;
    }
    // Tenant domain (e.g. cliente.asterysko.com) — NUNCA mostrar a tela da Manyways
    if (isTenantDomain || location.pathname.startsWith('/portal')) {
      return <AsteryskoLoginPage theme={theme} onToggleTheme={toggleTheme} />;
    }
    return <LoginPage />;
  }

  if (user?.requirePasswordChange) {
    return <ForcePasswordChange />;
  }

  const shouldShowWorkspaceEntry = user?.role?.toUpperCase() !== 'CLIENT'
    && (isFreshLogin || location.pathname === '/workspaces');

  if (shouldShowWorkspaceEntry) {
    return (
      <WorkspaceEntryPage
        userName={user?.name || ''}
        organizations={userOrgs}
        loading={!organizationsLoaded}
        error={organizationsError}
        onEnter={handleWorkspaceEnter}
        onRetry={() => setOrganizationReloadKey((key) => key + 1)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950 text-docka-900 dark:text-zinc-100 antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-hidden transition-colors duration-300">
      <CallOverlay />
      {!location.pathname.startsWith('/portal') && 
       !location.pathname.startsWith('/sign') && 
       !location.pathname.startsWith('/dashboard') && 
       !location.pathname.startsWith('/login') &&
       !location.pathname.startsWith('/auth') && (
        <UnifiedSidebar
          currentOrg={currentOrg}
          onOrgChange={(org) => {
            setCurrentOrg(org);

            // Update URL to persist on refresh
            const params = new URLSearchParams(window.location.search);
            params.set('org', org.id);
            navigate({ search: params.toString() }, { replace: true });

            addToast({
              type: 'success',
              title: `Workspace Alterado`,
              message: `Você agora está visualizando ${org.name}.`
            });
          }}
          userOrgs={userOrgs}
          user={user!}
          onLogout={handleLogout}
          onOpenProfile={handleOpenProfile}
          onOpenPreferences={handleOpenPreferences}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
      <div className="flex-1 h-full overflow-hidden relative bg-white dark:bg-zinc-950">
        <Routes>
          {/* Public Routes */}
          <Route path="/portal/welcome" element={<WelcomePage theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/portal/login" element={<AsteryskoLoginPage theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/sign/:dealId" element={<ContractSignaturePage dealId={location.pathname.split('/')[2]} />} />

          {/* Protected Routes */}
          <Route path="/dashboard/*" element={
            <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN', 'OWNER', 'USER']} fallbackPath="/login">
              <DashboardLayout currentOrg={currentOrg} userOrgs={userOrgs} user={user!} onLogout={handleLogout} onOpenProfile={handleOpenProfile} onOpenPreferences={handleOpenPreferences} theme={theme} onToggleTheme={toggleTheme} />
            </RoleGuard>
          } />
          <Route path="/mail" element={<MailLayout currentOrg={currentOrg} />} />
          <Route path="/chat" element={<ChatLayout currentOrg={currentOrg} />} />
          <Route path="/tasks" element={<TasksLayout />} />
          <Route path="/calendar" element={<CalendarLayout currentOrg={currentOrg} hasAccess={true} />} />
          <Route path="/drive" element={<DriveLayout currentOrg={currentOrg} hasAccess={true} />} />
          <Route path="/contacts" element={<PeopleLayout currentOrg={currentOrg} hasAccess={true} />} />
          <Route path="/meet" element={<MeetLayout onViewCalendar={() => navigate('/calendar')} />} />
          <Route path="/admin" element={<AdminView onSelectOrg={(org) => {
            setCurrentOrg(org);
            navigate('/dashboard');
          }} />} />
          <Route path="/asterysko" element={<AsteryskoLayout />} />
          <Route path="/portal/*" element={<AsteryskoClientPortal theme={theme} onToggleTheme={toggleTheme} onExit={() => navigate('/')} />} />

          {/* Default & Security Routes */}
          <Route path="/login" element={
            user ? (
              user.role?.toUpperCase() === 'CLIENT'
                ? <Navigate to="/portal" replace />
                : <Navigate to={`/dashboard?view=overview&org=${currentOrg?.id || 'org_4'}`} replace />
            ) : (
              <LoginPage />
            )
          } />
          <Route path="/" element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role?.toUpperCase() === 'CLIENT' ? (
              <Navigate to="/portal" replace />
            ) : (
              <Navigate to={`/dashboard?view=overview&org=${currentOrg?.id || 'org_4'}`} replace />
            )
          } />
          
          {/* Catch-all route to prevent black screen */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global Settings Modal */}
      <UserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user!}
        initialTab={settingsTab}
        onNavigateToAdmin={handleNavigateToAdmin}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        actions={commandActions}
      />
    </div>
  );
};

// Root App Component Wrapping Context
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CallProvider>
            <MeetProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </MeetProvider>
          </CallProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
