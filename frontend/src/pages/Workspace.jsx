import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, Briefcase, Eye, X } from 'lucide-react';

const Workspace = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0: Idle, 2: Analyzing, 3: Complete
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  // Core parser preview states
  const [resumeId, setResumeId] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // File drag & drop triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const uploadFile = async (selectedFile) => {
    setIsUploading(true);
    setError('');
    setResumeId('');
    setExtractedText('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const uploadRes = await fetch(`${API_BASE_URL}/api/analysis/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'File upload failed');
      }

      setResumeId(uploadData.resumeId);
      setExtractedText(uploadData.extractedText);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload and parse resume.');
      setFile(null); // Clear selected file on error
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    setFile(selectedFile);
    uploadFile(selectedFile); // Trigger immediate upload
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeId) {
      setError('Please wait for the resume to finish uploading and parsing.');
      return;
    }
    if (!jobTitle || !jobDescription) {
      setError('Please fill in both the Job Title and Job Description requirements.');
      return;
    }

    setError('');
    setUploadProgress(2);
    setStatusMessage('Analyzing profile alignment against job description using Gemini AI...');

    try {
      const token = localStorage.getItem('token');
      
      const analyzeRes = await fetch(`${API_BASE_URL}/api/analysis/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId,
          jobTitle,
          jobDescriptionText: jobDescription
        })
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.message || 'AI analysis failed');
      }

      setUploadProgress(3);
      setStatusMessage('Analysis complete! Redirecting...');
      
      setTimeout(() => {
        navigate(`/results/${analyzeData._id}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during resume analysis.');
      setUploadProgress(0);
      setStatusMessage('');
    }
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Resume Optimizer</h1>
        <p style={styles.subtitle}>Analyze your resume match rate and optimize it for ATS benchmarks.</p>
      </div>

      {uploadProgress > 0 ? (
        /* Loading Overlay State */
        <div className="glass-card" style={styles.loadingCard}>
          <div className="spinner" style={styles.largeSpinner}></div>
          <h3 style={styles.loadingHeading}>Running Analysis</h3>
          <p style={styles.loadingText}>{statusMessage}</p>
          <div style={styles.progressBarBg}>
            <div style={{
              ...styles.progressBar,
              width: uploadProgress === 2 ? '75%' : '100%'
            }}></div>
          </div>
        </div>
      ) : (
        /* Setup Form Workspace */
        <form onSubmit={handleAnalyze} className="workspace-grid">
          {/* Left Panel: Job Details */}
          <div className="glass-card" style={styles.leftPanel}>
            <h3 style={styles.panelTitle}>Target Job Information</h3>

            {error && <div style={styles.errorAlert}><AlertCircle size={18} /> {error}</div>}

            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <div style={styles.inputIconWrapper}>
                <Briefcase size={18} style={styles.inputIcon} />
                <input
                  id="jobTitle"
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. React Front-End Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="jobDesc">Job Description Requirements</label>
              <textarea
                id="jobDesc"
                required
                className="form-input"
                style={styles.textarea}
                placeholder="Paste the target Job Description responsibilities and requirements here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Right Panel: File Uploader */}
          <div className="glass-card" style={styles.rightPanel}>
            <h3 style={styles.panelTitle}>Upload Resume</h3>
            
            <div
              style={{
                ...styles.dropzone,
                borderColor: isDragActive ? '#6366f1' : '#1e293b',
                backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={file ? undefined : triggerFileInput} // Only open selector if no file is uploaded
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div style={styles.fileSelected}>
                  {isUploading ? (
                    <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px', marginBottom: '1rem' }}></div>
                  ) : (
                    <CheckCircle size={48} color="#10b981" />
                  )}
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  
                  {isUploading ? (
                    <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 500 }}>Extracting document text...</span>
                  ) : (
                    <div style={styles.fileActionsRow}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={styles.actionBtnSmall}
                        onClick={() => setIsPreviewOpen(true)}
                      >
                        <Eye size={14} /> Preview Text
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={styles.actionBtnSmall}
                        onClick={triggerFileInput}
                      >
                        Change File
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.uploadPrompt}>
                  <Upload size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                  <p style={styles.uploadTextMain}>Drag and drop your file here, or <span style={styles.browseLink}>browse</span></p>
                  <p style={styles.uploadTextSub}>Supports PDF or Word Document (.docx) formats up to 5MB</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={styles.analyzeBtn}
              disabled={isUploading || !resumeId}
            >
              <Sparkles size={18} /> Analyze Alignment
            </button>
          </div>
        </form>
      )}

      {/* Parse Preview Modal */}
      {isPreviewOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card animate-fade-in" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Extracted Resume Text Preview</h3>
              <button type="button" onClick={() => setIsPreviewOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <p style={styles.modalDesc}>This is the raw text extracted from your document. Verify that the spelling, formatting, and skills are parsed correctly.</p>
            <div style={styles.modalContent}>
              {extractedText}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1.5rem', height: '42px' }}
              onClick={() => setIsPreviewOpen(false)}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    height: '100%',
  },
  header: {
    marginBottom: '0.5rem',
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
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
    color: '#f8fafc',
  },
  inputIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: '#64748b',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    minHeight: '260px',
    lineHeight: '1.6',
  },
  dropzone: {
    flex: 1,
    border: '2px dashed #1e293b',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '2rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
    minHeight: '260px',
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  uploadTextMain: {
    fontSize: '1rem',
    fontWeight: 500,
    color: '#f8fafc',
    marginBottom: '0.25rem',
  },
  browseLink: {
    color: '#6366f1',
    fontWeight: 600,
  },
  uploadTextSub: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  fileSelected: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fileName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#f8fafc',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSize: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  fileActionsRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  actionBtnSmall: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
  },
  analyzeBtn: {
    width: '100%',
    height: '48px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    color: '#f87171',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  loadingCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '3rem auto 0 auto',
  },
  largeSpinner: {
    width: '48px',
    height: '48px',
    borderWidth: '4px',
    marginBottom: '2rem',
  },
  loadingHeading: {
    fontSize: '1.5rem',
    color: '#f8fafc',
    marginBottom: '0.5rem',
  },
  loadingText: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    marginBottom: '2rem',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  progressBarBg: {
    width: '100%',
    maxWidth: '350px',
    height: '6px',
    backgroundColor: '#1e293b',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  // Preview Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1.5rem',
  },
  modal: {
    width: '100%',
    maxWidth: '650px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh',
    boxShadow: 'var(--shadow-md), var(--shadow-glow)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: '#f8fafc',
    fontWeight: 700,
  },
  modalDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '1.25rem',
    lineHeight: '1.4',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#070b13',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '1.2rem',
    fontFamily: 'Courier, monospace',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    color: '#cbd5e1',
    textAlign: 'left',
  },
};

export default Workspace;
