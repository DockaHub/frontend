

import React, { useState, useEffect } from 'react';
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
import { Organization } from './types';
import { ORGANIZATIONS } from './constants';
import {
  Mail, MessageSquare, Calendar, HardDrive, Users,
  LayoutDashboard, CheckSquare, Video, Settings,
  LogOut, Sun, Moon, Building2
} from 'lucide-react';

import { CallProvider } from './context/CallContext';
import { MeetProvider } from './context/MeetContext';
import CallOverlay from './modules/chat/components/CallOverlay';

import { ContractSignaturePage } from './modules/asterysko/public/ContractSignaturePage';
import AsteryskoClientPortal from './modules/dashboard/components/asterysko/AsteryskoClientPortal';
import { AsteryskoLoginPage } from './modules/asterysko/public/AsteryskoLoginPage';
import WelcomePage from './modules/asterysko/public/WelcomePage';

// Main App Content component to use hooks inside Provider
const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
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

  // Domain Routing State
  const [isTenantDomain, setIsTenantDomain] = useState(false);
  const [resolvingDomain, setResolvingDomain] = useState(true);

  // Check Custom Domain
  useEffect(() => {
    const checkCustomDomain = async () => {
      const hostname = window.location.hostname;
      // Skip for default development and platform domains
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dockahub') || hostname.includes('vercel.app')) {
        setResolvingDomain(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/organizations/public/resolve-domain?domain=${hostname}`);
        if (response.ok) {
          setIsTenantDomain(true);
        }
      } catch (error) {
        console.error('Domain resolution failed', error);
      } finally {
        setResolvingDomain(false);
      }
    };
    checkCustomDomain();
  }, []);

  // Enforce Tenant Routing
  useEffect(() => {
    if (isTenantDomain && !resolvingDomain && !location.pathname.startsWith('/portal')) {
      navigate('/portal', { replace: true });
    }
  }, [isTenantDomain, resolvingDomain, location.pathname, navigate]);

  // Fetch real organizations for the user
  useEffect(() => {
    const fetchUserOrgs = async () => {
      if (user?.id) {
        try {
          const { organizationService } = await import('./services/organizationService');
          const orgs = await organizationService.getMyOrganizations();

          if (orgs && orgs.length > 0) {
            console.log('Loading user organizations:', orgs);

            const filteredOrgs = orgs.filter(org => !org.name.includes("'s Workspace"));

            const enhancedOrgs = filteredOrgs.map(org => ({
              ...org,
              logoColor: org.logoColor || 'bg-blue-600',
              type: org.type || 'saas',
              features: org.features || { calendar: true, drive: true, contacts: true, tasks: true, meet: true }
            }));

            if (enhancedOrgs.length > 0) {
              setUserOrgs(enhancedOrgs);
              setCurrentOrg(enhancedOrgs[0]);
            }
          }
        } catch (error) {
          console.error('Failed to load user organizations:', error);
        }
      }
    };
    fetchUserOrgs();
  }, [user]);

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
    logout();
    logout();
    navigate('/login');
    setIsSettingsOpen(false);
    addToast({
      type: 'info',
      title: 'Você saiu da conta',
      duration: 3000
    });
  };

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

  // Command Palette Actions Definition
  const commandActions = [
    // Navigation
    { id: 'nav-mail', label: 'Ir para E-mail', icon: Mail, section: 'Navegação', perform: () => navigate('/mail') },
    { id: 'nav-chat', label: 'Ir para Chat', icon: MessageSquare, section: 'Navegação', perform: () => navigate('/chat') },
    { id: 'nav-calendar', label: 'Ir para Agenda', icon: Calendar, section: 'Navegação', perform: () => navigate('/calendar') },
    { id: 'nav-drive', label: 'Ir para Drive', icon: HardDrive, section: 'Navegação', perform: () => navigate('/drive') },
    { id: 'nav-tasks', label: 'Ir para Tarefas', icon: CheckSquare, section: 'Navegação', perform: () => navigate('/tasks') },
    { id: 'nav-people', label: 'Ir para Pessoas', icon: Users, section: 'Navegação', perform: () => navigate('/contacts') },
    { id: 'nav-meet', label: 'Ir para Meet', icon: Video, section: 'Navegação', perform: () => navigate('/meet') },
    { id: 'nav-dash', label: 'Ir para Painel', icon: LayoutDashboard, section: 'Navegação', perform: () => navigate('/dashboard') },

    // Organizations
    ...(userOrgs.length > 0 ? userOrgs : ORGANIZATIONS).map(org => ({
      id: `org-${org.id}`,
      label: `Mudar para ${org.name}`,
      icon: Building2,
      section: 'Workspaces',
      perform: () => {
        setCurrentOrg(org);
        navigate('/dashboard');
        addToast({
          type: 'success',
          title: `Workspace Alterado`,
          message: `Você agora está visualizando ${org.name}.`
        });
      }
    })),

    // System
    { id: 'sys-theme', label: `Alternar para Modo ${theme === 'light' ? 'Escuro' : 'Claro'}`, icon: theme === 'light' ? Moon : Sun, section: 'Sistema', perform: toggleTheme },
    { id: 'sys-settings', label: 'Abrir Preferências', icon: Settings, section: 'Sistema', perform: handleOpenPreferences },
    { id: 'sys-admin', label: 'Console Admin', icon: LayoutDashboard, section: 'Sistema', perform: handleNavigateToAdmin },
    { id: 'sys-logout', label: 'Sair da Conta', icon: LogOut, section: 'Sistema', perform: handleLogout },
  ];


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
    if (location.pathname.startsWith('/portal')) {
      return <AsteryskoLoginPage theme={theme} onToggleTheme={toggleTheme} />;
    }
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-zinc-950 text-docka-900 dark:text-zinc-100 antialiased selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-hidden transition-colors duration-300">
      <CallOverlay />
      {!location.pathname.startsWith('/portal') && !location.pathname.startsWith('/sign') && !location.pathname.startsWith('/dashboard') && (
        <UnifiedSidebar
          currentOrg={currentOrg}
          onOrgChange={(org) => {
            setCurrentOrg(org);
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
          <Route path="/sign/:dealId" element={<ContractSignaturePage dealId={location.pathname.split('/')[2]} />} />

          {/* Protected Routes */}
          <Route path="/dashboard/*" element={<DashboardLayout currentOrg={currentOrg} userOrgs={userOrgs} user={user!} onLogout={handleLogout} onOpenProfile={handleOpenProfile} onOpenPreferences={handleOpenPreferences} theme={theme} onToggleTheme={toggleTheme} />} />
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

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard?view=home" replace />} />
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
              <AppContent />
            </MeetProvider>
          </CallProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
