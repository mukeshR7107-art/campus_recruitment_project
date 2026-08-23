import { useEffect, useState, FormEvent } from 'react';
import { User, Phone, BookOpen, Star, Link as LinkIcon, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile, upsertStudentProfile, getDepartments } from '../../services/api';
import { StudentProfile, Department } from '../../lib/supabase';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<StudentProfile>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getStudentProfile(user.id),
      getDepartments(),
    ]).then(([p, d]) => {
      if (p.data) setProfile(p.data);
      setDepartments((d.data ?? []) as Department[]);
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSaving(true);

    const { error: err } = await upsertStudentProfile({
      user_id: user.id,
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
      department_id: profile.department_id ?? null,
      skills: profile.skills ?? '',
      cgpa: Number(profile.cgpa ?? 0),
      resume_url: profile.resume_url ?? '',
    });

    setSaving(false);
    if (err) {
      setError('Failed to save profile. Please try again.');
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  const scoreSkills = (skills: string) => {
    const count = skills.split(',').filter(s => s.trim()).length;
    return Math.min(100, count * 8 + 20);
  };

  const estimatedScore = scoreSkills(profile.skills ?? '');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Keep your profile up to date to improve your chances.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader
              title="Personal Information"
              subtitle="Basic details visible to recruiters"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Arjun Mehta"
                value={profile.full_name ?? ''}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 555 000 0000"
                value={profile.phone ?? ''}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                icon={<Phone className="w-4 h-4" />}
              />
              <Select
                label="Department"
                value={profile.department_id ?? ''}
                onChange={e => setProfile(p => ({ ...p, department_id: Number(e.target.value) || null }))}
                options={departments.map(d => ({
                  value: d.id,
                  label: `${d.name}${(d as any).institutions?.name ? ` — ${(d as any).institutions.name}` : ''}`,
                }))}
                placeholder="Select department"
              />
              <Input
                label="CGPA / GPA"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="8.5"
                value={profile.cgpa ?? ''}
                onChange={e => setProfile(p => ({ ...p, cgpa: Number(e.target.value) }))}
                icon={<Star className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader
              title="Skills"
              subtitle="Comma-separated list (e.g., React, Node.js, Python)"
            />
            <Textarea
              placeholder="React, Node.js, Python, SQL, Git, Docker..."
              value={profile.skills ?? ''}
              onChange={e => setProfile(p => ({ ...p, skills: e.target.value }))}
              rows={3}
              hint="Separate skills with commas for best results."
            />

            {/* Live score */}
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Estimated Resume Score</span>
                <span className="text-lg font-bold text-blue-700">{estimatedScore}/100</span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${estimatedScore}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1.5">
                {estimatedScore >= 80 ? 'Excellent! You have a strong skill set.' :
                 estimatedScore >= 60 ? 'Good profile. Add more relevant skills to improve.' :
                 'Add more skills to boost your score and visibility.'}
              </p>
            </div>
          </Card>

          {/* Resume URL */}
          <Card>
            <CardHeader
              title="Resume"
              subtitle="Link to your resume (Google Drive, Dropbox, etc.)"
            />
            <Input
              label="Resume URL"
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={profile.resume_url ?? ''}
              onChange={e => setProfile(p => ({ ...p, resume_url: e.target.value }))}
              icon={<LinkIcon className="w-4 h-4" />}
              hint="Make sure the link is publicly accessible."
            />
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
