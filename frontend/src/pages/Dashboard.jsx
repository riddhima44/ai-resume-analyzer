import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { FileText, ClipboardList, Sparkles, AlertCircle, TrendingUp, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Analysis History
        const historyRes = await fetch(`${API_BASE_URL}/api/analysis/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyData = await historyRes.json();
        if (historyRes.ok) {
          setHistory(historyData);
        }

        // Fetch Applications Tracker
        const appsRes = await fetch(`${API_BASE_URL}/api/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appsData = await appsRes.json();
        if (appsRes.ok) {
          setApplications(appsData);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalScans = history.length;
  const bestAtsScore = totalScans > 0 ? Math.max(...history.map(item => item.atsScore)) : 0;
  const interviewingCount = applications.filter(app => app.status === 'Interviewing').length;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Welcome Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {user?.name.split(' ')[0]}</h1>
          <p style={styles.subtitle}>Here is an overview of your job search progress.</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/analyze" className="btn btn-primary">
            <Sparkles size={16} /> New Resume Scan
          </Link>
        </div>
      </div>

      {error && <div style={styles.errorAlert}><AlertCircle size={20} /> {error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statsCard}>
          <div style={styles.statIconWrapper}>
            <FileText size={22} color="#6366f1" />
          </div>
          <div style={styles.statDetails}>
            <span style={styles.statLabel}>Resumes Scanned</span>
            <span style={styles.statValue}>{totalScans}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statsCard}>
          <div style={{ ...styles.statIconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={22} color="#10b981" />
          </div>
          <div style={styles.statDetails}>
            <span style={styles.statLabel}>Highest ATS Score</span>
            <span style={styles.statValue}>{bestAtsScore}%</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statsCard}>
          <div style={{ ...styles.statIconWrapper, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
            <ClipboardList size={22} color="#f97316" />
          </div>
          <div style={styles.statDetails}>
            <span style={styles.statLabel}>Applications Tracked</span>
            <span style={styles.statValue}>{applications.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: History and Applications */}
      <div className="dashboard-main-grid">
        {/* Left Column: History */}
        <div className="glass-card" style={styles.historyCard}>
          <h2 style={styles.cardTitle}>Recent Scans</h2>
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={48} color="#334155" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>You haven't scanned any resumes yet.</p>
              <Link to="/analyze" className="btn btn-secondary">Scan Your First Resume</Link>
            </div>
          ) : (
            <div style={styles.list}>
              {history.slice(0, 5).map((item) => (
                <div key={item._id} style={styles.historyItem}>
                  <div style={styles.itemMain}>
                    <span style={styles.itemTitle}>{item.jobTitle}</span>
                    <div style={styles.itemMeta}>
                      <span style={styles.itemFile}><FileText size={12} /> {item.resumeId?.fileName || 'Resume'}</span>
                      <span style={styles.itemDate}><Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={styles.itemRight}>
                    <div style={{
                      ...styles.scoreBadge,
                      backgroundColor: item.atsScore >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                      color: item.atsScore >= 75 ? '#34d399' : '#fb923c',
                    }}>
                      {item.atsScore}%
                    </div>
                    <Link to={`/results/${item._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Tracker Overview */}
        <div className="glass-card" style={styles.trackerSummaryCard}>
          <h2 style={styles.cardTitle}>Application Status</h2>
          {applications.length === 0 ? (
            <div style={styles.emptyState}>
              <ClipboardList size={48} color="#334155" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No job applications tracked yet.</p>
              <Link to="/tracker" className="btn btn-secondary">Go to Job Tracker</Link>
            </div>
          ) : (
            <div style={styles.trackerContent}>
              <div style={styles.pipeline}>
                {['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map(status => {
                  const count = applications.filter(app => app.status === status).length;
                  return (
                    <div key={status} style={styles.pipelineItem}>
                      <span style={styles.pipelineLabel}>{status}</span>
                      <div style={styles.pipelineBarBg}>
                        <div style={{
                          ...styles.pipelineBar,
                          width: `${applications.length > 0 ? (count / applications.length) * 100 : 0}%`,
                          backgroundColor: status === 'Offer' ? '#10b981' : status === 'Interviewing' ? '#6366f1' : status === 'Rejected' ? '#ef4444' : '#64748b'
                        }}></div>
                      </div>
                      <span style={styles.pipelineCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div style={styles.trackerCta}>
                <Link to="/tracker" className="btn btn-secondary" style={{ width: '100%' }}>
                  Manage Application Tracker
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    color: '#f8fafc',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  statsCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.5rem',
  },
  statIconWrapper: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '12px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: '#f8fafc',
    lineHeight: 1.2,
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    marginBottom: '1.5rem',
    color: '#f8fafc',
  },
  historyCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid #1e293b',
    transition: 'border-color 0.2s',
  },
  itemMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  itemTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  itemMeta: {
    display: 'flex',
    gap: '1rem',
    color: '#64748b',
    fontSize: '0.75rem',
  },
  itemFile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  itemDate: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  scoreBadge: {
    borderRadius: '8px',
    padding: '0.4rem 0.8rem',
    fontWeight: 700,
    fontSize: '0.9rem',
    fontFamily: "'Outfit', sans-serif",
  },
  trackerSummaryCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  trackerContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  pipeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
    marginBottom: '1.5rem',
  },
  pipelineItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  pipelineLabel: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    width: '80px',
  },
  pipelineBarBg: {
    flex: 1,
    height: '6px',
    backgroundColor: '#1e293b',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  pipelineBar: {
    height: '100%',
    borderRadius: '3px',
  },
  pipelineCount: {
    fontSize: '0.85rem',
    color: '#f8fafc',
    fontWeight: 600,
    textAlign: 'right',
    width: '15px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center',
    flex: 1,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    color: '#f87171',
    fontSize: '0.9rem',
  }
};

export default Dashboard;
