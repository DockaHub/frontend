
import React from 'react';
import { Bell, Check, Trash2, X, ExternalLink, MessageSquare, CheckSquare, Info } from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.read) {
            await markAsRead(notif.id);
        }
        if (notif.link) {
            navigate(notif.link);
            onClose();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'CHAT': return <MessageSquare size={16} className="text-blue-500" />;
            case 'TASK': return <CheckSquare size={16} className="text-emerald-500" />;
            default: return <Info size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="absolute top-0 left-full ml-2 w-80 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] flex flex-col max-h-[500px] animate-in fade-in slide-in-from-left-2 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-docka-100 dark:border-zinc-800 flex items-center justify-between bg-docka-50/50 dark:bg-zinc-950/50">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-docka-900 dark:text-white" />
                    <h3 className="font-bold text-docka-900 dark:text-white">Notificações</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="p-1.5 text-docka-500 hover:text-docka-900 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            title="Marcar todas como lidas"
                        >
                            <Check size={16} />
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-docka-500 hover:text-docka-900 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-docka-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={24} className="text-docka-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-sm text-docka-500 dark:text-zinc-500">Nenhuma notificação por aqui.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-docka-50 dark:divide-zinc-800/50">
                        {notifications.map(notif => (
                            <button
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full text-left p-4 hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3 group relative ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!notif.read ? 'bg-white dark:bg-zinc-800 shadow-sm border border-blue-100 dark:border-blue-900/30' : 'bg-gray-50 dark:bg-zinc-800/50'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className={`text-sm truncate ${!notif.read ? 'font-bold text-docka-900 dark:text-zinc-100' : 'font-medium text-docka-600 dark:text-zinc-400'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-docka-400 dark:text-zinc-500 shrink-0 ml-2">
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-docka-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">
                                        {notif.message}
                                    </p>
                                    {!notif.read && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-950/30">
                    <button className="w-full text-center py-2 text-xs font-bold text-docka-500 hover:text-docka-900 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors">
                        Ver histórico completo
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;
