import { useEffect, useState, FormEvent } from 'react';
import { Users, ChevronDown, ChevronRight, ExternalLink, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsByRecruiter, getJobApplications, updateApplicationStatus, createFeedback } from '../../services/api';
import { Job, Application, ApplicationStatus } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge, { applicationStatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';

export default function ApplicantsList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);

  // Feedback modal
  const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    if (!user) return;
    getJobsByRecruiter(user.id).then(({ data }) => {
      setJobs((data ?? []) as Job[]);
    }).finally(() => setLoadingJobs(false));
  }, [user]);

  function selectJob(job: Job) {
    if (selectedJob?.id === job.id) {
      setSelectedJob(null);
      setApplications([]);
      return;
    }
    setSelectedJob(job);
    setLoadingApps(true);
    getJobApplications(job.id).then(({ data }) => {
      setApplications((data ?? []) as Application[]);
    }).finally(() => setLoadingApps(false));
  }

  async function handleStatusChange(app: Application, status: ApplicationStatus) {
    await updateApplicationStatus(app.id, status);
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a));
  }

  async function handleFeedbackSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !feedbackApp) return;
    setFeedbackError('');
    setSavingFeedback(true);

    const { error } = await createFeedback({
      from_user_id: user.id,
      to_entity_id: feedbackApp.id,
      type: 'APPLICATION',
      content: feedbackContent,
      comments: feedbackComments,
    });

    setSavingFeedback(false);
    if (error) {
      setFeedbackError('Failed to save feedback.');
    } else {
      setFeedbackApp(null);
      setFeedbackContent('');
      setFeedbackComments('');
    }
  }

  const statusOptions: ApplicationStatus[] = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED'];

  if (loadingJobs) {
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
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Pipeline & Candidate Review</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Select a campus posting below to evaluate applicant profiles and manage hiring stages.</p>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No job postings yet"
            description="Create and publish a campus job first to start receiving applications."
            icon={<Users className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id}>
                <Card className="cursor-pointer hover:border-brand-400 transition-all shadow-card" padding={false}>
                  <div
                    className="flex items-center justify-between p-5"
                    onClick={() => selectJob(job)}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-brand-50 border border-brand-200/80 rounded-xl flex items-center justify-center text-brand-700 shadow-xs">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-snug">{job.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{job.location || 'Location not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.status === 'OPEN' ? 'brand' : 'neutral'}>{job.status}</Badge>
                      {selectedJob?.id === job.id
                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                        : <ChevronRight className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded Applicants List */}
                  {selectedJob?.id === job.id && (
                    <div className="border-t border-slate-100 p-6 bg-slate-50/50">
                      {loadingApps ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full" />
                        </div>
                      ) : applications.length === 0 ? (
                        <EmptyState
                          title="No applications for this posting"
                          description="Students have not applied to this specific job listing yet."
                          icon={<Users className="w-7 h-7 text-slate-400" />}
                        />
                      ) : (
                        <div className="space-y-4">
                          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{applications.length} Student Applicant{applications.length !== 1 ? 's' : ''}</p>
                          {applications.map(app => {
                            const sp = (app as any).student_profiles;
                            const email = (app as any).profiles?.email;
                            return (
                              <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center text-brand-700 text-xs font-extrabold shrink-0">
                                    {(sp?.full_name || email || 'S')[0].toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <p className="text-sm font-bold text-slate-900">{sp?.full_name || email || 'Student'}</p>
                                      {sp?.cgpa > 0 && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                          {sp.cgpa} CGPA
                                        </span>
                                      )}
                                    </div>
                                    {sp?.skills && (
                                      <p className="text-xs text-slate-500 mb-2 truncate font-medium">{sp.skills}</p>
                                    )}
                                    {sp?.resume_url && (
                                      <a
                                        href={sp.resume_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-brand-600 font-bold hover:underline mb-2"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Open Resume Link
                                      </a>
                                    )}
                                    {app.cover_letter && (
                                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                                        "{app.cover_letter}"
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 md:pt-0 border-t md:border-none border-slate-100">
                                  <Badge variant={applicationStatusBadge(app.status)}>{app.status}</Badge>
                                  <select
                                    value={app.status}
                                    onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                                    className="text-xs font-bold text-slate-700 border border-slate-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-xs"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {statusOptions.map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    icon={<MessageSquare className="w-3.5 h-3.5" />}
                                    onClick={e => { e.stopPropagation(); setFeedbackApp(app); setFeedbackError(''); }}
                                    className="text-xs font-bold"
                                  >
                                    Feedback
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <Modal
        open={!!feedbackApp}
        onClose={() => { setFeedbackApp(null); setFeedbackError(''); }}
        title="Candidate Evaluation & Feedback"
        maxWidth="md"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <Textarea
            label="Candidate Performance & Review"
            placeholder="Share feedback on technical skills, interview performance, and suitability for the role..."
            value={feedbackContent}
            onChange={e => setFeedbackContent(e.target.value)}
            rows={4}
          />
          <Textarea
            label="Additional Notes / Next Steps"
            placeholder="Recommended preparation, next rounds, or general advice..."
            value={feedbackComments}
            onChange={e => setFeedbackComments(e.target.value)}
            rows={3}
          />
          {feedbackError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">
              {feedbackError}
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setFeedbackApp(null)}>Cancel</Button>
            <Button type="submit" loading={savingFeedback} icon={<MessageSquare className="w-4 h-4" />}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
