import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, User, ArrowRight, TrendingUp, Clock, Sparkles, Award, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile, getStudentApplications, getJobs } from '../../services/api';
import { StudentProfile, Application, Job } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge, { applicationStatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getStudentProfile(user.id),
      getStudentApplications(user.id),
      getJobs('OPEN'),
    ]).then(([p, a, j]) => {
      setProfile(p.data ?? null);
      setApplications((a.data ?? []) as Application[]);
      setJobs((j.data ?? []) as Job[]);
    }).finally(() => setLoading(false));
  }, [user]);

  const statusCounts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const resumeScore = profile?.resume_score ?? 0;
  const completedFields = [
    !!profile?.full_name,
    !!profile?.phone,
    !!profile?.department_id,
    !!profile?.skills,
    !!profile?.resume_url,
    !!profile?.cgpa
  ].filter(Boolean).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Student Overview
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Track your campus applications, discover recommended job openings, and review recruiter feedback.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <Link
              to="/student/jobs"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-brand-500/25"
            >
              <Briefcase className="w-4 h-4" /> Browse Openings
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Available Roles"
            value={jobs.length}
            icon={<Briefcase className="w-5 h-5" />}
            color="brand"
            trend="Active campus postings"
          />
          <StatCard
            title="My Applications"
            value={applications.length}
            icon={<FileText className="w-5 h-5" />}
            color="blue"
            trend={`${statusCounts['SHORTLISTED'] ?? 0} shortlisted`}
          />
          <StatCard
            title="Shortlisted"
            value={statusCounts['SHORTLISTED'] ?? 0}
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
            trend="Progressing in hiring"
          />
          <StatCard
            title="Resume Readiness"
            value={`${resumeScore}/100`}
            icon={<Award className="w-5 h-5" />}
            color="purple"
            trend={resumeScore >= 70 ? 'Strong profile' : 'Optimize profile'}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Applications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Recent Applications"
                subtitle={`${applications.length} total applications submitted`}
                action={
                  <Link to="/student/applications" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                }
              />
              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Explore available job listings and apply to roles that align with your skillset."
                  action={
                    <Link to="/student/jobs" className="text-xs font-bold text-brand-600 hover:underline">
                      Browse Jobs →
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {(app.jobs as any)?.title ?? 'Job Title'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Applied on {new Date(app.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={applicationStatusBadge(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Profile Completion & Quick Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Profile Completeness" subtitle="Complete to boost visibility" />
              <div className="space-y-3">
                {[
                  { label: 'Full Name', done: !!profile?.full_name },
                  { label: 'Contact Phone', done: !!profile?.phone },
                  { label: 'Academic Department', done: !!profile?.department_id },
                  { label: 'Skills & Tags', done: !!profile?.skills },
                  { label: 'Resume Uploaded', done: !!profile?.resume_url },
                  { label: 'CGPA Score', done: !!profile?.cgpa },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">{item.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${item.done ? 'bg-brand-500' : 'bg-slate-200'}`}>
                      {item.done ? '✓' : ''}
                    </span>
                  </div>
                ))}
                
                <div className="pt-3">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedFields / 6) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 text-right font-medium">
                    {completedFields} of 6 steps completed
                  </p>
                </div>
              </div>

              <Link
                to="/student/profile"
                className="mt-4 block text-center text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-xl py-2.5 transition-colors"
              >
                Update My Profile
              </Link>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader title="Quick Shortcuts" />
              <div className="space-y-2">
                <Link to="/student/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>Browse Job Listings</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </Link>
                <Link to="/student/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>Update Resume & Bio</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </Link>
                <Link to="/student/feedback" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Read Recruiter Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </Link>
              </div>
            </Card>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
