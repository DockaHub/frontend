import React from 'react';
import {
    AlertTriangle,
    Bell,
    BriefcaseBusiness,
    CalendarDays,
    Check,
    CheckSquare,
    FileText,
    FolderOpen,
    Info,
    RefreshCw,
    Users,
    X,
} from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        markAsReadByLink,
    } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = async (notification: Notification) => {
        if (notification.link) {
            await markAsReadByLink(notification.link);
            navigate(notification.link);
            onClose();
            return;
        }
        if (!notification.read) await markAsRead(notification.id);
    };

    const getIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'TASK':
            case 'TASK_ASSIGNED':
            case 'TASK_COMPLETED':
                return <CheckSquare size={16} className="text-emerald-600" />;
            case 'CALENDAR':
            case 'CALENDAR_INVITE':
            case 'CALENDAR_UPDATED':
                return <CalendarDays size={16} className="text-violet-600" />;
            case 'DRIVE_SHARED':
                return <FolderOpen size={16} className="text-blue-600" />;
            case 'ORG_MEMBERSHIP':
                return <Users size={16} className="text-cyan-600" />;
            case 'CRM':
            case 'CRM_ASSIGNMENT':
            case 'OPPORTUNITY':
                return <BriefcaseBusiness size={16} className="text-orange-600" />;
            case 'DOCUMENT':
                return <FileText size={16} className="text-indigo-600" />;
            case 'WARNING':
                return <AlertTriangle size={16} className="text-amber-600" />;
            default:
                return <Info size={16} className="text-zinc-500" />;
        }
    };

    return (
        <div className="fixed inset-x-4 bottom-4 z-[200] max-h-[min(560px,calc(100dvh-2rem))] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 lg:absolute lg:inset-x-auto lg:bottom-0 lg:left-full lg:ml-3 lg:w-[380px]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-950/70">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Bell size={18} className="text-zinc-900 dark:text-white shrink-0" />
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Notificações</h3>
                    {unreadCount > 0 && (
                        <span className="min-w-6 h-6 px-1.5 rounded-full bg-[#fff0eb] dark:bg-[#3b2018] text-[#fd6b32] dark:text-[#ff8b5e] text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => void refreshNotifications()}
                        disabled={loading}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                        title="Atualizar notificações"
                        aria-label="Atualizar notificações"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={() => void markAllAsRead()}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Marcar todas como lidas"
                            aria-label="Marcar todas como lidas"
                        >
                            <Check size={16} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        aria-label="Fechar notificações"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 ? (
                    <div className="p-4 space-y-3" aria-label="Carregando notificações">
                        {[0, 1, 2].map(item => (
                            <div key={item} className="flex gap-3 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                                    <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error && notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <AlertTriangle size={24} className="text-amber-500 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Falha ao carregar</p>
                        <p className="text-xs text-zinc-500 mt-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => void refreshNotifications()}
                            className="mt-4 text-xs font-bold text-[#fd6b32] hover:underline"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={22} className="text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Tudo em dia</p>
                        <p className="text-xs text-zinc-500 mt-1">Nenhuma notificação interna pendente.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {notifications.map(notification => (
                            <button
                                key={notification.id}
                                type="button"
                                onClick={() => void handleNotificationClick(notification)}
                                className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors flex gap-3 relative ${
                                    !notification.read ? 'bg-orange-50/40 dark:bg-orange-950/10' : ''
                                }`}
                            >
                                <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${
                                    !notification.read
                                        ? 'bg-white dark:bg-zinc-800 border-orange-100 dark:border-orange-900/30 shadow-sm'
                                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-100 dark:border-zinc-700'
                                }`}>
                                    {getIcon(notification.type)}
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-start justify-between gap-3 mb-1">
                                        <span className={`text-sm leading-snug ${
                                            !notification.read
                                                ? 'font-bold text-zinc-900 dark:text-zinc-100'
                                                : 'font-medium text-zinc-700 dark:text-zinc-300'
                                        }`}>
                                            {notification.title}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 shrink-0">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </span>
                                    <span className="block text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                        {notification.message}
                                    </span>
                                </span>
                                {!notification.read && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#fd6b32] rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
