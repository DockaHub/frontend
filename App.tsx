

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

          document.title = 'Asterysko | Portal';

          // Clear old default favicon
          const oldIcons = document.querySelectorAll("link[rel~='icon']");
          oldIcons.forEach(icon => icon.remove());

          const svgPaths = `<path d="M29.208 0.974374C28.9702 1.21152 28.779 1.47445 28.6239 1.758L19.6547 13.8217C19.2721 14.2032 19.2721 14.8218 19.6547 15.1982C20.0372 15.5745 20.6576 15.5797 21.035 15.1982L33.1317 6.25352C33.416 6.10402 33.6797 5.90811 33.9175 5.67096C35.2202 4.3718 35.2202 2.26838 33.9175 0.969219C32.6148 -0.329947 30.5056 -0.329947 29.2029 0.969219L29.208 0.974374Z" /><path d="M35.2461 15.9457C34.9669 15.9457 34.6929 15.987 34.4396 16.0643L21.9758 17.8893C21.5261 17.8893 21.159 18.2553 21.159 18.7039C21.159 19.1524 21.5261 19.5184 21.9758 19.5184L34.4345 21.3847C34.6878 21.462 34.9618 21.5033 35.2409 21.5033C36.7814 21.5033 38.0325 20.2608 38.0325 18.7296C38.0325 17.1985 36.7866 15.9457 35.2513 15.9457H35.2461Z" /><path d="M29.1356 28.7054C28.9754 28.5456 28.7996 28.4167 28.6083 28.3136L20.518 22.3127C20.2647 22.0549 19.8459 22.0549 19.5926 22.3127C19.3393 22.5704 19.3341 22.9829 19.5926 23.2355L25.5841 31.3243C25.6824 31.5151 25.8116 31.6904 25.9719 31.8502C26.8403 32.7215 28.2568 32.7215 29.1253 31.8502C29.9938 30.9789 29.9989 29.5715 29.1253 28.7054H29.1356Z" /><path d="M17.9435 32.2936C17.9435 32.1234 17.9177 31.9533 17.8712 31.7986L16.7442 24.1428C16.7442 23.8644 16.5219 23.6428 16.2428 23.6376C15.9636 23.6325 15.7413 23.8593 15.7361 24.1377L14.5833 31.7883C14.5368 31.943 14.511 32.1131 14.511 32.2832C14.511 33.2267 15.2761 33.9948 16.2273 34C17.1733 34 17.9435 33.237 17.9487 32.2884L17.9435 32.2936Z" /><path d="M9.27418 27.2464C9.3569 27.1639 9.42927 27.066 9.48096 26.968L12.6964 22.6581C12.8308 22.524 12.836 22.3024 12.6964 22.1632C12.5569 22.024 12.3397 22.024 12.2002 22.1632L7.86806 25.3544C7.76467 25.4059 7.67162 25.4781 7.58891 25.5606C7.12364 26.0246 7.12364 26.7773 7.58891 27.2412C8.05417 27.7052 8.80892 27.7052 9.27418 27.2412V27.2464Z" /><path d="M2.62615 20.4361C2.79674 20.4361 2.96734 20.4103 3.12242 20.3639L10.7941 19.2297C11.0732 19.2297 11.2955 19.0029 11.2955 18.7296C11.2955 18.4564 11.068 18.2296 10.7941 18.2296L3.12242 17.0954C2.96734 17.049 2.79674 17.0232 2.62615 17.0232C1.68012 17.0232 0.909851 17.7914 0.909851 18.7348C0.909851 19.6782 1.68012 20.4464 2.62615 20.4464V20.4361Z" /><path d="M0.811577 7.2743C1.00802 7.47536 1.23031 7.63518 1.46811 7.75891L11.5746 15.26C11.8951 15.5797 12.4121 15.5797 12.7326 15.26C13.0531 14.9404 13.0531 14.4249 12.7326 14.1052L5.24706 4.00061C5.12299 3.76346 4.95757 3.54177 4.76112 3.34587C3.67551 2.25807 1.90752 2.25807 0.816747 3.34071C-0.274031 4.42335 -0.274031 6.1865 0.811577 7.2743Z" /><path d="M14.5109 5.16058C14.5109 5.33071 14.5368 5.50083 14.5833 5.6555L15.7206 13.3061C15.7206 13.5845 15.9481 13.8062 16.2221 13.8062C16.4961 13.8062 16.7235 13.5794 16.7235 13.3061L17.8608 5.6555C17.9074 5.50083 17.9332 5.33071 17.9332 5.16058C17.9332 4.21713 17.1629 3.44898 16.2169 3.44898C15.2709 3.44898 14.5006 4.21713 14.5006 5.16058H14.5109Z" />`;

          const lightLink = document.createElement('link');
          lightLink.rel = 'icon';
          lightLink.media = '(prefers-color-scheme: light)';
          lightLink.href = 'data:image/svg+xml;utf8,<svg viewBox="-2 -2 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="%232563EB">' + svgPaths + '</g></svg>';

          const darkLink = document.createElement('link');
          darkLink.rel = 'icon';
          darkLink.media = '(prefers-color-scheme: dark)';
          darkLink.href = 'data:image/svg+xml;utf8,<svg viewBox="-2 -2 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><g fill="%23FFFFFF">' + svgPaths + '</g></svg>';

          document.head.appendChild(lightLink);
          document.head.appendChild(darkLink);
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
