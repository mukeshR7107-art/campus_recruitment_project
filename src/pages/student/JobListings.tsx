import { useEffect, useState } from 'react';
import { Search, MapPin, DollarSign, Building2, Clock, ExternalLink, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobs, applyForJob, checkExistingApplication, getStudentProfile } from '../../services/api';
import { Job, StudentProfile } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { Textarea } from '../../components/ui/Input';

export default function JobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [coverLetter, setCoverLetter] = useState('');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getJobs('OPEN'),
      getStudentProfile(user.id),
    ]).then(async ([j, p]) => {
      const jobList = (j.data ?? []) as Job[];
      setJobs(jobList);
      setFiltered(jobList);
      setStudentProfile(p.data ?? null);

      // Check which jobs already applied
      const checks = await Promise.all(
        jobList.map(job => checkExistingApplication(user.id, job.id))
      );
      const ids = new Set<number>();
      checks.forEach((c, i) => { if (c.data) ids.add(jobList[i].id); });
      setAppliedIds(ids);
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      jobs.filter(j => {
        const matchesSearch = 
          j.title.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.requirements ?? '').toLowerCase().includes(q);
        
        return matchesSearch;
      })
    );
  }, [search, jobs]);

  async function handleApply() {
    if (!user || !selectedJob) return;
    setApplyError('');
    setApplying(true);

    const { error } = await applyForJob({
      student_id: user.id,
      job_id: selectedJob.id,
      resume_path: studentProfile?.resume_url ?? '',
      cover_letter: coverLetter,
    });

    setApplying(false);
    if (error) {
      setApplyError((error as any).message ?? 'Application failed. You may have already applied.');
    } else {
      setAppliedIds(prev => new Set([...prev, selectedJob.id]));
      setApplySuccess('Application submitted successfully!');
      setTimeout(() => {
        setSelectedJob(null);
        setApplySuccess('');
        setCoverLetter('');
      }, 1500);
    }
  }

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
        
        {/* Header Title Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-slate-700/60">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Campus Opportunities
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Explore Open Campus Roles</h1>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Find positions matching your department and skill sets. Apply with 1-click using your verified student profile.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role, company, skills, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 px-2 shrink-0">
            Showing <span className="text-brand-600 font-extrabold">{filtered.length}</span> Active Jobs
          </div>
        </div>

        {/* Job Cards Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No matching job listings"
            description="Try broadening your search keyword or check back soon."
            icon={<Search className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(job => {
              const rp = (job as any).recruiter_profiles;
              const applied = appliedIds.has(job.id);
              const companyInitial = rp?.company_name?.[0]?.toUpperCase() ?? 'C';

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar + Badges */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center font-extrabold text-brand-700 text-lg shadow-xs">
                          {companyInitial}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-brand-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {rp?.company_name ?? 'Partner Recruiter'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant="brand">OPEN</Badge>
                        {applied && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                            <CheckCircle2 className="w-3 h-3" /> Applied
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata: Location, Salary, Posted Date */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 font-medium my-3">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                      )}
                      {job.salary_package && (
                        <span className="flex items-center gap-1 text-brand-700 font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-brand-600" />
                          {job.salary_package}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => { setSelectedJob(job); setCoverLetter(''); setApplyError(''); }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Details
                    </button>

                    {applied ? (
                      <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200">
                        Already Applied
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => { setSelectedJob(job); setCoverLetter(''); setApplyError(''); }}
                        className="text-xs font-bold"
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal
        open={!!selectedJob}
        onClose={() => { setSelectedJob(null); setApplyError(''); setApplySuccess(''); }}
        title={selectedJob?.title ?? 'Job Details'}
        maxWidth="lg"
      >
        {selectedJob && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              {selectedJob.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-600" />{selectedJob.location}</span>
              )}
              {selectedJob.salary_package && (
                <span className="flex items-center gap-1.5 font-bold text-brand-700"><DollarSign className="w-4 h-4 text-brand-600" />{selectedJob.salary_package}</span>
              )}
            </div>

            {selectedJob.description && (
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Role Description</p>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.requirements && (
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Key Requirements</p>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{selectedJob.requirements}</p>
              </div>
            )}

            {!appliedIds.has(selectedJob.id) && (
              <div>
                <Textarea
                  label="Cover Letter / Note to Recruiter (Optional)"
                  placeholder="Introduce yourself and explain why you're a standout candidate for this role..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {applyError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">
                {applyError}
              </div>
            )}
            {applySuccess && (
              <div className="bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                {applySuccess}
              </div>
            )}

            {appliedIds.has(selectedJob.id) ? (
              <div className="p-3 bg-brand-50 text-brand-800 border border-brand-200 rounded-xl text-center text-xs font-bold">
                You have already submitted an application for this position.
              </div>
            ) : (
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setSelectedJob(null)}>Close</Button>
                <Button loading={applying} onClick={handleApply}>
                  <Send className="w-4 h-4" /> Submit Application
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
