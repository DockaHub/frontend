
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getApiBaseUrl } from '../services/api';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    link?: string;
    organizationId?: string;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    markAsReadByLink: (link: string) => Promise<void>;
    addLocalNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const isInternalNotification = (notification: Notification) =>
    notification.type?.toUpperCase() !== 'CHAT';

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { addToast } = useToast();

    const fetchNotifications = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${getApiBaseUrl()}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(Array.isArray(data) ? data.filter(isInternalNotification) : []);
            } else {
                setError('Não foi possível carregar as notificações.');
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            setError('Não foi possível carregar as notificações.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user) return;
        const refreshInterval = window.setInterval(fetchNotifications, 60_000);
        window.addEventListener('focus', fetchNotifications);
        return () => {
            window.clearInterval(refreshInterval);
            window.removeEventListener('focus', fetchNotifications);
        };
    }, [user, fetchNotifications]);

    useEffect(() => {
        if (!user) return;

        const handleNewNotification = (notification: Notification) => {
            if (!isInternalNotification(notification)) return;
            setNotifications(previous => (
                previous.some(item => item.id === notification.id)
                    ? previous
                    : [notification, ...previous]
            ));
            addToast({
                type: 'info',
                title: notification.title,
                message: notification.message
            });
        };

        socketService.on('new_notification', handleNewNotification);
        return () => {
            socketService.off('new_notification', handleNewNotification);
        };
    }, [user, addToast]);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const markAsReadByLink = async (link: string) => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/notifications/link`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ link })
            });
            if (response.ok) {
                setNotifications(prev => prev.map(n => n.link === link ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error('Failed to mark notifications as read by link', error);
        }
    };

    const addLocalNotification = (notification: Notification) => {
        if (!isInternalNotification(notification)) return;
        setNotifications(previous => (
            previous.some(item => item.id === notification.id)
                ? previous
                : [notification, ...previous]
        ));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            error,
            refreshNotifications: fetchNotifications,
            markAsRead,
            markAllAsRead,
            markAsReadByLink,
            addLocalNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
