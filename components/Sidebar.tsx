import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon, // Renamed from Calendar
  Phone, // Replaces Video
  CheckSquare,
  // Settings as SettingsIcon, // REMOVED to avoid crash
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Menu, // Keep if used elsewhere in the full file
  Smile,
  User as UserIcon,
  Bell,
  Moon,
  Sun,
  HardDrive, // Keep for default navItems
  ChevronDown,
  Shield,
  Building2
} from 'lucide-react';
import { ViewState, Organization, User } from '../types';
import DockaLogo from './common/DockaLogo';
import Tooltip from './common/Tooltip';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useSidebarNavigation } from '../hooks/useSidebarNavigation';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  currentOrg: Organization;
  user: User;
  onLogout?: () => void;
  onOpenProfile?: () => void;
  onOpenPreferences?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  userOrgs?: Organization[];
  onSwitchOrg?: (org: Organization) => void;
}


const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  currentOrg,
  user,
  onLogout,
  onOpenProfile,
  onOpenPreferences,
  theme = 'light',
  onToggleTheme,
  userOrgs,
  onSwitchOrg
}) => {
  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dashboardView = searchParams.get('view');

  const { menuItems } = useSidebarNavigation(currentOrg);

  console.log('Sidebar render. Org:', currentOrg?.slug);
  const organizations = userOrgs || [currentOrg]; // Fallback

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel' },
    { id: 'mail', icon: Mail, label: 'E-mail' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'meet', icon: Phone, label: 'Meet' },
    { id: 'tasks', icon: CheckSquare, label: 'Tarefas' },
    { id: 'calendar', icon: CalendarIcon, label: 'Agenda' },
    { id: 'drive', icon: HardDrive, label: 'Drive' },
    { id: 'contacts', icon: Users, label: 'Pessoas' },
  ];

  const mobileNavItems = navItems.slice(0, 5);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDocka = currentOrg.slug === 'docka';

  return (
    <>
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <div
        className={`hidden md:flex ${isCollapsed ? 'w-[68px]' : 'w-[260px]'} h-screen bg-docka-50 dark:bg-zinc-900 border-r border-docka-200 dark:border-zinc-800 flex-col justify-between shrink-0 relative z-50 transition-all duration-300 ease-in-out`}
      >

        {/* 1. Header: Brand Identity & Toggle */}
        <div className={`px-4 mb-4 mt-4 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
          <div className={`${isCollapsed ? '' : 'ml-1'}`}>
            <DockaLogo variant={isCollapsed ? 'icon' : 'full'} className={`${isCollapsed ? 'h-8 w-8' : 'h-6'} text-docka-900 dark:text-zinc-100`} />
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-md text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-200 dark:hover:bg-zinc-800 transition-colors ${isCollapsed ? 'mt-2' : ''}`}
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* 2. Main Navigation & Org Switcher */}
        <div className="flex-1 overflow-y-auto py-2 px-2 overflow-x-hidden custom-scrollbar">

          {/* Org Switcher (Dropdown) */}
          <div className={`mb-6 animate-in fade-in slide-in-from-left-4 duration-500 ${isCollapsed ? 'flex justify-center' : 'px-2'}`}>
            <button
              onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
              className={`flex items-center gap-3 bg-white dark:bg-zinc-800/50 rounded-xl border transition-all duration-200 shadow-sm group hover:border-docka-300 dark:hover:border-zinc-600 ${isOrgMenuOpen ? 'border-docka-400 dark:border-zinc-500 ring-2 ring-docka-100 dark:ring-zinc-700/50' : 'border-docka-200 dark:border-zinc-700'} ${isCollapsed ? 'p-1.5 justify-center w-10 h-10' : 'w-full p-2'}`}
              title={isCollapsed ? currentOrg.name : undefined}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0 ${currentOrg.logoColor} ${isCollapsed ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'}`}>
                {currentOrg.name.substring(0, 1)}
              </div>
              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm truncate leading-tight group-hover:text-docka-700 dark:group-hover:text-zinc-300 transition-colors">{currentOrg.name}</h3>
                    <p className="text-[10px] text-docka-500 dark:text-zinc-500 truncate capitalize">{currentOrg.slug}</p>
                  </div>
                  <ChevronDown size={16} className={`text-docka-400 dark:text-zinc-500 transition-transform duration-200 ${isOrgMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* DROPDOWN MENU */}
            {isOrgMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOrgMenuOpen(false)} />
                <div className={`absolute top-28 mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-700 shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top ${isCollapsed ? 'left-14 w-60' : 'left-4 right-4'}`}>
                  <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                    <p className="px-2 py-1 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Trocar para...</p>
                    {organizations.filter(o => o.id !== currentOrg.id).map(org => (
                      <button
                        key={org.id}
                        onClick={() => {
                          onSwitchOrg?.(org);
                          setIsOrgMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors group text-left"
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 ${org.logoColor} opacity-80 group-hover:opacity-100`}>
                          {org.name.substring(0, 1)}
                        </div>
                        <span className="text-sm font-medium text-docka-600 dark:text-zinc-400 group-hover:text-docka-900 dark:group-hover:text-zinc-200 truncate">
                          {org.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              const ButtonContent = (
                <button
                  onClick={() => onChangeView(item.id as ViewState)}
                  className={`w-full flex items-center h-10 px-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-semibold shadow-sm'
                    : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100/50 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200 border border-transparent'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 group-hover:text-docka-700 dark:group-hover:text-zinc-300'} ${isDocka && isActive ? 'text-docka-900 dark:text-zinc-100' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm whitespace-nowrap transition-all duration-200">
                      {item.label}
                    </span>
                  )}
                </button>
              );

              return isCollapsed ? (
                <Tooltip key={item.id} content={item.label} side="right">
                  {ButtonContent}
                </Tooltip>
              ) : (
                <React.Fragment key={item.id}>
                  {ButtonContent}
                </React.Fragment>
              );
            })}

            {/* Separator */}
            <div className="my-2 border-t border-docka-200 dark:border-zinc-800 mx-2" />

            {/* SUPER ADMIN SECTION */}
            {user.role === 'admin' && (
              <>
                {!isCollapsed && <p className="px-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-1 mt-2">Super Admin</p>}

                {[
                  { id: 'admin-orgs', label: 'Organizações', icon: Building2, path: '/admin?tab=organizations' },
                  { id: 'admin-users', label: 'Usuários', icon: Users, path: '/admin?tab=users' },
                  { id: 'admin-settings', label: 'Configurações', icon: Shield, path: '/admin?tab=domains' },
                ].map((item) => {
                  const isActive = location.pathname.startsWith('/admin') && location.search.includes(item.path.split('?')[1]);

                  const ButtonContent = (
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center h-10 px-2.5 rounded-lg transition-all duration-200 group ${isActive
                        ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-semibold shadow-sm'
                        : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100/50 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200 border border-transparent'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <item.icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 group-hover:text-docka-700 dark:group-hover:text-zinc-300'}`} strokeWidth={isActive ? 2.5 : 2} />
                      {!isCollapsed && (
                        <span className="ml-3 text-sm whitespace-nowrap transition-all duration-200">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );

                  return isCollapsed ? (
                    <Tooltip key={item.id} content={item.label} side="right">
                      {ButtonContent}
                    </Tooltip>
                  ) : (
                    <React.Fragment key={item.id}>
                      {ButtonContent}
                    </React.Fragment>
                  );
                })}

                <div className="my-2 border-t border-docka-200 dark:border-zinc-800 mx-2" />
              </>
            )}

            {/* Organization Specific Items */}
            {!isCollapsed && <p className="px-4 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-1 mt-2">Workspace</p>}

            {menuItems.map(item => {
              const isActive = location.pathname.startsWith('/dashboard') && (dashboardView === item.id || (!dashboardView && item.id === 'overview'));

              const ButtonContent = (
                <button
                  onClick={() => navigate(`/dashboard?view=${item.id}`)}
                  className={`w-full flex items-center h-10 px-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-semibold shadow-sm'
                    : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100/50 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200 border border-transparent'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 group-hover:text-docka-700 dark:group-hover:text-zinc-300'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm whitespace-nowrap transition-all duration-200 truncate">
                      {item.label}
                    </span>
                  )}
                  {/* Indicate children if collapsed? For now simplistic */}
                </button>
              );

              return isCollapsed ? (
                <Tooltip key={item.id} content={item.label} side="right">
                  {ButtonContent}
                </Tooltip>
              ) : (
                <React.Fragment key={item.id}>
                  {ButtonContent}
                </React.Fragment>
              );
            })}

          </nav>
        </div>

        {/* 3. Bottom User Profile (Slack Style) */}
        <div className="p-3 border-t border-docka-200 dark:border-zinc-800" ref={menuRef}>
          <div className="relative">
            {/* Popover Menu */}
            {isUserMenuOpen && (
              <div className={`absolute bottom-full mb-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 w-72 overflow-hidden ${isCollapsed ? 'left-0' : 'left-0 right-0'}`}>
                {/* Header */}
                <div className="p-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/50 dark:bg-zinc-950/50 flex items-center gap-3">
                  <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} className="w-10 h-10 rounded-lg border border-docka-200 dark:border-zinc-700" alt="Avatar" />
                  <div className="min-w-0">
                    <div className="font-bold text-docka-900 dark:text-zinc-100 truncate">{user.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500 font-medium">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Ativo
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  {/* WORKSPACES SECTION */}

                  <button className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-3 transition-colors group">
                    <Smile size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />
                    Atualizar status
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-3 transition-colors group">
                    <Bell size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />
                    Pausar notificações
                  </button>
                  <div className="h-px bg-docka-100 dark:bg-zinc-800 my-1 mx-2" />

                  <button
                    onClick={() => { setIsUserMenuOpen(false); onOpenProfile?.(); }}
                    className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
                  >
                    <UserIcon size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />
                    Perfil
                  </button>

                  <button
                    onClick={() => { setIsUserMenuOpen(false); onOpenPreferences?.(); }}
                    className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
                  >
                    <SettingsIcon size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />
                    Preferências
                  </button>

                  <button
                    onClick={() => { onToggleTheme?.(); }}
                    className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
                  >
                    {theme === 'dark' ? <Sun size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" /> : <Moon size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />}
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                  </button>
                  <div className="h-px bg-docka-100 dark:bg-zinc-800 my-1 mx-2" />
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Sair de {currentOrg.name}
                  </button>
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 border ${isUserMenuOpen
                ? 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 shadow-sm'
                : 'hover:bg-white dark:hover:bg-zinc-800 border-transparent hover:border-docka-200 dark:hover:border-zinc-700 hover:shadow-sm'
                } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="relative shrink-0">
                <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} className="w-8 h-8 rounded-lg border border-docka-200 dark:border-zinc-700" alt="User" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-docka-50 dark:border-zinc-900 rounded-full" />
              </div>

              {!isCollapsed && (
                <div className="ml-3 text-left min-w-0 flex-1">
                  <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 truncate">{user.name}</div>
                  <div className="text-[10px] text-docka-500 dark:text-zinc-500 truncate">Online</div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Unchanged for now, add dark mode classes if needed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-t border-docka-200 dark:border-zinc-800 z-[60] flex items-center justify-around px-2 pb-safe">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500'}`}
            >
              <div className={`p-1.5 rounded-lg ${isActive ? 'bg-docka-100 dark:bg-zinc-800' : 'bg-transparent'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={() => onOpenProfile?.()}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'admin' ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500'}`}
        >
          <div className="p-1.5 rounded-lg">
            <Menu size={20} />
          </div>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
