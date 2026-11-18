import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, GraduationCap, Briefcase, FileText, Users, Check, Layers, MessageSquare, Compass } from 'lucide-react';

const features = [
  { icon: Compass, number: '01', title: 'Find your next chapter.', text: 'Explore campus opportunities, compare requirements, and find a role that fits your ambitions.', link: 'Explore opportunities', to: '/student/jobs' },
  { icon: FileText, number: '02', title: 'Make your introduction.', text: 'Bring your academic profile, skills, resume, and cover letter together in one application.', link: 'Build your profile', to: '/student/profile' },
  { icon: MessageSquare, number: '03', title: 'Know where you stand.', text: 'Follow your application status and read recruiter feedback without chasing scattered messages.', link: 'Track applications', to: '/student/applications' },
];

export default function LandingPage() {
  return (
    <div className="premium-home">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-nav shell">
        <Link to="/" className="wordmark" aria-label="JobBoard home"><span className="brand-symbol"><GraduationCap size={24} /></span>JobBoard<span className="wordmark-dot">.</span></Link>
        <nav className="desktop-links" aria-label="Main navigation"><a href="#experience">The experience</a><a href="#workflow">How it works</a><a href="#campus">For your campus</a></nav>
        <Link to="/login" className="nav-login">Log in <ArrowUpRight size={16}/></Link>
      </header>
      <main id="main">
        <section className="hero shell">
          <div className="hero-copy"><div className="eyebrow"><span/> YOUR CAMPUS. YOUR NEXT CHAPTER.</div>
            <h1>Big ambitions.<br/>A closer <em>connection.</em></h1>
            <p>Your first career move starts closer than you think. One thoughtful space for students, recruiters, and the people behind campus placements.</p>
            <div className="hero-actions"><Link to="/register" className="primary-link">Find your opportunity <ArrowUpRight size={19}/></Link><a href="#experience" className="quiet-link">Take a look around <ArrowRight size={17}/></a></div>
            <div className="hero-note"><span className="mini-icon"><GraduationCap size={18}/></span>Built around campus life. Designed for what comes next.</div>
          </div>
          <div className="hero-art" aria-label="Illustration of the campus application journey">
            <div className="orb orb-one"/><div className="orb orb-two"/>
            <div className="journey-card"><div className="preview-label"><span><span className="status-dot"/> YOUR CAREER SPACE</span><Layers size={18}/></div>
              <div className="preview-heading">A little clarity.<br/><strong>A world of possibility.</strong></div>
              <div className="opportunity-preview"><div className="opportunity-icon"><Briefcase size={23}/></div><div><b>Your next opportunity</b><small>Discover roles in your campus portal</small></div><ArrowUpRight size={19}/></div>
              <div className="journey-line"><span className="journey-check"><Check size={16}/></span><div><b>A profile that tells your story</b><small>Academics, skills, and your resume</small></div></div>
              <div className="journey-line"><span className="journey-check"><Check size={16}/></span><div><b>An application with direction</b><small>Track progress from applied to hired</small></div></div>
              <div className="journey-line"><span className="journey-check muted"><MessageSquare size={16}/></span><div><b>Feedback to move you forward</b><small>Learn from the recruitment process</small></div></div>
              <div className="preview-bottom">Your journey, all in one place <ArrowRight size={16}/></div>
            </div><div className="floating-note"><span>✦</span><div>Potential meets possibility.<small>Campus recruitment, connected.</small></div></div>
            <span className="illustration-caption">A glimpse of the experience · illustrative preview</span>
          </div>
        </section>
        <section className="role-strip shell" aria-label="Portal roles"><span>ONE CAMPUS COMMUNITY.<br/><b>Three connected perspectives.</b></span><div><GraduationCap/> Students</div><div><Briefcase/> Recruiters</div><div><Users/> Placement teams</div></section>
        <section id="experience" className="experience shell"><div className="section-top"><div><div className="eyebrow">LESS FRICTION. MORE FORWARD.</div><h2>From campus life<br/>to your working life.</h2></div><p>Keep the important things together, so you can focus on your next step.</p></div>
          <div className="feature-grid">{features.map(({icon: Icon, ...feature}) => <article className="feature-card" key={feature.number}><div className="feature-top"><span><Icon size={24}/></span><small>{feature.number}</small></div><h3>{feature.title}</h3><p>{feature.text}</p><Link to={feature.to}>{feature.link}<ArrowUpRight size={17}/></Link></article>)}</div>
        </section>
        <section id="workflow" className="workflow shell"><div><div className="eyebrow">A CLEAR PATH FORWARD</div><h2>One less thing<br/>to figure out.</h2><Link to="/register" className="quiet-link">Start your journey <ArrowRight size={18}/></Link></div><ol>{[['Create your account','Choose your role and get a space of your own.'],['Bring your profile to life','Add your department, academic details, skills, and resume.'],['Make your next move','Apply to opportunities and follow your application progress.']].map(([title, text], i) => <li key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
        <section id="campus" className="campus-panel shell"><div className="eyebrow">CONNECTED BY CAMPUS</div><h2>More than a listing.<br/>A shared starting point.</h2><p>Give your campus recruitment process a home. Students manage applications, recruiters manage candidates, and administrators organize institutions and departments.</p><div className="hero-actions"><Link to="/register" className="primary-link">Join your campus community <ArrowUpRight size={18}/></Link><Link to="/login" className="quiet-link">Already a member? Log in <ArrowRight size={17}/></Link></div></section>
      </main>
      <footer className="site-footer shell"><Link to="/" className="wordmark"><GraduationCap size={25}/> JobBoard.</Link><p>A brighter beginning, closer to home.</p><span>© {new Date().getFullYear()} JobBoard</span></footer>
    </div>
  );
}
