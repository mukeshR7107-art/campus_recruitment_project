import { useEffect, useState, FormEvent } from 'react';
import { GraduationCap, Plus, MapPin, Search } from 'lucide-react';
import { getInstitutions, createInstitution } from '../../services/api';
import { Institution } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

export default function InstitutionManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filtered, setFiltered] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function loadInstitutions() {
    getInstitutions().then(({ data }) => {
      setInstitutions((data ?? []) as Institution[]);
      setFiltered((data ?? []) as Institution[]);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { loadInstitutions(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(institutions.filter(i => i.name.toLowerCase().includes(q) || i.address.toLowerCase().includes(q)));
  }, [search, institutions]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Institution name is required.'); return; }
    setError('');
    setSaving(true);
    const { error: err } = await createInstitution(form);
    setSaving(false);
    if (err) { setError('Failed to create institution.'); return; }
    setModalOpen(false);
    setForm({ name: '', address: '' });
    loadInstitutions();
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
            <h1 className="text-xl font-bold text-gray-900">Institutions</h1>
            <p className="text-sm text-gray-500 mt-0.5">{institutions.length} registered institutions</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setModalOpen(true); setError(''); }}>
            Add Institution
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search institutions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No institutions found"
            icon={<GraduationCap className="w-8 h-8" />}
            action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Institution</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(inst => (
              <Card key={inst.id}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{inst.name}</p>
                    {inst.address && (
                      <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                        {inst.address}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Added {new Date(inst.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Institution"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Institution Name *"
            placeholder="MIT Institute of Technology"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Address"
            placeholder="77 Massachusetts Ave, Cambridge, MA"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            icon={<MapPin className="w-4 h-4" />}
          />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Institution</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
