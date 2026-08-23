import { useEffect, useState } from 'react';
import { FileText, MapPin, DollarSign, Clock, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentApplications } from '../../services/api';
import { Application } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge, { applicationStatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';

const statusSteps = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'HIRED'] as const;

function StatusTimeline({ status }: { status: string }) {
  const rejected = status === 'REJECTED';
  const currentIdx = statusSteps.indexOf(status as any);

  return (
    <div className="flex items-center gap-1 mt-3">
      {statusSteps.map((step, idx) => {
        const active = !rejected && idx <= currentIdx;
        const current = !rejected && idx === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`h-1.5 rounded-full transition-all ${
              rejected ? 'bg-red-200' :
              active ? 'bg-blue-500' : 'bg-gray-200'
            } ${idx === 0 || idx === statusSteps.length - 1 ? 'w-6' : 'w-10'}`} />
            {current && (
              <span className="text-[10px] font-medium text-blue-600 whitespace-nowrap">{step}</span>
            )}
          </div>
        );
      })}
      {rejected && <span className="text-[10px] font-medium text-red-600 whitespace-nowrap">REJECTED</span>}
    </div>
  );
}

export default function StudentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!user) return;
    getStudentApplications(user.id).then(({ data }) => {
      setApplications((data ?? []) as Application[]);
    }).finally(() => setLoading(false));
  }, [user]);

  const statusOptions = ['ALL', 'APPLIED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} total applications</p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}{s !== 'ALL' && counts[s] ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No applications"
            description={filter === 'ALL' ? "You haven't applied to any jobs yet." : `No applications with status "${filter}".`}
            icon={<FileText className="w-8 h-8" />}
            action={
              filter === 'ALL' ? (
                <Link to="/student/jobs" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Browse Jobs →
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4">
            {filtered.map(app => {
              const job = (app as any).jobs;
              const company = job?.recruiter_profiles?.company_name;
              return (
                <Card key={app.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900">{job?.title ?? 'Position'}</h3>
                        <Badge variant={applicationStatusBadge(app.status)}>{app.status}</Badge>
                      </div>
                      {company && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                          <Building2 className="w-3.5 h-3.5" />
                          {company}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{job.location}
                          </span>
                        )}
                        {job?.salary_package && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />{job.salary_package}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Applied {new Date(app.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <StatusTimeline status={app.status} />
                    </div>
                  </div>
                  {app.cover_letter && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 font-medium mb-1">Your Cover Letter</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{app.cover_letter}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
