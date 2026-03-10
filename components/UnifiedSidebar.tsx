import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, Mail, MessageSquare, Users, PanelLeftClose, PanelLeftOpen, X, Building2, Palette, Smile, Bell, User as UserIcon, Settings, Sun, Moon, LogOut,
    CheckSquare, Calendar, Phone, HardDrive, Home
} from 'lucide-react';
import { Organization, User } from '../types';
import Modal from './common/Modal';
import DockaLogo from './common/DockaLogo';
import Tooltip from './common/Tooltip';
import { useSidebarNavigation } from '../hooks/useSidebarNavigation';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const cleanSvg = (svg: string) => {
    if (!svg) return '';
    // Remove XML declaration, DOCTYPE, comments, style blocks and defs
    let cleaned = svg
        .replace(/<\?xml.*?\?>/gi, '')
        .replace(/<!DOCTYPE.*?>/gi, '')
        .replace(/<!--.*?-->/gs, '')
        .replace(/<style.*?>.*?<\/style>/gs, '')
        .replace(/<defs.*?>.*?<\/defs>/gs, '');

    // Remove hardcoded fill/stroke attributes (including hex, rgb, named colors) 
    // to force inheritance of 'currentColor'
    cleaned = cleaned
        .replace(/\s+(fill|stroke)=["'][^"']*["']/gi, ' ')
        // Remove width and height attributes from the <svg> tag to let CSS control it
        .replace(/<svg([^>]*?)\s+(width|height)=["'][^"']*["']/gi, '<svg$1')
        .replace(/<svg([^>]*?)\s+(width|height)=["'][^"']*["']/gi, '<svg$1')
        .trim();

    return cleaned;
};

interface UnifiedSidebarProps {
    currentOrg: Organization;
    onOrgChange: (org: Organization) => void;
    userOrgs: Organization[];
    user: User;
    onLogout?: () => void;
    onOpenProfile?: () => void;
    onOpenPreferences?: () => void;
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
    className?: string;
    onClose?: () => void;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
    currentOrg,
    onOrgChange,
    userOrgs = [],
    user,
    onLogout,
    onOpenProfile,
    onOpenPreferences,
    theme = 'light',
    onToggleTheme,
    className = '',
    onClose
}) => {
    // State
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
    const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Hooks
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { menuItems } = useSidebarNavigation(currentOrg);

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

    const handleSelectOrg = (org: Organization) => {
        onOrgChange(org);
        setIsOrgMenuOpen(false);
        if (isCollapsed) setIsCollapsed(false);
    };

    // Global Apps Configuration
    const globalApps = [
        { id: 'home', label: 'Início', icon: Home, path: `/dashboard?view=home&org=${currentOrg.id}` },
        { id: 'mail', label: 'E-mail', icon: Mail, path: `/mail?org=${currentOrg.id}` },
        { id: 'chat', label: 'Chat', icon: MessageSquare, path: `/chat?org=${currentOrg.id}` },
        { id: 'meet', label: 'Meet', icon: Phone, path: `/meet?org=${currentOrg.id}` },
        { id: 'tasks', label: 'Tarefas', icon: CheckSquare, path: `/tasks?org=${currentOrg.id}` },
        { id: 'calendar', label: 'Agenda', icon: Calendar, path: `/calendar?org=${currentOrg.id}` },
        { id: 'drive', label: 'Drive', icon: HardDrive, path: `/drive?org=${currentOrg.id}` },
        { id: 'contacts', label: 'Pessoas', icon: Users, path: `/contacts?org=${currentOrg.id}` },
    ];

    return (
        <div className={`flex flex-col bg-docka-50 dark:bg-zinc-900 pt-4 h-full border-r border-docka-200/50 dark:border-zinc-800 shrink-0 transition-all duration-300 ease-in-out relative group/sidebar ${isCollapsed ? 'w-[68px]' : 'w-[260px]'} ${className}`}>

            {/* Header / Toggle */}
            <div className={`px-4 mb-4 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'}`}>
                <div className={`${isCollapsed ? '' : 'ml-1'}`}>
                    <DockaLogo variant={isCollapsed ? 'icon' : 'full'} className={`${isCollapsed ? 'h-8 w-8' : 'h-6'} text-docka-900 dark:text-zinc-100`} />
                </div>

                {/* Mobile Close Button */}
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1.5 text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md">
                        <X size={20} />
                    </button>
                )}

                {/* Desktop Collapse Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors ${onClose ? 'hidden lg:block' : ''} ${isCollapsed ? 'mt-2' : ''}`}
                    title={isCollapsed ? "Expandir" : "Reduzir"}
                >
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>

            {/* MAIN CONTENT SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 relative">

                {/* 1. Organization Switcher */}
                <div className={`px-2 mb-6 relative z-20 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                        className={`flex items-center gap-3 bg-white dark:bg-zinc-800/50 rounded-xl border transition-all duration-200 shadow-sm group hover:border-docka-300 dark:hover:border-zinc-600 ${isOrgMenuOpen ? 'border-docka-400 dark:border-zinc-500 ring-2 ring-docka-100 dark:ring-zinc-700/50' : 'border-docka-200 dark:border-zinc-700'} ${isCollapsed ? 'p-1.5 justify-center w-10 h-10' : 'w-full p-2'}`}
                        title={isCollapsed ? currentOrg.name : undefined}
                    >
                        <div
                            className={`rounded-lg flex items-center justify-center text-white font-bold shadow-sm shrink-0 ${!currentOrg.iconBg ? currentOrg.logoColor : ''} ${isCollapsed ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} overflow-hidden transition-all duration-300`}
                            style={{
                                backgroundColor: currentOrg.iconBg || undefined,
                                color: currentOrg.iconColor || undefined
                            }}
                        >
                            {currentOrg.svgIcon ? (
                                <div
                                    className="w-full h-full p-1.5 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:block transition-transform duration-300"
                                    style={{ transform: `scale(${currentOrg.iconScale || 1})` }}
                                    dangerouslySetInnerHTML={{ __html: cleanSvg(currentOrg.svgIcon) }}
                                />
                            ) : (
                                currentOrg.name.substring(0, 1)
                            )}
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

                    {/* ORG DROPDOWN MENU */}
                    {isOrgMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsOrgMenuOpen(false)} />
                            <div className={`absolute top-full mt-2 bg-white dark:bg-zinc-900 rounded-xl border border-docka-200 dark:border-zinc-700 shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top ${isCollapsed ? 'left-14 w-60' : 'left-2 right-2'}`}>
                                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <p className="px-2 py-1 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider">Trocar para...</p>
                                    {userOrgs.filter(o => o.id !== currentOrg.id).map(org => (
                                        <button
                                            key={org.id}
                                            onClick={() => handleSelectOrg(org)}
                                            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors group text-left"
                                        >
                                            <div
                                                className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 ${!org.iconBg ? org.logoColor : ''} opacity-80 group-hover:opacity-100 overflow-hidden transition-all duration-300`}
                                                style={{
                                                    backgroundColor: org.iconBg || undefined,
                                                    color: org.iconColor || undefined
                                                }}
                                            >
                                                {org.svgIcon ? (
                                                    <div
                                                        className="w-full h-full p-1 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current [&>svg]:block transition-transform duration-300"
                                                        style={{ transform: `scale(${org.iconScale || 1})` }}
                                                        dangerouslySetInnerHTML={{ __html: cleanSvg(org.svgIcon) }}
                                                    />
                                                ) : (
                                                    org.name.substring(0, 1)
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-docka-600 dark:text-zinc-400 group-hover:text-docka-900 dark:group-hover:text-zinc-200 truncate">
                                                {org.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="p-2 border-t border-docka-100 dark:border-zinc-800 bg-docka-50/50 dark:bg-zinc-800/20">
                                    <button
                                        onClick={() => { setIsOrgMenuOpen(false); setIsAddOrgModalOpen(true); }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-docka-100 dark:hover:bg-zinc-800 transition-colors text-docka-500 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 text-xs font-medium"
                                    >
                                        <div className="w-5 h-5 rounded border border-dashed border-docka-300 dark:border-zinc-600 flex items-center justify-center">
                                            +
                                        </div>
                                        Criar nova organização
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Workspace Menu Items (PRIMARY) */}
                <div className="space-y-0.5 mb-6">
                    {menuItems.map(item => {
                        // Determine if active: Location is dashboard AND view matches
                        const currentView = searchParams.get('view') || 'overview';
                        const isDashboard = location.pathname.startsWith('/dashboard');

                        const isSelected = isDashboard && (currentView === item.id || (item.children?.some(child => currentView === child.id)));
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = isSelected;

                        const ButtonContent = (
                            <button
                                onClick={() => {
                                    navigate(`/dashboard?view=${item.id}&org=${currentOrg.id}`);
                                    if (onClose && !hasChildren) onClose();
                                }}
                                className={`w-full flex items-center px-2 py-2 text-sm rounded-lg transition-all duration-200 group ${isSelected
                                    ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-semibold'
                                    : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100/50 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <item.icon
                                    size={20}
                                    className={`shrink-0 transition-colors ${isSelected ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-300'} ${!isCollapsed ? 'mr-3' : ''}`}
                                />
                                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                                {!isCollapsed && hasChildren && (
                                    <ChevronDown size={14} className={`text-docka-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                                {!isCollapsed && item.badgeCount && item.badgeCount > 0 && (
                                    <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor || 'bg-docka-500'}`}>
                                        {item.badgeCount}
                                    </span>
                                )}
                                {isCollapsed && item.badgeCount && item.badgeCount > 0 && (
                                    <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${item.badgeColor || 'bg-docka-500'}`} />
                                )}
                            </button>
                        );

                        return (
                            <div key={item.id} className="space-y-0.5">
                                {isCollapsed ? (
                                    <Tooltip content={item.label} side="right">
                                        {ButtonContent}
                                    </Tooltip>
                                ) : (
                                    ButtonContent
                                )}

                                {/* Sub-items rendering */}
                                {!isCollapsed && isExpanded && hasChildren && (
                                    <div className="ml-9 border-l border-docka-200 dark:border-zinc-800 pl-3 space-y-1 my-1">
                                        {item.children?.map(child => {
                                            const isChildSelected = currentView === child.id;
                                            return (
                                                <button
                                                    key={child.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard?view=${child.id}&org=${currentOrg.id}`);
                                                        if (onClose) onClose();
                                                    }}
                                                    className={`w-full flex items-center px-2 py-1.5 text-xs rounded-md transition-colors ${isChildSelected
                                                        ? 'text-docka-900 dark:text-zinc-100 font-bold bg-docka-50 dark:bg-zinc-800/50'
                                                        : 'text-docka-500 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200'
                                                        }`}
                                                >
                                                    {child.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* 3. Global Apps (SECONDARY - Bottom) */}
                <div className={`mt-2 pt-4 border-t border-docka-200 dark:border-zinc-800 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    {!isCollapsed && <p className="px-2 text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Aplicativos</p>}
                    <div className="space-y-0.5 w-full">
                        {globalApps.map(app => {
                            const isActive = location.pathname.startsWith(app.path);

                            const AppLink = (
                                <button
                                    onClick={() => {
                                        navigate(app.path);
                                        if (onClose) onClose();
                                    }}
                                    className={`w-full flex items-center px-2 py-2 text-sm rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100 font-semibold'
                                        : 'text-docka-600 dark:text-zinc-400 hover:bg-docka-100/50 dark:hover:bg-zinc-800/50 hover:text-docka-900 dark:hover:text-zinc-200'
                                        } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <app.icon
                                        size={20}
                                        className={`shrink-0 transition-colors ${isActive ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-300'} ${!isCollapsed ? 'mr-3' : ''}`}
                                    />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">{app.label}</span>}
                                </button>
                            );

                            return isCollapsed ? (
                                <Tooltip key={app.id} content={app.label} side="right">
                                    {AppLink}
                                </Tooltip>
                            ) : (
                                <React.Fragment key={app.id}>
                                    {AppLink}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* CREATE ORG MODAL */}
            <Modal
                isOpen={isAddOrgModalOpen}
                onClose={() => setIsAddOrgModalOpen(false)}
                title="Criar Nova Organização"
                footer={
                    <>
                        <button onClick={() => setIsAddOrgModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button onClick={() => setIsAddOrgModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm transition-colors">Criar Workspace</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Organização</label>
                        <div className="relative">
                            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                            <input className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="Ex: Acme Inc." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Slug (Domínio)</label>
                            <div className="flex items-center">
                                <span className="bg-docka-50 dark:bg-zinc-900 border border-r-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-xs py-2 px-2 rounded-l-lg">docka.io/</span>
                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" placeholder="acme" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Tipo de Indústria</label>
                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100">
                                <option>SaaS / Tech</option>
                                <option>Agência</option>
                                <option>Eventos</option>
                                <option>Infraestrutura</option>
                                <option>Outro</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 flex items-center gap-2"><Palette size={14} /> Cor da Marca</label>
                        <div className="flex gap-3">
                            {['bg-slate-900', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600', 'bg-orange-500', 'bg-red-600'].map((color) => (
                                <button key={color} className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 ring-transparent hover:ring-docka-300 dark:hover:ring-zinc-600 transition-all focus:ring-docka-900`} />
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

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
                                    <Settings size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />
                                    Preferências
                                </button>

                                {onToggleTheme && (
                                    <button
                                        onClick={() => { onToggleTheme?.(); }}
                                        className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-3 transition-colors group"
                                    >
                                        {theme === 'dark' ? <Sun size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" /> : <Moon size={16} className="text-docka-400 dark:text-zinc-500 group-hover:text-docka-600 dark:group-hover:text-zinc-200" />}
                                        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                                    </button>
                                )}

                                <div className="h-px bg-docka-100 dark:bg-zinc-800 my-1 mx-2" />
                                <button
                                    onClick={() => { setIsUserMenuOpen(false); onLogout?.(); }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Trigger Button */}
                    <div className="w-full">
                        {isCollapsed ? (
                            <Tooltip content={user.name} side="right">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 border ${isUserMenuOpen
                                        ? 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 shadow-sm'
                                        : 'hover:bg-white dark:hover:bg-zinc-800 border-transparent hover:border-docka-200 dark:hover:border-zinc-700 hover:shadow-sm'
                                        } justify-center`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} className="w-8 h-8 rounded-lg border border-docka-200 dark:border-zinc-700" alt="User" />
                                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-docka-50 dark:border-zinc-900 rounded-full" />
                                    </div>
                                </button>
                            </Tooltip>
                        ) : (
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`w-full flex items-center p-2 rounded-xl transition-all duration-200 border ${isUserMenuOpen
                                    ? 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 shadow-sm'
                                    : 'hover:bg-white dark:hover:bg-zinc-800 border-transparent hover:border-docka-200 dark:hover:border-zinc-700 hover:shadow-sm'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.name} className="w-8 h-8 rounded-lg border border-docka-200 dark:border-zinc-700" alt="User" />
                                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-docka-50 dark:border-zinc-900 rounded-full" />
                                </div>

                                <div className="ml-3 text-left min-w-0 flex-1">
                                    <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 truncate">{user.name}</div>
                                    <div className="text-[10px] text-docka-500 dark:text-zinc-500 truncate">Online</div>
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UnifiedSidebar;
