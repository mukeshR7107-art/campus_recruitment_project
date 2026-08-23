import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfile';
import JobListings from './pages/student/JobListings';
import StudentApplications from './pages/student/StudentApplications';
import StudentFeedback from './pages/student/StudentFeedback';

// Recruiter
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfile';
import ManageJobs from './pages/recruiter/ManageJobs';
import ApplicantsList from './pages/recruiter/ApplicantsList';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import InstitutionManagement from './pages/admin/InstitutionManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';

import { Loader2 } from 'lucide-react';

function RootRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return <LandingPage />;

  const roleMap: Record<string, string> = {
    STUDENT: '/student',
    RECRUITER: '/recruiter',
    ADMIN: '/admin',
  };
  return <Navigate to={roleMap[role ?? ''] ?? '/student'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Student */}
      <Route
        path="/student"
        element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>}
      />
      <Route
        path="/student/profile"
        element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfilePage /></ProtectedRoute>}
      />
      <Route
        path="/student/jobs"
        element={<ProtectedRoute allowedRoles={['STUDENT']}><JobListings /></ProtectedRoute>}
      />
      <Route
        path="/student/applications"
        element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentApplications /></ProtectedRoute>}
      />
      <Route
        path="/student/feedback"
        element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentFeedback /></ProtectedRoute>}
      />

      {/* Recruiter */}
      <Route
        path="/recruiter"
        element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>}
      />
      <Route
        path="/recruiter/profile"
        element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterProfilePage /></ProtectedRoute>}
      />
      <Route
        path="/recruiter/jobs"
        element={<ProtectedRoute allowedRoles={['RECRUITER']}><ManageJobs /></ProtectedRoute>}
      />
      <Route
        path="/recruiter/applicants"
        element={<ProtectedRoute allowedRoles={['RECRUITER']}><ApplicantsList /></ProtectedRoute>}
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/users"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/institutions"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><InstitutionManagement /></ProtectedRoute>}
      />
      <Route
        path="/admin/departments"
        element={<ProtectedRoute allowedRoles={['ADMIN']}><DepartmentManagement /></ProtectedRoute>}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
