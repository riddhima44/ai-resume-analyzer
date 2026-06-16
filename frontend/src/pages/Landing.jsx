import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, FileText, ClipboardList } from 'lucide-react';

const Landing = () => {
  return (
    <div style={styles.container}>
      {/* Navigation Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>
            <Sparkles size={20} color="white" />
          </div>
          <span style={styles.brandName}>ResuMetrics <span style={styles.brandAccent}>AI</span></span>
        </div>
        <div style={styles.authLinks}>
          <Link to="/login" style={styles.loginBtn}>Login</Link>
          <Link to="/register" style={{...styles.btn, ...styles.btnPrimary}}>Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.badge}>
          <Sparkles size={14} color="#818cf8" />
          <span>Next-Generation Resume Intelligence</span>
        </div>
        <h1 style={styles.title}>
          Land More Interviews with <br />
          <span style={styles.titleGradient}>AI-Powered Resume Optimization</span>
        </h1>
        <p style={styles.subtitle}>
          Analyze your resume against any job description, optimize for Applicant Tracking Systems (ATS), generate tailored cover letters, and track your job applications in one unified dashboard.
        </p>
        <div style={styles.heroCta}>
          <Link to="/register" style={{...styles.btn, ...styles.btnLarge, ...styles.btnPrimary}}>
            Start Optimizing For Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section style={styles.features}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Everything You Need to Beat the ATS</h2>
          <p style={styles.sectionSubtitle}>Powerful modules designed to elevate your professional job search pipeline.</p>
        </div>

        <div style={styles.grid}>
          {featuresList.map((feature, idx) => (
            <div key={idx} className="glass-card" style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ResuMetrics AI. Powered by Google Gemini API.</p>
      </footer>
    </div>
  );
};

const featuresList = [
  {
    icon: <Cpu size={24} color="#818cf8" />,
    title: "ATS Scoring System",
    description: "Instantly calculate your match score against target job descriptions using advanced semantic keyword scanning."
  },
  {
    icon: <Sparkles size={24} color="#db2777" />,
    title: "Keyword Gap Analysis",
    description: "Uncover critical technical skills and core keywords missing from your resume that recruiters are looking for."
  },
  {
    icon: <FileText size={24} color="#10b981" />,
    title: "AI Cover Letters",
    description: "Generate professionally drafted, highly customized cover letters tailored precisely to the job description in seconds."
  },
  {
    icon: <ClipboardList size={24} color="#f97316" />,
    title: "Application Pipeline Tracker",
    description: "Track and organize your job applications across columns: Wishlist, Applied, Interviewing, and Offers."
  }
];

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#070b13',
    backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 5%',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  brandLogo: {
    background: 'linear-gradient(135deg, #6366f1 0%, #db2777 100%)',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  brandAccent: {
    background: 'linear-gradient(135deg, #818cf8 0%, #db2777 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  loginBtn: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  btn: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #5046e5 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
  },
  btnLarge: {
    padding: '0.9rem 2rem',
    fontSize: '1.05rem',
    borderRadius: '12px',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '5rem 1rem',
    maxWidth: '850px',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '50px',
    padding: '0.4rem 1rem',
    fontSize: '0.85rem',
    color: '#a5b4fc',
    marginBottom: '2rem',
    fontWeight: 500,
    fontFamily: "'Outfit', sans-serif",
  },
  title: {
    fontSize: '3.5rem',
    lineHeight: 1.15,
    marginBottom: '1.5rem',
    color: '#f8fafc',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #818cf8 0%, #db2777 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.15rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: '2.5rem',
  },
  heroCta: {
    display: 'flex',
    gap: '1rem',
  },
  features: {
    padding: '6rem 5%',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  sectionTitle: {
    fontSize: '2.2rem',
    marginBottom: '1rem',
    color: '#f8fafc',
  },
  sectionSubtitle: {
    fontSize: '1.05rem',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  featureIcon: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #1e293b',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  featureText: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  footer: {
    padding: '2rem 1rem',
    textAlign: 'center',
    borderTop: '1px solid #1e293b',
    color: '#475569',
    fontSize: '0.85rem',
    fontFamily: "'Outfit', sans-serif",
  }
};

export default Landing;
