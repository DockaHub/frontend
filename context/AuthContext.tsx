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
            if (storedUser) {
                // 1. Set initial state from storage (fast load)
                setUser({ ...storedUser, role: (storedUser.role?.toLowerCase() || 'user') as 'admin' | 'user' });

                // 2. Fetch latest data from API (background refresh)
                try {
                    const data = await authService.getCurrentUser();
                    const updatedUser = { ...data, role: (data.role?.toLowerCase() || 'user') as 'admin' | 'user' };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser)); // Update storage
                } catch (error) {
                    console.error('Failed to refresh user on mount:', error);
                }

                // Connect socket if we have a user
                socketService.connect();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const refreshUser = async () => {
        try {
            const data = await authService.getCurrentUser();
            const updatedUser = { ...data, role: (data.role?.toLowerCase() || 'user') as 'admin' | 'user' }; // Ensure role type
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.user && response.token) {
                const userWithRole = { ...response.user, role: (response.user.role?.toLowerCase() || 'user') as 'admin' | 'user' };
                setUser(userWithRole);
                localStorage.setItem('user', JSON.stringify(userWithRole));
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
                const userWithRole = { ...response.user, role: (response.user.role?.toLowerCase() || 'user') as 'admin' | 'user' };
                setUser(userWithRole);
                localStorage.setItem('user', JSON.stringify(userWithRole));
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
