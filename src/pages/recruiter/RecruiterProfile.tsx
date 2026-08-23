import { useEffect, useState, FormEvent } from 'react';
import { Building2, User, Globe, Save } from 'lucide-react';
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
      setError('Failed to save profile. Please try again.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
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
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">This information is visible to students when they browse your job postings.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader title="Company Details" subtitle="Basic company information" />
            <div className="space-y-4">
              <Input
                label="Company Name"
                placeholder="Acme Corporation"
                value={profile.company_name ?? ''}
                onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))}
                icon={<Building2 className="w-4 h-4" />}
              />
              <Input
                label="Your Designation / Title"
                placeholder="Senior HR Manager"
                value={profile.designation ?? ''}
                onChange={e => setProfile(p => ({ ...p, designation: e.target.value }))}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Company Website"
                type="url"
                placeholder="https://www.yourcompany.com"
                value={profile.company_website ?? ''}
                onChange={e => setProfile(p => ({ ...p, company_website: e.target.value }))}
                icon={<Globe className="w-4 h-4" />}
              />
            </div>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
              Profile saved successfully!
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
