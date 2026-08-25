import { useEffect, useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, MapPin, DollarSign, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsByRecruiter, createJob, updateJob, deleteJob } from '../../services/api';
import { Job } from '../../lib/supabase';
import { validateJobInput } from '../../lib/security/validation';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input, { Textarea, Select } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = {
  title: '',
  description: '',
  requirements: '',
  salary_package: '',
  location: '',
  status: 'OPEN' as 'OPEN' | 'CLOSED',
};

export default function ManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function loadJobs() {
    if (!user) return;
    getJobsByRecruiter(user.id).then(({ data }) => {
      setJobs((data ?? []) as Job[]);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadJobs(); }, [user]);

  function openCreate() {
    setEditingJob(null);
    setForm(emptyForm);
    setError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(job: Job) {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary_package: job.salary_package,
      location: job.location,
      status: job.status,
    });
    setError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setFieldErrors({});

    // Client-side schema validation
    const validation = validateJobInput(form);
    if (!validation.isValid) {
      setError(validation.error ?? 'Please check the highlighted fields.');
      setFieldErrors(validation.fieldErrors ?? {});
      return;
    }

    setSaving(true);

    if (editingJob) {
      const { error: err } = await updateJob(editingJob.id, form);
      if (err) setError(err.message ?? 'Failed to update job posting.');
      else { setModalOpen(false); loadJobs(); }
    } else {
      const { error: err } = await createJob({ ...form, recruiter_id: user.id });
      if (err) setError(err.message ?? 'Failed to create job posting.');
      else { setModalOpen(false); loadJobs(); }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    await deleteJob(deleteConfirm.id);
    setDeleting(false);
    setDeleteConfirm(null);
    loadJobs();
  }

  async function toggleStatus(job: Job) {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    await updateJob(job.id, { status: newStatus });
    loadJobs();
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
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Job Vacancies</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">{jobs.length} campus postings active in your account.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate} className="px-5 py-2.5 font-bold uppercase tracking-wider text-xs">
            Post New Vacancy
          </Button>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No job postings yet"
            description="Create your first job posting to start receiving applications from qualified campus students."
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Post a Job</Button>}
          />
        ) : (
          <div className="grid gap-5">
            {jobs.map(job => (
              <Card key={job.id} hoverEffect>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                      <Badge variant={job.status === 'OPEN' ? 'brand' : 'neutral'}>{job.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium mb-3">
                      {job.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}</span>
                      )}
                      {job.salary_package && (
                        <span className="flex items-center gap-1 font-bold text-brand-700"><DollarSign className="w-3.5 h-3.5 text-brand-600" />{job.salary_package}</span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{job.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 font-medium">
                      Published on {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleStatus(job)}
                      className={`p-2 rounded-xl transition-colors cursor-pointer ${job.status === 'OPEN' ? 'text-brand-600 hover:bg-brand-50' : 'text-slate-400 hover:bg-slate-100'}`}
                      title={job.status === 'OPEN' ? 'Close job' : 'Open job'}
                    >
                      {job.status === 'OPEN' ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => openEdit(job)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeleteConfirm(job)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingJob ? 'Edit Campus Job' : 'Post New Campus Job'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Input
              label="Job Title *"
              placeholder="e.g. Graduate Software Engineer"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.title}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Location"
                placeholder="e.g. Bangalore / Hybrid / Remote"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                icon={<MapPin className="w-4 h-4" />}
              />
              {fieldErrors.location && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.location}</p>
              )}
            </div>

            <div>
              <Input
                label="Salary / Package"
                placeholder="e.g. $85,000 / yr or ₹12 LPA"
                value={form.salary_package}
                onChange={e => setForm(f => ({ ...f, salary_package: e.target.value }))}
                icon={<DollarSign className="w-4 h-4" />}
              />
              {fieldErrors.salary_package && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.salary_package}</p>
              )}
            </div>
          </div>

          <div>
            <Textarea
              label="Job Description"
              placeholder="Outline the role expectations, day-to-day responsibilities, and team culture..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
            />
            {fieldErrors.description && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          <div>
            <Textarea
              label="Candidate Requirements & Tech Stack"
              placeholder="List required skills, minimum CGPA, eligible departments..."
              value={form.requirements}
              onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
              rows={3}
            />
            {fieldErrors.requirements && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{fieldErrors.requirements}</p>
            )}
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as 'OPEN' | 'CLOSED' }))}
            options={[
              { value: 'OPEN', label: 'Open — Accepting Student Applications' },
              { value: 'CLOSED', label: 'Closed — Archived / Hiring Completed' },
            ]}
          />

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {editingJob ? 'Update Posting' : 'Publish Job'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Job Posting"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to permanently delete <strong>"{deleteConfirm?.title}"</strong>? This will remove all associated applications.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Confirm Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
