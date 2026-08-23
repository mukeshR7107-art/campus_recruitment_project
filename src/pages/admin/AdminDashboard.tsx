import { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, Building2, Sparkles } from 'lucide-react';
import { getAdminStats } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import Card, { CardHeader } from '../../components/ui/Card';

interface Stats {
  users: { data: any[] | null; count: number | null };
  jobs: { data: any[] | null; count: number | null };
  applications: { data: any[] | null; count: number | null };
  institutions: { data: any[] | null; count: number | null };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(s => setStats(s as any)).finally(() => setLoading(false));
  }, []);

  const roleCounts = stats?.users?.data?.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const appStatusCounts = stats?.applications?.data?.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const jobStatusCounts = stats?.jobs?.data?.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const hiredCount = (appStatusCounts['HIRED'] ?? 0) + (appStatusCounts['OFFERED'] ?? 0);
  const placementPercentage = Math.round((hiredCount / (stats?.applications.count || 1)) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/60">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Platform Governance & Analytics
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">System Admin Console</h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Real-time monitoring across user roles, institution registries, campus vacancies, and placement metrics.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Registered Users"
            value={stats?.users.count ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="brand"
            trend={`${roleCounts['STUDENT'] ?? 0} students · ${roleCounts['RECRUITER'] ?? 0} recruiters`}
          />
          <StatCard
            title="Total Job Postings"
            value={stats?.jobs.count ?? 0}
            icon={<Briefcase className="w-5 h-5" />}
            color="blue"
            trend={`${jobStatusCounts['OPEN'] ?? 0} open positions`}
          />
          <StatCard
            title="Total Applications"
            value={stats?.applications.count ?? 0}
            icon={<FileText className="w-5 h-5" />}
            color="emerald"
            trend={`${hiredCount} offers/hires recorded`}
          />
          <StatCard
            title="Partner Institutions"
            value={stats?.institutions.count ?? 0}
            icon={<Building2 className="w-5 h-5" />}
            color="purple"
            trend="Active colleges"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* User Breakdown */}
          <Card>
            <CardHeader title="User Role Breakdown" subtitle="Distribution across platform stakeholder tiers" />
            <div className="space-y-4">
              {[
                { label: 'Students / Candidates', key: 'STUDENT', color: 'bg-brand-500', total: stats?.users.count ?? 1 },
                { label: 'Corporate Recruiters', key: 'RECRUITER', color: 'bg-sky-500', total: stats?.users.count ?? 1 },
                { label: 'System Administrators', key: 'ADMIN', color: 'bg-amber-500', total: stats?.users.count ?? 1 },
              ].map(item => {
                const count = roleCounts[item.key] ?? 0;
                const pct = Math.round((count / (stats?.users.count || 1)) * 100);
                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-900">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Application Pipeline */}
          <Card>
            <CardHeader title="Application Status Pipeline" subtitle="Lifecycle status across all job applications" />
            <div className="space-y-3.5">
              {[
                { status: 'SUBMITTED', color: 'bg-sky-500' },
                { status: 'REVIEWED', color: 'bg-amber-500' },
                { status: 'SHORTLISTED', color: 'bg-purple-500' },
                { status: 'INTERVIEWING', color: 'bg-indigo-500' },
                { status: 'OFFERED / HIRED', color: 'bg-brand-500', countVal: hiredCount },
                { status: 'REJECTED', color: 'bg-rose-500' },
              ].map(item => {
                const count = item.countVal ?? (appStatusCounts[item.status] ?? 0);
                const total = stats?.applications.count || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-xs mb-1 font-bold">
                      <span className="text-slate-700">{item.status}</span>
                      <span className="text-slate-900">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Jobs Status */}
          <Card>
            <CardHeader title="Campus Postings Status" subtitle="Active vs archived vacancies" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Open Positions', value: jobStatusCounts['OPEN'] ?? 0, color: 'text-brand-700', bg: 'bg-brand-50 border border-brand-200' },
                { label: 'Closed / Filled', value: jobStatusCounts['CLOSED'] ?? 0, color: 'text-slate-700', bg: 'bg-slate-50 border border-slate-200' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-2xl p-5 text-center`}>
                  <p className={`text-3xl font-extrabold ${item.color}`}>{item.value}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Placement Conversion */}
          <Card>
            <CardHeader title="Placement Conversion" subtitle="Candidates hired vs total applications" />
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#89ba16" strokeWidth="3.5"
                    strokeDasharray={`${placementPercentage}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">
                    {placementPercentage}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placed</span>
                </div>
              </div>
              <div className="ml-6 space-y-2.5 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-500 rounded-full" />
                  <span className="text-slate-700 font-bold">Placed / Offered: {hiredCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 rounded-full" />
                  <span className="text-slate-500">In Pipeline / Other: {(stats?.applications.count ?? 0) - hiredCount}</span>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}
