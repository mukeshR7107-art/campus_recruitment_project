import { useEffect, useState, FormEvent } from 'react';
import { Building2, User, Globe, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRecruiterProfile, upsertRecruiterProfile } from '../../services/api';
import { RecruiterProfile } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RecruiterProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<RecruiterProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getRecruiterProfile(user.id).then(({ data }) => {
      if (data) setProfile(data);
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);

    const { error: err } = await upsertRecruiterProfile({
      user_id: user.id,
      company_name: profile.company_name ?? '',
      designation: profile.designation ?? '',
      company_website: profile.company_website ?? '',
    });

    setSaving(false);
    if (err) {
      setError('Failed to update company profile. Please try again.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Corporate Employer Profile</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            This branding and organizational information is displayed across all your campus job postings.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader title="Company & Representative Details" subtitle="Official branding details" />
            <div className="space-y-4">
              <Input
                label="Company / Enterprise Name"
                placeholder="e.g. Acme Technologies Inc."
                value={profile.company_name ?? ''}
                onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))}
                icon={<Building2 className="w-4 h-4" />}
                required
              />
              <Input
                label="Your Role / Designation"
                placeholder="e.g. Lead Campus Recruiter, VP of Engineering"
                value={profile.designation ?? ''}
                onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Official Company Website"
                type="url"
                placeholder="https://www.company.com"
                value={profile.company_website ?? ''}
                onChange={e => setProfile(p => ({ ...p, company_website: e.target.value }))}
                icon={<Globe className="w-4 h-4" />}
              />
            </div>
          </Card>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" /> Company profile saved successfully!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />} className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs">
              Save Company Info
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
