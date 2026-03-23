import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [], canAccess = null }) => {
    const { user, loading, hasRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-sm"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login if not authenticated
        return <Navigate to="/portal-admin" state={{ from: location }} replace />;
    }

    // Check custom access function if provided
    if (canAccess && !canAccess()) {
        return <Navigate to="/dashboard" replace />;
    }

    // Check roles if provided
    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
