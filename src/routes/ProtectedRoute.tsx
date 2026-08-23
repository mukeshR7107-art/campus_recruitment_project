import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center">
        <p className="max-w-md text-sm text-red-700">Your account is authenticated, but its profile could not be loaded. Please ask an administrator to run the Supabase auth setup migration.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap: Record<UserRole, string> = {
      STUDENT: '/student',
      RECRUITER: '/recruiter',
      ADMIN: '/admin',
    };
    return <Navigate to={redirectMap[role]} replace />;
  }

  return <>{children}</>;
}
