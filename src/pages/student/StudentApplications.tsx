import { useEffect, useState } from 'react';
import { FileText, MapPin, DollarSign, Clock, Building2, ChevronRight } from 'lucide-react';
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
    <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
      {statusSteps.map((step, idx) => {
        const active = !rejected && idx <= currentIdx;
        const current = !rejected && idx === currentIdx;
        return (
          <div key={step} className="flex items-center gap-1.5">
            <div className={`h-2 rounded-full transition-all duration-300 ${
              rejected ? 'bg-rose-200' :
              active ? 'bg-brand-500' : 'bg-slate-200'
            } ${idx === 0 || idx === statusSteps.length - 1 ? 'w-8' : 'w-12'}`} />
            {current && (
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider">{step}</span>
            )}
          </div>
        );
      })}
      {rejected && <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">REJECTED</span>}
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

  const statusOptions = ['ALL', 'APPLIED', 'REVIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED'];
  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter);

  const counts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

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
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Applications</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Track real-time candidate progression and recruiter reviews.</p>
          </div>
          <Link
            to="/student/jobs"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Explore More Jobs <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                filter === s
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s}{s !== 'ALL' && counts[s] ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No applications in this view"
            description={filter === 'ALL' ? "You haven't submitted any job applications yet." : `No applications found with status "${filter}".`}
            icon={<FileText className="w-8 h-8 text-slate-400" />}
            action={
              filter === 'ALL' ? (
                <Link to="/student/jobs" className="text-xs font-bold text-brand-600 hover:underline">
                  Browse Campus Jobs →
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
                <Card key={app.id} hoverEffect>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <h3 className="font-bold text-slate-900 text-base">{job?.title ?? 'Position'}</h3>
                        <Badge variant={applicationStatusBadge(app.status)}>{app.status}</Badge>
                      </div>
                      {company && (
                        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-2.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {company}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                        {job?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}
                          </span>
                        )}
                        {job?.salary_package && (
                          <span className="flex items-center gap-1 font-bold text-brand-700">
                            <DollarSign className="w-3.5 h-3.5 text-brand-600" />{job.salary_package}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          Submitted on {new Date(app.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <StatusTimeline status={app.status} />
                    </div>
                  </div>
                  {app.cover_letter && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your Attached Cover Note</p>
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{app.cover_letter}"
                      </p>
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
