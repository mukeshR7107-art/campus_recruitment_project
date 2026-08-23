import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Briefcase, FileText, MessageSquare,
  Building2, Users, GraduationCap, LogOut, Menu, X,
  ChevronRight, Bell, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

function getNavItems(role: string | null): NavItem[] {
  if (role === 'STUDENT') {
    return [
      { label: 'Dashboard', path: '/student', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'My Profile', path: '/student/profile', icon: <User className="w-4 h-4" /> },
      { label: 'Job Listings', path: '/student/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'My Applications', path: '/student/applications', icon: <FileText className="w-4 h-4" /> },
      { label: 'Feedback', path: '/student/feedback', icon: <MessageSquare className="w-4 h-4" /> },
    ];
  }
  if (role === 'RECRUITER') {
    return [
      { label: 'Dashboard', path: '/recruiter', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Company Profile', path: '/recruiter/profile', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Manage Jobs', path: '/recruiter/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Applicants', path: '/recruiter/applicants', icon: <Users className="w-4 h-4" /> },
    ];
  }
  if (role === 'ADMIN') {
    return [
      { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
      { label: 'Institutions', path: '/admin/institutions', icon: <GraduationCap className="w-4 h-4" /> },
      { label: 'Departments', path: '/admin/departments', icon: <Building2 className="w-4 h-4" /> },
    ];
  }
  return [];
}

const roleBadgeColor: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  RECRUITER: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-amber-100 text-amber-700',
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItems(role);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 block leading-tight">CampusRecruit</span>
            <span className="text-xs text-gray-500">Platform</span>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{profile?.email}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${roleBadgeColor[role ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <span className={active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}>
                {item.icon}
              </span>
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Bell className="w-4 h-4" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
