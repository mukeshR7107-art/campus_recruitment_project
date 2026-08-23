import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Plus, ArrowRight, Clock, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsByRecruiter, getJobApplications, getRecruiterProfile } from '../../services/api';
import { Job, RecruiterProfile } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getJobsByRecruiter(user.id),
      getRecruiterProfile(user.id),
    ]).then(async ([j, p]) => {
      const jobList = (j.data ?? []) as Job[];
      setJobs(jobList);
      setProfile(p.data ?? null);

      const counts = await Promise.all(
        jobList.map(job => getJobApplications(job.id))
      );
      setTotalApplicants(counts.reduce((sum, c) => sum + (c.data?.length ?? 0), 0));
    }).finally(() => setLoading(false));
  }, [user]);

  const openJobs = jobs.filter(j => j.status === 'OPEN').length;
  const closedJobs = jobs.filter(j => j.status === 'CLOSED').length;

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
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Building2 className="w-3.5 h-3.5" /> Recruiter Management Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {profile?.company_name ? `${profile.company_name} Workspace` : 'Recruiter Dashboard'}
            </h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Manage your campus vacancies, review incoming applicant credentials, and evaluate students.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <Link
              to="/recruiter/jobs"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-brand-500/25"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Total Jobs Posted" value={jobs.length} icon={<Briefcase className="w-5 h-5" />} color="brand" />
          <StatCard title="Active Openings" value={openJobs} icon={<TrendingUp className="w-5 h-5" />} color="emerald" trend="Accepting applications" />
          <StatCard title="Closed Archives" value={closedJobs} icon={<Briefcase className="w-5 h-5" />} color="amber" />
          <StatCard title="Total Applicants" value={totalApplicants} icon={<Users className="w-5 h-5" />} color="blue" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Job Listings Column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Active Campus Postings"
                subtitle={`${jobs.length} total vacancies`}
                action={
                  <Link to="/recruiter/jobs" className="text-xs text-brand-600 font-bold hover:text-brand-700 inline-flex items-center gap-1">
                    Manage all <ArrowRight className="w-3 h-3" />
                  </Link>
                }
              />
              {jobs.length === 0 ? (
                <EmptyState
                  title="No job postings yet"
                  description="Publish your first campus placement vacancy to start receiving verified student applications."
                  action={
                    <Link to="/recruiter/jobs">
                      <Button size="sm" icon={<Plus className="w-4 h-4" />}>Post a Job</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{job.title}</p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Posted on {new Date(job.created_at).toLocaleDateString()}
                          {job.location ? ` · ${job.location}` : ''}
                        </p>
                      </div>
                      <Badge variant={job.status === 'OPEN' ? 'brand' : 'neutral'}>{job.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Shortcuts & Company Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader title="Recruiter Actions" />
              <div className="space-y-2">
                <Link to="/recruiter/jobs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <Plus className="w-4 h-4 text-brand-600" />
                  <span>Create New Job Post</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </Link>
                <Link to="/recruiter/applicants" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Review Applicant Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </Link>
                <Link to="/recruiter/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Update Company Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </Link>
              </div>
            </Card>

            <Card>
              <CardHeader title="Company Details" />
              {profile ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization</p>
                    <p className="font-bold text-slate-900 mt-0.5 text-sm">{profile.company_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{profile.designation || '—'}</p>
                  </div>
                  {profile.company_website && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Website</p>
                      <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-semibold hover:underline truncate block mt-0.5">
                        {profile.company_website}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  <Link to="/recruiter/profile" className="text-brand-600 font-bold hover:underline">Set up your company profile</Link> to boost trust.
                </p>
              )}
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
