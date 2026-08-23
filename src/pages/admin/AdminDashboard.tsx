import { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, Building2, TrendingUp, Activity } from 'lucide-react';
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
          <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide overview and analytics.</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.users.count ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="blue"
            trend={`${roleCounts['STUDENT'] ?? 0} students · ${roleCounts['RECRUITER'] ?? 0} recruiters`}
          />
          <StatCard
            title="Job Postings"
            value={stats?.jobs.count ?? 0}
            icon={<Briefcase className="w-5 h-5" />}
            color="emerald"
            trend={`${jobStatusCounts['OPEN'] ?? 0} open`}
          />
          <StatCard
            title="Applications"
            value={stats?.applications.count ?? 0}
            icon={<FileText className="w-5 h-5" />}
            color="amber"
            trend={`${appStatusCounts['HIRED'] ?? 0} hired`}
          />
          <StatCard
            title="Institutions"
            value={stats?.institutions.count ?? 0}
            icon={<Building2 className="w-5 h-5" />}
            color="rose"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* User breakdown */}
          <Card>
            <CardHeader title="User Breakdown" subtitle="By role" />
            <div className="space-y-3">
              {[
                { label: 'Students', key: 'STUDENT', color: 'bg-blue-500', total: stats?.users.count ?? 1 },
                { label: 'Recruiters', key: 'RECRUITER', color: 'bg-emerald-500', total: stats?.users.count ?? 1 },
                { label: 'Admins', key: 'ADMIN', color: 'bg-amber-500', total: stats?.users.count ?? 1 },
              ].map(item => {
                const count = roleCounts[item.key] ?? 0;
                const pct = Math.round((count / (stats?.users.count || 1)) * 100);
                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="text-gray-900 font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

          {/* Application pipeline */}
          <Card>
            <CardHeader title="Application Pipeline" subtitle="All applications by status" />
            <div className="space-y-2">
              {[
                { status: 'APPLIED', color: 'bg-sky-500' },
                { status: 'REVIEWED', color: 'bg-amber-500' },
                { status: 'SHORTLISTED', color: 'bg-blue-500' },
                { status: 'REJECTED', color: 'bg-red-500' },
                { status: 'HIRED', color: 'bg-emerald-500' },
              ].map(item => {
                const count = appStatusCounts[item.status] ?? 0;
                const total = stats?.applications.count || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{item.status}</span>
                      <span className="text-gray-900 font-semibold">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

          {/* Jobs status */}
          <Card>
            <CardHeader title="Jobs Overview" subtitle="By status" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Open', value: jobStatusCounts['OPEN'] ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Closed', value: jobStatusCounts['CLOSED'] ?? 0, color: 'text-gray-600', bg: 'bg-gray-50' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Placement rate */}
          <Card>
            <CardHeader title="Placement Rate" subtitle="Students hired vs total applications" />
            <div className="flex items-center justify-center py-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${Math.round(((appStatusCounts['HIRED'] ?? 0) / (stats?.applications.count || 1)) * 100)}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(((appStatusCounts['HIRED'] ?? 0) / (stats?.applications.count || 1)) * 100)}%
                  </span>
                  <span className="text-xs text-gray-500">Hired</span>
                </div>
              </div>
              <div className="ml-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <span className="text-gray-600">Hired: {appStatusCounts['HIRED'] ?? 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full" />
                  <span className="text-gray-600">Other: {(stats?.applications.count ?? 0) - (appStatusCounts['HIRED'] ?? 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
