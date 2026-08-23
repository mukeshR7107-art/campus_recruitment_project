import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Briefcase, FileText, MessageSquare,
  Building2, Users, GraduationCap, LogOut, Menu,
  ChevronRight, Bell, ExternalLink
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
      { label: 'Job Listings', path: '/student/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'My Applications', path: '/student/applications', icon: <FileText className="w-4 h-4" /> },
      { label: 'My Profile', path: '/student/profile', icon: <User className="w-4 h-4" /> },
      { label: 'Feedback', path: '/student/feedback', icon: <MessageSquare className="w-4 h-4" /> },
    ];
  }
  if (role === 'RECRUITER') {
    return [
      { label: 'Dashboard', path: '/recruiter', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Manage Jobs', path: '/recruiter/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Applicants', path: '/recruiter/applicants', icon: <Users className="w-4 h-4" /> },
      { label: 'Company Profile', path: '/recruiter/profile', icon: <Building2 className="w-4 h-4" /> },
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
  STUDENT: 'bg-brand-50 text-brand-700 border border-brand-200',
  RECRUITER: 'bg-sky-50 text-sky-700 border border-sky-200',
  ADMIN: 'bg-amber-50 text-amber-700 border border-amber-200',
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Brand Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">JobBoard</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block"></span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Campus Portal</span>
          </div>
        </Link>
      </div>

      {/* User Card */}
      <div className="px-4 py-3.5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center text-brand-400 text-sm font-bold shrink-0">
            {profile?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{profile?.email}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${roleBadgeColor[role ?? ''] ?? 'bg-slate-700 text-slate-300'}`}>
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Navigation</p>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group
                ${active
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-brand-400 transition-colors'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Quick link to public home */}
      <div className="px-3 py-2">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public Site</span>
        </Link>
      </div>

      {/* Bottom Sign Out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border hover:border-rose-800/50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 shadow-xl z-20">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] shadow-2xl z-10">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 gap-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Campus Placement Portal
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/70 px-3 py-1.5 rounded-lg border border-brand-200/80 transition-colors"
            >
              Browse Jobs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page content scrollable */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
