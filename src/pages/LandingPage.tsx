import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Briefcase, Users, ArrowRight, CheckCircle2,
  Star, TrendingUp, Building2, Search, MapPin,
  Clock, DollarSign, ChevronRight, Sparkles, Check,
  Send, Compass, Award, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge, { jobTypeBadge } from '../components/ui/Badge';

// Mock featured jobs for the landing page showcase
const sampleFeaturedJobs = [
  {
    id: 101,
    title: 'Senior Software Engineer (Full Stack)',
    company: 'TechVision Global',
    location: 'Bangalore / Remote',
    type: 'Full Time',
    salary: '$85,000 - $110,000 / yr',
    department: 'Computer Science',
    posted: '2 days ago',
    logoColor: 'bg-emerald-500 text-white',
    logoText: 'TV',
    tags: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    id: 102,
    title: 'Machine Learning & AI Intern',
    company: 'DataCore Intelligence',
    location: 'Hyderabad, India',
    type: 'Internship',
    salary: '$3,500 / mo Stipend',
    department: 'Artificial Intelligence',
    posted: 'Just now',
    logoColor: 'bg-brand-500 text-white',
    logoText: 'DC',
    tags: ['Python', 'PyTorch', 'TensorFlow', 'NLP'],
  },
  {
    id: 103,
    title: 'Associate Product Manager',
    company: 'NextWave Solutions',
    location: 'Mumbai / Hybrid',
    type: 'Full Time',
    salary: '$70,000 - $90,000 / yr',
    department: 'Management',
    posted: '3 days ago',
    logoColor: 'bg-sky-500 text-white',
    logoText: 'NW',
    tags: ['Agile', 'Product Strategy', 'Analytics'],
  },
  {
    id: 104,
    title: 'UI/UX Design Specialist',
    company: 'PixelCraft Studios',
    location: 'Remote',
    type: 'Part Time',
    salary: '$45 / hr',
    department: 'Design & Media',
    posted: '1 week ago',
    logoColor: 'bg-purple-500 text-white',
    logoText: 'PC',
    tags: ['Figma', 'Prototyping', 'Design Systems'],
  },
  {
    id: 105,
    title: 'Cloud DevOps Engineer',
    company: 'Synthetix Cloud Labs',
    location: 'Pune / Hybrid',
    type: 'Full Time',
    salary: '$90,000 - $120,000 / yr',
    department: 'Information Technology',
    posted: '4 days ago',
    logoColor: 'bg-amber-500 text-white',
    logoText: 'SC',
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
  },
  {
    id: 106,
    title: 'Embedded Systems Graduate Trainee',
    company: 'Apex Robotics & IoT',
    location: 'Chennai, India',
    type: 'Full Time',
    salary: '$65,000 - $80,000 / yr',
    department: 'Electronics & Comm.',
    posted: '5 days ago',
    logoColor: 'bg-rose-500 text-white',
    logoText: 'AR',
    tags: ['C/C++', 'Microcontrollers', 'RTOS', 'IoT'],
  },
];

const trendingTags = [
  'Software Engineer', 'React Developer', 'Data Scientist', 'AI / ML',
  'Product Manager', 'DevOps', 'UI/UX Designer', 'Cloud Architect'
];

const testimonials = [
  {
    quote: 'JobBoard transformed our campus hiring process completely. We screened over 400 qualified applicants and filled 18 roles in record time with structured feedback.',
    name: 'Sarah Jenkins',
    role: 'Head of University Talent, TechCorp Global',
    company: 'TechCorp',
    avatar: 'SJ',
    rating: 5,
  },
  {
    quote: 'The automated resume score pinpointed areas to refine in my portfolio. Within two weeks of updating it, I received interview invites from three top companies and accepted my dream offer!',
    name: 'Arjun Mehta',
    role: 'Associate Software Engineer',
    company: 'Infosys Placement 2026',
    avatar: 'AM',
    rating: 5,
  },
  {
    quote: 'Coordinating placement drives across 14 engineering departments used to take weeks of spreadsheets. JobBoard centralized everything for our college placement office effortlessly.',
    name: 'Dr. Ramesh Sundaram',
    role: 'Dean of Corporate Relations & Placements',
    company: 'National Institute of Technology',
    avatar: 'RS',
    rating: 5,
  },
];

const howItWorksSteps = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Sign up in seconds, upload your academic achievements, projects, and calculate your resume readiness score.',
    icon: <Users className="w-6 h-6 text-brand-600" />,
  },
  {
    step: '02',
    title: 'Explore & Discover Jobs',
    desc: 'Browse tailored job opportunities filtered by department, experience level, job type, and salary package.',
    icon: <Search className="w-6 h-6 text-brand-600" />,
  },
  {
    step: '03',
    title: '1-Click Application',
    desc: 'Apply directly with customized cover letters and track status progression in real time from review to interview.',
    icon: <Send className="w-6 h-6 text-brand-600" />,
  },
  {
    step: '04',
    title: 'Get Hired & Feedback',
    desc: 'Receive structured interview evaluations, recruiter feedback notes, and direct job offers on your dashboard.',
    icon: <Award className="w-6 h-6 text-brand-600" />,
  },
];

export default function LandingPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  // Search filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [activeTab, setActiveTab] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (user && role === 'STUDENT') {
      navigate('/student/jobs');
    } else {
      navigate('/login');
    }
  }

  function handleTagClick(tag: string) {
    setSearchKeyword(tag);
  }

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
    }
  }

  // Filter sample jobs
  const filteredJobs = sampleFeaturedJobs.filter(job => {
    const matchesTab = activeTab === 'All' || job.type.toLowerCase().includes(activeTab.toLowerCase());
    const matchesKeyword = !searchKeyword || 
      job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.tags.some(t => t.toLowerCase().includes(searchKeyword.toLowerCase()));
    const matchesDept = !selectedDept || job.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesType = selectedType === 'All' || !selectedType || job.type.toLowerCase().includes(selectedType.toLowerCase());

    return matchesTab && matchesKeyword && matchesDept && matchesType;
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* ── TOP STICKY NAVBAR ────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-extrabold tracking-wider uppercase text-white">JobBoard</span>
                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block"></span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block -mt-1">Campus Recruitment</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#hero" className="text-white hover:text-brand-400 transition-colors">Home</a>
            <a href="#jobs" className="text-slate-300 hover:text-brand-400 transition-colors">Job Listings</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-brand-400 transition-colors">How It Works</a>
            <a href="#employers" className="text-slate-300 hover:text-brand-400 transition-colors">For Employers</a>
            <a href="#testimonials" className="text-slate-300 hover:text-brand-400 transition-colors">Testimonials</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={role === 'STUDENT' ? '/student' : role === 'RECRUITER' ? '/recruiter' : '/admin'}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/20"
              >
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center gap-2 border-2 border-slate-600 hover:border-white text-white hover:bg-white hover:text-slate-900 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5" /> Post a Job
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-500/25"
                >
                  <Lock className="w-3.5 h-3.5" /> Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ──────────────────────────────────────────────── */}
      <section id="hero" className="relative pt-36 pb-24 md:pt-44 md:pb-36 bg-slate-950 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transform"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            The Next-Gen Campus Placement Network
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
            The Easiest Way to Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-400">Dream Job</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
            Connect directly with verified corporate recruiters, get automated resume optimization, 
            and land high-impact campus opportunities effortlessly.
          </p>

          {/* ── MULTI-SEGMENT JOB SEARCH WIDGET ─────────────────────── */}
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-hero-search border border-white/20 text-left">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Keywords Input */}
              <div className="md:col-span-4 relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                />
              </div>

              {/* Department / Category Dropdown */}
              <div className="md:col-span-3 relative flex items-center">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Tech</option>
                  <option value="Artificial Intelligence">AI & Data Science</option>
                  <option value="Electronics">Electronics & Comm.</option>
                  <option value="Management">Business & Management</option>
                  <option value="Design">Design & Media</option>
                </select>
              </div>

              {/* Job Type Dropdown */}
              <div className="md:col-span-3 relative flex items-center">
                <Clock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-11 pr-8 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Job Types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract / Freelance</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Trending Keywords Tag Cloud */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 px-1 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand-600" /> Trending:
              </span>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── STATS & NUMERICAL COUNTER ROW ─────────────────────────────── */}
      <section className="bg-slate-900 border-y border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="p-4 border-r border-slate-800/80 last:border-none">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-400 tracking-tight">12,500+</p>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-2">Candidates Placed</p>
          </div>

          <div className="p-4 border-r border-slate-800/80 last:border-none">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">850+</p>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-2">Partner Companies</p>
          </div>

          <div className="p-4 border-r border-slate-800/80 last:border-none">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-400 tracking-tight">200+</p>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-2">Institutions & Colleges</p>
          </div>

          <div className="p-4">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">98.6%</p>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400 mt-2">Satisfaction Rate</p>
          </div>

        </div>
      </section>

      {/* ── FEATURED JOB LISTINGS SECTION ─────────────────────────────── */}
      <section id="jobs" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest mb-2 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                <Briefcase className="w-3.5 h-3.5" /> Recent Opportunities
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured Job Openings
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl">
                Explore active campus openings from verified recruiters. Apply in 1-click and track your application status.
              </p>
            </div>

            {/* Job Type Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start md:self-auto">
              {['All', 'Full Time', 'Internship', 'Part Time'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Company logo & Job Type Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${job.logoColor} flex items-center justify-center font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform`}>
                      {job.logoText}
                    </div>
                    <Badge variant={jobTypeBadge(job.type)}>
                      {job.type}
                    </Badge>
                  </div>

                  {/* Title & Company */}
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5 mb-3 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {job.company}
                  </p>

                  {/* Meta Information: Location & Department */}
                  <div className="space-y-1.5 mb-4 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-700 font-bold">
                      <DollarSign className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {job.posted}
                  </span>
                  <Link
                    to={user ? (role === 'STUDENT' ? '/student/jobs' : '/login') : '/login'}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl border border-brand-200 transition-colors"
                  >
                    Apply Now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Explore All CTA */}
          <div className="mt-12 text-center">
            <Link
              to={user && role === 'STUDENT' ? '/student/jobs' : '/login'}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg transition-all"
            >
              Browse All 150+ Campus Openings <ArrowRight className="w-4 h-4 text-brand-400" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS / 4-STEP PROCESS ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest mb-2 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Compass className="w-3.5 h-3.5" /> Simple Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How JobBoard Works
            </h2>
            <p className="text-slate-500 text-base mt-3">
              A streamlined, 4-step recruitment cycle engineered for maximum placement success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-card hover:bg-white transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 group-hover:text-brand-500 transition-colors">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── DUAL BANNER: CANDIDATES VS EMPLOYERS ───────────────────────── */}
      <section id="employers" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* For Candidates Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 border border-slate-700/60 shadow-2xl flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">For Candidates & Students</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-4">
                Looking For Your Next Career Move?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Build an automated resume score, showcase your projects, browse vetted campus job opportunities, 
                and receive feedback directly from hiring teams.
              </p>
              <ul className="space-y-2.5 mb-8 text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  Instant profile completeness & resume rating
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  Apply in one click with real-time status tracking
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  Transparent recruiter feedback and interview notes
                </li>
              </ul>
            </div>
            <div className="relative z-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20"
              >
                Register as Student <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* For Employers Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 border border-slate-700/60 shadow-2xl flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">For Employers & Recruiters</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-4">
                Looking to Hire Top Campus Talent?
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Publish openings, screen pre-evaluated candidates by department and CGPA, manage recruitment pipelines, 
                and conduct seamless placement drives.
              </p>
              <ul className="space-y-2.5 mb-8 text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  Post customized job roles with targeted requirements
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  Screen candidate resumes with skills match filtering
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                  Seamless applicant pipeline management & shortlisting
                </li>
              </ul>
            </div>
            <div className="relative z-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg"
              >
                Post Jobs as Recruiter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ──────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest mb-2 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Star className="w-3.5 h-3.5 fill-brand-500 text-brand-500" /> Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trusted by 10,000+ Students & Recruiters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-700 font-extrabold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── NEWSLETTER & CALL TO ACTION ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Stay Updated with New Campus Placement Drives
          </h2>
          <p className="text-brand-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Subscribe to our weekly job digest and get notifications when top tech companies open campus recruitment.
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-bold">
              <Check className="w-5 h-5 text-white" /> Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-md"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── RICH THEMEWAGON-STYLE FOOTER ──────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-wider uppercase text-white">JobBoard</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The premier campus recruitment management platform connecting ambitious graduates, universities, 
              and leading corporate recruiters.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-400">
              <span>Security</span> • <span>Privacy Policy</span> • <span>Terms of Service</span>
            </div>
          </div>

          {/* Col 2: For Students */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-xs mb-4">For Candidates</p>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Resume Score Calculator</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Register as Student</Link></li>
            </ul>
          </div>

          {/* Col 3: For Employers */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-xs mb-4">For Employers</p>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Post a Campus Job</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Applicant Pipeline</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Recruiter Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Campus Placement Drives</Link></li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <p className="text-white font-bold uppercase tracking-wider text-xs mb-4">Navigation</p>
            <ul className="space-y-2.5 text-xs font-medium">
              <li><a href="#hero" className="hover:text-brand-400 transition-colors">Home</a></li>
              <li><a href="#jobs" className="hover:text-brand-400 transition-colors">Job Listings</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-400 transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="hover:text-brand-400 transition-colors">Testimonials</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobBoard. Built with precision for Campus Recruitment.</p>
          <p>Theme inspired by JobBoard &mdash; Designed for peak speed and responsiveness.</p>
        </div>
      </footer>

    </div>
  );
}
