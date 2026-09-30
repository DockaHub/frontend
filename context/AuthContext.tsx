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
    isFreshLogin: boolean;
    completeFreshLogin: () => void;
    beginImpersonation: (token: string, targetUser: User, returnUrl?: string) => void;
    stopImpersonation: () => void;
}

const ORIGINAL_TOKEN_KEY = 'manyspace_impersonation_original_token';
const ORIGINAL_USER_KEY = 'manyspace_impersonation_original_user';
const RETURN_URL_KEY = 'manyspace_impersonation_return_url';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role?: string): User['role'] => {
    switch ((role || 'user').toUpperCase()) {
        case 'ADMIN':
            return 'ADMIN';
        case 'CLIENT':
            return 'CLIENT';
        case 'OWNER':
            return 'OWNER';
        case 'SUPER_ADMIN':
            return 'SUPER_ADMIN';
        default:
            return 'user';
    }
};

const normalizeUser = (source: Omit<User, 'role'> & { role?: string }): User => ({
    ...source,
    role: normalizeRole(source.role),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFreshLogin, setIsFreshLogin] = useState(false);

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
                const normalizedStored = normalizeUser(storedUser);
                setUser(normalizedStored);

                // 2. Fetch latest data from API (background refresh)
                try {
                    const data = await authService.getCurrentUser();
                    const normalizedUser = normalizeUser(data);
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
                    const normalizedUser = normalizeUser(data);
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
            const normalizedUser = normalizeUser(data);
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
                const normalizedUser = normalizeUser(response.user);
                setUser(normalizedUser);
                setIsFreshLogin(true);
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
                const normalizedUser = normalizeUser(response.user);
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
        sessionStorage.removeItem(ORIGINAL_TOKEN_KEY);
        sessionStorage.removeItem(ORIGINAL_USER_KEY);
        sessionStorage.removeItem(RETURN_URL_KEY);
        socketService.disconnect();
        setUser(null);
        setIsFreshLogin(false);
    };

    const beginImpersonation = (token: string, targetUser: User, returnUrl = window.location.href) => {
        const currentToken = localStorage.getItem('token');
        const currentUser = localStorage.getItem('user');
        if (currentToken && !sessionStorage.getItem(ORIGINAL_TOKEN_KEY)) {
            sessionStorage.setItem(ORIGINAL_TOKEN_KEY, currentToken);
            if (currentUser) sessionStorage.setItem(ORIGINAL_USER_KEY, currentUser);
            sessionStorage.setItem(RETURN_URL_KEY, returnUrl);
        }

        const normalizedUser = normalizeUser(targetUser);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        socketService.disconnect();
        setUser(normalizedUser);
        setIsFreshLogin(false);
    };

    const stopImpersonation = () => {
        const originalToken = sessionStorage.getItem(ORIGINAL_TOKEN_KEY);
        const originalUser = sessionStorage.getItem(ORIGINAL_USER_KEY);
        const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
        sessionStorage.removeItem(ORIGINAL_TOKEN_KEY);
        sessionStorage.removeItem(ORIGINAL_USER_KEY);
        sessionStorage.removeItem(RETURN_URL_KEY);

        if (!originalToken) {
            logout();
            window.location.assign('/login');
            return;
        }

        localStorage.setItem('token', originalToken);
        if (originalUser) localStorage.setItem('user', originalUser);
        else localStorage.removeItem('user');
        socketService.disconnect();
        window.location.assign(returnUrl || '/dashboard');
    };

    const completeFreshLogin = () => setIsFreshLogin(false);

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refreshUser,
        isFreshLogin,
        completeFreshLogin,
        beginImpersonation,
        stopImpersonation,
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
