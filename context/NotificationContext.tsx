
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

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
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    markAsReadByLink: (link: string) => Promise<void>;
    addLocalNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = useAuth();
    const { addToast } = useToast();
    const notificationAudio = useRef<HTMLAudioElement>(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        if (!user) return;

        const handleNewNotification = (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            
            // If it's NOT a chat notification (since chat already has its own toasts), show toast
            // Or maybe show toast for everything that happens while not on that specific page
            if (notification.type !== 'CHAT') {
                addToast({
                    type: 'info',
                    title: notification.title,
                    message: notification.message
                });
            }

            // Always play sound for notification if it belongs to current user
            notificationAudio.current.volume = 0.5;
            notificationAudio.current.play().catch(e => console.log('Audio play failed:', e));
        };

        socketService.on('new_notification', handleNewNotification);
        return () => {
            socketService.off('new_notification', handleNewNotification);
        };
    }, [user, addToast]);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/link`, {
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
        setNotifications(prev => [notification, ...prev]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, markAsReadByLink, addLocalNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
