import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, RegisterData } from '../services/authService';
import { socketService } from '../services/socketService';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount and refresh from API
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = authService.getStoredUser();
            let token = localStorage.getItem('token');

            // 1. CHECK FOR AUTO-LOGIN / IMPERSONATION TOKEN IN URL
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            
            if (urlToken) {
                console.log('🔑 URL token detected. Storing session dynamically...');
                token = urlToken;
                localStorage.setItem('token', urlToken);
                
                // Clean URL parameters cleanly without doing a hard page reload
                try {
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, '', cleanUrl);
                } catch (e) {
                    console.error('Failed to clean URL parameters:', e);
                }
            }

            if (storedUser && !urlToken) {
                // 1. Set initial state from storage (fast load)
                const normalizedStored = { ...storedUser, role: (storedUser.role || 'user').toUpperCase() };
                setUser(normalizedStored);

                // 2. Fetch latest data from API (background refresh)
                try {
                    const data = await authService.getCurrentUser();
                    const normalizedUser = { ...data, role: (data.role || 'user').toUpperCase() };
                    setUser(normalizedUser);
                    localStorage.setItem('user', JSON.stringify(normalizedUser)); // Update storage
                } catch (error) {
                    console.error('Failed to refresh user on mount:', error);
                }

                // Connect socket if we have a user
                socketService.connect();
            } else if (token) {
                // Handle case where we have a token (either from storage or URL) but no user object
                try {
                    const data = await authService.getCurrentUser();
                    const normalizedUser = { ...data, role: (data.role || 'user').toUpperCase() };
                    setUser(normalizedUser);
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                    socketService.connect();
                } catch (error) {
                    console.error('Failed to fetch user from token on mount:', error);
                    localStorage.removeItem('token'); // Clear invalid token
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const refreshUser = async () => {
        try {
            const data = await authService.getCurrentUser();
            const normalizedUser = { ...data, role: (data.role || 'user').toUpperCase() };
            setUser(normalizedUser);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.user && response.token) {
                const normalizedUser = { ...response.user, role: (response.user.role || 'user').toUpperCase() };
                setUser(normalizedUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            if (response.user && response.token) {
                const normalizedUser = { ...response.user, role: (response.user.role || 'user').toUpperCase() };
                setUser(normalizedUser);
                localStorage.setItem('user', JSON.stringify(normalizedUser));
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
