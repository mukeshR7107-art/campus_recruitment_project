import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, MessageSquare, User, ArrowRight, TrendingUp, Clock } from 'lucide-react';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's your placement activity overview.</p>
          </div>
          {!profile?.full_name && (
            <Link
              to="/student/profile"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Complete Profile
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Open Jobs"
            value={jobs.length}
            icon={<Briefcase className="w-5 h-5" />}
            color="blue"
            trend="Available now"
          />
          <StatCard
            title="Applications"
            value={applications.length}
            icon={<FileText className="w-5 h-5" />}
            color="emerald"
            trend={`${statusCounts['SHORTLISTED'] ?? 0} shortlisted`}
          />
          <StatCard
            title="Shortlisted"
            value={statusCounts['SHORTLISTED'] ?? 0}
            icon={<TrendingUp className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Resume Score"
            value={`${resumeScore}/100`}
            icon={<MessageSquare className="w-5 h-5" />}
            color="rose"
            trend={resumeScore >= 70 ? 'Strong profile' : 'Needs improvement'}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Recent Applications"
                subtitle={`${applications.length} total`}
                action={
                  <Link to="/student/applications" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    View all
                  </Link>
                }
              />
              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Browse job listings and apply to positions that match your skills."
                  action={
                    <Link to="/student/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Browse Jobs →
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {(app.jobs as any)?.title ?? 'Job'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(app.submitted_at).toLocaleDateString()}
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

          {/* Profile Completeness */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Profile Completion" />
              <div className="space-y-3">
                {[
                  { label: 'Full Name', done: !!profile?.full_name },
                  { label: 'Phone', done: !!profile?.phone },
                  { label: 'Department', done: !!profile?.department_id },
                  { label: 'Skills', done: !!profile?.skills },
                  { label: 'Resume Uploaded', done: !!profile?.resume_url },
                  { label: 'CGPA', done: !!profile?.cgpa },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold ${item.done ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                      {item.done ? '✓' : ''}
                    </span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${([!!profile?.full_name, !!profile?.phone, !!profile?.department_id, !!profile?.skills, !!profile?.resume_url, !!profile?.cgpa].filter(Boolean).length / 6) * 100}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {[!!profile?.full_name, !!profile?.phone, !!profile?.department_id, !!profile?.skills, !!profile?.resume_url, !!profile?.cgpa].filter(Boolean).length}/6 complete
                  </p>
                </div>
              </div>
              <Link
                to="/student/profile"
                className="mt-3 block text-center text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-xl py-2 transition-colors"
              >
                Edit Profile
              </Link>
            </Card>

            <Card>
              <CardHeader title="Quick Actions" />
              <div className="space-y-2">
                <Link to="/student/jobs" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Browse Jobs
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </Link>
                <Link to="/student/profile" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors">
                  <User className="w-4 h-4 text-emerald-500" />
                  Update Resume
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </Link>
                <Link to="/student/feedback" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  View Feedback
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
