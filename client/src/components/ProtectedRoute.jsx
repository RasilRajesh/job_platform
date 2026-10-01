import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && user?.role !== role) {
        const redirect = user?.role === 'recruiter'
            ? '/dashboard/recruiter'
            : '/dashboard/jobseeker';
        return <Navigate to={redirect} replace />;
    }

    return children;
}

export default ProtectedRoute;
