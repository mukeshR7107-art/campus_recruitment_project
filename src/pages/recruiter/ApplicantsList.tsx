import { useEffect, useState, FormEvent } from 'react';
import { Users, ChevronDown, ChevronRight, ExternalLink, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsByRecruiter, getJobApplications, updateApplicationStatus, createFeedback } from '../../services/api';
import { Job, Application, ApplicationStatus } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader } from '../../components/ui/Card';
import Badge, { applicationStatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Select, Textarea } from '../../components/ui/Input';
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

  const statusOptions: ApplicationStatus[] = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];

  if (loadingJobs) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Applicants</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select a job to view and manage applicants.</p>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs posted yet"
            description="Post a job first to start receiving applications."
            icon={<Users className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id}>
                <Card className="cursor-pointer hover:border-emerald-300 transition-colors" padding={false}>
                  <div
                    className="flex items-center justify-between p-5"
                    onClick={() => selectJob(job)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                        <p className="text-xs text-gray-500">{job.location || 'Location not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.status === 'OPEN' ? 'success' : 'neutral'}>{job.status}</Badge>
                      {selectedJob?.id === job.id
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded applicants */}
                  {selectedJob?.id === job.id && (
                    <div className="border-t border-gray-100 p-5">
                      {loadingApps ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
                        </div>
                      ) : applications.length === 0 ? (
                        <EmptyState
                          title="No applications yet"
                          description="Students haven't applied to this position yet."
                          icon={<Users className="w-6 h-6" />}
                        />
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{applications.length} applicant{applications.length !== 1 ? 's' : ''}</p>
                          {applications.map(app => {
                            const sp = (app as any).student_profiles;
                            const email = (app as any).profiles?.email;
                            return (
                              <div key={app.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                                  {(sp?.full_name || email || 'S')[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="text-sm font-semibold text-gray-900">{sp?.full_name || email || 'Student'}</p>
                                    {sp?.cgpa > 0 && (
                                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        {sp.cgpa} CGPA
                                      </span>
                                    )}
                                  </div>
                                  {sp?.skills && (
                                    <p className="text-xs text-gray-500 mb-2 truncate">{sp.skills}</p>
                                  )}
                                  {sp?.resume_url && (
                                    <a href={sp.resume_url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                                      <ExternalLink className="w-3 h-3" />
                                      View Resume
                                    </a>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap mt-2">
                                    <Badge variant={applicationStatusBadge(app.status)}>{app.status}</Badge>
                                    <select
                                      value={app.status}
                                      onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {statusOptions.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      icon={<MessageSquare className="w-3.5 h-3.5" />}
                                      onClick={e => { e.stopPropagation(); setFeedbackApp(app); setFeedbackError(''); }}
                                    >
                                      Feedback
                                    </Button>
                                  </div>
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
        title="Provide Feedback"
        maxWidth="md"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <Textarea
            label="Feedback"
            placeholder="Describe the candidate's performance, strengths, and areas for improvement..."
            value={feedbackContent}
            onChange={e => setFeedbackContent(e.target.value)}
            rows={4}
          />
          <Textarea
            label="Additional Comments"
            placeholder="Any other notes or suggestions for the candidate..."
            value={feedbackComments}
            onChange={e => setFeedbackComments(e.target.value)}
            rows={3}
          />
          {feedbackError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {feedbackError}
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setFeedbackApp(null)}>Cancel</Button>
            <Button type="submit" loading={savingFeedback} icon={<MessageSquare className="w-4 h-4" />}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
