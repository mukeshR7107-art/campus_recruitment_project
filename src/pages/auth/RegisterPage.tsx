import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Briefcase, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface RoleOption {
  role: UserRole;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  active: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'STUDENT',
    label: 'Student',
    desc: 'Looking for placement opportunities',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'border-gray-200 hover:border-blue-300',
    active: 'border-blue-500 bg-blue-50',
  },
  {
    role: 'RECRUITER',
    label: 'Recruiter',
    desc: 'Hiring campus talent',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'border-gray-200 hover:border-emerald-300',
    active: 'border-emerald-500 bg-emerald-50',
  },
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err, emailConfirmationRequired } = await signUp(email, password, role);
    setLoading(false);

    if (err) {
      setError(err.message ?? 'Registration failed. Please try again.');
      return;
    }

    if (emailConfirmationRequired) {
      setSuccess(true);
      return;
    }

    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CampusRecruit</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of students and recruiters</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Created!</h3>
              <p className="text-sm text-gray-500">Check your inbox and confirm your email before signing in.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map(opt => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setRole(opt.role)}
                      className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 text-center transition-all
                        ${role === opt.role ? opt.active : opt.color}`}
                    >
                      <div className={`p-2 rounded-lg ${role === opt.role ? 'bg-white/80' : 'bg-gray-100'}`}>
                        {opt.icon}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                      <span className="text-xs text-gray-500">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-10 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Confirm password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white pl-9 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
                Create Account
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
