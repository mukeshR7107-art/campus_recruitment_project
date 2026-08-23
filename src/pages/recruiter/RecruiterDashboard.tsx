import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Plus, ArrowRight, Clock } from 'lucide-react';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {profile?.company_name ? `${profile.company_name} Dashboard` : 'Recruiter Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your job postings and track candidates.</p>
          </div>
          {!profile?.company_name && (
            <Link to="/recruiter/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              Complete Profile <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Jobs" value={jobs.length} icon={<Briefcase className="w-5 h-5" />} color="blue" />
          <StatCard title="Open Positions" value={openJobs} icon={<TrendingUp className="w-5 h-5" />} color="emerald" trend="Currently hiring" />
          <StatCard title="Closed Jobs" value={closedJobs} icon={<Briefcase className="w-5 h-5" />} color="amber" />
          <StatCard title="Total Applicants" value={totalApplicants} icon={<Users className="w-5 h-5" />} color="rose" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Job listings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title="Your Job Postings"
                subtitle={`${jobs.length} total`}
                action={
                  <div className="flex items-center gap-2">
                    <Link to="/recruiter/jobs" className="text-xs text-blue-600 font-medium hover:text-blue-700">
                      Manage all
                    </Link>
                  </div>
                }
              />
              {jobs.length === 0 ? (
                <EmptyState
                  title="No job postings yet"
                  description="Create your first job posting to start receiving applications."
                  action={
                    <Link to="/recruiter/jobs">
                      <Button size="sm" icon={<Plus className="w-4 h-4" />}>Post a Job</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(job.created_at).toLocaleDateString()}
                          {job.location ? ` · ${job.location}` : ''}
                        </p>
                      </div>
                      <Badge variant={job.status === 'OPEN' ? 'success' : 'neutral'}>{job.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Quick Actions" />
              <div className="space-y-2">
                <Link to="/recruiter/jobs" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  Post New Job
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </Link>
                <Link to="/recruiter/applicants" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors">
                  <Users className="w-4 h-4 text-blue-500" />
                  View All Applicants
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </Link>
                <Link to="/recruiter/profile" className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-700 font-medium transition-colors">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  Company Profile
                  <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                </Link>
              </div>
            </Card>

            <Card>
              <CardHeader title="Company Info" />
              {profile ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{profile.company_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Designation</p>
                    <p className="font-medium text-gray-900">{profile.designation || '—'}</p>
                  </div>
                  {profile.company_website && (
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <a href={profile.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate block">
                        {profile.company_website}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  <Link to="/recruiter/profile" className="text-blue-600 hover:underline">Set up your company profile</Link> to get started.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
