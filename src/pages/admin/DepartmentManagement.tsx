import { useEffect, useState, FormEvent } from 'react';
import { Building2, Plus, Search, GraduationCap, AlertTriangle } from 'lucide-react';
import { getDepartments, createDepartment, getInstitutions } from '../../services/api';
import { Department, Institution } from '../../lib/supabase';
import { validateDepartmentInput } from '../../lib/security/validation';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filtered, setFiltered] = useState<Department[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', institution_id: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function loadData() {
    Promise.all([getDepartments(), getInstitutions()]).then(([d, i]) => {
      setDepartments((d.data ?? []) as Department[]);
      setFiltered((d.data ?? []) as Department[]);
      setInstitutions((i.data ?? []) as Institution[]);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    setFiltered(departments.filter(d =>
      d.name.toLowerCase().includes(q) ||
      ((d as any).institutions?.name ?? '').toLowerCase().includes(q)
    ));
  }, [search, departments]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');

    const validation = validateDepartmentInput({
      name: form.name,
      institution_id: form.institution_id,
    });

    if (!validation.isValid) {
      setError(validation.error ?? 'Please provide valid department details.');
      return;
    }

    setSaving(true);
    const { error: err } = await createDepartment({
      name: form.name,
      institution_id: Number(form.institution_id),
    });
    setSaving(false);
    if (err) {
      setError(err.message ?? 'Failed to create department.');
      return;
    }
    setModalOpen(false);
    setForm({ name: '', institution_id: '' });
    loadData();
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Departments</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">{departments.length} departments categorized across {institutions.length} partner institutions.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setModalOpen(true); setError(''); }} className="px-5 py-2.5 font-bold uppercase tracking-wider text-xs">
            Add Department
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search academic departments or institution names..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
          />
        </div>

        {/* Group by institution */}
        {institutions.map(inst => {
          const depts = filtered.filter(d => d.institution_id === inst.id);
          if (depts.length === 0) return null;
          return (
            <div key={inst.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">{inst.name}</h3>
                <span className="text-xs font-semibold text-slate-400">({depts.length} departments)</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {depts.map(dept => (
                  <Card key={dept.id} hoverEffect className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 border border-brand-200/80 rounded-xl flex items-center justify-center shrink-0 text-brand-700">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{dept.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Added {new Date(dept.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            title="No departments found"
            description="Add academic departments to map students and job qualifications."
            icon={<Building2 className="w-8 h-8 text-slate-400" />}
            action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Department</Button>}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Academic Department"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name *"
            placeholder="e.g. Computer Science & Engineering"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="Affiliated Institution *"
            value={form.institution_id}
            onChange={e => setForm(f => ({ ...f, institution_id: e.target.value }))}
            options={institutions.map(i => ({ value: i.id, label: i.name }))}
            placeholder="Select participating institution..."
            required
          />
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Department</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
