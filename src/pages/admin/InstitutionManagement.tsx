import { useEffect, useState, FormEvent } from 'react';
import { GraduationCap, Plus, MapPin, Search } from 'lucide-react';
import { getInstitutions, createInstitution } from '../../services/api';
import { Institution } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
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
    if (err) { setError('Failed to register institution.'); return; }
    setModalOpen(false);
    setForm({ name: '', address: '' });
    loadInstitutions();
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
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">University & College Registry</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">{institutions.length} partner institutions participating in placement drives.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setModalOpen(true); setError(''); }} className="px-5 py-2.5 font-bold uppercase tracking-wider text-xs">
            Add Institution
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search participating universities by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No institutions found"
            description="Register a new academic university or institution to get started."
            icon={<GraduationCap className="w-8 h-8 text-slate-400" />}
            action={<Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>Add Institution</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(inst => (
              <Card key={inst.id} hoverEffect>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 border border-brand-200/80 rounded-2xl flex items-center justify-center shrink-0 text-brand-700">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 text-sm leading-snug">{inst.name}</p>
                    {inst.address && (
                      <p className="text-xs text-slate-500 flex items-start gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                        {inst.address}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      Registered {new Date(inst.created_at).toLocaleDateString()}
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
        title="Register Partner Institution"
        maxWidth="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Institution Name *"
            placeholder="e.g. National Institute of Technology"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Campus Address / Location"
            placeholder="e.g. Cambridge, MA or Bangalore, India"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            icon={<MapPin className="w-4 h-4" />}
          />
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">{error}</div>
          )}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Institution</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
