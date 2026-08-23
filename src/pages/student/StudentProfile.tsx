import { useEffect, useState, FormEvent } from 'react';
import { User, Phone, Star, Link as LinkIcon, Save, Sparkles, CheckCircle2 } from 'lucide-react';
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
      setError('Failed to save profile. Please verify your information and try again.');
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
          <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Candidate Profile</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Keep your profile comprehensive and accurate to maximize your shortlisting chances with corporate recruiters.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Personal Info */}
          <Card>
            <CardHeader
              title="Academic & Personal Information"
              subtitle="Core details displayed on your recruiter application card"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Alex Morgan"
                value={profile.full_name ?? ''}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Contact Phone"
                type="tel"
                placeholder="+1 555 019 2834"
                value={profile.phone ?? ''}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                icon={<Phone className="w-4 h-4" />}
              />
              <Select
                label="Academic Department / Major"
                value={profile.department_id ?? ''}
                onChange={e => setProfile(p => ({ ...p, department_id: Number(e.target.value) || null }))}
                options={departments.map(d => ({
                  value: d.id,
                  label: `${d.name}${(d as any).institutions?.name ? ` — ${(d as any).institutions.name}` : ''}`,
                }))}
                placeholder="Select your department..."
              />
              <Input
                label="CGPA / Cumulative Grade"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="8.75"
                value={profile.cgpa ?? ''}
                onChange={e => setProfile(p => ({ ...p, cgpa: Number(e.target.value) }))}
                icon={<Star className="w-4 h-4" />}
              />
            </div>
          </Card>

          {/* Skills with Live Score */}
          <Card>
            <CardHeader
              title="Technical Skills & Competencies"
              subtitle="Comma-separated keywords (e.g. React, Node.js, Python, PostgreSQL, AWS)"
            />
            <Textarea
              placeholder="React, TypeScript, Python, Tailwind CSS, Docker, GraphQL, System Design..."
              value={profile.skills ?? ''}
              onChange={e => setProfile(p => ({ ...p, skills: e.target.value }))}
              rows={3}
              hint="Enter skills separated with commas. These are parsed for recruiter keyword matching."
            />

            {/* Live resume score widget */}
            <div className="mt-5 p-4 bg-brand-50/60 rounded-2xl border border-brand-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" /> Automated Resume Score
                </span>
                <span className="text-lg font-extrabold text-brand-700">{estimatedScore}/100</span>
              </div>
              <div className="h-2.5 bg-brand-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${estimatedScore}%` }}
                />
              </div>
              <p className="text-xs text-brand-700 mt-2 font-medium">
                {estimatedScore >= 80 ? '🌟 Outstanding profile readiness! Recruiters will prioritize your profile.' :
                 estimatedScore >= 60 ? '✨ Good candidate profile. Consider adding a few more specific tools.' :
                 '💡 Add more technical skills and frameworks to optimize your matching score.'}
              </p>
            </div>
          </Card>

          {/* Resume Link */}
          <Card>
            <CardHeader
              title="Online Portfolio & Resume"
              subtitle="Public link to your resume document (Google Drive, Dropbox, Notion, or PDF link)"
            />
            <Input
              label="Public Resume Link"
              type="url"
              placeholder="https://drive.google.com/file/d/... or https://portfolio.dev"
              value={profile.resume_url ?? ''}
              onChange={e => setProfile(p => ({ ...p, resume_url: e.target.value }))}
              icon={<LinkIcon className="w-4 h-4" />}
              hint="Ensure permissions are set to 'Anyone with the link can view'."
            />
          </Card>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" /> Profile saved and synced successfully!
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
              className="px-6 py-2.5 font-bold uppercase tracking-wider text-xs"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
