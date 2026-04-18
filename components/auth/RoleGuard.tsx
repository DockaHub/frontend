
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
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        console.warn(`Access denied for role: ${user?.role}. Allowed: ${allowedRoles.join(', ')}`);
        
        // If it's a client trying to access admin, send to portal
        if (user?.role === 'CLIENT' && !fallbackPath.includes('portal')) {
            return <Navigate to="/portal" replace />;
        }

        // If it's an admin blocked from something, don't force them into the client portal
        if (user?.role === 'ADMIN' && fallbackPath === '/portal') {
            return <Navigate to="/dashboard" replace />;
        }
        
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};
