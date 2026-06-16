import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, FileText, CheckCircle, XCircle, AlertCircle, Copy, Check, Download, Send } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Results = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // PDF download handler using html2pdf.js with multi-page printing templates
  const downloadPdfReport = () => {
    const element = document.getElementById('pdf-report-template');
    if (!element) return;

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `ResuMetrics_Report_${analysis.jobTitle.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#070b13' },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).save();
  };
  
  // Cover Letter states
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);
  
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'keywords', 'suggestions', 'coverletter'
  const [copiedRewriteIndex, setCopiedRewriteIndex] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/analysis/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setAnalysis(data);
        } else {
          setError(data.message || 'Failed to fetch analysis report.');
        }
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Network error. Failed to load report.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const generateCoverLetter = async () => {
    if (!analysis) return;
    setGeneratingLetter(true);
    setCopiedLetter(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/analysis/cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: analysis.resumeId._id || analysis.resumeId,
          jobTitle: analysis.jobTitle,
          jobDescriptionText: analysis.jobDescriptionText
        })
      });

      const data = await res.json();
      if (res.ok) {
        setCoverLetter(data.content);
      } else {
        alert(data.message || 'Failed to generate cover letter.');
      }
    } catch (err) {
      console.error('Error generating cover letter:', err);
      alert('Network error. Failed to generate cover letter.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const copyToClipboard = (text, index = null) => {
    navigator.clipboard.writeText(text);
    if (index !== null) {
      setCopiedRewriteIndex(index);
      setTimeout(() => setCopiedRewriteIndex(null), 2000);
    } else {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Generating report metrics...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={styles.loadingContainer}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Failed to Load Report</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{error || 'Analysis details not found.'}</p>
        <Link to="/dashboard" className="btn btn-secondary">Return to Dashboard</Link>
      </div>
    );
  }

  const { analysisData } = analysis;
  const matchCount = analysisData?.keywordAnalysis?.matchingKeywords?.length || 0;
  const missingCount = analysisData?.keywordAnalysis?.missingKeywords?.length || 0;
  
  // Recharts visual comparison data
  const chartData = [
    { name: 'Matched Keywords', count: matchCount, fill: '#10b981' },
    { name: 'Missing Keywords', count: missingCount, fill: '#ef4444' }
  ];

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Header Info */}
      <div style={styles.header}>
        <div>
          <span style={styles.preTitle}>Analysis Report</span>
          <h1 style={styles.title}>{analysis.jobTitle}</h1>
          <p style={styles.subtitle}>
            <FileText size={14} /> {analysis.resumeId?.fileName || 'Extracted Document'} &bull; Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={downloadPdfReport} className="btn btn-secondary">
            <Download size={16} /> Download PDF
          </button>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Report PDF Capture Area */}
      <div id="report-pdf-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Hero Overview */}
        <div className="glass-card results-overview-card">
        {/* Circular SVG Gauge */}
        <div style={styles.gaugeContainer}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={styles.svg}>
            <circle cx="75" cy="75" r="65" stroke="#1e293b" strokeWidth="12" fill="transparent" />
            <circle
              cx="75"
              cy="75"
              r="65"
              stroke={analysis.atsScore >= 75 ? '#10b981' : '#f97316'}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 65}
              strokeDashoffset={2 * Math.PI * 65 * (1 - analysis.atsScore / 100)}
              strokeLinecap="round"
              transform="rotate(-90 75 75)"
            />
          </svg>
          <div style={styles.gaugeCenter}>
            <span style={styles.gaugeNumber}>{analysis.atsScore}%</span>
            <span style={styles.gaugeLabel}>ATS Score</span>
          </div>
        </div>

        <div style={styles.overviewMeta}>
          <h3 style={styles.overviewHeading}>
            {analysis.atsScore >= 75 ? 'Strong Resume Alignment!' : 'Needs Optimization'}
          </h3>
          <p style={styles.overviewText}>
            {analysis.atsScore >= 75 
              ? 'Your resume displays solid keyword matching and structuring for this target position. Implementing the detailed suggestions below can help push it to 90%+.'
              : 'Your resume is missing critical keywords and impact phrased accomplishments requested by the recruiter. Review the keyword gaps and suggested rewrites to improve your alignment.'
            }
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div style={styles.tabsMenu}>
        {[
          { id: 'summary', label: 'Summary & Suggestions' },
          { id: 'keywords', label: 'Keyword Gaps' },
          { id: 'rewrites', label: 'Suggested Rewrites' },
          { id: 'coverletter', label: 'AI Cover Letter' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabBtn,
              color: activeTab === tab.id ? '#f8fafc' : '#64748b',
              borderBottomColor: activeTab === tab.id ? '#6366f1' : 'transparent',
              backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel Context */}
      <div style={styles.tabContent}>
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="results-summary-grid">
            <div className="glass-card" style={styles.card}>
              <h3 style={styles.cardHeading}>Formatting & Layout Suggestions</h3>
              <ul style={styles.list}>
                {analysisData?.feedback?.formatting?.map((item, idx) => (
                  <li key={idx} style={styles.listItem}>
                    <AlertCircle size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={styles.card}>
              <h3 style={styles.cardHeading}>Skills & Certifications to Add</h3>
              <ul style={styles.list}>
                {analysisData?.feedback?.skillsImprovement?.map((item, idx) => (
                  <li key={idx} style={styles.listItem}>
                    <Sparkles size={16} color="#db2777" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* KEYWORDS TAB */}
        {activeTab === 'keywords' && (
          <div style={styles.keywordsLayout}>
            {/* Chart Widget */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', height: '200px' }}>
              <h4 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '0.95rem' }}>Keyword Stats</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={chartData} margin={{ left: -20, right: 10, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={120} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="results-keywords-grid">
              <div className="glass-card" style={styles.card}>
                <h3 style={{ ...styles.cardHeading, color: '#34d399' }}>
                  <CheckCircle size={18} /> Matching Skills ({matchCount})
                </h3>
                <div style={styles.tagCloud}>
                  {analysisData?.keywordAnalysis?.matchingKeywords?.map((tag, idx) => (
                    <span key={idx} style={{ ...styles.tag, borderColor: '#10b98133', backgroundColor: '#10b98111', color: '#34d399' }}>
                      {tag}
                    </span>
                  ))}
                  {matchCount === 0 && <span style={styles.emptyText}>No matching keywords found.</span>}
                </div>
              </div>

              <div className="glass-card" style={styles.card}>
                <h3 style={{ ...styles.cardHeading, color: '#f87171' }}>
                  <XCircle size={18} /> Missing Keywords ({missingCount})
                </h3>
                <div style={styles.tagCloud}>
                  {analysisData?.keywordAnalysis?.missingKeywords?.map((tag, idx) => (
                    <span key={idx} style={{ ...styles.tag, borderColor: '#ef444433', backgroundColor: '#ef444411', color: '#f87171' }}>
                      {tag}
                    </span>
                  ))}
                  {missingCount === 0 && <span style={styles.emptyText}>Perfect! No missing keywords.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REWRITES TAB */}
        {activeTab === 'rewrites' && (
          <div style={styles.rewritesList}>
            {analysisData?.suggestedRewrites?.map((item, idx) => (
              <div key={idx} className="glass-card" style={styles.rewriteCard}>
                <div style={styles.rewriteHeader}>
                  <h4 style={styles.rewriteTitle}>Rewrite Suggestion #{idx + 1}</h4>
                  <button
                    onClick={() => copyToClipboard(item.suggestedText, idx)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    {copiedRewriteIndex === idx ? (
                      <><Check size={14} /> Copied</>
                    ) : (
                      <><Copy size={14} /> Copy Rewrite</>
                    )}
                  </button>
                </div>
                
                <div className="rewrite-body-grid">
                  <div style={styles.phrasingBlock}>
                    <span style={styles.phrasingLabel}>Original Resume Phrasing</span>
                    <p style={styles.originalPhrasing}>"{item.originalText}"</p>
                  </div>
                  <div style={styles.phrasingBlock}>
                    <span style={styles.phrasingLabel}><Sparkles size={12} color="#6366f1" /> Optimized Suggestion</span>
                    <p style={styles.optimizedPhrasing}>"{item.suggestedText}"</p>
                  </div>
                </div>

                <div style={styles.rewriteReason}>
                  <strong>Why it helps:</strong> {item.reasoning}
                </div>
              </div>
            ))}
            {(!analysisData?.suggestedRewrites || analysisData.suggestedRewrites.length === 0) && (
              <div style={styles.emptyState}>
                <p>No rewrite suggestions needed for this resume.</p>
              </div>
            )}
          </div>
        )}

        {/* COVER LETTER TAB */}
        {activeTab === 'coverletter' && (
          <div className="glass-card" style={styles.coverLetterCard}>
            {coverLetter ? (
              <div style={styles.letterWrapper}>
                <div style={styles.letterActions}>
                  <button onClick={() => copyToClipboard(coverLetter)} className="btn btn-secondary" style={styles.actionBtn}>
                    {copiedLetter ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy to Clipboard</>}
                  </button>
                  <button onClick={generateCoverLetter} className="btn btn-secondary" style={styles.actionBtn} disabled={generatingLetter}>
                    Regenerate
                  </button>
                </div>
                <pre style={styles.letterContent}>{coverLetter}</pre>
              </div>
            ) : (
              <div style={styles.letterEmpty}>
                <FileText size={48} color="#334155" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Tailor a Custom Cover Letter</h3>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '450px' }}>
                  Generate a cover letter optimized using key matches in your resume aligned directly to the responsibilities in the job description.
                </p>
                <button onClick={generateCoverLetter} className="btn btn-primary" disabled={generatingLetter}>
                  {generatingLetter ? (
                    <><span className="spinner"></span> Generating Draft...</>
                  ) : (
                    <><Send size={16} /> Generate Cover Letter</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div> {/* End report-pdf-area */}
      </div>

      {/* Hidden container that holds the print layout */}
      <div style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
        <div id="pdf-report-template" style={styles.printContainer}>
          <div style={styles.printHeader}>
            <span style={styles.printPreTitle}>ResuMetrics AI &bull; Resume Analysis Report</span>
            <h1 style={styles.printTitle}>{analysis.jobTitle}</h1>
            <p style={styles.printSubtitle}>
              Parsed File: {analysis.resumeId?.fileName || 'Document'} &bull; Date: {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Page 1: Overview and Suggestions */}
          <div style={styles.printSection}>
            <div style={styles.printScoreWrapper}>
              <div style={styles.printScoreGauge}>
                <span style={styles.printScoreNumber}>{analysis.atsScore}%</span>
                <span style={styles.printScoreLabel}>ATS Score</span>
              </div>
              <div style={styles.printOverviewText}>
                <h3 style={styles.printSectionHeading}>{analysis.atsScore >= 75 ? 'Strong Match' : 'Needs Optimization'}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {analysis.atsScore >= 75 
                    ? 'Your resume displays solid keyword matching and structuring for this target position. Implementing the suggestions below can help improve alignment further.'
                    : 'Your resume is missing critical keywords and impact-phrased accomplishments requested by the recruiter. Review the keyword gaps and suggested rewrites to improve your score.'
                  }
                </p>
              </div>
            </div>

            <div style={styles.printGrid}>
              <div style={styles.printCard}>
                <h4 style={styles.printCardTitle}>Formatting & Layout Suggestions</h4>
                <ul style={styles.printList}>
                  {analysisData?.feedback?.formatting?.map((item, idx) => (
                    <li key={idx} style={styles.printListItem}>&bull; {item}</li>
                  ))}
                  {(!analysisData?.feedback?.formatting || analysisData.feedback.formatting.length === 0) && (
                    <li style={styles.printListItem}>No formatting issues detected.</li>
                  )}
                </ul>
              </div>
              <div style={styles.printCard}>
                <h4 style={styles.printCardTitle}>Skills & Certifications to Add</h4>
                <ul style={styles.printList}>
                  {analysisData?.feedback?.skillsImprovement?.map((item, idx) => (
                    <li key={idx} style={styles.printListItem}>&bull; {item}</li>
                  ))}
                  {(!analysisData?.feedback?.skillsImprovement || analysisData.feedback.skillsImprovement.length === 0) && (
                    <li style={styles.printListItem}>No additional skills suggested.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="html2pdf__page-break"></div>

          {/* Page 2: Keyword Gap Analysis */}
          <div style={styles.printSection}>
            <h3 style={styles.printSectionTitle}>Keyword Gap Analysis</h3>
            <p style={styles.printSectionDesc}>Comparison of required job description skills and terms found in your resume.</p>
            
            <div style={styles.printCard}>
              <h4 style={{ ...styles.printCardTitle, color: '#34d399' }}>Matching Keywords ({matchCount})</h4>
              <div style={styles.printTagCloud}>
                {analysisData?.keywordAnalysis?.matchingKeywords?.map((tag, idx) => (
                  <span key={idx} style={styles.printTagGreen}>{tag}</span>
                ))}
                {matchCount === 0 && <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>No matching keywords found.</span>}
              </div>
            </div>

            <div style={{ ...styles.printCard, marginTop: '1.5rem' }}>
              <h4 style={{ ...styles.printCardTitle, color: '#f87171' }}>Missing Keywords ({missingCount})</h4>
              <div style={styles.printTagCloud}>
                {analysisData?.keywordAnalysis?.missingKeywords?.map((tag, idx) => (
                  <span key={idx} style={styles.printTagRed}>{tag}</span>
                ))}
                {missingCount === 0 && <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>Perfect! No missing keywords.</span>}
              </div>
            </div>
          </div>

          <div className="html2pdf__page-break"></div>

          {/* Page 3: Suggested Rewrites */}
          <div style={styles.printSection}>
            <h3 style={styles.printSectionTitle}>Optimized Resume Rewrites</h3>
            <p style={styles.printSectionDesc}>Use these high-impact, action-verb and metric-oriented phrasing replacements in your resume.</p>
            
            <div style={styles.printRewritesList}>
              {analysisData?.suggestedRewrites?.map((item, idx) => (
                <div key={idx} style={styles.printRewriteCard}>
                  <h4 style={styles.printRewriteCardTitle}>Suggestion #{idx + 1}</h4>
                  <div style={styles.printRewriteGrid}>
                    <div style={styles.printRewriteBlock}>
                      <span style={styles.printRewriteLabel}>Original Phrasing:</span>
                      <p style={styles.printOriginalText}>"{item.originalText}"</p>
                    </div>
                    <div style={styles.printRewriteBlock}>
                      <span style={styles.printRewriteLabel}>Optimized Replacement:</span>
                      <p style={styles.printOptimizedText}>"{item.suggestedText}"</p>
                    </div>
                  </div>
                  <p style={styles.printRewriteReason}><strong>Why it helps:</strong> {item.reasoning}</p>
                </div>
              ))}
              {(!analysisData?.suggestedRewrites || analysisData.suggestedRewrites.length === 0) && (
                <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                  No rewrite suggestions needed for this resume.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
  preTitle: {
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#818cf8',
    letterSpacing: '0.05em',
  },
  title: {
    fontSize: '1.8rem',
    color: '#f8fafc',
    margin: '0.2rem 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  overviewCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
    padding: '2rem',
  },
  gaugeContainer: {
    position: 'relative',
    width: '150px',
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeNumber: {
    fontSize: '2rem',
    fontWeight: 850,
    color: '#f8fafc',
    fontFamily: "'Outfit', sans-serif",
  },
  gaugeLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  overviewMeta: {
    flex: 1,
  },
  overviewHeading: {
    fontSize: '1.35rem',
    color: '#f8fafc',
    marginBottom: '0.5rem',
  },
  overviewText: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    lineHeight: '1.6',
  },
  tabsMenu: {
    display: 'flex',
    borderBottom: '1px solid #1e293b',
    gap: '0.5rem',
  },
  tabBtn: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 600,
    padding: '0.8rem 1.5rem',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabContent: {
    marginTop: '0.5rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.8rem',
  },
  cardHeading: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#f8fafc',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: '1.5',
  },
  keywordsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  tagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
  },
  tag: {
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  rewritesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rewriteCard: {
    padding: '1.8rem',
  },
  rewriteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  rewriteTitle: {
    fontSize: '1.05rem',
    color: '#f8fafc',
  },
  rewriteBody: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.2rem',
  },
  phrasingBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  phrasingLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  originalPhrasing: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    textDecoration: 'line-through',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  optimizedPhrasing: {
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    color: '#34d399',
    fontSize: '0.95rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  rewriteReason: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    paddingTop: '1rem',
    borderTop: '1px solid #1e293b',
  },
  coverLetterCard: {
    padding: '2.5rem',
    minHeight: '350px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  letterWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  letterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
  },
  letterContent: {
    padding: '2rem',
    backgroundColor: '#070b13',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontFamily: 'Courier, monospace',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#64748b',
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  printContainer: {
    width: '720px',
    backgroundColor: '#070b13',
    color: '#cbd5e1',
    padding: '2.5rem',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  printHeader: {
    borderBottom: '2px solid #1e293b',
    paddingBottom: '1.5rem',
    marginBottom: '1rem',
  },
  printPreTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#818cf8',
    letterSpacing: '0.05em',
  },
  printTitle: {
    fontSize: '2.2rem',
    color: '#f8fafc',
    margin: '0.5rem 0',
  },
  printSubtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  printSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  printScoreWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '2rem',
  },
  printScoreGauge: {
    border: '8px solid #6366f1',
    borderRadius: '50%',
    width: '110px',
    height: '110px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  printScoreNumber: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  printScoreLabel: {
    fontSize: '0.65rem',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  printOverviewText: {
    flex: 1,
  },
  printSectionHeading: {
    fontSize: '1.25rem',
    color: '#f8fafc',
    marginBottom: '0.5rem',
  },
  printGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  printCard: {
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  printCardTitle: {
    fontSize: '1.05rem',
    color: '#f8fafc',
    marginBottom: '1rem',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '0.5rem',
  },
  printList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  printListItem: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  printSectionTitle: {
    fontSize: '1.4rem',
    color: '#f8fafc',
    marginBottom: '0.25rem',
  },
  printSectionDesc: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '1rem',
  },
  printTagCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  printTagGreen: {
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #10b98133',
    backgroundColor: '#10b98111',
    color: '#34d399',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  printTagRed: {
    padding: '0.35rem 0.7rem',
    borderRadius: '6px',
    border: '1px solid #ef444433',
    backgroundColor: '#ef444411',
    color: '#f87171',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  printRewritesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  printRewriteCard: {
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  printRewriteCardTitle: {
    fontSize: '1rem',
    color: '#818cf8',
    marginBottom: '1rem',
  },
  printRewriteGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  printRewriteBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  printRewriteLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  printOriginalText: {
    padding: '0.75rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    border: '1px solid rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    textDecoration: 'line-through',
    fontSize: '0.85rem',
    lineHeight: '1.4',
    fontStyle: 'italic',
  },
  printOptimizedText: {
    padding: '0.75rem',
    borderRadius: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.08)',
    color: '#34d399',
    fontSize: '0.85rem',
    lineHeight: '1.4',
    fontWeight: 500,
  },
  printRewriteReason: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    paddingTop: '0.75rem',
    borderTop: '1px dashed #1e293b',
  }
};

export default Results;
