
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    fallbackPath?: string;
}

/**
 * RoleGuard prevents unauthorized access to routes based on user roles.
 * If the user's role is not in the allowedRoles list, it redirects to fallbackPath.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ 
    children, 
    allowedRoles, 
    fallbackPath = '/portal' 
}) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // If still loading auth state, show nothing or a loader
    if (loading) {
        return null; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated but user data is missing (still fetching profile)
    // AND it's not a public route, wait for user object.
    if (!user) {
        return null; // Or a spinner
    }

    if (!user || !allowedRoles.map(r => r.toUpperCase()).includes(user.role.toUpperCase())) {
        console.warn(`Access denied for role: ${user?.role}. Allowed: ${allowedRoles.join(', ')}`);
        
        // Intelligent fallback based on role
        if (user?.role === 'CLIENT') {
            return <Navigate to="/portal" replace />;
        }

        if ((user?.role === 'ADMIN' || user?.role === 'OWNER' || user?.role === 'SUPER_ADMIN') && location.pathname.startsWith('/portal')) {
            // Admins shouldn't be locked out of the portal, but if they are, send to dashboard
            return <Navigate to="/dashboard" replace />;
        }
        
        // If no specific role logic matches, go to root and let App.tsx decide
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
