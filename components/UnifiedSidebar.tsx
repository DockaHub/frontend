import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, X, Building2, Palette, Bell,
    User as UserIcon, Settings, Sun, Moon, LogOut
} from 'lucide-react';
import { Organization, User } from '../types';
import Modal from './common/Modal';
import UserAvatar from './common/UserAvatar';
import { useSidebarNavigation } from '../hooks/useSidebarNavigation';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { getBackendUrl } from '../services/api';

const getLogoUrl = (logo?: string) => {
    if (!logo) return undefined;
    if (/^(https?:|data:|blob:)/.test(logo)) return logo;
    return `${getBackendUrl()}${logo.startsWith('/') ? '' : '/'}${logo}`;
};

const AsteryskoBrandMark: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
    <svg viewBox="0 0 38 34" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M29.208 0.974374C28.9702 1.21152 28.779 1.47445 28.6239 1.758L19.6547 13.8217C19.2721 14.2032 19.2721 14.8218 19.6547 15.1982C20.0372 15.5745 20.6576 15.5797 21.035 15.1982L33.1317 6.25352C33.416 6.10402 33.6797 5.90811 33.9175 5.67096C35.2202 4.3718 35.2202 2.26838 33.9175 0.969219C32.6148 -0.329947 30.5056 -0.329947 29.2029 0.969219L29.208 0.974374Z" fill="currentColor" />
        <path d="M35.2461 15.9457C34.9669 15.9457 34.6929 15.987 34.4396 16.0643L21.9758 17.8893C21.5261 17.8893 21.159 18.2553 21.159 18.7039C21.159 19.1524 21.5261 19.5184 21.9758 19.5184L34.4345 21.3847C34.6878 21.462 34.9618 21.5033 35.2409 21.5033C36.7814 21.5033 38.0325 20.2608 38.0325 18.7296C38.0325 17.1985 36.7866 15.9457 35.2513 15.9457H35.2461Z" fill="currentColor" />
        <path d="M29.1356 28.7054C28.9754 28.5456 28.7996 28.4167 28.6083 28.3136L20.518 22.3127C20.2647 22.0549 19.8459 22.0549 19.5926 22.3127C19.3393 22.5704 19.3341 22.9829 19.5926 23.2355L25.5841 31.3243C25.6824 31.5151 25.8116 31.6904 25.9719 31.8502C26.8403 32.7215 28.2568 32.7215 29.1253 31.8502C29.9938 30.9789 29.9989 29.5715 29.1253 28.7054H29.1356Z" fill="currentColor" />
        <path d="M17.9435 32.2936C17.9435 32.1234 17.9177 31.9533 17.8712 31.7986L16.7442 24.1428C16.7442 23.8644 16.5219 23.6428 16.2428 23.6376C15.9636 23.6325 15.7413 23.8593 15.7361 24.1377L14.5833 31.7883C14.5368 31.943 14.511 32.1131 14.511 32.2832C14.511 33.2267 15.2761 33.9948 16.2273 34C17.1733 34 17.9435 33.237 17.9487 32.2884L17.9435 32.2936Z" fill="currentColor" />
        <path d="M9.27418 27.2464C9.3569 27.1639 9.42927 27.066 9.48096 26.968L12.6964 22.6581C12.8308 22.524 12.836 22.3024 12.6964 22.1632C12.5569 22.024 12.3397 22.024 12.2002 22.1632L7.86806 25.3544C7.76467 25.4059 7.67162 25.4781 7.58891 25.5606C7.12364 26.0246 7.12364 26.7773 7.58891 27.2412C8.05417 27.7052 8.80892 27.7052 9.27418 27.2412V27.2464Z" fill="currentColor" />
        <path d="M2.62615 20.4361C2.79674 20.4361 2.96734 20.4103 3.12242 20.3639L10.7941 19.2297C11.0732 19.2297 11.2955 19.0029 11.2955 18.7296C11.2955 18.4564 11.068 18.2296 10.7941 18.2296L3.12242 17.0954C2.96734 17.049 2.79674 17.0232 2.62615 17.0232C1.68012 17.0232 0.909851 17.7914 0.909851 18.7348C0.909851 19.6782 1.68012 20.4464 2.62615 20.4464V20.4361Z" fill="currentColor" />
        <path d="M0.811577 7.2743C1.00802 7.47536 1.23031 7.63518 1.46811 7.75891L11.5746 15.26C11.8951 15.5797 12.4121 15.5797 12.7326 15.26C13.0531 14.9404 13.0531 14.4249 12.7326 14.1052L5.24706 4.00061C5.12299 3.76346 4.95757 3.54177 4.76112 3.34587C3.67551 2.25807 1.90752 2.25807 0.816747 3.34071C-0.274031 4.42335 -0.274031 6.1865 0.811577 7.2743Z" fill="currentColor" />
        <path d="M14.5109 5.16058C14.5109 5.33071 14.5368 5.50083 14.5833 5.6555L15.7206 13.3061C15.7206 13.5845 15.9481 13.8062 16.2221 13.8062C16.4961 13.8062 16.7235 13.5794 16.7235 13.3061L17.8608 5.6555C17.9074 5.50083 17.9332 5.33071 17.9332 5.16058C17.9332 4.21713 17.1629 3.44898 16.2169 3.44898C15.2709 3.44898 14.5006 4.21713 14.5006 5.16058H14.5109Z" fill="currentColor" />
    </svg>
);

const ManywaysBrandMark: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
    <svg viewBox="0 0 600 600" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M535.712 527.642C540.289 527.642 544 531.353 544 535.93C544 540.507 540.289 544.218 535.712 544.218H63.2881C58.7107 544.218 55 540.507 55 535.93C55 531.353 58.7107 527.642 63.2881 527.642H535.712Z" fill="currentColor"/>
        <path d="M464.977 421.341C469.399 420.156 473.943 422.78 475.128 427.202C476.313 431.623 473.689 436.168 469.267 437.353L85.225 540.256C80.8035 541.441 76.2588 538.817 75.0741 534.396C73.8894 529.974 76.5132 525.43 80.9347 524.245L464.977 421.341Z" fill="currentColor"/>
        <path d="M373.979 350.189C377.943 347.9 383.012 349.258 385.3 353.222C387.589 357.186 386.231 362.255 382.267 364.544L87.9368 534.476C83.9727 536.764 78.9037 535.406 76.615 531.442C74.3263 527.478 75.6845 522.409 79.6487 520.12L373.979 350.189Z" fill="currentColor"/>
        <path d="M276.057 315.927C279.293 312.691 284.541 312.691 287.778 315.927C291.015 319.164 291.015 324.412 287.778 327.649L82.0857 533.341C78.849 536.577 73.6012 536.577 70.3645 533.341C67.1278 530.104 67.1278 524.856 70.3645 521.62L276.057 315.927Z" fill="currentColor"/>
        <path d="M183.55 316.568C185.839 312.604 190.907 311.245 194.872 313.534C198.836 315.823 200.194 320.892 197.905 324.856L79.0515 530.717C76.7628 534.681 71.6939 536.039 67.7297 533.75C63.7656 531.462 62.4074 526.393 64.6961 522.428L183.55 316.568Z" fill="currentColor"/>
        <path d="M107.109 346.406C108.293 341.985 112.838 339.361 117.259 340.545C121.681 341.73 124.305 346.275 123.12 350.696L75.3062 529.14C74.1215 533.561 69.5768 536.185 65.1554 535C60.7339 533.815 58.1101 529.271 59.2948 524.849L107.109 346.406Z" fill="currentColor"/>
        <path d="M55 393.65C55 389.073 58.7107 385.362 63.2881 385.362C67.8655 385.362 71.5763 389.073 71.5763 393.65L71.5763 535.649C71.5763 540.227 67.8655 543.938 63.2881 543.938C58.7107 543.938 55 540.227 55 535.649L55 393.65Z" fill="currentColor"/>
    </svg>
);

const getBgColorForSlug = (slug: string) => {
    switch (slug?.toLowerCase()) {
        case 'manyspace':
        case 'manyways': return '#000000';
        case 'fauves': return '#2a2ad7';
        case 'tokyon': return '#dc2626';
        case 'asterysko': return '#0412dd';
        case 'umachave': return '#f97316';
        default: return '#3b82f6';
    }
};

const BrandLogo: React.FC<{
    org: Organization;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}> = ({ org, size = 'md', className = '' }) => {
    const slug = org.slug?.toLowerCase() || '';

    const dim = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-[40px] h-[40px]' : 'w-9 h-9';
    const iconDim = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-[22px] h-[22px]' : 'w-5 h-5';

    // 1. Uploaded custom logo image
    if (org.logo) {
        const logoUrl = getLogoUrl(org.logo);
        if (logoUrl) {
            return (
                <img
                    src={logoUrl}
                    alt={org.name}
                    className={`${dim} rounded-xl object-cover shrink-0 ${className}`}
                />
            );
        }
    }

    // 2. Asterysko
    if (slug === 'asterysko') {
        return (
            <div
                className={`${dim} rounded-xl bg-[#0412dd] flex items-center justify-center text-white shrink-0 ${className}`}
            >
                <div className={iconDim}>
                    <AsteryskoBrandMark />
                </div>
            </div>
        );
    }

    // 3. ManySpace / Manyways
    if (slug === 'manyspace' || slug === 'manyways') {
        return (
            <div
                className={`${dim} rounded-xl bg-black flex items-center justify-center text-white shrink-0 ${className}`}
            >
                <div className={size === 'lg' ? 'w-[24px] h-[24px]' : 'w-[20px] h-[20px]'}>
                    <ManywaysBrandMark />
                </div>
            </div>
        );
    }

    // 4. Fauves
    if (slug === 'fauves') {
        return (
            <div
                className={`${dim} rounded-xl bg-[#2a2ad7] flex items-center justify-center text-white shrink-0 overflow-hidden ${className}`}
            >
                <img src="/brands/fauves.svg" alt="Fauves" className="w-full h-full object-cover" />
            </div>
        );
    }

    // 5. Tokyon
    if (slug === 'tokyon') {
        return (
            <div
                className={`${dim} rounded-xl bg-black flex items-center justify-center text-white shrink-0 overflow-hidden ${className}`}
            >
                <img src="/brands/tokyon.svg" alt="Tokyon" className="w-full h-full object-cover" />
            </div>
        );
    }

    // 6. Known brand assets (/brands/allyo.svg, /brands/niva.svg)
    const knownBrandAssets: Record<string, string> = {
        allyo: '/brands/allyo.svg',
        niva: '/brands/niva.svg',
    };
    if (knownBrandAssets[slug]) {
        return (
            <div
                className={`${dim} rounded-xl bg-black flex items-center justify-center text-white shrink-0 overflow-hidden ${className}`}
            >
                <img src={knownBrandAssets[slug]} alt={org.name} className="w-full h-full object-cover" />
            </div>
        );
    }

    // 7. Custom raw svgIcon from DB (e.g. Uma Chave, Docka, etc.)
    if (org.svgIcon && org.svgIcon.includes('<svg')) {
        const bg = org.iconBg || getBgColorForSlug(org.slug);
        const scale = org.iconScale || 1;
        return (
            <div
                className={`${dim} rounded-xl flex items-center justify-center text-white font-bold shrink-0 overflow-hidden ${className}`}
                style={{ backgroundColor: bg }}
            >
                <div
                    className={`${iconDim} flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain`}
                    style={{ transform: `scale(${scale})` }}
                    dangerouslySetInnerHTML={{ __html: org.svgIcon }}
                />
            </div>
        );
    }

    // 8. Fallback: Styled initial letter with brand background
    const bg = org.iconBg || getBgColorForSlug(org.slug);
    return (
        <div
            className={`${dim} rounded-xl flex items-center justify-center text-white font-black uppercase shrink-0 ${className}`}
            style={{ backgroundColor: bg }}
        >
            <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-[17px]' : 'text-[15px]'}>
                {org.name.substring(0, 1)}
            </span>
        </div>
    );
};

const AVATAR_COLORS = [
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-blue-600',
    'bg-purple-600',
    'bg-teal-600',
    'bg-orange-600'
];

const OrgMembersStack: React.FC<{ org: Organization }> = ({ org }) => {
    const members = org.membersPreview || [];
    const displayedMembers = members.slice(0, 4);
    const totalMembers = org._count?.members || members.length || 1;
    const extraMembers = totalMembers - displayedMembers.length;

    return (
        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
            {displayedMembers.length > 0 ? (
                <div className="flex items-center -space-x-1.5 shrink-0">
                    {displayedMembers.map((member, i) => {
                        const u = member.user;
                        const name = u?.name || u?.email || 'Membro';
                        const initial = name.charAt(0).toUpperCase();
                        const color = AVATAR_COLORS[(name.charCodeAt(0) + i) % AVATAR_COLORS.length];
                        const avatarUrl = u?.avatar ? getLogoUrl(u.avatar) : undefined;

                        return avatarUrl ? (
                            <img
                                key={member.id || i}
                                src={avatarUrl}
                                alt={name}
                                className="w-4 h-4 rounded-full object-cover ring-1.5 ring-[#1e1f22] bg-zinc-700"
                                title={name}
                            />
                        ) : (
                            <div
                                key={member.id || i}
                                className={`w-4 h-4 rounded-full ${color} text-white text-[7.5px] font-bold flex items-center justify-center ring-1.5 ring-[#1e1f22] shrink-0`}
                                title={name}
                            >
                                {initial}
                            </div>
                        );
                    })}
                </div>
            ) : null}

            <span className="text-[11px] text-[#9f9f9f] truncate">
                {extraMembers > 0 ? (
                    `+ ${extraMembers} ${extraMembers === 1 ? 'pessoa' : 'pessoas'}`
                ) : totalMembers === 1 ? (
                    '1 pessoa'
                ) : (
                    `${totalMembers} pessoas`
                )}
            </span>
        </div>
    );
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
    const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
    const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const orgMenuRef = useRef<HTMLDivElement>(null);

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
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
                setIsOrgMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Hotkey switching (e.g. Meta+1, Meta+2)
    const filteredAndSortedOrgs = React.useMemo(() => {
        const valid = (userOrgs.length > 0 ? userOrgs : [currentOrg]).filter(
            o => o.slug !== 'docka' && !o.name.toLowerCase().includes('docka')
        );
        return [...valid].sort((a, b) => {
            const aIsMaster = a.slug === 'manyspace' || a.slug === 'manyways';
            const bIsMaster = b.slug === 'manyspace' || b.slug === 'manyways';
            if (aIsMaster && !bIsMaster) return -1;
            if (!aIsMaster && bIsMaster) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [userOrgs, currentOrg]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && !isNaN(Number(event.key))) {
                const index = Number(event.key) - 1;
                if (index >= 0 && index < filteredAndSortedOrgs.length) {
                    event.preventDefault();
                    handleSelectOrg(filteredAndSortedOrgs[index]);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredAndSortedOrgs]);

    const { unreadCount } = useNotifications();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const handleSelectOrg = (org: Organization) => {
        onOrgChange(org);
        setIsOrgMenuOpen(false);
    };

    if (!currentOrg) return null;

    // Toggle item expansion
    const toggleItem = (id: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const getAccentColor = (slug: string) => {
        const isDark = theme === 'dark';
        switch (slug?.toLowerCase()) {
            case 'asterysko':
                return isDark ? '#818cf8' : '#0412dd'; // Indigo-400 on dark mode, bright blue on light mode
            case 'fauves':
                return isDark ? '#a5b4fc' : '#2a2ad7'; // Indigo-300 on dark mode
            default:
                return isDark ? '#ff7a45' : '#fd6b32'; // Orange on dark mode
        }
    };

    const getInactiveColor = () => {
        return theme === 'dark' ? '#a1a1aa' : '#000000'; // zinc-400 on dark mode, black on light mode
    };
    const firstName = user.name?.trim().split(/\s+/)[0] || 'Usuário';

    const isCurrentAsterysko = currentOrg.slug === 'asterysko';
    const isCurrentManyways = currentOrg.slug === 'manyspace' || currentOrg.slug === 'manyways';

    return (
        <div className={`flex flex-col bg-white dark:bg-zinc-950 pt-[15px] pb-[15px] h-full border-r border-[#e5e5e5] dark:border-zinc-800 shrink-0 relative w-[180px] ${className}`}>

            {/* Logo container at top left */}
            <div className="px-6 mb-6 flex items-center justify-between relative">
                <div className="relative group">
                    {/* 3D bottom shadow layer */}
                    <div className="absolute top-[2px] left-0 w-[40px] h-[40px] bg-black/15 rounded-xl transition-transform duration-150 group-hover:translate-y-[1px]" />
                    {/* Switcher trigger button */}
                    <button 
                        onClick={() => setIsOrgMenuOpen(!isOrgMenuOpen)}
                        className="relative rounded-xl flex items-center justify-center transition-all duration-150 active:translate-y-[2px] group-hover:-translate-y-[1px] shadow-sm overflow-hidden"
                        title={currentOrg.name}
                    >
                        <BrandLogo org={currentOrg} size="lg" />
                    </button>
                </div>

                {/* Dark Slack-style switcher menu */}
                {isOrgMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOrgMenuOpen(false)} />
                        <div 
                            ref={orgMenuRef}
                            className="absolute top-[50px] left-6 w-[320px] bg-[#1e1f22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-2"
                        >
                            <div className="space-y-1">
                                {filteredAndSortedOrgs.map((org, index) => {
                                    const isSelected = org.id === currentOrg.id;
                                    const isManyways = org.slug === 'manyspace' || org.slug === 'manyways';
                                    
                                    return (
                                        <React.Fragment key={org.id}>
                                            {index === 1 && filteredAndSortedOrgs.length > 1 && (
                                                <div className="pt-2 pb-1 px-2 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-[#80848e] uppercase tracking-wider">Empresas do Portfólio</span>
                                                    <div className="flex-1 h-px bg-white/10" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleSelectOrg(org)}
                                                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors group text-left ${
                                                    isSelected ? 'bg-white/5' : 'hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                                                    {/* Logo wrapper with white ring if active */}
                                                    <div 
                                                        className={`rounded-xl shrink-0 transition-transform duration-150 ${
                                                            isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e1f22]' : 'group-hover:scale-105'
                                                        }`}
                                                    >
                                                        <BrandLogo org={org} size="md" />
                                                    </div>
                                                    
                                                    {/* Text & Member Avatar Stack */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <h4 className="font-bold text-white text-[14px] leading-snug truncate">
                                                                {org.name}
                                                            </h4>
                                                            {isManyways && (
                                                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-white/10 text-zinc-300 rounded shrink-0">
                                                                    Mandante
                                                                </span>
                                                            )}
                                                        </div>
                                                        <OrgMembersStack org={org} />
                                                    </div>
                                                </div>
                                                
                                                <span className="text-[10px] font-medium text-[#9f9f9f] font-mono bg-white/5 px-1.5 py-0.5 rounded uppercase shrink-0">
                                                    ⌘{index + 1}
                                                </span>
                                            </button>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 text-[#9f9f9f] hover:text-black rounded transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* MAIN CONTENT SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-4 relative">

                {/* 2. Workspace Menu Items (PRIMARY) */}
                <div className="space-y-[15px] mb-6">
                    {menuItems.map(item => {
                        // Determine if active: Location is dashboard AND view matches
                        const currentView = searchParams.get('view') || 'overview';
                        const isDashboard = location.pathname.startsWith('/dashboard');

                        const isSelected = isDashboard && (currentView === item.id || (item.children?.some(child => currentView === child.id)));
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = isSelected || expandedItems.has(item.id);

                        const ButtonContent = (
                            <button
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleItem(item.id);
                                    } else {
                                        navigate(`/dashboard?view=${item.id}&org=${currentOrg.id}`);
                                        if (onClose) onClose();
                                    }
                                }}
                                className="w-full flex items-center gap-[8px] py-1 px-0 transition-all duration-150 group"
                            >
                                <item.icon
                                    size={16}
                                    className="shrink-0"
                                    style={{ color: isSelected ? getAccentColor(currentOrg.slug) : getInactiveColor() }}
                                />
                                <span
                                    className="flex-1 text-left truncate"
                                    style={{
                                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: isSelected ? getAccentColor(currentOrg.slug) : getInactiveColor(),
                                    }}
                                >
                                    {item.label}
                                </span>
                                {hasChildren && (
                                    <ChevronDown size={14} style={{ color: '#9f9f9f' }} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                                {item.badgeCount && item.badgeCount > 0 && (
                                    <span className={`ml-auto px-1.5 py-0.5 text-[9px] font-bold text-white rounded-full ${item.badgeColor || 'bg-gray-400'}`}>
                                        {item.badgeCount}
                                    </span>
                                )}
                            </button>
                        );

                        return (
                            <div key={item.id} className="space-y-[15px]">
                                {ButtonContent}

                                {/* Sub-items rendering */}
                                {isExpanded && hasChildren && (
                                    <div className="ml-9 border-l border-[#e5e5e5] dark:border-zinc-800 pl-3 space-y-1 my-1">
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
                                                        ? 'font-bold'
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                                                        }`}
                                                    style={isChildSelected ? { color: getAccentColor(currentOrg.slug) } : undefined}
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
                                <span className="bg-docka-50 dark:bg-zinc-900 border border-r-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-xs py-2 px-2 rounded-l-lg">manyspace.io/</span>
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

            {/* Notificações internas, próximas do contexto do usuário */}
            <div className="mx-6 border-y border-[#e5e5e5] dark:border-zinc-800" ref={notificationRef}>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsNotificationOpen(current => !current)}
                        className="w-full flex items-center justify-between py-3 text-black dark:text-white hover:text-[#fd6b32] dark:hover:text-[#ff7a45] transition-colors"
                        aria-expanded={isNotificationOpen}
                        aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
                    >
                        <span className="flex items-center gap-3 min-w-0">
                            <Bell size={17} strokeWidth={1.8} className="shrink-0" />
                            <span
                                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                                className="text-xs font-semibold truncate"
                            >
                                Notificações
                            </span>
                        </span>
                        {unreadCount > 0 && (
                            <span className="min-w-6 h-6 px-1.5 rounded-full bg-[#fff0eb] dark:bg-[#3b2018] text-[#fd6b32] dark:text-[#ff8b5e] text-[10px] font-bold flex items-center justify-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {isNotificationOpen && <NotificationPanel onClose={() => setIsNotificationOpen(false)} />}
                </div>
            </div>

            {/* Perfil do usuário */}
            <div className="mx-6 pt-3" ref={menuRef}>
                <div className="relative">
                    {/* Popover Menu */}
                    {isUserMenuOpen && (
                        <div className={`absolute bottom-full mb-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 w-64 overflow-hidden left-0`}>
                            {/* Header */}
                            <div className="p-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/50 dark:bg-zinc-950/50 flex items-center gap-3">
                                <UserAvatar src={user.avatar} name={user.name} size="md" />
                                <div className="min-w-0">
                                    <div className="font-bold text-docka-900 dark:text-zinc-100 truncate">{user.name}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500 font-medium">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Ativo
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="p-2 space-y-1">
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
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-full flex items-center justify-between py-1.5 hover:bg-[#f5f5f5] dark:hover:bg-zinc-800 rounded-lg transition-colors px-2 -mx-2"
                        aria-expanded={isUserMenuOpen}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar src={user.avatar} name={user.name} size="sm" />
                            <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }} className="text-xs font-semibold text-black dark:text-white truncate">
                                {firstName}
                            </span>
                        </div>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9f9f9f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default UnifiedSidebar;
