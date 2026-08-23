import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && role) {
      const map: Record<string, string> = { STUDENT: '/student', RECRUITER: '/recruiter', ADMIN: '/admin' };
      navigate(map[role] ?? '/student', { replace: true });
    }
  }, [user, role, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err.message ?? 'Invalid email or password. Please verify your credentials.');
      return;
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-extrabold tracking-wider uppercase text-white">JobBoard</span>
                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block -mt-1">Campus Recruitment</span>
            </div>
          </Link>

          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Access student job applications, recruiter pipeline, and placement dashboards.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 relative">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <Input
              label="Email Address"
              type="email"
              placeholder="name@university.edu or recruiter@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your secret password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full justify-center py-3 text-sm font-bold uppercase tracking-wider"
              size="lg"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
                Create Free Account
              </Link>
            </p>
          </div>

        </div>

        {/* Security badge */}
        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          <span>Protected with secure Supabase authentication & SSL</span>
        </div>

      </div>
    </div>
  );
}
