import { useEffect, useState, FormEvent } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import { getDepartments, createDepartment, getInstitutions } from '../../services/api';
import { Department, Institution } from '../../lib/supabase';
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
    const q = search.toLowerCase();
    setFiltered(departments.filter(d =>
      d.name.toLowerCase().includes(q) ||
      ((d as any).institutions?.name ?? '').toLowerCase().includes(q)
    ));
  }, [search, departments]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.institution_id) {
      setError('Department name and institution are required.');
      return;
    }
    setError('');
    setSaving(true);
    const { error: err } = await createDepartment({
      name: form.name,
      institution_id: Number(form.institution_id),
    });
    setSaving(false);
    if (err) { setError('Failed to create department.'); return; }
    setModalOpen(false);
    setForm({ name: '', institution_id: '' });
    loadData();
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Departments</h1>
            <p className="text-sm text-gray-500 mt-0.5">{departments.length} departments across {institutions.length} institutions</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setModalOpen(true); setError(''); }}>
            Add Department
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments or institutions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Group by institution */}
        {institutions.map(inst => {
          const depts = filtered.filter(d => d.institution_id === inst.id);
          if (depts.length === 0) return null;
          return (
            <div key={inst.id}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                {inst.name}
                <span className="text-xs font-normal text-gray-400">({depts.length})</span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {depts.map(dept => (
                  <div key={dept.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{dept.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Added {new Date(dept.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            title="No departments found"
            icon={<Building2 className="w-8 h-8" />}
            action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Department</Button>}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Department"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Department Name *"
            placeholder="Computer Science"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Institution *"
            value={form.institution_id}
            onChange={e => setForm(f => ({ ...f, institution_id: e.target.value }))}
            options={institutions.map(i => ({ value: i.id, label: i.name }))}
            placeholder="Select institution"
          />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Department</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
