import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Plus, Trash2, Edit2, Calendar, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Tracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for creating/editing cards
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Wishlist');
  const [notes, setNotes] = useState('');
  const [appliedDate, setAppliedDate] = useState('');

  const columns = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(data);
      } else {
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setCompany('');
    setRole('');
    setStatus('Wishlist');
    setNotes('');
    setAppliedDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (app) => {
    setEditingId(app._id);
    setCompany(app.company);
    setRole(app.role);
    setStatus(app.status);
    setNotes(app.notes || '');
    setAppliedDate(app.appliedDate ? app.appliedDate.substring(0, 10) : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      company,
      role,
      status,
      notes,
      appliedDate: appliedDate || undefined
    };

    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId 
        ? `${API_BASE_URL}/api/applications/${editingId}`
        : `${API_BASE_URL}/api/applications`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchApplications();
      } else {
        setError(data.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Failed to save.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this application from your tracker?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchApplications();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to delete.');
    }
  };

  const shiftStatus = async (app, direction) => {
    const currentIndex = columns.indexOf(app.status);
    let nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= columns.length) return;
    const nextStatus = columns[nextIndex];

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/applications/${app._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading job boards...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Job Application Tracker</h1>
          <p style={styles.subtitle}>Organize and track your application milestones.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Add Position
        </button>
      </div>

      {error && !isModalOpen && <div style={styles.errorAlert}><AlertCircle size={18} /> {error}</div>}

      {/* Kanban Board Grid */}
      <div className="kanban-board-grid">
        {columns.map((colName) => {
          const colApps = applications.filter((app) => app.status === colName);
          return (
            <div key={colName} style={styles.column}>
              <div style={styles.columnHeader}>
                <span style={styles.columnTitle}>{colName}</span>
                <span style={styles.columnBadge}>{colApps.length}</span>
              </div>

              <div style={styles.columnCards}>
                {colApps.map((app) => (
                  <div key={app._id} className="glass-card" style={styles.card}>
                    <div style={styles.cardHeader}>
                      <span style={styles.cardRole}>{app.role}</span>
                      <span style={styles.cardCompany}>{app.company}</span>
                    </div>

                    {app.appliedDate && (
                      <div style={styles.cardMeta}>
                        <Calendar size={12} />
                        <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {app.notes && <p style={styles.cardNotes}>{app.notes}</p>}

                    <div style={styles.cardActions}>
                      <div style={styles.shiftButtons}>
                        <button
                          disabled={colName === 'Wishlist'}
                          onClick={() => shiftStatus(app, -1)}
                          style={styles.shiftBtn}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          disabled={colName === 'Rejected'}
                          onClick={() => shiftStatus(app, 1)}
                          style={styles.shiftBtn}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      <div style={styles.cardUtils}>
                        <button onClick={() => openEditModal(app)} style={styles.utilBtn} title="Edit details">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(app._id)} style={{ ...styles.utilBtn, color: '#f87171' }} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div className="glass-card" style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingId ? 'Edit Position' : 'Track New Position'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {error && <div style={styles.errorAlert}><AlertCircle size={18} /> {error}</div>}

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Job Role</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              <div style={styles.modalRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status</label>
                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={styles.select}
                  >
                    {columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Applied Date (Optional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>Notes</label>
                <textarea
                  className="form-input"
                  placeholder="Paste interview dates, link to job post, salaries, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ minHeight: '80px', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Position
              </button>
            </form>
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
    minWidth: 0,
    width: '100%',
    overflow: 'hidden',
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
  boardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    alignItems: 'flex-start',
    flex: 1,
    overflowX: 'auto',
    paddingBottom: '1rem',
  },
  column: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '1rem',
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minHeight: '500px',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #1e293b',
  },
  columnTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#94a3b8',
  },
  columnBadge: {
    backgroundColor: '#1e293b',
    borderRadius: '50px',
    padding: '0.15rem 0.5rem',
    fontSize: '0.75rem',
    color: '#f8fafc',
    fontWeight: 600,
  },
  columnCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: 1,
  },
  card: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: 'rgba(7, 11, 19, 0.6)',
    transition: 'transform 0.2s',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardRole: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  cardCompany: {
    fontSize: '0.75rem',
    color: '#818cf8',
    fontWeight: 500,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.7rem',
    color: '#64748b',
  },
  cardNotes: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: 1.4,
    borderTop: '1px dashed #1e293b',
    paddingTop: '0.5rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    borderTop: '1px solid #1e293b',
    paddingTop: '0.5rem',
  },
  shiftButtons: {
    display: 'flex',
    gap: '0.25rem',
  },
  shiftBtn: {
    background: 'none',
    border: '1px solid #1e293b',
    borderRadius: '4px',
    color: '#64748b',
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  cardUtils: {
    display: 'flex',
    gap: '0.35rem',
  },
  utilBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.2rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    color: '#f8fafc',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalRow: {
    display: 'flex',
    gap: '1rem',
  },
  select: {
    cursor: 'pointer',
    height: '42px',
    fontSize: '0.85rem',
    backgroundColor: '#070b13',
    padding: '0 1.5rem 0 0.75rem',
  },
  dateInput: {
    height: '42px',
    fontSize: '0.85rem',
    colorScheme: 'dark',
    padding: '0 0.75rem',
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
  }
};

export default Tracker;
