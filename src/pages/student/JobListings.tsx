import { useEffect, useState } from 'react';
import { Search, MapPin, DollarSign, Building2, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobs, applyForJob, checkExistingApplication, getStudentProfile } from '../../services/api';
import { Job, StudentProfile } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
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
      jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        (j.requirements ?? '').toLowerCase().includes(q)
      )
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
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Job Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} open positions available</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location, or requirements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try adjusting your search query."
            icon={<Search className="w-8 h-8" />}
          />
        ) : (
          <div className="grid gap-4">
            {filtered.map(job => {
              const rp = (job as any).recruiter_profiles;
              const applied = appliedIds.has(job.id);
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-900 text-base">{job.title}</h3>
                        <Badge variant="success">OPEN</Badge>
                        {applied && <Badge variant="info">Applied</Badge>}
                      </div>
                      {rp?.company_name && (
                        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {rp.company_name}
                          {rp.designation ? ` — ${rp.designation}` : ''}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                        )}
                        {job.salary_package && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salary_package}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => { setSelectedJob(job); setCoverLetter(''); setApplyError(''); }}
                      >
                        Details
                      </Button>
                      {!applied && (
                        <Button
                          size="sm"
                          onClick={() => { setSelectedJob(job); setCoverLetter(''); setApplyError(''); }}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal
        open={!!selectedJob}
        onClose={() => { setSelectedJob(null); setApplyError(''); setApplySuccess(''); }}
        title={selectedJob?.title ?? ''}
        maxWidth="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {selectedJob.location && (
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
              )}
              {selectedJob.salary_package && (
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{selectedJob.salary_package}</span>
              )}
            </div>

            {selectedJob.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.requirements && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Requirements</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedJob.requirements}</p>
              </div>
            )}

            {!appliedIds.has(selectedJob.id) && (
              <div>
                <Textarea
                  label="Cover Letter (optional)"
                  placeholder="Tell the recruiter why you're a great fit..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            {applyError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {applyError}
              </div>
            )}
            {applySuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
                {applySuccess}
              </div>
            )}

            {appliedIds.has(selectedJob.id) ? (
              <Badge variant="info" className="text-sm py-1.5 px-3">You have already applied for this position</Badge>
            ) : (
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>Cancel</Button>
                <Button loading={applying} onClick={handleApply}>Submit Application</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
