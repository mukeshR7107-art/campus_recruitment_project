import { Link } from 'react-router-dom';
import {
  GraduationCap, Briefcase, Users, ArrowRight, CheckCircle2,
  Star, TrendingUp, Shield, Zap, Building2, Search
} from 'lucide-react';

const features = [
  {
    icon: <Search className="w-5 h-5" />,
    title: 'Smart Job Discovery',
    desc: 'Students browse curated job listings tailored to their skills, department, and academic background.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    title: 'Streamlined Applications',
    desc: 'Apply with a single click, track application status in real time, and receive direct recruiter feedback.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Recruiter Tools',
    desc: 'Post jobs, manage applicant pipelines, shortlist candidates, and provide structured feedback.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Role-Based Access',
    desc: 'Secure RBAC ensures students, recruiters, and admins each have exactly the right permissions.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Resume Scoring',
    desc: 'Automated resume analysis helps students optimise their profile for better placement outcomes.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Real-Time Updates',
    desc: 'Live status updates, feedback notifications, and instant application tracking across all devices.',
    color: 'bg-violet-50 text-violet-600',
  },
];

const stats = [
  { value: '12,000+', label: 'Students Placed' },
  { value: '850+', label: 'Partner Companies' },
  { value: '200+', label: 'Institutions' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const testimonials = [
  {
    quote: 'CampusRecruit transformed how we hire. The pipeline management is excellent and feedback tools save us hours every week.',
    name: 'Sarah Johnson',
    role: 'Talent Lead, TechCorp',
    avatar: 'SJ',
  },
  {
    quote: 'I landed my dream job three weeks after creating my profile. The resume score feature helped me stand out from hundreds of applicants.',
    name: 'Arjun Mehta',
    role: 'Software Engineer, Infosys',
    avatar: 'AM',
  },
  {
    quote: 'Managing campus placements across 12 departments used to be chaotic. Now everything is centralised and transparent.',
    name: 'Dr. Patricia Lee',
    role: 'Placement Coordinator, MIT Institute',
    avatar: 'PL',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">CampusRecruit</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5" />
            Trusted by 200+ institutions worldwide
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Connect Campus Talent<br />
            <span className="text-blue-600">with Top Recruiters</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The complete campus recruitment platform — from profile creation and resume scoring
            to job applications, shortlisting, and structured feedback. Built for students, recruiters, and institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Start for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Hero image placeholder */}
        <div className="max-w-5xl mx-auto mt-16 px-4">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <img
              src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Team collaboration"
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-blue-600">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything you need to run campus placements</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              A unified platform for students, recruiters, and placement coordinators.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white group">
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Built for every stakeholder</h2>
            <p className="text-gray-500">Three powerful dashboards, one seamless platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <GraduationCap className="w-6 h-6" />,
                title: 'Students',
                color: 'from-blue-500 to-blue-600',
                perks: ['Create rich profiles', 'Upload & score resumes', 'Browse & apply to jobs', 'Track application status', 'Read recruiter feedback'],
                cta: 'Join as Student',
                path: '/register',
              },
              {
                icon: <Briefcase className="w-6 h-6" />,
                title: 'Recruiters',
                color: 'from-emerald-500 to-emerald-600',
                perks: ['Build company profile', 'Post & manage jobs', 'Review applications', 'Update candidate status', 'Provide structured feedback'],
                cta: 'Join as Recruiter',
                path: '/register',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Admins',
                color: 'from-amber-500 to-amber-600',
                perks: ['Manage all users', 'Assign user roles', 'Manage institutions', 'Manage departments', 'View platform analytics'],
                cta: 'Admin Access',
                path: '/login',
              },
            ].map(role => (
              <div key={role.title} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className={`bg-gradient-to-r ${role.color} p-6`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-3">
                    {role.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{role.title}</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 mb-6">
                    {role.perks.map(perk => (
                      <li key={perk} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={role.path}
                    className="block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-xl py-2.5 transition-colors"
                  >
                    {role.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Loved by students and recruiters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to transform your campus recruitment?</h2>
          <p className="text-blue-100 mb-8">Join thousands of students and recruiters already using CampusRecruit.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-700 font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-blue-400 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-700">CampusRecruit</span>
          </div>
          <p>© {new Date().getFullYear()} CampusRecruit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
