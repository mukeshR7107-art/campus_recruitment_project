import { useEffect, useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, MapPin, DollarSign, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getJobsByRecruiter, createJob, updateJob, deleteJob } from '../../services/api';
import { Job } from '../../lib/supabase';
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
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user || !form.title.trim()) {
      setError('Job title is required.');
      return;
    }
    setError('');
    setSaving(true);

    if (editingJob) {
      const { error: err } = await updateJob(editingJob.id, form);
      if (err) setError('Failed to update job.');
      else { setModalOpen(false); loadJobs(); }
    } else {
      const { error: err } = await createJob({ ...form, recruiter_id: user.id });
      if (err) setError('Failed to create job.');
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
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Jobs</h1>
            <p className="text-sm text-gray-500 mt-0.5">{jobs.length} postings</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Post Job</Button>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No job postings yet"
            description="Create your first job posting to start receiving applications from students."
            action={<Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>Post a Job</Button>}
          />
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <Badge variant={job.status === 'OPEN' ? 'success' : 'neutral'}>{job.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                      {job.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      )}
                      {job.salary_package && (
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salary_package}</span>
                      )}
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleStatus(job)}
                      className={`p-1.5 rounded-lg transition-colors ${job.status === 'OPEN' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={job.status === 'OPEN' ? 'Close job' : 'Open job'}
                    >
                      {job.status === 'OPEN' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
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
        title={editingJob ? 'Edit Job Posting' : 'Post New Job'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Job Title *"
            placeholder="Software Engineer Intern"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="San Francisco, CA / Remote"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              icon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Salary / Package"
              placeholder="$80,000 / year"
              value={form.salary_package}
              onChange={e => setForm(f => ({ ...f, salary_package: e.target.value }))}
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>
          <Textarea
            label="Job Description"
            placeholder="Describe the role, responsibilities, and what the candidate will work on..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
          />
          <Textarea
            label="Requirements"
            placeholder="List skills, qualifications, and experience required..."
            value={form.requirements}
            onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
            rows={3}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as 'OPEN' | 'CLOSED' }))}
            options={[
              { value: 'OPEN', label: 'Open — Accepting Applications' },
              { value: 'CLOSED', label: 'Closed — Not Accepting Applications' },
            ]}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {editingJob ? 'Update Job' : 'Post Job'}
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
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>"{deleteConfirm?.title}"</strong>? This will also remove all associated applications. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
